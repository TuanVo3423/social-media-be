import { TweetRequestBody } from '~/models/requests/tweet.requests'
import databaseServices from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'

class TweetsServices {
  async createTweet(user_id: string, data: TweetRequestBody) {
    const result = await databaseServices.tweets.insertOne(
      new Tweet({
        audience: data.audience,
        content: data.content,
        hashtags: [],
        mentions: data.mentions,
        medias: data.medias,
        parent_id: data.parent_id,
        type: data.type,
        user_id
      })
    )
    return result
  }
}

const tweetsServices = new TweetsServices()
export default tweetsServices
