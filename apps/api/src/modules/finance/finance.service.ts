import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { PostReceiptJournalDto } from './dto/post-receipt-journal.dto';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async getAccounts() {
    const org = await this.prisma.organization.findFirst();
    if (!org) return [];

    const accounts = await this.prisma.account.findMany({
      where: { organizationId: org.id },
      include: {
        journalLines: {
          select: {
            debit: true,
            credit: true,
          },
        },
      },
      orderBy: { accountCode: 'asc' },
    });

    return accounts.map((acc) => {
      let totalDebit = 0;
      let totalCredit = 0;

      for (const line of acc.journalLines) {
        totalDebit += Number(line.debit);
        totalCredit += Number(line.credit);
      }

      // Calculate ending balance based on normal account balance
      let endingBalance = 0;
      if (acc.accountType === 'ASSET' || acc.accountType === 'EXPENSE') {
        endingBalance = totalDebit - totalCredit;
      } else {
        endingBalance = totalCredit - totalDebit;
      }

      return {
        id: acc.id,
        accountCode: acc.accountCode,
        accountName: acc.accountName,
        accountType: acc.accountType,
        totalDebit,
        totalCredit,
        endingBalance,
      };
    });
  }

  async getJournals(limit = 30) {
    const entries = await this.prisma.journalEntry.findMany({
      take: limit,
      include: {
        lines: {
          include: {
            account: true,
          },
        },
      },
      orderBy: { transactionDate: 'desc' },
    });

    return entries.map((entry) => {
      const totalDebit = entry.lines.reduce(
        (sum, l) => sum + Number(l.debit),
        0
      );
      const totalCredit = entry.lines.reduce(
        (sum, l) => sum + Number(l.credit),
        0
      );
      const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

      return {
        id: entry.id,
        journalNumber: entry.journalNumber,
        transactionDate: entry.transactionDate,
        description: entry.description,
        postingStatus: entry.postingStatus,
        postedBy: entry.postedBy,
        postedAt: entry.postedAt,
        totalDebit,
        totalCredit,
        isBalanced,
        lines: entry.lines.map((l) => ({
          id: l.id,
          accountCode: l.account.accountCode,
          accountName: l.account.accountName,
          accountType: l.account.accountType,
          debit: Number(l.debit),
          credit: Number(l.credit),
          memo: l.memo,
        })),
      };
    });
  }

  async getSummary() {
    const accounts = await this.getAccounts();

    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;
    let totalRevenue = 0;
    let totalExpenses = 0;
    let totalDebitTrial = 0;
    let totalCreditTrial = 0;

    for (const acc of accounts) {
      totalDebitTrial += acc.totalDebit;
      totalCreditTrial += acc.totalCredit;

      if (acc.accountType === 'ASSET') {
        totalAssets += acc.endingBalance;
      } else if (acc.accountType === 'LIABILITY') {
        totalLiabilities += acc.endingBalance;
      } else if (acc.accountType === 'EQUITY') {
        totalEquity += acc.endingBalance;
      } else if (acc.accountType === 'REVENUE') {
        totalRevenue += acc.endingBalance;
      } else if (acc.accountType === 'EXPENSE') {
        totalExpenses += acc.endingBalance;
      }
    }

    const netIncome = totalRevenue - totalExpenses;
    const isTrialBalanceBalanced =
      Math.abs(totalDebitTrial - totalCreditTrial) < 0.01;

    return {
      totalAssets,
      totalLiabilities,
      totalEquity,
      totalRevenue,
      totalExpenses,
      netIncome,
      trialBalance: {
        totalDebit: totalDebitTrial,
        totalCredit: totalCreditTrial,
        isBalanced: isTrialBalanceBalanced,
      },
    };
  }

  async createJournal(dto: CreateJournalDto) {
    const org = await this.prisma.organization.findFirst();
    if (!org) throw new NotFoundException('Organization not found');

    // 1. Double-Entry Invariant Validation
    let totalDebit = 0;
    let totalCredit = 0;

    for (const line of dto.lines) {
      totalDebit += Number(line.debit || 0);
      totalCredit += Number(line.credit || 0);
    }

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new UnprocessableEntityException(
        `Jurnal tidak seimbang: Total Debit (Rp ${totalDebit.toLocaleString(
          'id-ID'
        )}) tidak sama dengan Total Kredit (Rp ${totalCredit.toLocaleString(
          'id-ID'
        )})`
      );
    }

    // 2. Resolve accounts
    const accountCodes = dto.lines.map((l) => l.accountCode);
    const existingAccounts = await this.prisma.account.findMany({
      where: {
        organizationId: org.id,
        accountCode: { in: accountCodes },
      },
    });

    const accountMap = new Map(
      existingAccounts.map((a) => [a.accountCode, a.id])
    );
    for (const code of accountCodes) {
      if (!accountMap.has(code)) {
        throw new NotFoundException(`Akun dengan kode ${code} tidak ditemukan`);
      }
    }

    // Resolve optional project
    let defaultProjectId: string | undefined;
    const lrtProject = await this.prisma.project.findFirst({
      where: { organizationId: org.id },
    });
    if (lrtProject) defaultProjectId = lrtProject.id;

    // 3. Atomic Interactive Transaction
    return this.prisma.$transaction(async (tx) => {
      const entry = await tx.journalEntry.create({
        data: {
          organizationId: org.id,
          journalNumber: dto.journalNumber,
          transactionDate: new Date(dto.transactionDate),
          description: dto.description,
          postingStatus: 'POSTED',
          postedAt: new Date(),
          postedBy: 'System Accountant',
          lines: {
            create: dto.lines.map((l) => ({
              accountId: accountMap.get(l.accountCode)!,
              projectId: defaultProjectId,
              debit: Number(l.debit || 0),
              credit: Number(l.credit || 0),
              memo: l.memo || dto.description,
            })),
          },
        },
        include: {
          lines: {
            include: { account: true },
          },
        },
      });

      return {
        id: entry.id,
        journalNumber: entry.journalNumber,
        description: entry.description,
        totalAmount: totalDebit,
        lineCount: entry.lines.length,
        postingStatus: entry.postingStatus,
      };
    });
  }

  async postGoodsReceiptJournal(dto: PostReceiptJournalDto) {
    const org = await this.prisma.organization.findFirst();
    if (!org) throw new NotFoundException('Organization not found');

    const invAccount = await this.prisma.account.findFirst({
      where: { organizationId: org.id, accountCode: '1-1400' },
    });
    const apAccount = await this.prisma.account.findFirst({
      where: { organizationId: org.id, accountCode: '2-1100' },
    });

    if (!invAccount || !apAccount) {
      throw new NotFoundException(
        'Akun standar Persediaan (1-1400) atau Utang Usaha (2-1100) tidak ditemukan'
      );
    }

    const journalNumber = `JV-AUTO-${Date.now().toString().slice(-6)}`;
    const description =
      dto.description ||
      `Auto-Journal GR ${dto.receiptNumber} untuk ${dto.poNumber}`;

    return this.createJournal({
      journalNumber,
      transactionDate: new Date().toISOString(),
      description,
      lines: [
        {
          accountCode: '1-1400',
          debit: Number(dto.totalAmount),
          credit: 0,
          memo: `Penerimaan fisik barang Surat Jalan ${dto.receiptNumber}`,
        },
        {
          accountCode: '2-1100',
          debit: 0,
          credit: Number(dto.totalAmount),
          memo: `Utang usaha PO ${dto.poNumber}`,
        },
      ],
    });
  }
}

