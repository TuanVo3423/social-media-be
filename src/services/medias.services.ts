import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_FOLDER } from '~/constants/dir'
import { getNameFromFilePath, handleUploadSingleImage } from '~/utils/file'
import fs from 'fs'
class MediasServices {
  async upLoadSingleImage(req: Request) {
    const { filepath, newFilename, originalFilename } = await handleUploadSingleImage(req)
    // convert to jpeg
    const newName = getNameFromFilePath(newFilename)
    const newPath = path.resolve(UPLOAD_FOLDER, `${newName}.jpeg`)
    await sharp(filepath).jpeg().toFile(newPath)
    // delete temp file
    fs.unlinkSync(filepath)
    return `localhost:3000/uploads/${newName}.jpeg`
  }
}

const mediasService = new MediasServices()
export default mediasService
