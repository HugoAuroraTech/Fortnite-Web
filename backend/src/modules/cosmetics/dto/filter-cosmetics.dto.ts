import {
  IsOptional,
  IsString,
  IsBooleanString,
  IsDateString,
} from 'class-validator';

export class FilterCosmeticsDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  rarity?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsBooleanString()
  isNew?: string;

  @IsOptional()
  @IsBooleanString()
  isOnSale?: string;
}
