import { Request } from 'express'
import fs from 'fs/promises'
import fsPromise from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { isProduction } from '~/constants/deloyment'
import { UPLOAD_IMAGE_FOLDER, UPLOAD_VIDEO_FOLDER } from '~/constants/dir'
import { MediaType } from '~/constants/enums'
import { Media } from '~/models/Others'
import { getNameFromFilePath, handleUploadImage, handleUploadVideo } from '~/utils/file'
import { handleUploadToS3 } from '~/utils/s3'
import mime from 'mime'

class MediasServices {
  async upLoadImage(req: Request) {
    // upload image into temp folder
    const files = await handleUploadImage(req)
    // convert to jpeg
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFilePath(file.newFilename)
        const newFullFileName = `${newName}.jpg`
        const newPath = path.resolve(UPLOAD_IMAGE_FOLDER, `${newFullFileName}`)
        await sharp(file.filepath).jpeg().toFile(newPath)
        // upload to S3
        const uploadResult = await handleUploadToS3({
          fileName: 'images/' + newFullFileName,
          filePath: newPath,
          contentType: mime.getType(newPath) as string
        })
        // delete temp file
        await Promise.all([fsPromise.unlink(file.filepath), fsPromise.unlink(newPath)])
        return {
          url: uploadResult.Location as string,
          type: MediaType.Image
        }
        // fs.unlinkSync(file.filepath)
        // const url = isProduction
        //   ? `${process.env.HOST}/static/image/${newFullFileName}`
        //   : `http://localhost:${process.env.PORT}/static/image/${newFullFileName}`
        // return {
        //   url,
        //   type: MediaType.Image
        // }
      })
    )
    return result
  }

  async upLoadVideo(req: Request) {
    // upload video into video folder
    const files = await handleUploadVideo(req)
    // upload to S3
    const result = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFilePath(file.newFilename)
        const newFullFileName = `${newName}.mp4`
        const newPath = path.resolve(UPLOAD_VIDEO_FOLDER, `${newFullFileName}`)
        const uploadResult = await handleUploadToS3({
          fileName: 'videos/' + newFullFileName,
          filePath: newPath,
          contentType: mime.getType(newPath) as string
        })
        await fsPromise.unlink(file.filepath)
        // const url = isProduction
        //   ? `${process.env.HOST}/static/video/${file.newFilename}`
        //   : `http://localhost:${process.env.PORT}/static/video-stream/${file.newFilename}`

        // console.log('uploadResult', uploadResult)
        return {
          url: uploadResult.Location as string,
          type: MediaType.Video
        }
      })
    )
    return result
  }
}

const mediasService = new MediasServices()
export default mediasService
