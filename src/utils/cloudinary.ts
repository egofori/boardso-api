import * as sharp from 'sharp';
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiOptions,
} from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { BillboardImage } from '@prisma/client';
const config = new ConfigService();

export const uploadImageToCloudinary = async (
  pipeline: sharp.Sharp,
  options?: UploadApiOptions,
): Promise<
  { url: string; providerMetadata?: any } | UploadApiErrorResponse
> => {
  return new Promise((resolve, reject) => {
    cloudinary.config({
      cloud_name: config.get<string>('CLOUD_NAME'),
      api_key: config.get<string>('CLOUD_API_KEY'),
      api_secret: config.get<string>('CLOUD_API_SECRET'),
    });
    const upload = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          providerMetadata: {
            resourceType: result.resource_type,
            publicId: result.public_id,
          },
        });
      },
    );
    pipeline.pipe(upload);
  });
};

export const deleteImageFromCloudinary = async (
  billboardImage: BillboardImage,
) => {
  try {
    const { resourceType, publicId }: any =
      billboardImage.providerMetadata ?? {};
    const deleteConfig = {
      resource_type: (resourceType || 'image') as string,
      invalidate: true,
    };

    const response = await cloudinary.uploader.destroy(
      `${publicId}`,
      deleteConfig,
    );

    if (response.result !== 'ok' && response.result !== 'not found') {
      throw new Error(response.result);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error deleting on cloudinary: ${error.message}`);
    }

    throw error;
  }
};
