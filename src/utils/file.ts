import { Request } from 'express'
import formidable, { File } from 'formidable'
import fs from 'fs'
import { UPLOAD_IMAGE_FOLDER, UPLOAD_IMAGE_TEMP_FOLDER, UPLOAD_VIDEO_FOLDER } from '~/constants/dir'
export const initFolder = () => {
  ;[UPLOAD_IMAGE_TEMP_FOLDER, UPLOAD_IMAGE_FOLDER, UPLOAD_VIDEO_FOLDER].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true
      })
    }
  })
}

export const handleUploadImage = async (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_FOLDER,
    maxFiles: 4,
    maxFileSize: 3000 * 1024, //3000KB
    maxTotalFileSize: 3000 * 1024 * 4,
    keepExtensions: true,
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!valid) {
        form.emit('error' as any, new Error('Invalid file type') as any)
      }
      return valid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.image)) {
        return reject(new Error('Invalid file'))
      }
      return resolve(files.image as File[])
    })
  })
}

export const handleUploadVideo = async (req: Request) => {
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_FOLDER,
    maxFiles: 1,
    maxFileSize: 3000 * 1024 * 1024, //3000KB
    // keepExtensions: true,
    filter: function ({ name, originalFilename, mimetype }) {
      // const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      // if (!valid) {
      //   form.emit('error' as any, new Error('Invalid file type') as any)
      // }
      // return valid
      return true
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }

      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.video)) {
        return reject(new Error('Invalid file'))
      }
      ;(files.video as File[]).forEach((video) => {
        const oldPath = video.filepath
        const extenstion = getExtentionFromFilePath(video.originalFilename as string)
        const newPath = oldPath + `.${extenstion}`
        fs.renameSync(oldPath, newPath)
        video.newFilename = video.newFilename + `.${extenstion}`
      })

      return resolve(files.video as File[])
    })
  })
}

export const getNameFromFilePath = (filePath: string) => {
  const paths = filePath.split('.')
  paths.pop()
  return paths.join('')
}

export const getExtentionFromFilePath = (filePath: string) => {
  const paths = filePath.split('.')
  return paths[paths.length - 1]
}
