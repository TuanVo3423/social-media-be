import { NextFunction, Request, Response } from 'express'
import { handleUploadSingleImage } from '~/utils/file'

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  // upload into folder upload
  const data = await handleUploadSingleImage(req)
  return res.json({
    message: 'Upload success'
  })
}
