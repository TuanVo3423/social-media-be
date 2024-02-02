import { NextFunction, Request, Response } from 'express'
import mediasService from '~/services/medias.services'

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  // upload into folder upload
  const result = await mediasService.upLoadSingleImage(req)
  return res.json(result)
}
