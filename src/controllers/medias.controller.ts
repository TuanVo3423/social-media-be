import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import { UPLOAD_IMAGE_FOLDER, UPLOAD_VIDEO_FOLDER } from '~/constants/dir'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { USER_MESSAGES } from '~/constants/message'
import mediasService from '~/services/medias.services'
import mime from 'mime'

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

export const getVersion = (req: Request, res: Response, next: NextFunction) => {
  return res.json({
    version: 1
  })
}

export const serveVideoStreamController = (req: Request, res: Response, next: NextFunction) => {
  // get header range from client
  const range = req.headers.range
  if (!range) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json('Require range header')
  }

  const { name } = req.params
  const pathVideo = path.resolve(UPLOAD_VIDEO_FOLDER, name)
  // get video size
  const videoSize = fs.statSync(pathVideo).size

  const chunkSize = 10 ** 6 // 10^6 = 1MB

  // get start and end from range header
  const start = Number(range.replace(/\D/g, ''))
  const end = Math.min(start + chunkSize, videoSize - 1)

  const contentLength = end - start + 1
  const contentType = mime.getType(pathVideo) || 'video/*'

  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }
  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers)
  const videoStreams = fs.createReadStream(pathVideo, { start, end })
  videoStreams.pipe(res)
}
