import { Router } from 'express'
import { getConversationsController } from '~/controllers/conversations.controller'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const conversationRouter = Router()

conversationRouter.get(
  '/reciever/:reciever_id',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(getConversationsController)
)

export default conversationRouter
