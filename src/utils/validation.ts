import express from 'express'
import { ValidationChain, validationResult } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { EntityError, ErrorWithStatus } from '~/models/Errors'
// can be reused by many routes

// sequential processing, stops running validations chain if the previous one fails.
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await validation.run(req)
    const errors = validationResult(req)
    // neu khong co loi -> next
    if (errors.isEmpty()) {
      return next()
    }
    const entityError = new EntityError({ errors: {} })
    const errorsObject = errors.mapped()
    // neu loi khong phai validator : 422
    for (const key in errorsObject) {
      const { msg } = errorsObject[key]

      if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        return next(msg)
      }
      entityError.errors[key] = errorsObject[key]
    }

    next(entityError)
  }
}
