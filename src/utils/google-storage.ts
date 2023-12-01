import sharp from 'sharp';
import { Storage } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

const storage = new Storage({
  projectId: configService.get('GCS_PROJECT_ID'),
  keyFilename: 'gcsServiceAccount.json',
});

const bucket = storage.bucket(configService.get('GCS_BUCKET'));

export const uploadImageToGCS = async (pipeline: sharp.Sharp, options: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      const buffer = await pipeline.toBuffer();
      const filePath = `${options?.folder || ''}/${options?.filename}`;

      // Create a new blob in the bucket and upload the file data.
      const blob = bucket.file(filePath);
      const blobStream = blob.createWriteStream({
        resumable: false,
      });

      blobStream.on('error', (err) => reject(err.message));

      blobStream.on('finish', async () => {
        return bucket
          .file(filePath)
          .makePublic()
          .then(() => {
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            return resolve({
              url: publicUrl,
              providerMetadata: { name: filePath },
            });
          })
          .catch((err) => reject(err));
      });

      blobStream.end(buffer);
    } catch (err) {
      return reject(err);
    }
  });
};

export const deleteImageFromGCS = async (providerMetadata: any) => {
  const { name }: any = providerMetadata ?? {};

  return await storage.bucket(bucket.name).file(name).delete();
};
