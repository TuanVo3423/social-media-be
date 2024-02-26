import { ObjectId, WithId } from 'mongodb'
import databaseServices from './database.services'
import Bookmark from '~/models/schemas/Bookmark.schema'

class BookmarksServices {
  async bookmarkTweet({ user_id, tweet_id }: { user_id: string; tweet_id: string }) {
    const result = await databaseServices.bookmarks.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      },
      {
        $setOnInsert: new Bookmark({ user_id: new ObjectId(user_id), tweet_id: new ObjectId(tweet_id) })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
    return result.value as WithId<Bookmark>
  }
  async unbookmarkTweet({ user_id, tweet_id }: { user_id: string; tweet_id: string }) {
    const result = await databaseServices.bookmarks.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
    return result.value as WithId<Bookmark>
  }

  async unbookmarkTweetById({ user_id, bookmark_id }: { user_id: string; bookmark_id: string }) {
    const result = await databaseServices.bookmarks.findOneAndDelete({
      user_id: new ObjectId(user_id),
      _id: new ObjectId(bookmark_id)
    })
    return result.value as WithId<Bookmark>
  }
}

const bookmarksServices = new BookmarksServices()
export default bookmarksServices
