import fs from 'fs'
import path from 'path'
export const initFolder = () => {
  if (!fs.existsSync(path.resolve('uploads'))) {
    fs.mkdirSync(path.resolve('uploads'), {
      recursive: true
    })
  }
}
