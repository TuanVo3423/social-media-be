import { Router } from 'express'
import { serveImageController, serveVideoStreamController } from '~/controllers/medias.controller'
import { wrapRequestHandler } from '~/utils/handlers'

const staticRouter = Router()

staticRouter.get('/image/:name', wrapRequestHandler(serveImageController))
staticRouter.get('/video-stream/:name', wrapRequestHandler(serveVideoStreamController))

export default staticRouter
