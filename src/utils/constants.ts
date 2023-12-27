import { ParseFilePipeBuilder } from '@nestjs/common';

export const imageValidator = new ParseFilePipeBuilder()
  .addFileTypeValidator({
    fileType: /(jpeg|jpg|png)/,
  })
  .addMaxSizeValidator({
    // 5 MB
    maxSize: 5 * 1024 ** 2,
  })
  .build();
