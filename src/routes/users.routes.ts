import { Router } from 'express'
import { registerController } from '~/controllers/users.controller'
import { registerValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const usersRouter = Router()

// add middlewares here
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

export default usersRouter

// class errorWithStatus
// 