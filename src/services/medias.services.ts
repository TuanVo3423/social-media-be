import { Request } from 'express'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { isProduction } from '~/constants/deloyment'
import { UPLOAD_FOLDER } from '~/constants/dir'
import { MediaType } from '~/constants/enums'
import { Media } from '~/models/Others'
import { getNameFromFilePath, handleUploadImage } from '~/utils/file'
class MediasServices {
  async upLoadImage(req: Request) {
    // upload image into temp folder
    const files = await handleUploadImage(req)
    // convert to jpeg
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFilePath(file.newFilename)
        const newPath = path.resolve(UPLOAD_FOLDER, `${newName}.jpeg`)
        await sharp(file.filepath).jpeg().toFile(newPath)
        // delete temp file
        fs.unlinkSync(file.filepath)
        const url = isProduction
          ? `${process.env.HOST}/static/image/${newName}.jpeg`
          : `http://localhost:${process.env.PORT}/static/image/${newName}.jpeg`
        return {
          url,
          type: MediaType.Image
        }
      })
    )
    return result
  }
}

const mediasService = new MediasServices()
export default mediasService
