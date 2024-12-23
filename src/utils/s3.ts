import { S3Client, S3 } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import fs from 'fs'
import path from 'path'
import { envConfigs } from '~/constants/config'
const s3 = new S3({
  region: envConfigs.AWS_REGION,
  credentials: {
    secretAccessKey: envConfigs.AWS_SECRET_ACCESS_KEY,
    accessKeyId: envConfigs.AWS_ACCESS_KEY_ID
  }
})

s3.listBuckets({})
  .then((data) => {
    console.log(data)
  })
  .catch((error) => {
    console.error(error)
  })

// const file = fs.readFileSync(path.resolve('uploads/images/panda.jpg'))

export const handleUploadToS3 = async ({
  fileName,
  filePath,
  contentType
}: {
  fileName: string
  filePath: string
  contentType: string
}) => {
  const parallelUploads3 = new Upload({
    client: s3 || new S3Client({}),
    params: {
      Bucket: envConfigs.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: fs.readFileSync(path.resolve(filePath)),
      ContentType: contentType
    },

    tags: [
      /*...*/
    ], // optional tags
    queueSize: 4, // optional concurrency configuration
    partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
    leavePartsOnError: false // optional manually handle dropped parts
  })
  return parallelUploads3.done()
}

// parallelUploads3.on('httpUploadProgress', (progress) => {
//   console.log(progress)
// })
