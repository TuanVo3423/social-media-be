import { NextFunction, Request, Response } from 'express'
import path from 'path'
import { UPLOAD_FOLDER } from '~/constants/dir'
import { USER_MESSAGES } from '~/constants/message'
import mediasService from '~/services/medias.services'

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  // upload into folder upload
  const urls = await mediasService.upLoadImage(req)
  return res.json({
    message: USER_MESSAGES.UPLOAD_SUCCESS,
    result: urls
  })
}

export const serveImageController = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_FOLDER, name), (err) => {
    if (err) {
      return res.status(404).json('Not found')
    }
  })
}
