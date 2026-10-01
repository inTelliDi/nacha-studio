import { getYYMMDD, getHHMM } from './nachaGenerator';

export const DEFAULT_HEADER = {
  immediateDestinationRouting: '071000013', // Fed ACH Clearing
  immediateDestinationName: 'FEDERAL RESERVE BANK',
  immediateOriginId: '103913502', // MapleMark Bank ODFI Routing
  immediateOriginName: 'MAPLEMARK BANK',
  fileDate: getYYMMDD(),
  fileTime: getHHMM(),
  fileIdModifier: 'A',
  referenceCode: 'ACH-PAY1',
};

export const SAMPLE_PRESETS = [
  {
    id: 'ppd_payroll',
    title: 'Employee Payroll Batch (PPD Direct Deposit)',
    badge: 'PPD - Consumer',
    description: 'Bi-weekly direct deposit salary disbursements to employee checking & savings accounts.',
    header: {
      ...DEFAULT_HEADER,
      referenceCode: 'PAYROLL1',
    },
    batches: [
      {
        secCode: 'PPD',
        companyName: 'ACME CORP PAYROLL',
        companyId: '1987654321',
        companyEntryDescription: 'PAYROLL',
        companyDescriptiveDate: getYYMMDD(),
        effectiveDate: getYYMMDD(),
        odfiRouting: '103913502', // MapleMark Bank ODFI
        isBalanced: true,
        offsetAccountNumber: '9900112233',
        entries: [
          {
            transactionCode: '22', // Checking Credit
            routingNumber: '021000021', // Chase NY
            accountNumber: '1102938475',
            amount: '2850.00',
            individualId: 'EMP-00101',
            individualName: 'ALEX MORGAN',
            discretionaryData: 'S ',
            addenda: 'PAYROLL PERIOD ENDING 09/30 NET SALARY',
          },
          {
            transactionCode: '22', // Checking Credit
            routingNumber: '121000358', // Wells Fargo
            accountNumber: '4455667788',
            amount: '3420.50',
            individualId: 'EMP-00102',
            individualName: 'JORDAN TAYLOR',
            discretionaryData: 'S ',
            addenda: 'PAYROLL PERIOD ENDING 09/30 NET SALARY',
          },
          {
            transactionCode: '32', // Savings Credit
            routingNumber: '071000013', // Chase IL
            accountNumber: '9876543210',
            amount: '1250.00',
            individualId: 'EMP-00103',
            individualName: 'SAMANTHA REED',
            discretionaryData: '',
            addenda: '',
          },
          {
            transactionCode: '22', // Checking Credit
            routingNumber: '021000021', // Chase
            accountNumber: '5544332211',
            amount: '4100.75',
            individualId: 'EMP-00104',
            individualName: 'DAVID CHEN',
            discretionaryData: 'S ',
            addenda: 'BONUS + REGULAR SALARY DISBURSEMENT',
          },
        ],
      },
    ],
  },
  {
    id: 'single_customer_credit',
    title: 'Single Customer Credit (PPD Payout)',
    badge: 'PPD - Single Credit',
    description: 'Single ACH credit disbursement payout transaction to a customer checking account.',
    header: {
      ...DEFAULT_HEADER,
      referenceCode: 'CREDIT01',
    },
    batches: [
      {
        secCode: 'PPD',
        companyName: 'ACME PAYMENTS',
        companyId: '1987654321',
        companyEntryDescription: 'PAYOUT',
        companyDescriptiveDate: getYYMMDD(),
        effectiveDate: getYYMMDD(),
        odfiRouting: '103913502', // MapleMark Bank ODFI
        isBalanced: true,
        offsetAccountNumber: '9900112233',
        entries: [
          {
            transactionCode: '22', // Checking Credit
            routingNumber: '021000021',
            accountNumber: '7788990011',
            amount: '450.00',
            individualId: 'PAY-99201',
            individualName: 'ROBERT DAVIS',
            discretionaryData: '',
            addenda: 'SINGLE CUSTOMER PAYOUT DISBURSEMENT',
          },
        ],
      },
    ],
  },
  {
    id: 'single_customer_debit',
    title: 'Single Customer Direct Debit (PPD / WEB Collection)',
    badge: 'PPD - Single Debit',
    description: 'Single ACH direct debit collection transaction from a customer checking account (e.g. one-time invoice payment or fee collection).',
    header: {
      ...DEFAULT_HEADER,
      referenceCode: 'DEBIT01',
    },
    batches: [
      {
        secCode: 'PPD',
        companyName: 'ACME BILLING',
        companyId: '1987654321',
        companyEntryDescription: 'PAYMENT',
        companyDescriptiveDate: getYYMMDD(),
        effectiveDate: getYYMMDD(),
        odfiRouting: '103913502', // MapleMark Bank ODFI
        isBalanced: true,
        offsetAccountNumber: '9900112233',
        entries: [
          {
            transactionCode: '27', // Checking Debit
            routingNumber: '121000358',
            accountNumber: '3344556677',
            amount: '1250.00',
            individualId: 'INV-40082',
            individualName: 'SARAH JENKINS',
            discretionaryData: '',
            addenda: 'ONE-TIME INVOICE #40082 COLLECTION',
          },
        ],
      },
    ],
  },
  {
    id: 'ccd_vendor',
    title: 'B2B Vendor Disbursements (CCD with Addenda)',
    badge: 'CCD - Corporate',
    description: 'Corporate vendor payments with CCD+ remittance details in Type 7 Addenda records.',
    header: {
      ...DEFAULT_HEADER,
      referenceCode: 'VENDOR99',
    },
    batches: [
      {
        secCode: 'CCD',
        companyName: 'ACME SUPPLIES',
        companyId: '1987654321',
        companyEntryDescription: 'VENDOR PAY',
        companyDescriptiveDate: getYYMMDD(),
        effectiveDate: getYYMMDD(),
        odfiRouting: '103913502', // MapleMark Bank ODFI
        isBalanced: true,
        offsetAccountNumber: '9900112233',
        entries: [
          {
            transactionCode: '22',
            routingNumber: '121000358',
            accountNumber: '8822334411',
            amount: '14850.00',
            individualId: 'VEND-8801',
            individualName: 'GLOBAL TECH SUPPLY',
            discretionaryData: '',
            addenda: 'INV# 98231 DATED 09/15 DISCOUNT 2% NET 30 PAID IN FULL',
          },
          {
            transactionCode: '22',
            routingNumber: '021000021',
            accountNumber: '3322114455',
            amount: '6720.30',
            individualId: 'VEND-9042',
            individualName: 'LOGISTICS EXPRESS',
            discretionaryData: '',
            addenda: 'INV# FREIGHT-4409 FREIGHT & SHIPPING EXPENSES',
          },
          {
            transactionCode: '22',
            routingNumber: '071000013',
            accountNumber: '7766554433',
            amount: '9400.00',
            individualId: 'VEND-7711',
            individualName: 'APEX CONSULTING LLC',
            discretionaryData: '',
            addenda: 'INV# AC-2026-09 IT SERVICES RETAINER',
          },
        ],
      },
    ],
  },
  {
    id: 'direct_debit',
    title: 'Recurring Customer Billing (PPD Direct Debit)',
    badge: 'PPD - Direct Debit',
    description: 'Pre-authorized debit entries to collect monthly subscription & utility payments from customers.',
    header: {
      ...DEFAULT_HEADER,
      referenceCode: 'BILLING1',
    },
    batches: [
      {
        secCode: 'PPD',
        companyName: 'ACME SERVICES',
        companyId: '1987654321',
        companyEntryDescription: 'AUTO BILL',
        companyDescriptiveDate: getYYMMDD(),
        effectiveDate: getYYMMDD(),
        odfiRouting: '103913502', // MapleMark Bank ODFI
        isBalanced: false, // Unbalanced example
        offsetAccountNumber: '',
        entries: [
          {
            transactionCode: '27', // Checking Debit
            routingNumber: '021000021',
            accountNumber: '1098234712',
            amount: '199.99',
            individualId: 'CUST-3001',
            individualName: 'EMILY WATSON',
            discretionaryData: '',
            addenda: 'MONTHLY SaaS SERVICE DUES',
          },
          {
            transactionCode: '27', // Checking Debit
            routingNumber: '121000358',
            accountNumber: '5566778899',
            amount: '299.50',
            individualId: 'CUST-3002',
            individualName: 'MICHAEL BROWN',
            discretionaryData: '',
            addenda: '',
          },
          {
            transactionCode: '37', // Savings Debit
            routingNumber: '071000013',
            accountNumber: '2233445566',
            amount: '149.00',
            individualId: 'CUST-3003',
            individualName: 'LAURA MARTINEZ',
            discretionaryData: '',
            addenda: '',
          },
        ],
      },
    ],
  },
];
