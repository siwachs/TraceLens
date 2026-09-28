import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UploadResearchAssetDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  filename: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  contentType: string;
}
