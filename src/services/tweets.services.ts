import { TweetRequestBody } from '~/models/requests/tweets.requests'
import databaseServices from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import Hashtag from '~/models/schemas/Hashtag.schema'
import { ObjectId, WithId } from 'mongodb'
import { TweetAudience, TweetType } from '~/constants/enums'

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
        projection: { user_views: 1, guest_views: 1, updated_at: 1 }
      }
    )
    return result.value as WithId<{
      user_views: number
      guest_views: number
      updated_at: Date
    }>
  }

  async getTweetChildren({
    tweet_id,
    tweet_type,
    limit,
    page,
    user_id
  }: {
    tweet_id: string
    tweet_type: TweetType
    limit: number
    page: number
    user_id: string
  }) {
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const date = new Date()
    const tweets = await databaseServices.tweets
      .aggregate<Tweet>([
        {
          $match: {
            parent_id: new ObjectId(tweet_id),
            type: tweet_type
          }
        },
        { $skip: (page - 1) * limit },
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
        }
      ])
      .toArray()
    const ids = tweets.map((tweet) => tweet._id as ObjectId)
    const [total] = await Promise.all([
      databaseServices.tweets.countDocuments({ parent_id: new ObjectId(tweet_id), type: tweet_type }),
      databaseServices.tweets.updateMany(
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
    ])

    tweets.forEach((tweet) => {
      tweet.updated_at = date
      if (user_id) {
        tweet.user_views += 1
      } else {
        tweet.guest_views += 1
      }
    })

    return {
      total_page: Math.ceil(total / limit),
      tweets
    }
  }

  async getNewFeeds({ user_id, limit, page }: { user_id: string; limit: number; page: number }) {
    const user_id_object = new ObjectId(user_id)
    const date = new Date()

    const followed_user_ids = await databaseServices.followers
      .find(
        {
          user_id: user_id_object
        },
        {
          projection: {
            followed_user_id: 1,
            _id: 0
          }
        }
      )
      .toArray()
    const ids = followed_user_ids.map((item) => item.followed_user_id)
    ids.push(user_id_object)

    const [tweets, total] = await Promise.all([
      databaseServices.tweets
        .aggregate([
          {
            $match: {
              user_id: {
                $in: ids
              }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: {
              path: '$user'
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: TweetAudience.Everyone
                },
                {
                  $and: [
                    {
                      audience: TweetAudience.TwitterCircle
                    },
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
          { $skip: (page - 1) * limit },
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
          {
            $match: {
              user_id: {
                $in: ids
              }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: {
              path: '$user'
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: TweetAudience.Everyone
                },
                {
                  $and: [
                    {
                      audience: TweetAudience.TwitterCircle
                    },
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
            $count: 'tweet_counts'
          }
        ])
        .toArray()
    ])

    await databaseServices.tweets.updateMany(
      {
        user_id: {
          $in: ids
        }
      },
      {
        $inc: { user_views: 1 },
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
      total_page: Math.ceil(total[0].tweet_counts / limit),
      tweets
    }
  }
}

const tweetsServices = new TweetsServices()
export default tweetsServices
