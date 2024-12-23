import { config } from 'dotenv'
const env = process.env.NODE_ENV
config({
  path: env ? `.env.${env}` : '.env'
})

export const envConfigs = {
  PORT: (process.env.PORT as string) || 3000,
  CLIENT_REDIRECT_CALLBACK: process.env.CLIENT_REDIRECT_CALLBACK as string,
  JWT_SECRET_FORGOT_PASSWORD_TOKEN: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
  JWT_SECRET_ACCESS_TOKEN: process.env.JWT_SECRET_ACCESS_TOKEN as string,
  JWT_SECRET_REFRESH_TOKEN: process.env.JWT_SECRET_REFRESH_TOKEN as string,
  JWT_SECRET_EMAIL_VERIFY_TOKEN: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
  DB_URL: process.env.DB_URL as string,
  DB_NAME: process.env.DB_NAME as string,
  DB_USERS_COLLECTION: process.env.DB_USERS_COLLECTION as string,
  DB_REFRESH_TOKENS_COLLECTION: process.env.DB_REFRESH_TOKENS_COLLECTION as string,
  DB_FOLLOWERS_COLLECTION: process.env.DB_FOLLOWERS_COLLECTION as string,
  DB_TWEETS_COLLECTION: process.env.DB_TWEETS_COLLECTION as string,
  DB_HASHTAGS_COLLECTION: process.env.DB_HASHTAGS_COLLECTION as string,
  DB_BOOKMARKS_COLLECTION: process.env.DB_BOOKMARKS_COLLECTION as string,
  DB_LIKES_COLLECTION: process.env.DB_LIKES_COLLECTION as string,
  DB_CONVERSATIONS_COLLECTION: process.env.DB_CONVERSATIONS_COLLECTION as string,
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
  EMAIL_VERIFY_TOKEN_EXPIRES_IN: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN as string,
  FORGOT_PASSWORD_TOKEN_EXPIRES_IN: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN as string,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI as string,
  AWS_REGION: process.env.AWS_REGION as string,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY as string,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID as string,
  SES_FROM_ADDRESS: process.env.SES_FROM_ADDRESS as string,
  CLIENT_URL: process.env.CLIENT_URL as string,
  PASSWORD_HASH: process.env.PASSWORD_HASH as string,
  AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME as string
}
