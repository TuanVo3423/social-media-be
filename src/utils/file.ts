import { Request } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs'
import path from 'path'
import { UPLOAD_TEMP_FOLDER } from '~/constants/dir'
export const initFolder = () => {
  if (!fs.existsSync(UPLOAD_TEMP_FOLDER)) {
    fs.mkdirSync(UPLOAD_TEMP_FOLDER, {
      recursive: true
    })
  }
}

export const handleUploadSingleImage = async (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_TEMP_FOLDER,
    maxFiles: 1,
    maxFileSize: 3000 * 1024, //3000KB
    keepExtensions: true,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('Invalid file type') as any)
      }
      return valid
    }
  })
  return new Promise<File>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.image)) {
        return reject(new Error('Invalid file'))
      }
      return resolve((files.image as File[])[0])
    })
  })
}

export const getNameFromFilePath = (filePath: string) => {
  const paths = filePath.split('.')
  paths.pop()
  return paths.join('')
}
