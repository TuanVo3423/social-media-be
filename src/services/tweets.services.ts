import { TweetRequestBody } from '~/models/requests/tweets.requests'
import databaseServices from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import Hashtag from '~/models/schemas/Hashtag.schema'
import { WithId } from 'mongodb'

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
}

const tweetsServices = new TweetsServices()
export default tweetsServices
