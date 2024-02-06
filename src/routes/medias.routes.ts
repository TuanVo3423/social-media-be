import { Router } from 'express'
import { uploadImageController } from '~/controllers/medias.controller'
import { wrapRequestHandler } from '~/utils/handlers'

const mediasRouter = Router()

mediasRouter.post('/upload', wrapRequestHandler(uploadImageController))

export default mediasRouter
