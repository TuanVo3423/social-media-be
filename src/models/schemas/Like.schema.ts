import { ObjectId } from 'mongodb'

interface ILike {
  _id?: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  created_at?: Date
}

export default class Like {
  _id?: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  created_at: Date
  constructor({ _id, tweet_id, user_id, created_at }: ILike) {
    this._id = _id || new ObjectId()
    this.user_id = user_id
    this.tweet_id = tweet_id
    this.created_at = created_at || new Date()
  }
}
