import { ParseFilePipeBuilder } from '@nestjs/common';

export const imageValidator = new ParseFilePipeBuilder()
  .addFileTypeValidator({
    fileType: /(jpeg|jpg|png)/,
  })
  .addMaxSizeValidator({
    maxSize: 2000000,
  })
  .build();
