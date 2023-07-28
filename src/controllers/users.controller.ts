import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { USER_MESSAGES } from '~/constants/message'
import { LogoutReqBody, RegisterReqBody } from '~/models/requests/register.requests'
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
