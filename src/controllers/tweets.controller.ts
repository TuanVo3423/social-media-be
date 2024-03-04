import { NextFunction, Request, Response } from 'express'
import { TWEET_MESSAGES } from '~/constants/message'
import { TokenPayload } from '~/models/requests/users.requests'
import Tweet from '~/models/schemas/Tweet.schema'
import tweetsServices from '~/services/tweets.services'
export const createTweetController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetsServices.createTweet(user_id, req.body)
  return res.json({
    message: TWEET_MESSAGES.CREATE_SUCCESS,
    result
  })
}
export const getTweetDetailController = async (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.tweet as Tweet
  return res.json({
    message: TWEET_MESSAGES.GET_TWEET_SUCCESS,
    result: tweet
  })
}
