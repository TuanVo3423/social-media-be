import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_FOLDER } from '~/constants/dir'
import { getNameFromFilePath, handleUploadSingleImage } from '~/utils/file'
import fs from 'fs'
import { isProduction } from '~/constants/deloyment'
class MediasServices {
  async upLoadSingleImage(req: Request) {
    const { filepath, newFilename, originalFilename } = await handleUploadSingleImage(req)
    // convert to jpeg
    const newName = getNameFromFilePath(newFilename)
    const newPath = path.resolve(UPLOAD_FOLDER, `${newName}.jpeg`)
    await sharp(filepath).jpeg().toFile(newPath)
    // delete temp file
    fs.unlinkSync(filepath)
    const url = isProduction
      ? `${process.env.HOST}/medias/${newName}.jpeg`
      : `http://localhost:${process.env.PORT}/medias/${newName}.jpeg`
    return url
  }
}

const mediasService = new MediasServices()
export default mediasService
