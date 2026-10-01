/**
 * NACHA File Generator & Validator for FIS Horizon ACH Systems
 * Compliant with NACHA Operating Rules & 94-character fixed width ASCII standard.
 */

// Helper to pad strings
export const padLeft = (val, length, char = '0') => {
  const str = String(val ?? '');
  return str.padStart(length, char).slice(-length);
};

export const padRight = (val, length, char = ' ') => {
  const str = String(val ?? '');
  return str.padEnd(length, char).slice(0, length);
};

// Clean non-alphanumeric chars or format string to uppercase ASCII
export const cleanText = (val, uppercase = true) => {
  if (!val) return '';
  let str = String(val).replace(/[^a-zA-Z0-9\s\-_.,/]/g, '');
  return uppercase ? str.toUpperCase() : str;
};

// Validate 9-digit ABA Routing Number using Fed Checksum algorithm: 3(d1+d4+d7) + 7(d2+d5+d8) + 1(d3+d6+d9) mod 10 === 0
export const validateRoutingNumber = (routing) => {
  const clean = String(routing || '').replace(/\D/g, '');
  if (clean.length !== 9) return false;
  const d = clean.split('').map(Number);
  const sum = 3 * (d[0] + d[3] + d[6]) + 7 * (d[1] + d[4] + d[7]) + 1 * (d[2] + d[5] + d[8]);
  return sum % 10 === 0;
};

// Format Currency in Cents (e.g. 100.50 -> 10050)
export const toCents = (amount) => {
  const num = parseFloat(amount) || 0;
  return Math.round(num * 100);
};

export const formatCurrency = (cents) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format((cents || 0) / 100);
};

/**
 * Standard Transaction Codes
 * 22: Checking Credit
 * 27: Checking Debit
 * 32: Savings Credit
 * 37: Savings Debit
 * 23: Checking Pre-note Credit
 * 28: Checking Pre-note Debit
 * 33: Savings Pre-note Credit
 * 38: Savings Pre-note Debit
 */
export const TRANSACTION_CODES = {
  CHECKING_CREDIT: '22',
  CHECKING_DEBIT: '27',
  SAVINGS_CREDIT: '32',
  SAVINGS_DEBIT: '37',
  CHECKING_PRENOTE_CREDIT: '23',
  CHECKING_PRENOTE_DEBIT: '28',
  SAVINGS_PRENOTE_CREDIT: '33',
  SAVINGS_PRENOTE_DEBIT: '38',
};

/**
 * Generate NACHA File Data & Line Objects
 */
export function generateNachaFile({ header, batches }) {
  const lines = [];
  const errors = [];
  const warnings = [];
  
  let totalFileDebits = 0;
  let totalFileCredits = 0;
  let totalFileHash = 0;
  let totalFileEntriesAndAddenda = 0;
  let totalBatches = 0;

  // 1. FILE HEADER RECORD (Record Type 1)
  const destRouting = cleanText(header.immediateDestinationRouting || '').replace(/\D/g, '');
  const destName = cleanText(header.immediateDestinationName || 'FEDERAL RESERVE BANK');
  const originId = cleanText(header.immediateOriginId || '').replace(/\D/g, '');
  const originName = cleanText(header.immediateOriginName || 'MAPLEMARK BANK');
  const fileDate = header.fileDate ? header.fileDate.replace(/\D/g, '').slice(2, 8) : getYYMMDD();
  const fileTime = header.fileTime ? header.fileTime.replace(/\D/g, '').slice(0, 4) : getHHMM();
  const fileIdModifier = (header.fileIdModifier || 'A').toUpperCase().slice(0, 1);
  const refCode = padRight(cleanText(header.referenceCode || ''), 8);

  // Immediate Destination (10 chars, typically space prefixed + 9 digit routing)
  const immDestField = padLeft(destRouting, 10, ' ');
  // Immediate Origin (10 chars, space or 1-prefixed tax id)
  const immOriginField = padLeft(originId, 10, ' ');

  if (destRouting.length !== 9) {
    errors.push('Immediate Destination Routing Number must be 9 digits.');
  } else if (!validateRoutingNumber(destRouting)) {
    warnings.push(`Immediate Destination Routing (${destRouting}) failed ABA check digit validation.`);
  }

  if (!originId) {
    errors.push('Immediate Origin ID (Company Tax ID / Routing) is required.');
  }

  const record1 = 
    '1' +                                      // pos 1: Record Type (1)
    '01' +                                     // pos 2-3: Priority Code (01)
    immDestField +                             // pos 4-13: Immediate Destination (10)
    immOriginField +                           // pos 14-23: Immediate Origin (10)
    padLeft(fileDate, 6) +                     // pos 24-29: File Creation Date YYMMDD (6)
    padLeft(fileTime, 4) +                     // pos 30-33: File Creation Time HHMM (4)
    fileIdModifier +                           // pos 34: File ID Modifier (1)
    '094' +                                    // pos 35-37: Record Size (094)
    '10' +                                     // pos 38-39: Blocking Factor (10)
    '1' +                                      // pos 40: Format Code (1)
    padRight(destName, 23) +                   // pos 41-63: Immediate Destination Name (23)
    padRight(originName, 23) +                 // pos 64-86: Immediate Origin Name (23)
    refCode;                                   // pos 87-94: Reference Code (8)

  lines.push({ type: '1', line: record1, desc: 'File Header Record' });

  // Process Batches
  batches.forEach((batch, bIdx) => {
    totalBatches++;
    const batchNum = bIdx + 1;
    let batchDebits = 0;
    let batchCredits = 0;
    let batchHash = 0;
    let batchEntryAddendaCount = 0;

    const secCode = (batch.secCode || 'PPD').toUpperCase().slice(0, 3);
    const companyName = padRight(cleanText(batch.companyName || originName), 16);
    const companyDiscretionary = padRight(cleanText(batch.companyDiscretionaryData || ''), 20);
    const companyId = padRight(cleanText(batch.companyId || originId), 10);
    const companyEntryDesc = padRight(cleanText(batch.companyEntryDescription || 'PAYROLL'), 10);
    const companyDescDate = padRight(cleanText(batch.companyDescriptiveDate || getYYMMDD()), 6);
    const effectiveDate = batch.effectiveDate ? batch.effectiveDate.replace(/\D/g, '').slice(2, 8) : getYYMMDD();
    const fullOdfiRouting = cleanText(batch.odfiRouting || destRouting).replace(/\D/g, '');
    const odfiRouting = fullOdfiRouting.slice(0, 8);

    // Calculate Service Class Code if set to 'AUTO' or determine from entries
    let entries = [...(batch.entries || [])];

    // If Balanced File is requested, inject an offset Record Type 6 entry
    if (batch.isBalanced) {
      let calcCredits = 0;
      let calcDebits = 0;
      entries.forEach(e => {
        const amt = toCents(e.amount);
        if (['27', '37', '28', '38', '29', '57'].includes(e.transactionCode)) {
          calcDebits += amt;
        } else {
          calcCredits += amt;
        }
      });
      const netDifference = calcDebits - calcCredits;
      if (netDifference > 0) {
        // Debits exceed credits => Offset entry needs to be Credit to balance
        entries.push({
          transactionCode: '22', // Checking Credit
          routingNumber: fullOdfiRouting,
          accountNumber: batch.offsetAccountNumber || 'SETTLEMENT',
          amount: (netDifference / 100).toFixed(2),
          individualId: 'SETTLEMENT',
          individualName: companyName.trim() + ' OFFSET',
          discretionaryData: '',
          addenda: '',
          isOffset: true
        });
      } else if (netDifference < 0) {
        // Credits exceed debits => Offset entry needs to be Debit to balance
        entries.push({
          transactionCode: '27', // Checking Debit
          routingNumber: fullOdfiRouting,
          accountNumber: batch.offsetAccountNumber || 'SETTLEMENT',
          amount: (Math.abs(netDifference) / 100).toFixed(2),
          individualId: 'SETTLEMENT',
          individualName: companyName.trim() + ' OFFSET',
          discretionaryData: '',
          addenda: '',
          isOffset: true
        });
      }
    }

    // Determine Service Class Code (200 = Mixed, 220 = Credits, 225 = Debits)
    let hasCredits = false;
    let hasDebits = false;
    entries.forEach(e => {
      if (['27', '37', '28', '38', '29', '57'].includes(e.transactionCode)) hasDebits = true;
      else hasCredits = true;
    });

    let serviceClassCode = '200';
    if (hasCredits && !hasDebits) serviceClassCode = '220';
    if (hasDebits && !hasCredits) serviceClassCode = '225';

    // 2. BATCH HEADER RECORD (Record Type 5)
    const record5 = 
      '5' +                                    // pos 1: Record Type (5)
      serviceClassCode +                       // pos 2-4: Service Class Code (3)
      companyName +                            // pos 5-20: Company Name (16)
      companyDiscretionary +                   // pos 21-40: Company Discretionary Data (20)
      companyId +                              // pos 41-50: Company Identification (10)
      padRight(secCode, 3) +                   // pos 51-53: Standard Entry Class Code (3)
      companyEntryDesc +                       // pos 54-63: Company Entry Description (10)
      companyDescDate +                        // pos 64-69: Company Descriptive Date (6)
      padLeft(effectiveDate, 6) +              // pos 70-75: Effective Entry Date YYMMDD (6)
      '   ' +                                  // pos 76-78: Settlement Date Julian (3 spaces)
      '1' +                                    // pos 79: Originator Status Code (1)
      padLeft(odfiRouting, 8) +                // pos 80-87: Originating DFI ID (8)
      padLeft(batchNum, 7);                    // pos 88-94: Batch Number (7)

    lines.push({ type: '5', line: record5, desc: `Batch Header #${batchNum} (${secCode})` });

    // Process Entries (Record Type 6) & Addendas (Record Type 7)
    entries.forEach((entry, eIdx) => {
      batchEntryAddendaCount++;
      const entrySeq = eIdx + 1;
      const recRouting = cleanText(entry.routingNumber || '').replace(/\D/g, '');
      const recRouting8 = recRouting.slice(0, 8);
      const checkDigit = recRouting.slice(8, 9) || '0';
      const recAccount = padRight(cleanText(entry.accountNumber || ''), 17);
      const amountCents = toCents(entry.amount);
      const indId = padRight(cleanText(entry.individualId || entry.receiverId || ''), 15);
      const indName = padRight(cleanText(entry.individualName || entry.receiverName || 'VALUED CUSTOMER'), 22);
      const discData = padRight(cleanText(entry.discretionaryData || ''), 2);
      const hasAddenda = entry.addenda && entry.addenda.trim().length > 0 ? '1' : '0';
      const traceNumber = padLeft(odfiRouting, 8) + padLeft(entrySeq, 7);

      if (recRouting.length !== 9) {
        errors.push(`Batch #${batchNum}, Entry #${entrySeq}: Routing number must be 9 digits.`);
      } else if (!validateRoutingNumber(recRouting)) {
        warnings.push(`Batch #${batchNum}, Entry #${entrySeq}: Routing (${recRouting}) failed ABA check digit.`);
      }

      if (amountCents < 0) {
        errors.push(`Batch #${batchNum}, Entry #${entrySeq}: Amount cannot be negative.`);
      }

      // Add to Hash & Amounts
      batchHash += parseInt(recRouting8, 10) || 0;
      if (['27', '37', '28', '38', '29', '57'].includes(entry.transactionCode)) {
        batchDebits += amountCents;
      } else {
        batchCredits += amountCents;
      }

      // 3. ENTRY DETAIL RECORD (Record Type 6)
      const record6 = 
        '6' +                                  // pos 1: Record Type (6)
        padLeft(entry.transactionCode || '22', 2) + // pos 2-3: Transaction Code (2)
        padLeft(recRouting8, 8) +              // pos 4-11: Receiving DFI ID (8)
        checkDigit +                           // pos 12: Check Digit (1)
        recAccount +                           // pos 13-29: DFI Account Number (17)
        padLeft(amountCents, 10) +             // pos 30-39: Amount in Cents (10)
        indId +                                // pos 40-54: Individual ID Number (15)
        indName +                              // pos 55-76: Individual Name (22)
        discData +                             // pos 77-78: Discretionary Data (2)
        hasAddenda +                           // pos 79: Addenda Record Indicator (1)
        traceNumber;                           // pos 80-94: Trace Number (15)

      lines.push({ type: '6', line: record6, desc: `Entry Detail #${entrySeq} - ${indName.trim()}`, isOffset: entry.isOffset });

      // 4. ADDENDA RECORD (Record Type 7) - If Addenda present
      if (hasAddenda === '1') {
        batchEntryAddendaCount++;
        const addendaType = '05'; // Standard Payment Related Information
        const paymentInfo = padRight(cleanText(entry.addenda || ''), 80);
        const addendaSeq = '0001';
        const entryTraceSeq = padLeft(entrySeq, 7);

        const record7 = 
          '7' +                                // pos 1: Record Type (7)
          addendaType +                        // pos 2-3: Addenda Type Code (2)
          paymentInfo +                        // pos 4-83: Payment Related Information (80)
          addendaSeq +                         // pos 84-87: Addenda Sequence Number (4)
          entryTraceSeq;                       // pos 88-94: Entry Detail Sequence Number (7)

        lines.push({ type: '7', line: record7, desc: `Addenda Record for Entry #${entrySeq}` });
      }
    });

    // 5. BATCH CONTROL RECORD (Record Type 8)
    const batchHashStr = padLeft(String(batchHash).slice(-10), 10);
    const record8 = 
      '8' +                                    // pos 1: Record Type (8)
      serviceClassCode +                       // pos 2-4: Service Class Code (3)
      padLeft(batchEntryAddendaCount, 6) +     // pos 5-10: Entry/Addenda Count (6)
      batchHashStr +                           // pos 11-20: Entry Hash (10)
      padLeft(batchDebits, 12) +               // pos 21-32: Total Batch Debit Amount (12)
      padLeft(batchCredits, 12) +              // pos 33-44: Total Batch Credit Amount (12)
      companyId +                              // pos 45-54: Company Identification (10)
      padRight('', 19) +                       // pos 55-73: MAC (19 spaces)
      padRight('', 6) +                        // pos 74-79: Reserved (6 spaces)
      padLeft(odfiRouting, 8) +                // pos 80-87: Originating DFI ID (8)
      padLeft(batchNum, 7);                    // pos 88-94: Batch Number (7)

    lines.push({ type: '8', line: record8, desc: `Batch Control #${batchNum}` });

    totalFileDebits += batchDebits;
    totalFileCredits += batchCredits;
    totalFileHash += batchHash;
    totalFileEntriesAndAddenda += batchEntryAddendaCount;
  });

  // 6. FILE CONTROL RECORD (Record Type 9)
  const fileHashStr = padLeft(String(totalFileHash).slice(-10), 10);
  
  // Calculate Block Count: total lines so far + 1 (File Control line itself) + padding lines to make multiple of 10
  const linesBeforePadding = lines.length + 1; // including File Control
  const blockCount = Math.ceil(linesBeforePadding / 10);
  const totalLinesWithPadding = blockCount * 10;
  const fillerCount = totalLinesWithPadding - linesBeforePadding;

  const record9 = 
    '9' +                                      // pos 1: Record Type (9)
    padLeft(totalBatches, 6) +                 // pos 2-7: Batch Count (6)
    padLeft(blockCount, 6) +                   // pos 8-13: Block Count (6)
    padLeft(totalFileEntriesAndAddenda, 8) +   // pos 14-21: Total Entry/Addenda Count (8)
    fileHashStr +                              // pos 22-31: Total Entry Hash (10)
    padLeft(totalFileDebits, 12) +             // pos 32-43: Total File Debit Amount (12)
    padLeft(totalFileCredits, 12) +            // pos 44-55: Total File Credit Amount (12)
    padRight('', 39);                          // pos 56-94: Reserved (39 spaces)

  lines.push({ type: '9', line: record9, desc: 'File Control Record' });

  // 7. FILLER RECORDS (Record Type 9 Padding)
  for (let i = 0; i < fillerCount; i++) {
    lines.push({ type: '999', line: '9'.repeat(94), desc: `Filler Block Record (${i + 1}/${fillerCount})` });
  }

  // Validate line lengths strictly
  lines.forEach((l, idx) => {
    if (l.line.length !== 94) {
      errors.push(`Line #${idx + 1} (${l.desc}) has invalid length of ${l.line.length} (must be 94).`);
    }
  });

  const fileString = lines.map(l => l.line).join('\r\n');

  return {
    fileString,
    lines,
    metrics: {
      totalBatches,
      blockCount,
      totalEntries: totalFileEntriesAndAddenda,
      totalDebits: totalFileDebits,
      totalCredits: totalFileCredits,
      totalHash: fileHashStr,
      totalLines: lines.length,
      fillerCount
    },
    errors,
    warnings
  };
}

// Format date YYMMDD
export function getYYMMDD(date = new Date()) {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

// Format time HHMM
export function getHHMM(date = new Date()) {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}${mm}`;
}

// Breakdown of line fields for interactive NACHA Inspector
export function inspectNachaLine(lineObj) {
  const line = lineObj.line;
  const type = lineObj.type;
  const fields = [];

  if (type === '1') {
    fields.push(
      { pos: '1-1', len: 1, name: 'Record Type Code', value: line.slice(0, 1), req: '1', desc: 'Identifies file header record' },
      { pos: '2-3', len: 2, name: 'Priority Code', value: line.slice(1, 3), req: '01', desc: 'Handling priority code' },
      { pos: '4-13', len: 10, name: 'Immediate Destination', value: line.slice(3, 13), req: 'Routing', desc: 'ODFI Transit Routing # (preceded by space)' },
      { pos: '14-23', len: 10, name: 'Immediate Origin', value: line.slice(13, 23), req: 'Tax ID/Routing', desc: 'Company Tax ID or Origin Routing #' },
      { pos: '24-29', len: 6, name: 'File Creation Date', value: line.slice(23, 29), req: 'YYMMDD', desc: 'Date file was created' },
      { pos: '30-33', len: 4, name: 'File Creation Time', value: line.slice(29, 33), req: 'HHMM', desc: 'Time file was created' },
      { pos: '34-34', len: 1, name: 'File ID Modifier', value: line.slice(33, 34), req: 'A-Z, 0-9', desc: 'Sequence code for multiple files per day' },
      { pos: '35-37', len: 3, name: 'Record Size', value: line.slice(34, 37), req: '094', desc: 'Fixed character length of each record' },
      { pos: '38-39', len: 2, name: 'Blocking Factor', value: line.slice(37, 39), req: '10', desc: 'Records per block count' },
      { pos: '40-40', len: 1, name: 'Format Code', value: line.slice(39, 40), req: '1', desc: 'NACHA code format' },
      { pos: '41-63', len: 23, name: 'Immediate Destination Name', value: line.slice(40, 63), req: 'Alphanumeric', desc: 'Receiving Institution / ODFI Bank Name' },
      { pos: '64-86', len: 23, name: 'Immediate Origin Name', value: line.slice(63, 86), req: 'Alphanumeric', desc: 'Originating Company / Financial Entity Name' },
      { pos: '87-94', len: 8, name: 'Reference Code', value: line.slice(86, 94), req: 'Optional', desc: 'Internal bank reference / audit tracking code' }
    );
  } else if (type === '5') {
    fields.push(
      { pos: '1-1', len: 1, name: 'Record Type Code', value: line.slice(0, 1), req: '5', desc: 'Batch Header Record Identifier' },
      { pos: '2-4', len: 3, name: 'Service Class Code', value: line.slice(1, 4), req: '200/220/225', desc: '200=Mixed, 220=Credits, 225=Debits' },
      { pos: '5-20', len: 16, name: 'Company Name', value: line.slice(4, 20), req: 'Alphanumeric', desc: 'Name of originating organization' },
      { pos: '21-40', len: 20, name: 'Company Discretionary Data', value: line.slice(20, 40), req: 'Optional', desc: 'Internal codes or descriptions' },
      { pos: '41-50', len: 10, name: 'Company Identification', value: line.slice(40, 50), req: '10 digits', desc: 'Assigned 10-digit Tax ID / Company ID' },
      { pos: '51-53', len: 3, name: 'Standard Entry Class Code', value: line.slice(50, 53), req: 'PPD/CCD/WEB', desc: 'Payment product classification' },
      { pos: '54-63', len: 10, name: 'Company Entry Description', value: line.slice(53, 63), req: 'Alphanumeric', desc: 'Purpose of transaction (PAYROLL, VENDOR, etc)' },
      { pos: '64-69', len: 6, name: 'Company Descriptive Date', value: line.slice(63, 69), req: 'YYMMDD', desc: 'Date displayed to receiver' },
      { pos: '70-75', len: 6, name: 'Effective Entry Date', value: line.slice(69, 75), req: 'YYMMDD', desc: 'Intended settlement date' },
      { pos: '76-78', len: 3, name: 'Settlement Date (Julian)', value: line.slice(75, 78), req: 'Blank', desc: 'Assigned by ACH operator' },
      { pos: '79-79', len: 1, name: 'Originator Status Code', value: line.slice(78, 79), req: '1', desc: 'ODFI authorization code' },
      { pos: '80-87', len: 8, name: 'Originating DFI Identification', value: line.slice(79, 87), req: '8 digits', desc: 'First 8 digits of ODFI routing number' },
      { pos: '88-94', len: 7, name: 'Batch Number', value: line.slice(87, 94), req: 'Numeric', desc: 'Sequential batch number in file' }
    );
  } else if (type === '6') {
    fields.push(
      { pos: '1-1', len: 1, name: 'Record Type Code', value: line.slice(0, 1), req: '6', desc: 'Entry Detail Record Identifier' },
      { pos: '2-3', len: 2, name: 'Transaction Code', value: line.slice(1, 3), req: '22/27/32/37', desc: '22=Chk Credit, 27=Chk Debit, 32=Sav Credit, 37=Sav Debit' },
      { pos: '4-11', len: 8, name: 'Receiving DFI Identification', value: line.slice(3, 11), req: '8 digits', desc: 'First 8 digits of RDFI routing number' },
      { pos: '12-12', len: 1, name: 'Check Digit', value: line.slice(11, 12), req: '1 digit', desc: '9th digit of RDFI routing number' },
      { pos: '13-29', len: 17, name: 'DFI Account Number', value: line.slice(12, 29), req: 'Alphanumeric', desc: 'Receiver account number at RDFI' },
      { pos: '30-39', len: 10, name: 'Amount', value: line.slice(29, 39), req: 'Numeric (cents)', desc: 'Transaction amount in cents' },
      { pos: '40-54', len: 15, name: 'Individual Identification', value: line.slice(39, 54), req: 'Alphanumeric', desc: 'Receiver ID, Employee #, or Invoice #' },
      { pos: '55-76', len: 22, name: 'Individual Name', value: line.slice(54, 76), req: 'Alphanumeric', desc: 'Name of individual or company receiver' },
      { pos: '77-78', len: 2, name: 'Discretionary Data', value: line.slice(76, 78), req: '2 spaces/code', desc: 'Special codes or payment status indicator' },
      { pos: '79-79', len: 1, name: 'Addenda Record Indicator', value: line.slice(78, 79), req: '0 or 1', desc: '1 = Type 7 addenda follows, 0 = none' },
      { pos: '80-94', len: 15, name: 'Trace Number', value: line.slice(79, 94), req: '15 digits', desc: 'ODFI Routing (8) + Entry Sequence (7)' }
    );
  } else if (type === '7') {
    fields.push(
      { pos: '1-1', len: 1, name: 'Record Type Code', value: line.slice(0, 1), req: '7', desc: 'Addenda Record Identifier' },
      { pos: '2-3', len: 2, name: 'Addenda Type Code', value: line.slice(1, 3), req: '05', desc: '05 = Payment Related Information' },
      { pos: '4-83', len: 80, name: 'Payment Related Information', value: line.slice(3, 83), req: 'Alphanumeric', desc: 'Remittance details, invoice reference, notes' },
      { pos: '84-87', len: 4, name: 'Addenda Sequence Number', value: line.slice(83, 87), req: '0001', desc: 'Sequential addenda count for entry' },
      { pos: '88-94', len: 7, name: 'Entry Detail Sequence Number', value: line.slice(87, 94), req: '7 digits', desc: 'Last 7 digits of entry trace number' }
    );
  } else if (type === '8') {
    fields.push(
      { pos: '1-1', len: 1, name: 'Record Type Code', value: line.slice(0, 1), req: '8', desc: 'Batch Control Record Identifier' },
      { pos: '2-4', len: 3, name: 'Service Class Code', value: line.slice(1, 4), req: '200/220/225', desc: 'Matches Batch Header service class' },
      { pos: '5-10', len: 6, name: 'Entry / Addenda Count', value: line.slice(4, 10), req: 'Numeric', desc: 'Total Type 6 + Type 7 records in batch' },
      { pos: '11-20', len: 10, name: 'Entry Hash', value: line.slice(10, 20), req: '10 digits', desc: 'Sum of first 8 digits of RDFI routings' },
      { pos: '21-32', len: 12, name: 'Total Batch Debit Amount', value: line.slice(20, 32), req: 'Cents', desc: 'Total debits in batch' },
      { pos: '33-44', len: 12, name: 'Total Batch Credit Amount', value: line.slice(32, 44), req: 'Cents', desc: 'Total credits in batch' },
      { pos: '45-54', len: 10, name: 'Company Identification', value: line.slice(44, 54), req: '10 digits', desc: 'Matches Batch Header Company ID' },
      { pos: '55-73', len: 19, name: 'Message Authentication Code', value: line.slice(54, 73), req: 'Blank', desc: 'Reserved for MAC security checksum' },
      { pos: '74-79', len: 6, name: 'Reserved Space', value: line.slice(73, 79), req: 'Blank', desc: 'Blank reserved space' },
      { pos: '80-87', len: 8, name: 'Originating DFI Identification', value: line.slice(79, 87), req: '8 digits', desc: 'Matches Batch Header ODFI ID' },
      { pos: '88-94', len: 7, name: 'Batch Number', value: line.slice(87, 94), req: 'Numeric', desc: 'Matches Batch Header batch number' }
    );
  } else if (type === '9') {
    fields.push(
      { pos: '1-1', len: 1, name: 'Record Type Code', value: line.slice(0, 1), req: '9', desc: 'File Control Record Identifier' },
      { pos: '2-7', len: 6, name: 'Batch Count', value: line.slice(1, 7), req: 'Numeric', desc: 'Total batches in file' },
      { pos: '8-13', len: 6, name: 'Block Count', value: line.slice(7, 13), req: 'Numeric', desc: 'Total 10-record blocks in file including filler' },
      { pos: '14-21', len: 8, name: 'Total Entry / Addenda Count', value: line.slice(13, 21), req: 'Numeric', desc: 'Total entries + addenda in file' },
      { pos: '22-31', len: 10, name: 'Total File Entry Hash', value: line.slice(21, 31), req: '10 digits', desc: 'Sum of batch hashes in file' },
      { pos: '32-43', len: 12, name: 'Total File Debit Amount', value: line.slice(31, 43), req: 'Cents', desc: 'Sum of batch debit totals in file' },
      { pos: '44-55', len: 12, name: 'Total File Credit Amount', value: line.slice(43, 55), req: 'Cents', desc: 'Sum of batch credit totals in file' },
      { pos: '56-94', len: 39, name: 'Reserved Space', value: line.slice(55, 94), req: 'Blank', desc: 'Blank reserved space' }
    );
  } else if (type === '999') {
    fields.push(
      { pos: '1-94', len: 94, name: 'Filler Line', value: line, req: '9999... (94 nines)', desc: 'NACHA block padding record to ensure 10-record alignment' }
    );
  }

  return fields;
}
