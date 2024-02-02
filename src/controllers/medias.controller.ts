import { NextFunction, Request, Response } from 'express'
import formidable from 'formidable'
import path from 'path'

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  // upload into folder upload
  const form = formidable({
    uploadDir: path.resolve('uploads'),
    maxFiles: 1,
    maxFieldsSize: 300 * 1024,
    keepExtensions: true
  })
  form.parse(req, (err, fields, files) => {
    if (err) {
      throw err
    }
    return res.json({ message: 'upload successfully!' })
  })
}
