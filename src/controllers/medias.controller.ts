import { NextFunction, Request, Response } from 'express'
import path from 'path'
import { UPLOAD_FOLDER } from '~/constants/dir'
import { USER_MESSAGES } from '~/constants/message'
import mediasService from '~/services/medias.services'

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  // upload into folder upload
  const url = await mediasService.upLoadSingleImage(req)
  return res.json({
    message: USER_MESSAGES.UPLOAD_SUCCESS,
    result: url
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
