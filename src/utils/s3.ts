import { S3Client, S3 } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import fs from 'fs'
import path from 'path'
const s3 = new S3({
  region: process.env.AWS_REGION as string,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string
  }
})

s3.listBuckets({})
  .then((data) => {
    console.log(data)
  })
  .catch((error) => {
    console.error(error)
  })

const file = fs.readFileSync(path.resolve('uploads/images/panda.jpg'))

const parallelUploads3 = new Upload({
  client: s3 || new S3Client({}),
  params: { Bucket: process.env.AWS_S3_BUCKET_NAME as string, Key: 'anh1.jpg', Body: file, ContentType: 'image/jpeg' },

  tags: [
    /*...*/
  ], // optional tags
  queueSize: 4, // optional concurrency configuration
  partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
  leavePartsOnError: false // optional manually handle dropped parts
})

parallelUploads3.on('httpUploadProgress', (progress) => {
  console.log(progress)
})

parallelUploads3.done().then((res) => console.log(res))
