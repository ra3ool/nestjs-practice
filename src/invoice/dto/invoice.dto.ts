import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

export class InvoiceDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemsDto)
  items: InvoiceItemsDto[];
}

export class InvoiceIdDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  id: number;
}

export class InvoiceItemsDto {
  @IsString()
  sku: string;

  @IsNumber()
  qt: number;
}
