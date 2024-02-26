import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { LIKE_MESSAGES } from '~/constants/message'
import { LikeRequestBody } from '~/models/requests/likes.requests'
import { TokenPayload } from '~/models/requests/users.requests'
import likesServices from '~/services/likes.services'
export const likeTweetController = async (
  req: Request<ParamsDictionary, any, LikeRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.body
  const result = await likesServices.likeTweet({ user_id, tweet_id })
  return res.json({ message: LIKE_MESSAGES.LIKE_MESSAGES, result })
}

export const unlikeTweetController = async (
  req: Request<ParamsDictionary, any, LikeRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { tweet_id } = req.params
  const result = await likesServices.unlikeTweet({ user_id, tweet_id })
  return res.json({ message: LIKE_MESSAGES.UNLIKE_MESSAGES, result })
}
