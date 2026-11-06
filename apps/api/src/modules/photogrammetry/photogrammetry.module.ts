import { Module } from '@nestjs/common';
import { PhotogrammetryController } from './photogrammetry.controller';
import { PhotogrammetryService } from './photogrammetry.service';

@Module({
  controllers: [PhotogrammetryController],
  providers: [PhotogrammetryService],
  exports: [PhotogrammetryService],
})
export class PhotogrammetryModule {}
