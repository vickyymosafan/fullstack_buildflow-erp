import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDocuments(
    category?: string,
    status?: string,
    projectCode?: string,
    limit: number = 50,
  ) {
    const where: any = {};
    if (category && category !== 'ALL') {
      where.category = category;
    }
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (projectCode) {
      where.project = { projectCode };
    }

    const items = await this.prisma.document.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            projectCode: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return items.map((doc) => ({
      id: doc.id,
      projectId: doc.projectId,
      projectCode: doc.project?.projectCode || 'PRJ-2026-LRT',
      projectName: doc.project?.name || 'LRT Jabodebek Cawang - Dukuh Atas',
      documentNumber: doc.documentNumber || `DOC-${doc.id.substring(0, 8).toUpperCase()}`,
      category: doc.category,
      title: doc.title,
      description: doc.description || '',
      fileUrl: doc.fileUrl,
      fileType: doc.fileType || 'PDF',
      fileSize: doc.fileSize || '2.4 MB',
      version: doc.version,
      uploadedBy: doc.uploadedBy || 'Engineering Lead',
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
  }

  async getSummary() {
    const totalDocuments = await this.prisma.document.count();
    const drawingCount = await this.prisma.document.count({
      where: { category: 'DRAWING' },
    });
    const contractCount = await this.prisma.document.count({
      where: { category: 'CONTRACT' },
    });
    const permitCount = await this.prisma.document.count({
      where: { category: 'PERMIT' },
    });
    const specCount = await this.prisma.document.count({
      where: { category: 'SPECIFICATION' },
    });
    const approvedCount = await this.prisma.document.count({
      where: { status: 'APPROVED' },
    });
    const reviewCount = await this.prisma.document.count({
      where: { status: 'UNDER_REVIEW' },
    });

    const approvalRate =
      totalDocuments > 0
        ? Math.round((approvedCount / totalDocuments) * 100)
        : 100;

    return {
      totalDocuments,
      drawingCount,
      contractCount,
      permitCount,
      specCount,
      approvedCount,
      reviewCount,
      approvalRate,
    };
  }

  async createDocument(dto: CreateDocumentDto) {
    const project = await this.prisma.project.findFirst({
      where: { projectCode: dto.projectCode || 'PRJ-2026-LRT' },
    });

    if (!project) {
      throw new NotFoundException(
        `Proyek dengan kode ${dto.projectCode} tidak ditemukan`,
      );
    }

    const docNumber =
      dto.documentNumber ||
      `${dto.category.substring(0, 3)}-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newDoc = await this.prisma.document.create({
      data: {
        projectId: project.id,
        documentNumber: docNumber,
        category: dto.category,
        title: dto.title,
        description: dto.description || null,
        fileUrl:
          dto.fileUrl ||
          `/storage/${dto.category.toLowerCase()}s/${docNumber}.${(dto.fileType || 'PDF').toLowerCase()}`,
        fileType: dto.fileType || 'PDF',
        fileSize: dto.fileSize || '3.5 MB',
        version: dto.version || 1,
        uploadedBy: dto.uploadedBy || 'Engineering Team',
        status: dto.status || 'APPROVED',
      },
      include: {
        project: {
          select: {
            id: true,
            projectCode: true,
            name: true,
          },
        },
      },
    });

    return {
      id: newDoc.id,
      projectId: newDoc.projectId,
      projectCode: newDoc.project.projectCode,
      projectName: newDoc.project.name,
      documentNumber: newDoc.documentNumber,
      category: newDoc.category,
      title: newDoc.title,
      description: newDoc.description,
      fileUrl: newDoc.fileUrl,
      fileType: newDoc.fileType,
      fileSize: newDoc.fileSize,
      version: newDoc.version,
      uploadedBy: newDoc.uploadedBy,
      status: newDoc.status,
      createdAt: newDoc.createdAt,
    };
  }
}

