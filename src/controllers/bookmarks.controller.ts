import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { BOOKMARK_MESSAGES } from '~/constants/message'
import { BookmarkRequestBody } from '~/models/requests/bookmarks.requests'
import { TokenPayload } from '~/models/requests/users.requests'
import bookmarksServices from '~/services/bookmarks.services'

export const bookmarkTweetController = async (
  req: Request<ParamsDictionary, any, BookmarkRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const { tweet_id } = req.body
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await bookmarksServices.bookmarkTweet({ user_id, tweet_id })
  return res.json({ message: BOOKMARK_MESSAGES.BOOKMARK_SUCCESS, result })
}

export const unbookmarkTweetController = async (req: Request, res: Response, next: NextFunction) => {
  const { tweet_id } = req.params
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await bookmarksServices.unbookmarkTweet({ user_id, tweet_id })
  return res.json({ message: BOOKMARK_MESSAGES.UNBOOKMARK_SUCCESS, result })
}

export const unbookmarkTweetByIdController = async (req: Request, res: Response, next: NextFunction) => {
  const { bookmark_id } = req.params
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await bookmarksServices.unbookmarkTweetById({ user_id, bookmark_id })
  return res.json({ message: BOOKMARK_MESSAGES.UNBOOKMARK_SUCCESS, result })
}
