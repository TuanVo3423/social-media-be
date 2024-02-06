import { NextFunction, Request, Response } from 'express'
import path from 'path'
import { UPLOAD_IMAGE_FOLDER, UPLOAD_VIDEO_FOLDER } from '~/constants/dir'
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

export const uploadVideoController = async (req: Request, res: Response, next: NextFunction) => {
  const urls = await mediasService.upLoadVideo(req)
  return res.json({
    message: USER_MESSAGES.UPLOAD_SUCCESS,
    result: urls
  })
}

export const serveImageController = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_IMAGE_FOLDER, name), (err) => {
    if (err) {
      return res.status(404).json('Not found')
    }
  })
}

export const serveVideoController = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_VIDEO_FOLDER, name), (err) => {
    if (err) {
      return res.status(404).json('Not found')
    }
  })
}
