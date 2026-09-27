import { IsString } from 'class-validator';

export class UploadResearchAssetDto {
  @IsString()
  filename: string;

  @IsString()
  contentType: string;
}
