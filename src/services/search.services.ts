import { SearchQuery } from '~/models/requests/search.requests'
import databaseServices from './database.services'
import { ObjectId } from 'mongodb'
import { MediaType, MediaTypeQuery, TweetType } from '~/constants/enums'

class SearchServices {
  async advancedSearch({
    content,
    limit,
    page,
    user_id,
    media_type
  }: {
    limit: number
    page: number
    content: string
    user_id: string
    media_type: MediaTypeQuery
  }) {
    const user_id_object = new ObjectId(user_id)
    const date = new Date()

    const $match: any = { $text: { $search: content } }

    if (media_type) {
      if (media_type === MediaTypeQuery.Image) {
        $match['medias.type'] = MediaType.Image
      } else {
        $match['medias.type'] = MediaType.Video
      }
    }

    const [tweets, total] = await Promise.all([
      await databaseServices.tweets
        .aggregate([
          { $match },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          { $unwind: { path: '$user' } },
          {
            $match: {
              $or: [
                { audience: 0 },
                {
                  $and: [
                    { audience: 1 },
                    {
                      'user.twitter_circle': {
                        $in: [user_id_object]
                      }
                    }
                  ]
                }
              ]
            }
          },
          { $skip: limit * (page - 1) },
          { $limit: limit },
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
          {
            $project: {
              tweet_children: 0,
              user: {
                password: 0,
                email_verify_token: 0,
                twitter_circle: 0,
                date_of_birth: 0,
                forgot_password_token: 0
              }
            }
          }
        ])
        .toArray(),
      databaseServices.tweets
        .aggregate([
          { $match },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          { $unwind: { path: '$user' } },
          {
            $match: {
              $or: [
                { audience: 0 },
                {
                  $and: [
                    { audience: 1 },
                    {
                      'user.twitter_circle': {
                        $in: [user_id_object]
                      }
                    }
                  ]
                }
              ]
            }
          },
          {
            $count: 'count'
          }
        ])
        .toArray()
    ])
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const ids = tweets.map((tweet) => tweet._id as ObjectId)
    await databaseServices.tweets.updateMany(
      {
        _id: {
          $in: ids
        }
      },
      {
        $inc: inc,
        $set: {
          updated_at: date
        }
      }
    )
    tweets.forEach((tweet) => {
      tweet.user_views += 1
      tweet.updated_at = date
    })
    return {
      total_page: total.length !== 0 ? Math.ceil(total[0].count / limit) : 0,
      tweets
    }
  }
}
const searchServices = new SearchServices()
export default searchServices
