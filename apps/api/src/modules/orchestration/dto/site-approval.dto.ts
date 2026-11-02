export class SiteApprovalDto {
  reportId!: string;
  approvedBy!: string;
  physicalProgressIncrementPercentage?: number; // e.g. 1.5%
  qualityPassed?: boolean;
  notes?: string;
}

