import {
  IsNumber,
  IsPositive,
  IsArray,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

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
