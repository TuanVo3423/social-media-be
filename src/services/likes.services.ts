import Like from '~/models/schemas/Like.schema'
import databaseServices from './database.services'
import { ObjectId, WithId } from 'mongodb'

class LikesServices {
  async likeTweet({ user_id, tweet_id }: { user_id: string; tweet_id: string }) {
    const result = await databaseServices.likes.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      },
      {
        $setOnInsert: new Like({ user_id: new ObjectId(user_id), tweet_id: new ObjectId(tweet_id) })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    return result.value as WithId<Like>
  }
  async unlikeTweet({ user_id, tweet_id }: { user_id: string; tweet_id: string }) {
    const result = await databaseServices.likes.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
    return result.value as WithId<Like>
  }
}

const likesServices = new LikesServices()
export default likesServices
