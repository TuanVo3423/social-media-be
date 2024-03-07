import { TweetRequestBody } from '~/models/requests/tweets.requests'
import databaseServices from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import Hashtag from '~/models/schemas/Hashtag.schema'
import { ObjectId, WithId } from 'mongodb'
import { TweetType } from '~/constants/enums'

class TweetsServices {
  async checkAndCreateHashTags(hashtags: string[]) {
    const hashtagDocument = await Promise.all(
      hashtags.map((hashtag) => {
        return databaseServices.hashtags.findOneAndUpdate(
          {
            name: hashtag
          },
          {
            $setOnInsert: new Hashtag({ name: hashtag })
          },
          {
            upsert: true,
            returnDocument: 'after'
          }
        )
      })
    )
    return hashtagDocument.map((item) => (item.value as WithId<Hashtag>)._id)
  }

  async createTweet(user_id: string, data: TweetRequestBody) {
    const hashtags = await this.checkAndCreateHashTags(data.hashtags)
    console.log(hashtags)
    const result = await databaseServices.tweets.insertOne(
      new Tweet({
        audience: data.audience,
        content: data.content,
        hashtags,
        mentions: data.mentions,
        medias: data.medias,
        parent_id: data.parent_id,
        type: data.type,
        user_id
      })
    )
    return result
  }

  async getTweet(tweet_id: string) {
    const result = await databaseServices.tweets.findOne({ _id: new ObjectId(tweet_id) })
    return result
  }

  async increaseView({ tweet_id, user_id }: { tweet_id: string; user_id?: string }) {
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const result = await databaseServices.tweets.findOneAndUpdate(
      { _id: new ObjectId(tweet_id) },
      {
        $inc: inc,
        $currentDate: { updated_at: true }
      },
      {
        returnDocument: 'after',
        projection: { user_views: 1, guest_views: 1 }
      }
    )
    return result.value as WithId<{
      user_views: number
      guest_views: number
    }>
  }

  async getTweetChildren({
    tweet_id,
    tweet_type,
    limit,
    page
  }: {
    tweet_id: string
    tweet_type: TweetType
    limit: number
    page: number
  }) {
    const tweet = await databaseServices.tweets
      .aggregate<Tweet>([
        {
          $match: {
            parent_id: new ObjectId(tweet_id),
            type: tweet_type
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
            likes: { $size: '$likes' },
            bookmarks: { $size: '$bookmarks' },
            retweet_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: { $eq: ['$$item.type', TweetType.Retweet] }
                }
              }
            },
            comment_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: { $eq: ['$$item.type', TweetType.Comment] }
                }
              }
            },
            quote_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: { $eq: ['$$item.type', TweetType.QuoteTweet] }
                }
              }
            }
          }
        },
        { $skip: (page - 1) * limit },
        { $limit: limit }
      ])
      .toArray()

    const total = await databaseServices.tweets.countDocuments({ parent_id: new ObjectId(tweet_id), type: tweet_type })
    return {
      total_page: Math.ceil(total / limit),
      tweet
    }
  }
}

const tweetsServices = new TweetsServices()
export default tweetsServices
