import { Injectable } from '@nestjs/common';
import exifr from 'exifr';

@Injectable()
export class ExifService {
  async extract(buffer: Buffer) {
    const exif = await exifr.parse(buffer, {
      // parse the TIFF-based metadata insted of exif because tiff is broader than exif
      tiff: true,
      // Camera Make, Model, Dimensions, Orientation, Software used, Date/time, Copyright, Description
      ifd0: {},
      // ISO, exposure time, aperture, focal length, lens model, flash, date/time original, exposure program
      exif: true,
      // latitude, longitude, altitude, GPS timestamp, direction, north/south/east/west references
      gps: true,
      // creator, description, keywords, editing/application information, Adobe metadata, other application-specific metadata
      xmp: true,
    });

    return exif ?? null;
  }
}
