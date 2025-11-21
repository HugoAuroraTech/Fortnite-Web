import { IsString, IsOptional } from 'class-validator';

export class PurchaseDto {
  @IsString()
  @IsOptional()
  cosmeticId?: string;

  @IsString()
  @IsOptional()
  bundleId?: string;
}
