import { NextFunction, Request, Response } from 'express'
import { omit } from 'lodash'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  try {
    if (err instanceof ErrorWithStatus) {
      return res.status(err.status).json(omit(err, 'status'))
    }
    const finalError: any = {}

    // lấy các key của err, nếu key đó không phải là enumerable hoặc configurable thì bỏ qua (loi do aws khong cho overide error)
    Object.getOwnPropertyNames(err).forEach((key) => {
      if (
        !Object.getOwnPropertyDescriptor(err, key)?.enumerable ||
        !Object.getOwnPropertyDescriptor(err, key)?.configurable
      ) {
        return
      }
      finalError[key] = err[key]
    })
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: finalError.message,
      errorInfo: omit(finalError, 'stack')
    })
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Internal server error',
      errorInfo: omit(error as any, 'stack')
    })
  }
}
// lỗi có status đi kèm -> lỗi của mình custom
// lỗi không có status đi kèm => mặc định sẽ là 500, lỗi server -> lỗi của trình duyệt trả về, không custom
