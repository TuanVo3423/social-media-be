import { NextFunction, Request, Response } from 'express'
import { omit } from 'lodash'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ErrorWithStatus) {
    return res.status(err.status).json(omit(err, 'status'))
  }
  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, { enumerable: true })
  })
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: err.message,
    errorInfo: omit(err, 'stack')
  })
}
// lỗi có status đi kèm -> lỗi của mình custom
// lỗi không có status đi kèm => mặc định sẽ là 500, lỗi server -> lỗi của trình duyệt trả về, không custom
