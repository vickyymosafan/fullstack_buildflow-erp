export class HandoverTenderDto {
  tenderId?: string;
  contractId?: string;
  projectCode!: string;
  projectName!: string;
  plannedStart?: string;
  plannedEnd?: string;
  initialBudgetRatio?: number; // e.g. 0.85 (85% of contract value as budget)
  notes?: string;
}

