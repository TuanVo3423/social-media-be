import { Router } from 'express'
import { uploadImageController, uploadVideoController } from '~/controllers/medias.controller'
import { wrapRequestHandler } from '~/utils/handlers'

const mediasRouter = Router()

mediasRouter.post('/upload/image', wrapRequestHandler(uploadImageController))
mediasRouter.post('/upload/video', wrapRequestHandler(uploadVideoController))

export default mediasRouter
