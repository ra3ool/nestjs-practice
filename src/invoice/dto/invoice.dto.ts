import { IsNumber, IsString, IsOptional, IsPositive } from 'class-validator';

export class InvoiceDto {
  @IsNumber()
  @IsPositive()
  user: number;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;
}