import { IsNumber, IsPositive, IsArray, IsString } from 'class-validator';

export class InvoiceDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsArray()
  items: InvoiceItemsDto[];
}

export class InvoiceItemsDto {
  @IsString()
  sku: string;

  @IsString()
  qt: string;
}
