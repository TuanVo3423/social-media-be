import { Router } from 'express'
import { serveImageController, serveVideoController } from '~/controllers/medias.controller'
import { wrapRequestHandler } from '~/utils/handlers'

const staticRouter = Router()

staticRouter.get('/image/:name', wrapRequestHandler(serveImageController))
staticRouter.get('/video/:name', wrapRequestHandler(serveVideoController))

export default staticRouter
