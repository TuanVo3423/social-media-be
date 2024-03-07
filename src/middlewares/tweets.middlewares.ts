import { checkSchema } from 'express-validator'
import { NextFunction, Request, Response } from 'express'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enums'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { TWEET_MESSAGES, USER_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Errors'
import databaseServices from '~/services/database.services'
import { getArrayFromEnum } from '~/utils/common'
import { wrapRequestHandler } from '~/utils/handlers'
import { validate } from '~/utils/validation'
import Tweet from '~/models/schemas/Tweet.schema'
import { TokenPayload } from '~/models/requests/users.requests'
// type, parentid, content, hashtags, mentions
const tweetTypes = getArrayFromEnum(TweetType)
const mediaTypes = getArrayFromEnum(MediaType)
const tweetAudienceTypes = getArrayFromEnum(TweetAudience)

export const createTweetValidator = validate(
  checkSchema(
    {
      type: {
        isIn: {
          options: [tweetTypes],
          errorMessage: TWEET_MESSAGES.INVALID_TWEET_TYPE
        }
      },
      audience: {
        isIn: {
          options: [tweetAudienceTypes],
          errorMessage: TWEET_MESSAGES.INVALID_TWEET_AUDIENCE
        }
      },
      parent_id: {
        // neu ma retweet, comment, quote thi parent_id phai la objectid
        custom: {
          options: async (value, { req }) => {
            const type = req.body.type as TweetType
            if (
              [TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) &&
              !ObjectId.isValid(value)
            ) {
              throw new Error(TWEET_MESSAGES.PARENT_ID_MUST_BE_TWEET_ID)
            }

            if ([TweetType.Tweet].includes(type) && value !== null) {
              throw new Error(TWEET_MESSAGES.PARENT_ID_MUST_BE_NULL)
            }
            return true
          }
        }
      },
      content: {
        isString: true,
        custom: {
          options: async (value, { req }) => {
            const type = req.body.type as TweetType
            const metions = req.body.mentions as string[]
            const hashtags = req.body.hashtags as string[]

            if ([TweetType.Retweet].includes(type) && (value !== '' || null)) {
              throw new Error(TWEET_MESSAGES.CONTENT_MUST_BE_NULL)
            }

            if (
              [TweetType.Tweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) &&
              value === null &&
              isEmpty(metions) &&
              isEmpty(hashtags)
            ) {
              throw new Error(TWEET_MESSAGES.CONTENT_MUST_BE_NON_EMPTY_STRING)
            }
            return true
          }
        }
      },
      hashtags: {
        isArray: true,
        custom: {
          options: (value) => {
            if (value.some((item: any) => typeof item !== 'string')) {
              throw new Error(TWEET_MESSAGES.HASHTAGS_MUST_BE_ARRAY_OF_STRING)
            }
            return true
          }
        }
      },
      mentions: {
        isArray: true,
        custom: {
          options: async (value) => {
            if (value.some((item: any) => !ObjectId.isValid(item))) {
              throw new Error(TWEET_MESSAGES.MENTIONS_MUST_BE_ARRAY_OF_USER_ID)
            }
            return true
          }
        }
      },
      // mang object thang media
      medias: {
        isArray: true,
        custom: {
          options: (value) => {
            if (value.some((item: any) => typeof item.url !== 'string' || !mediaTypes.includes(item.type))) {
              throw new Error(TWEET_MESSAGES.MEDIAS_MUST_BE_ARRAY_OF_MEDIA_OBJECT)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const tweetIdValidator = validate(
  checkSchema(
    {
      tweet_id: {
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: TWEET_MESSAGES.INVALID_TWEET_ID,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            const [tweet] = await databaseServices.tweets
              .aggregate<Tweet>([
                {
                  $match: {
                    _id: new ObjectId(value)
                  }
                },
                {
                  $lookup: {
                    from: 'hashtags',
                    localField: 'hashtags',
                    foreignField: '_id',
                    as: 'hashtags'
                  }
                },
                {
                  $lookup: {
                    from: 'users',
                    localField: 'mentions',
                    foreignField: '_id',
                    as: 'mentions'
                  }
                },
                {
                  $addFields: {
                    mentions: {
                      $map: {
                        input: '$mentions',
                        as: 'mention',
                        in: {
                          _id: '$$mention._id',
                          name: '$$mention.name',
                          username: '$$mention.username',
                          email: '$$mention.email'
                        }
                      }
                    }
                  }
                },
                {
                  $lookup: {
                    from: 'likes',
                    localField: 'tweet_id',
                    foreignField: '_id',
                    as: 'likes'
                  }
                },
                {
                  $lookup: {
                    from: 'bookmarks',
                    localField: 'tweet_id',
                    foreignField: '_id',
                    as: 'bookmarks'
                  }
                },
                {
                  $lookup: {
                    from: 'tweets',
                    localField: '_id',
                    foreignField: 'parent_id',
                    as: 'tweet_children'
                  }
                },
                {
                  $addFields: {
                    likes: {
                      $size: '$likes'
                    },
                    bookmarks: {
                      $size: '$bookmarks'
                    },
                    retweet_count: {
                      $size: {
                        $filter: {
                          input: '$tweet_children',
                          as: 'item',
                          cond: {
                            $eq: ['$$item.type', TweetType.Retweet]
                          }
                        }
                      }
                    },
                    comment_count: {
                      $size: {
                        $filter: {
                          input: '$tweet_children',
                          as: 'item',
                          cond: {
                            $eq: ['$$item.type', TweetType.Comment]
                          }
                        }
                      }
                    },
                    quote_count: {
                      $size: {
                        $filter: {
                          input: '$tweet_children',
                          as: 'item',
                          cond: {
                            $eq: ['$$item.type', TweetType.QuoteTweet]
                          }
                        }
                      }
                    }
                  }
                }
              ])
              .toArray()
            if (!tweet) {
              throw new ErrorWithStatus({
                message: TWEET_MESSAGES.INVALID_TWEET_ID,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            ;(req as Request).tweet = tweet
            return true
          }
        }
      }
    },
    ['body', 'params']
  )
)

export const audienceValidator = wrapRequestHandler(async (req: Request, res: Response, next: NextFunction) => {
  // day la test case check voi tweet la thuoc tweet circle
  const tweet = req.tweet as Tweet
  if (tweet.audience === TweetAudience.TwitterCircle) {
    // check xem da logged chua?
    if (!req.decoded_authorization) {
      throw new ErrorWithStatus({
        message: USER_MESSAGES.ACCESS_TOKEN_IS_INVALID,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }

    // check xem author da bi block hay delete chua
    const author = await databaseServices.users.findOne({ _id: new ObjectId(tweet.user_id) })
    if (!author || author.verify === UserVerifyStatus.Banned) {
      throw new ErrorWithStatus({
        message: USER_MESSAGES.AUTHOR_IS_BANNED,
        status: HTTP_STATUS.FORBIDDEN
      })
    }

    // check xem user co trong twitter circle cua tweet khong va co phai la tac gia hay khong
    const { user_id } = req.decoded_authorization as TokenPayload
    const isInTwitterCircle = tweet.twitter_circle.some((item) => item.equals(user_id))
    if (!isInTwitterCircle && !tweet.user_id.equals(user_id)) {
      throw new ErrorWithStatus({
        message: TWEET_MESSAGES.TWEET_IS_NOT_PUBLIC,
        status: HTTP_STATUS.FORBIDDEN
      })
    }
  }
  // neu khong thi la public -> next
  next()
})
