import * as toStream from 'buffer-to-stream';
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiOptions,
  UploadApiResponse,
} from 'cloudinary';
import * as sharp from 'sharp';
import { ConfigService } from '@nestjs/config';

const config = new ConfigService();

// get image information
export const getFileMetadata = (file: Express.Multer.File) =>
  new Promise(
    (resolve: (value: sharp.Metadata) => void | PromiseLike<void>, reject) => {
      const pipeline = sharp();
      pipeline.metadata().then(resolve).catch(reject);
      toStream(file.buffer).pipe(pipeline);
    },
  );

export const THUMBNAIL_SIZE: sharp.ResizeOptions = {
  width: 500,
  height: 500,
  fit: 'inside',
};

export const MAX_IMAGE_SIZE: sharp.ResizeOptions = {
  width: 1920,
  height: 1920,
  fit: 'inside',
};

export const resizeImageTo = (
  file: Express.Multer.File,
  options?: sharp.ResizeOptions,
) => optimizeImage(file).then((result) => result.pipe(sharp().resize(options)));

export const resizeImageToThumbnail = (file: Express.Multer.File) =>
  getFileMetadata(file).then((result: sharp.Metadata) => {
    if (
      result.width > THUMBNAIL_SIZE.width ||
      result.height > THUMBNAIL_SIZE.height
    )
      return resizeImageTo(file, THUMBNAIL_SIZE);

    return optimizeImage(file);
  });

export const resizeImageToMax = (file: Express.Multer.File) =>
  getFileMetadata(file).then((result: sharp.Metadata) => {
    if (
      result.width > MAX_IMAGE_SIZE.width ||
      result.height > MAX_IMAGE_SIZE.height
    )
      return resizeImageTo(file, MAX_IMAGE_SIZE);

    return optimizeImage(file);
  });

export const optimizeImage = async (file: Express.Multer.File) =>
  getFileMetadata(file).then((result: sharp.Metadata) => {
    const pipeline = sharp();
    // reduce image quality
    pipeline[result.format]({ quality: 80 });
    // rotate image based on EXIF data
    pipeline.rotate();

    return toStream(file.buffer).pipe(pipeline);
  });

export const uploadImage = async (pipeline: sharp.Sharp, config?: any) => {
  const { provider } = config || {};

  if (provider === 'CLOUDINARY') {
    const options: UploadApiOptions = {
      folder: config?.folder,
      filename_override: config?.filename,
      resource_type: 'image',
      unique_filename: false,
      use_filename: true,
    };
    return uploadImageToCloudinary(pipeline, options);
  }
};

export const uploadImageToCloudinary = async (
  pipeline: sharp.Sharp,
  options?: UploadApiOptions,
): Promise<UploadApiResponse | UploadApiErrorResponse> => {
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
        resolve(result);
      },
    );
    pipeline.pipe(upload);
  });
};
