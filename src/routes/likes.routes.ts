import { Router } from 'express'
import { likeTweetController, unlikeTweetController } from '~/controllers/likes.controller'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const likesRouter = Router()

likesRouter.post('/', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(likeTweetController))
likesRouter.delete('/:tweet_id', accessTokenValidator, verifiedUserValidator, wrapRequestHandler(unlikeTweetController))
export default likesRouter
