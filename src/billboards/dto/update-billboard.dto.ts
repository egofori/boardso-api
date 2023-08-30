import { PartialType } from '@nestjs/mapped-types';
import { CreateBillboardDto } from './create-billboard.dto';

export class UpdateBillboardDto extends PartialType(CreateBillboardDto) {}
