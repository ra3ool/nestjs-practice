import { IsOptional, IsDate, IsNumber, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class InvoiceFiltersDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsNumber()
  minAmount?: number;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsNumber()
  maxAmount?: number;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : 1))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : 10))
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
