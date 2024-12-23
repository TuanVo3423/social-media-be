import axios from 'axios'
import { ObjectId } from 'mongodb'
import { TokenType, UserVerifyStatus } from '~/constants/enums'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { USER_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Errors'
import { RegisterReqBody, ResetPasswordReqBody, UpdateMeReqBody } from '~/models/requests/users.requests'
import Follower from '~/models/schemas/Follower.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import User from '~/models/schemas/User.schema'
import { sendForgotPasswordEmail, sendRegisterEmail } from '~/utils/aws'
import { getNameFromEmail } from '~/utils/common'
import { hashPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'
import databaseServices from './database.services'
import { envConfigs } from '~/constants/config'

class UsersServices {
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
        verify
      },
      privateKey: envConfigs.JWT_SECRET_ACCESS_TOKEN,
      options: {
        expiresIn: envConfigs.ACCESS_TOKEN_EXPIRES_IN
      }
    })
  }

  private signRefreshToken({ user_id, verify, exp }: { user_id: string; verify: UserVerifyStatus; exp?: number }) {
    if (exp) {
      return signToken({
        payload: {
          user_id,
          token_type: TokenType.RefreshToken,
          verify,
          exp
        },
        privateKey: envConfigs.JWT_SECRET_REFRESH_TOKEN
      })
    }
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
        verify
      },
      privateKey: envConfigs.JWT_SECRET_REFRESH_TOKEN,
      options: {
        expiresIn: envConfigs.REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }

  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken,
        verify
      },
      privateKey: envConfigs.JWT_SECRET_EMAIL_VERIFY_TOKEN,
      options: {
        expiresIn: envConfigs.EMAIL_VERIFY_TOKEN_EXPIRES_IN
      }
    })
  }

  private signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken,
        verify
      },
      privateKey: envConfigs.JWT_SECRET_FORGOT_PASSWORD_TOKEN,
      options: {
        expiresIn: envConfigs.FORGOT_PASSWORD_TOKEN_EXPIRES_IN
      }
    })
  }

  private signAccessTokenAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
  }

  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({ token: refresh_token, privateKey: envConfigs.JWT_SECRET_REFRESH_TOKEN })
  }

  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    await databaseServices.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password),
        username: getNameFromEmail(payload.email)
      })
    )
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })

    const { exp, iat } = await this.decodeRefreshToken(refresh_token)
    await databaseServices.refreshToken.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token, iat, exp })
    )
    // send mail here to client
    await sendRegisterEmail(payload.email, email_verify_token)
    console.log('email_verify_token: ', email_verify_token)
    return { access_token, refresh_token }
  }

  async checkEmailExists(email: string) {
    const user = await databaseServices.users.findOne({ email })
    return user
  }

  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({ user_id, verify })
    const { exp, iat } = await this.decodeRefreshToken(refresh_token)
    await databaseServices.refreshToken.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token, iat, exp })
    )
    return { access_token, refresh_token }
  }

  private async getOauthGoogleToken(code: string) {
    // get access token from google
    const body = {
      code,
      client_id: envConfigs.GOOGLE_CLIENT_ID,
      client_secret: envConfigs.GOOGLE_CLIENT_SECRET,
      redirect_uri: envConfigs.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    }
    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return data as {
      access_token: string
      id_token: string
    }
  }

  private async getUserInfoFromGoogle(access_token: string, id_token: string) {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: {
        access_token,
        alt: 'json'
      },
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    })
    return data as {
      id: string
      email: string
      verified_email: boolean
      name: string
      given_name: string
      family_name: string
      picture: string
      locale: string
    }
  }

  async oauth(code: string) {
    const { access_token, id_token } = await this.getOauthGoogleToken(code)
    const userInfo = await this.getUserInfoFromGoogle(access_token, id_token)
    console.log(userInfo)
    // check verify email
    if (!userInfo.verified_email) {
      throw new ErrorWithStatus({ message: USER_MESSAGES.GMAIL_NOT_VERIFIED, status: HTTP_STATUS.BAD_REQUEST })
    }

    const user = await databaseServices.users.findOne({ email: userInfo.email })
    // if user existt -> return access token and refresh token
    if (user) {
      const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({
        user_id: user._id.toString(),
        verify: UserVerifyStatus.Verified
      })
      const { exp, iat } = await this.decodeRefreshToken(refresh_token)
      await databaseServices.refreshToken.insertOne(
        new RefreshToken({ user_id: new ObjectId(user._id), token: refresh_token, iat, exp })
      )
      return {
        access_token,
        refresh_token,
        newUser: false,
        verify: UserVerifyStatus.Verified
      }
    }
    // if user not exist -> create new user and return access token and refresh token
    else {
      const password = Math.random().toString(36).substring(2, 15)
      const { access_token, refresh_token } = await this.register({
        name: userInfo.name,
        email: userInfo.email,
        password,
        confirm_password: password,
        date_of_birth: new Date().toISOString()
      })
      return {
        access_token,
        refresh_token,
        newUser: true,
        verify: UserVerifyStatus.Unverified
      }
    }
  }

  async logout(refresh_token: string) {
    await databaseServices.refreshToken.deleteOne({ token: refresh_token })
  }

  async refreshToken({
    user_id,
    verify,
    refresh_token,
    exp
  }: {
    user_id: string
    verify: UserVerifyStatus
    refresh_token: string
    exp: number
  }) {
    const [new_access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken({ user_id, verify }),
      this.signRefreshToken({ user_id, verify, exp }),
      databaseServices.refreshToken.deleteOne({ token: refresh_token })
    ])
    const decoded_refresh_token = await this.decodeRefreshToken(refresh_token)
    await databaseServices.refreshToken.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: new_refresh_token,
        iat: decoded_refresh_token.iat,
        exp: decoded_refresh_token.exp
      })
    )

    return {
      access_token: new_access_token,
      refresh_token: new_refresh_token
    }
  }

  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      this.signAccessTokenAndRefreshToken({ user_id, verify: UserVerifyStatus.Unverified }),
      databaseServices.users.updateOne({ _id: new ObjectId(user_id) }, [
        {
          $set: {
            email_verify_token: '',
            updated_at: '$$NOW',
            verify: UserVerifyStatus.Verified
          }
        }
      ])
    ])
    const [access_token, refresh_token] = token
    const { exp, iat } = await this.decodeRefreshToken(refresh_token)
    await databaseServices.refreshToken.insertOne(
      new RefreshToken({
        token: refresh_token,
        user_id: new ObjectId(user_id),
        iat,
        exp
      })
    )
    return {
      access_token,
      refresh_token
    }
  }

  async resendVerifyEmail(user_id: string, email: string) {
    const email_verify_token = await this.signEmailVerifyToken({ user_id, verify: UserVerifyStatus.Unverified })
    // resend mail here to client
    // send mail here to client
    await sendRegisterEmail(email, email_verify_token)
    console.log('new email_verify_token: ', email_verify_token)
    await databaseServices.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          email_verify_token,
          updated_at: '$$NOW'
        }
      }
    ])
    return {
      message: USER_MESSAGES.RESEND_EMAIL_VERIFY_SUCCESS
    }
  }
  async forgotPassword({ user_id, verify, email }: { user_id: string; verify: UserVerifyStatus; email: string }) {
    const forgot_password_token = await this.signForgotPasswordToken({ user_id, verify })
    // send forgot password mail here to client
    await sendForgotPasswordEmail(email, forgot_password_token)
    console.log('new forgot_password_token: ', forgot_password_token)
    await databaseServices.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          forgot_password_token,
          updated_at: '$$NOW'
        }
      }
    ])
    return {
      message: USER_MESSAGES.SEND_FORGOT_PASSWORD_EMAIL_VERIFY_SUCCESS
    }
  }

  async resetPassword({ user_id, payload }: { user_id: string; payload: ResetPasswordReqBody }) {
    const password = hashPassword(payload.password)
    await databaseServices.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          password,
          forgot_password_token: '',
          updated_at: '$$NOW'
        }
      }
    ])
    return {
      message: USER_MESSAGES.RESET_PASSWORD_SUCCESS
    }
  }

  async getMe(user_id: string) {
    const user = await databaseServices.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }

  async checkIsUniqueUsername(username: string) {
    const is_exists_username = await databaseServices.users.findOne({
      username
    })
    return is_exists_username
  }

  async updateMe(user_id: string, payload: UpdateMeReqBody) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload

    const user = await databaseServices.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      [
        {
          $set: {
            ..._payload,
            updated_at: '$$NOW'
          }
        }
      ],
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user.value
  }

  async checkAlreadyFollow(user_id: string, followed_user_id: string) {
    return await databaseServices.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
  }
  async followers(user_id: string, followed_user_id: string) {
    await databaseServices.followers.insertOne(
      new Follower({
        followed_user_id: new ObjectId(followed_user_id),
        user_id: new ObjectId(user_id)
      })
    )

    return {
      message: USER_MESSAGES.FOLLOW_PROFILE_SUCCESS
    }
  }

  async unFollow(user_id: string, followed_user_id: string) {
    const follower = await databaseServices.followers.findOne({
      followed_user_id: new ObjectId(followed_user_id),
      user_id: new ObjectId(user_id)
    })
    if (follower === null) {
      return {
        message: USER_MESSAGES.ALREADY_UNFOLLOW_USER
      }
    }
    await databaseServices.followers.deleteOne({
      followed_user_id: new ObjectId(followed_user_id),
      user_id: new ObjectId(user_id)
    })

    return {
      message: USER_MESSAGES.UNFOLLOW_USER
    }
  }

  async changePassword(user_id: string, password: string) {
    await databaseServices.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      [
        {
          $set: {
            password: hashPassword(password),
            updated_at: '$$NOW'
          }
        }
      ]
    )
    return {
      message: USER_MESSAGES.CHANGE_PASSWORD_SUCCESS
    }
  }
}

const userServices = new UsersServices()
export default userServices
