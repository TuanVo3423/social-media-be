import { Request } from 'express'
import User from './models/schemas/User.schema'
import { TokenPayload } from './models/requests/register.requests'

declare module 'express' {
  interface Request {
    user?: User
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
  }
}
