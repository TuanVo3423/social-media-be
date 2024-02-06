import { Router } from 'express'
import {
  changePasswordController,
  followController,
  forgotPasswordController,
  getMeController,
  loginController,
  logoutController,
  oauthController,
  refreshTokenController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  unfolowController,
  updateMeController,
  verifyEmailController,
  verifyForgotPasswordController
} from '~/controllers/users.controller'
import { FilterValidator } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  verifyForgotPasswordTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  verifiedUserValidator,
  updateMeValidator,
  followValidator,
  changePasswordValidator
} from '~/middlewares/users.middlewares'
import { UpdateMeReqBody } from '~/models/requests/users.requests'
import { wrapRequestHandler } from '~/utils/handlers'

const usersRouter = Router()

// add middlewares here
usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))
usersRouter.get('/oauth/google', wrapRequestHandler(oauthController))
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))
usersRouter.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))
usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController))
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(resendVerifyEmailController))
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordController)
)

usersRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))

usersRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController))
usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  FilterValidator<UpdateMeReqBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'username',
    'avatar',
    'cover_photo'
  ]),
  wrapRequestHandler(updateMeController)
)

usersRouter.post(
  '/follow',
  followValidator,
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(followController)
)

usersRouter.delete(
  '/follow/:user_id',
  followValidator,
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(unfolowController)
)

usersRouter.put(
  '/password',
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
)

export default usersRouter

// class errorWithStatus
//
