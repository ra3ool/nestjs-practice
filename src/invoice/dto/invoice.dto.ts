import {
  IsNumber,
  IsPositive,
  IsArray,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemsDto)
  items: InvoiceItemsDto[];
}

export class InvoiceItemsDto {
  @IsString()
  sku: string;

  @IsString()
  qt: string;
}
