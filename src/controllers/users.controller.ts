import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { USER_MESSAGES } from '~/constants/message'
import { LogoutReqBody, RegisterReqBody, TokenPayload } from '~/models/requests/register.requests'
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

export const loginController = async (req: Request, res: Response) => {
  const user = req.user
  const user_id = user?._id as ObjectId
  const result = await userServices.login(user_id.toString())
  return res.json({ message: USER_MESSAGES.LOGIN_SUCCESS, result })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  await userServices.logout(refresh_token)
  return res.json({ message: USER_MESSAGES.LOGOUT_SUCCESS })
}

export const verifyEmailValidator = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
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
