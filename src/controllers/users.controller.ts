import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { TWITTER_USERNAME_REGEX } from '~/constants/common'
import { UserVerifyStatus } from '~/constants/enums'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { USER_MESSAGES } from '~/constants/message'
import {
  ChangePasswordReqBody,
  FollowReqBody,
  ForgotPasswordReqBody,
  LoginReqBody,
  LogoutReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayload,
  UpdateMeReqBody,
  VerifyEmailReqBody
} from '~/models/requests/users.requests'
import User from '~/models/schemas/User.schema'
import databaseServices from '~/services/database.services'
import userServices from '~/services/users.services'

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await userServices.register(req.body)
  return res.json({ message: USER_MESSAGES.REGISTER_SUCCESS, result })
}

export const loginController = async (
  req: Request<ParamsDictionary, any, LoginReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { verify, _id: user_id } = req.user as User
  // const user_id = user?._id as ObjectId
  const result = await userServices.login({ user_id: (user_id as ObjectId).toString(), verify })
  return res.json({ message: USER_MESSAGES.LOGIN_SUCCESS, result })
}

export const oauthController = async (req: Request, res: Response) => {
  const { code } = req.query
  const data = await userServices.oauth(code as string)
  return res.redirect(
    `${process.env.CLIENT_REDIRECT_CALLBACK}?access_token=${data.access_token}&refresh_token=${data.refresh_token}&verify=${data.verify}`
  )
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  await userServices.logout(refresh_token)
  return res.json({ message: USER_MESSAGES.LOGOUT_SUCCESS })
}

export const verifyEmailController = async (req: Request<ParamsDictionary, any, VerifyEmailReqBody>, res: Response) => {
  const { user_id, verify } = req.decoded_email_verify_token as TokenPayload
  const user = await databaseServices.users.findOne({ _id: new ObjectId(user_id) })

  // neu khong tim ra user
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USER_MESSAGES.USER_NOT_FOUND
    })
  }
  // da xac thuc roi
  if (user.email_verify_token === '') {
    return res.json({ message: USER_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE })
  }

  const result = await userServices.verifyEmail(user_id)
  return res.json({ message: USER_MESSAGES.EMAIL_VERIFY_SUCCESS, result })
}
export const resendVerifyEmailController = async (req: Request, res: Response) => {
  // find user
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await databaseServices.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USER_MESSAGES.USER_NOT_FOUND
    })
  }
  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({ message: USER_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE })
  }
  // goi service o day de tao moi email token
  const result = await userServices.resendVerifyEmail(user_id)
  return res.json(result)
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response
) => {
  const email = req.body.email
  const user = await databaseServices.users.findOne({ email })
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USER_MESSAGES.USER_NOT_FOUND
    })
  }
  if (user.forgot_password_token) {
    return res.json({ message: USER_MESSAGES.ALREADY_SEND_FORGOT_PASSWORD_EMAIL })
  }
  // create a new forgot password token
  const result = await userServices.forgotPassword({ user_id: user._id.toString(), verify: user.verify })
  return res.json(result)
}

export const verifyForgotPasswordController = async (req: Request, res: Response) => {
  return res.json({
    message: USER_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESS
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response
) => {
  const payload = req.body
  const { user_id } = req.decoded_forgot_password_verify_token as TokenPayload
  const result = await userServices.resetPassword({ user_id, payload })
  return res.json(result)
}

export const getMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await userServices.getMe(user_id)
  return res.json({
    result: user,
    message: USER_MESSAGES.GET_PROFILE_SUCCESS
  })
}

export const updateMeController = async (req: Request<ParamsDictionary, any, UpdateMeReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const is_exists_username = await userServices.checkIsUniqueUsername(req.body.username as string)
  const is_true_format = TWITTER_USERNAME_REGEX.test(req.body.username as string)
  if (is_exists_username) {
    return res.json({
      message: USER_MESSAGES.USERNAME_ALREADY_EXISTS
    })
  }
  if (!is_true_format) {
    return res.json({
      message: USER_MESSAGES.INVALID_USERNAME_FORMAT
    })
  }
  const result = await userServices.updateMe(user_id, req.body)
  return res.json({
    message: USER_MESSAGES.UPDATE_PROFILE_SUCCESS,
    result
  })
}

export const followController = async (req: Request<ParamsDictionary, any, FollowReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { followed_user_id } = req.body
  const is_already_follow = await userServices.checkAlreadyFollow(user_id, followed_user_id)
  if (is_already_follow) {
    return res.json({
      message: USER_MESSAGES.ALREADY_FOLLOW_USER
    })
  }
  const result = await userServices.followers(user_id, followed_user_id)
  return res.json(result)
}

export const unfolowController = async (req: Request<any>, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { user_id: followed_user_id } = req.params
  const result = await userServices.unFollow(user_id, followed_user_id)
  return res.json(result)
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { password } = req.body
  const result = await userServices.changePassword(user_id, password)
  return res.json(result)
}
