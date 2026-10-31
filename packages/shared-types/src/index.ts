// Core Domain Types & Enums for BUILDFlow ERP

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CLOSED';
export type BudgetStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'SUPERSEDED';
export type PurchaseOrderStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CLOSED';
export type StockMovementType = 'IN_PURCHASE' | 'OUT_PROJECT_ISSUE' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'ADJUSTMENT';
export type PostingStatus = 'DRAFT' | 'POSTED' | 'REVERSED';
export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
export type OutboxStatus = 'PENDING' | 'PROCESSING' | 'PUBLISHED' | 'FAILED';

export interface UserSession {
  userId: string;
  email: string;
  fullName: string;
  organizationId: string;
  branchId?: string;
  roles: string[];
  permissions: string[];
}

export interface ExecutiveDashboardKPIs {
  activeProjectsCount: number;
  totalContractValue: number;
  budgetUtilizationPercentage: number;
  outstandingReceivables: number;
}

