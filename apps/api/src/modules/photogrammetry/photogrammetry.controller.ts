import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PhotogrammetryService } from './photogrammetry.service';
import {
  RegisterFlightMissionDto,
  CompleteMissionProcessingDto,
  CalculateEarthworkVolumeDto,
  RunAiVisualInspectionDto,
  ResolveAiDefectDto,
} from './dto/photogrammetry.dto';

@ApiTags('Drone UAV Photogrammetry & Point Cloud Earthwork')
@Controller('photogrammetry')
export class PhotogrammetryController {
  constructor(private readonly photogrammetryService: PhotogrammetryService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get Executive Summary for Drone UAV Photogrammetry, Point Cloud & AI Visual Inspection' })
  @ApiResponse({ status: 200, description: 'Photogrammetry overview metrics returned.' })
  getOverview() {
    return this.photogrammetryService.getOverview();
  }

  @Get('missions')
  @ApiOperation({ summary: 'List all UAV RTK/PPK Drone Flight Missions & KKOP Airspace clearances' })
  getMissions() {
    return this.photogrammetryService.getMissions();
  }

  @Post('missions/register')
  @ApiOperation({ summary: 'Register a new UAV RTK/PPK Drone Flight Mission with KKOP altitude verification' })
  registerMission(@Body() dto: RegisterFlightMissionDto) {
    return this.photogrammetryService.registerMission(dto);
  }

  @Post('missions/complete-processing')
  @ApiOperation({ summary: 'Complete Structure-from-Motion (SfM) & LiDAR Point Cloud processing for a mission' })
  completeMissionProcessing(@Body() dto: CompleteMissionProcessingDto) {
    return this.photogrammetryService.completeMissionProcessing(dto);
  }

  @Get('point-clouds')
  @ApiOperation({ summary: 'List all generated 3D Point Clouds (LAZ/COPC), Orthomosaics & DSM/DTM models' })
  getPointClouds() {
    return this.photogrammetryService.getPointClouds();
  }

  @Get('earthwork-volumes')
  @ApiOperation({ summary: 'List all Cut-and-Fill Earthwork volumetric calculations vs BOQ contract targets' })
  getEarthworkVolumes() {
    return this.photogrammetryService.getEarthworkVolumes();
  }

  @Post('earthwork-volumes/calculate')
  @ApiOperation({ summary: 'Calculate Cut & Fill Earthwork Volume from Point Cloud DSM/DTM vs RAB/BOQ' })
  calculateEarthworkVolume(@Body() dto: CalculateEarthworkVolumeDto) {
    return this.photogrammetryService.calculateEarthworkVolume(dto);
  }

  @Get('ai-inspections')
  @ApiOperation({ summary: 'List all Computer Vision (CV) AI structural defect & crack width inspections' })
  getAiInspections() {
    return this.photogrammetryService.getAiInspections();
  }

  @Post('ai-inspections/analyze')
  @ApiOperation({ summary: 'Run AI Computer Vision crack & spalling analysis against SNI 2847:2019 thresholds' })
  runAiVisualInspection(@Body() dto: RunAiVisualInspectionDto) {
    return this.photogrammetryService.runAiVisualInspection(dto);
  }

  @Post('ai-inspections/resolve-defect')
  @ApiOperation({ summary: 'Verify structural remediation (epoxy injection / grouting) and close AI defect NCR' })
  resolveAiDefect(@Body() dto: ResolveAiDefectDto) {
    return this.photogrammetryService.resolveAiDefect(dto);
  }
}
