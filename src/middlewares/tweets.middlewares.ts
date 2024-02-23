import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType } from '~/constants/enums'
import { TWEET_MESSAGES } from '~/constants/message'
import { getArrayFromEnum } from '~/utils/common'
import { validate } from '~/utils/validation'
// type, parentid, content, hashtags, mentions
const tweetTypes = getArrayFromEnum(TweetType)
const mediaTypes = getArrayFromEnum(MediaType)
const tweetAudienceTypes = getArrayFromEnum(TweetAudience)

export const createTweetValidator = validate(
  checkSchema({
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
          if ([TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(type) && !ObjectId.isValid(value)) {
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

          if ([TweetType.Retweet].includes(type) && value !== null) {
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
  })
)
