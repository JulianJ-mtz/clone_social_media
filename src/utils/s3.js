import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { config } from '../config.js'

const bucketName = config.AWS_BUCKET_NAME
const region = config.AWS_BUCKET_REGION
const accessKeyId = config.AWS_ACCESS_KEY
const secretAccessKey = config.AWS_SECRET_ACCESS_KEY

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey
  }
})

export async function uploadFile (fileBuffer, fileName, mimetype) {
  const uploadParams = {
    Bucket: bucketName,
    Body: fileBuffer,
    Key: fileName,
    ContentType: mimetype
  }

  return s3Client.send(new PutObjectCommand(uploadParams))
}

export async function getFileStream (fileKey) {
  const downloadParams = {
    Key: fileKey,
    Bucket: bucketName
  }

  return s3Client.send(new GetObjectCommand(downloadParams))
}

export async function getSignedFileUrl (fileKey, expiresIn = 3600) {
  const params = {
    Bucket: bucketName,
    Key: fileKey
  }

  const command = new GetObjectCommand(params)
  return getSignedUrl(s3Client, command, { expiresIn })
}

export async function deleteFile (fileKey) {
  const deleteParams = {
    Bucket: bucketName,
    Key: fileKey
  }

  return s3Client.send(new DeleteObjectCommand(deleteParams))
}
