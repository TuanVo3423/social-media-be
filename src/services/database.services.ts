import { Collection, Db, MongoClient } from 'mongodb'
import User from '../models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Follower from '~/models/schemas/Follower.schema'
import Tweet from '~/models/schemas/Tweet.schema'
import Hashtag from '~/models/schemas/HashTag.schema'

class DatabaseServices {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(process.env.DB_URL as string)
    this.db = this.client.db(process.env.DB_NAME)
  }
  async connect() {
    try {
      await this.client.connect()
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async indexUsers() {
    const isExist = await this.users.indexExists(['email_1', 'username_1', 'email_1_password_1'])
    if (!isExist) {
      this.users.createIndex({ email: 1, password: 1 })
      this.users.createIndex({ email: 1 }, { unique: true })
      this.users.createIndex({ username: 1 }, { unique: true })
    }
  }

  async indexRefreshTokens() {
    const isExist = await this.refreshToken.indexExists(['exp_1', 'token_1'])
    if (!isExist) {
      this.refreshToken.createIndex({ token: 1 })
      this.refreshToken.createIndex({ exp: 1 }, { expireAfterSeconds: 0 })
    }
  }

  async indexFollowers() {
    const isExist = await this.followers.indexExists('user_id_1_followed_user_id_1')
    if (!isExist) {
      this.followers.createIndex({ user_id: 1, followed_user_id: 1 })
    }
  }

  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }

  get refreshToken(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string)
  }

  get followers(): Collection<Follower> {
    return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION as string)
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection(process.env.DB_TWEETS_COLLECTION as string)
  }
  get hashtags(): Collection<Hashtag> {
    return this.db.collection(process.env.DB_HASHTAGS_COLLECTION as string)
  }
}

const databaseServices = new DatabaseServices()
export default databaseServices
