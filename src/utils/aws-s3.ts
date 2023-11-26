import {
  PutObjectCommand,
  S3Client,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';

const configService = new ConfigService();

const s3Client = new S3Client({
  region: configService.get('AWS_S3_REGION'),
});

export const uploadImageToS3 = async (pipeline: sharp.Sharp, options: any) => {
  try {
    const buffer = await pipeline.toBuffer();
    const filePath = `${options?.folder || ''}/${options?.filename}`;
    const bucket = configService.get<string>('AWS_S3_BUCKET');

    return s3Client
      .send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: filePath,
          Body: buffer,
          ACL: 'public-read',
        }),
      )
      .then(() => {
        const url = `https://${bucket}.s3.amazonaws.com/${filePath}`;
        return { url, providerMetadata: { key: filePath } };
      })
      .catch((error) => error);
  } catch (err) {
    return err;
  }
};

export const deleteImagesFromS3 = async (objects: { Key: string }[]) => {
  return await s3Client.send(
    new DeleteObjectsCommand({
      Bucket: configService.get<string>('AWS_S3_BUCKET'),
      Delete: { Objects: objects },
    }),
  );
};
