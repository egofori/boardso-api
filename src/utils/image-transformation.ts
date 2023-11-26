import * as toStream from 'buffer-to-stream';
import { UploadApiOptions } from 'cloudinary';
import * as sharp from 'sharp';
import { deleteImagesFromS3, uploadImageToS3 } from './aws-s3';
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from './cloudinary';

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
) =>
  optimizeImage(file)
    .then((result) => result.pipe(sharp().resize(options)))
    .catch((err) => err);

export const resizeImageToThumbnail = (file: Express.Multer.File) =>
  getFileMetadata(file)
    .then((result: sharp.Metadata) => {
      if (
        result.width > THUMBNAIL_SIZE.width ||
        result.height > THUMBNAIL_SIZE.height
      )
        return resizeImageTo(file, THUMBNAIL_SIZE);

      return optimizeImage(file);
    })
    .catch((err) => err);

export const resizeImageToMax = (file: Express.Multer.File) =>
  getFileMetadata(file)
    .then((result: sharp.Metadata) => {
      if (
        result.width > MAX_IMAGE_SIZE.width ||
        result.height > MAX_IMAGE_SIZE.height
      )
        return resizeImageTo(file, MAX_IMAGE_SIZE);

      return optimizeImage(file);
    })
    .catch((err) => err);

export const optimizeImage = async (file: Express.Multer.File) =>
  getFileMetadata(file).then((result: sharp.Metadata) => {
    const pipeline = sharp();
    // reduce image quality
    pipeline[result.format]({ quality: 80 });
    // rotate image based on EXIF data
    pipeline.rotate();

    return toStream(file.buffer).pipe(pipeline);
  });

export const uploadImage = async (pipeline: sharp.Sharp, config: any) => {
  const { provider } = config || {};

  if (provider === 'CLOUDINARY') {
    const options: UploadApiOptions = {
      folder: config.folder,
      filename_override: config.filename,
      resource_type: 'image',
      unique_filename: false,
      use_filename: true,
    };
    return await uploadImageToCloudinary(pipeline, options);
  } else if (provider === 'AWS_S3') {
    return await uploadImageToS3(pipeline, config);
  }
};

export const deleteImage = async (imageData: {
  provider: string;
  providerMetadata: any;
  [x: string]: any;
}) => {
  const { provider, providerMetadata } = imageData || {};

  switch (provider) {
    case 'AWS_S3':
      return await deleteImagesFromS3([{ Key: providerMetadata?.key }]);
    case 'CLOUDINARY':
      return await deleteImageFromCloudinary(providerMetadata);
    default:
      break;
  }
};
