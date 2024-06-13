// import { Upload } from "@aws-sdk/lib-storage"
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import fs from 'fs'
import { ActionInput } from './input'
import { getMimeType } from './utils'

export type UploadResult = boolean

export async function uploadSingleFile({
  s3,
  input,
  source,
  destination
}: {
  s3: S3Client
  input: ActionInput
  source: string
  destination: string
}): Promise<UploadResult> {
  const contentType = await getMimeType(source)
  const file = fs.readFileSync(source)

  // up to 5GB
  const command = new PutObjectCommand({
    Bucket: input.bucket,
    Key: destination,
    Body: file,
    // FIXME: types mismatch
    // ...input.acl && { ACL: input.acl },
    // FIXME: currently undocumented, easy to implement
    // ...input.cacheControl && { CacheControl: input.cacheControl },
    ...(contentType && { ContentType: contentType })
  })

  // TODO: handle >5GB using from @aws-sdk/lib-storage
  // if (file.size > 5e+9) {
  //   const result = await new Upload({
  //     client,
  //     params: {
  //       ACL: acl,
  //       Bucket: bucket,
  //       Key: destination,
  //       Body: file,
  //     }
  //   }).done()
  // }

  const result = await s3.send(command)
  console.info(
    'UPLOAD SINGLE FILE RESULT:',
    '\nFROM:',
    source,
    '\nTO:',
    destination,
    '\nRESULT:',
    result
  )

  // TODO: return actually usefull stuff
  return Boolean(result)
}

export default uploadSingleFile
