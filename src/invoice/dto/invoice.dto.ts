import {
  IsNumber,
  IsString,
  IsOptional,
  IsPositive,
  IsArray,
} from 'class-validator';

export class InvoiceDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  items: any;
}
