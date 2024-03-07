import { NextFunction, Request, Response } from 'express'
import { TweetType } from '~/constants/enums'
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
  const tweet_id = req.params.tweet_id
  const { user_id } = req.decoded_authorization as TokenPayload
  const { guest_views, user_views } = await tweetsServices.increaseView({ tweet_id, user_id })
  return res.json({
    message: TWEET_MESSAGES.GET_TWEET_SUCCESS,
    result: {
      ...tweet,
      user_views,
      guest_views
    }
  })
}

export const getTweetChildrenController = async (req: Request, res: Response, next: NextFunction) => {
  const tweet_id = req.params.tweet_id
  // tweet_id, page, limit, type
  const page = Number(req.query.page as string)
  const limit = Number(req.query.limit as string)
  const tweet_type = Number(req.query.type as string) as TweetType
  // tweet service => call aggregate and call get total documents
  const { total_page, tweet } = await tweetsServices.getTweetChildren({ tweet_id, page, limit, tweet_type })
  return res.json({
    message: TWEET_MESSAGES.GET_TWEET_CHILDREN_SUCCESS,
    result: {
      total_page,
      tweet
    }
  })
}
