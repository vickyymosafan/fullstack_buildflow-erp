import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';

@ApiTags('Document & Engineering Drawing Management (DMS)')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Ringkasan KPI Arsip Dokumen Teknik & Status Persetujuan' })
  @ApiResponse({ status: 200, description: 'Metrik dokumen berhasil diambil' })
  async getSummary() {
    const data = await this.documentsService.getSummary();
    return { success: true, data };
  }

  @Get()
  @ApiOperation({ summary: 'Daftar gambar kerja, kontrak, izin PBG, dan spesifikasi RKS' })
  @ApiResponse({ status: 200, description: 'Daftar dokumen berhasil diambil' })
  async getDocuments(
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('projectCode') projectCode?: string,
    @Query('limit') limit?: number,
  ) {
    const data = await this.documentsService.getDocuments(
      category,
      status,
      projectCode,
      limit ? Number(limit) : 50,
    );
    return { success: true, data, count: data.length };
  }

  @Post()
  @ApiOperation({ summary: 'Pendaftaran atau unggah revisi dokumen / gambar teknik baru' })
  @ApiResponse({ status: 201, description: 'Dokumen berhasil didaftarkan' })
  async createDocument(@Body() dto: CreateDocumentDto) {
    const data = await this.documentsService.createDocument(dto);
    return {
      success: true,
      data,
      message: `Dokumen ${data.documentNumber} (${data.title}) berhasil didaftarkan ke repositori DMS`,
    };
  }
}

