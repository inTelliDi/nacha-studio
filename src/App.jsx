import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { HeaderConfigForm } from './components/HeaderConfigForm';
import { EntryTable } from './components/EntryTable';
import { EntryModal } from './components/EntryModal';
import { CsvImporterModal } from './components/CsvImporterModal';
import { NachaInspector } from './components/NachaInspector';
import { NachaSpecModal } from './components/NachaSpecModal';
import { generateNachaFile, getYYMMDD, getHHMM } from './utils/nachaGenerator';
import { DEFAULT_HEADER, SAMPLE_PRESETS } from './utils/sampleData';

export default function App() {
  // File Header State (Record Type 1)
  const [header, setHeader] = useState(DEFAULT_HEADER);

  // Batches State (Record Type 5 & 6)
  const [batches, setBatches] = useState([
    {
      secCode: 'PPD',
      companyName: 'ACME FINANCIAL',
      companyId: '1234567890',
      companyEntryDescription: 'PAYROLL',
      companyDescriptiveDate: getYYMMDD(),
      effectiveDate: getYYMMDD(),
      odfiRouting: '071000013',
      isBalanced: true,
      offsetAccountNumber: '9900112233',
      entries: [
        {
          transactionCode: '22',
          routingNumber: '021000021',
          accountNumber: '1102938475',
          amount: '2850.00',
          individualId: 'EMP-00101',
          individualName: 'ALEX MORGAN',
          discretionaryData: 'S ',
          addenda: 'PAYROLL PERIOD ENDING 09/30 NET SALARY',
        },
        {
          transactionCode: '22',
          routingNumber: '121000358',
          accountNumber: '4455667788',
          amount: '3420.50',
          individualId: 'EMP-00102',
          individualName: 'JORDAN TAYLOR',
          discretionaryData: 'S ',
          addenda: 'PAYROLL PERIOD ENDING 09/30 NET SALARY',
        }
      ],
    }
  ]);

  const [activeBatchIndex, setActiveBatchIndex] = useState(0);

  // Modals state
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingEntryIndex, setEditingEntryIndex] = useState(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);

  const activeBatch = batches[activeBatchIndex] || batches[0];

  // Helper to update active batch
  const updateActiveBatch = (updatedBatch) => {
    const newBatches = [...batches];
    newBatches[activeBatchIndex] = updatedBatch;
    setBatches(newBatches);
  };

  // Generate NACHA File Data in real-time
  const nachaResult = useMemo(() => {
    return generateNachaFile({ header, batches });
  }, [header, batches]);

  // Load Preset Handler
  const handleLoadPreset = (presetId) => {
    const preset = SAMPLE_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setHeader({
        ...preset.header,
        fileDate: getYYMMDD(),
        fileTime: getHHMM(),
      });
      setBatches(preset.batches);
      setActiveBatchIndex(0);
    }
  };

  // Entry Handlers
  const handleSaveEntry = (entryData, editIdx) => {
    const currentEntries = [...activeBatch.entries];
    if (editIdx !== null) {
      currentEntries[editIdx] = entryData;
    } else {
      currentEntries.push(entryData);
    }
    updateActiveBatch({ ...activeBatch, entries: currentEntries });
  };

  const handleDuplicateEntry = (index) => {
    const entryToDup = activeBatch.entries[index];
    const currentEntries = [...activeBatch.entries];
    currentEntries.splice(index + 1, 0, { ...entryToDup });
    updateActiveBatch({ ...activeBatch, entries: currentEntries });
  };

  const handleDeleteEntry = (index) => {
    const currentEntries = activeBatch.entries.filter((_, i) => i !== index);
    updateActiveBatch({ ...activeBatch, entries: currentEntries });
  };

  const handleBulkImportCsv = (importedEntries) => {
    const currentEntries = [...activeBatch.entries, ...importedEntries];
    updateActiveBatch({ ...activeBatch, entries: currentEntries });
  };

  // Reset Handler
  const handleReset = () => {
    if (window.confirm('Reset all file headers and entry records to empty defaults?')) {
      setHeader(DEFAULT_HEADER);
      setBatches([
        {
          secCode: 'PPD',
          companyName: 'COMPANY NAME',
          companyId: '1234567890',
          companyEntryDescription: 'PAYROLL',
          companyDescriptiveDate: getYYMMDD(),
          effectiveDate: getYYMMDD(),
          odfiRouting: '071000013',
          isBalanced: true,
          offsetAccountNumber: '',
          entries: [],
        }
      ]);
    }
  };

  // Download File Handler
  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([nachaResult.fileString], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    const fileName = `NACHA_${header.referenceCode || 'PAYMENT'}_${getYYMMDD()}_${getHHMM()}.ach`;
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        metrics={nachaResult.metrics}
        errors={nachaResult.errors}
        warnings={nachaResult.warnings}
        onLoadPreset={handleLoadPreset}
        onOpenCsvModal={() => setIsCsvModalOpen(true)}
        onOpenSpecModal={() => setIsSpecModalOpen(true)}
        onReset={handleReset}
        onDownload={handleDownload}
      />

      {/* Main Grid Workspace */}
      <main className="main-layout">
        {/* Left Column: Config Form & Entry Management */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header Configuration */}
          <HeaderConfigForm
            header={header}
            setHeader={setHeader}
            activeBatch={activeBatch}
            setActiveBatch={updateActiveBatch}
          />

          {/* Payment Entries Table */}
          <EntryTable
            entries={activeBatch.entries}
            onAddEntry={() => {
              setEditingEntryIndex(null);
              setIsEntryModalOpen(true);
            }}
            onEditEntry={(idx) => {
              setEditingEntryIndex(idx);
              setIsEntryModalOpen(true);
            }}
            onDuplicateEntry={handleDuplicateEntry}
            onDeleteEntry={handleDeleteEntry}
            isBalanced={activeBatch.isBalanced}
          />
        </div>

        {/* Right Column: Live NACHA Monospace Inspector & Validation */}
        <div>
          <NachaInspector
            nachaResult={nachaResult}
            onDownload={handleDownload}
          />
        </div>
      </main>

      {/* Add / Edit Entry Modal */}
      <EntryModal
        isOpen={isEntryModalOpen}
        onClose={() => {
          setIsEntryModalOpen(false);
          setEditingEntryIndex(null);
        }}
        onSave={handleSaveEntry}
        initialData={editingEntryIndex !== null ? activeBatch.entries[editingEntryIndex] : null}
        editIndex={editingEntryIndex}
      />

      {/* CSV Bulk Importer Modal */}
      <CsvImporterModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImport={handleBulkImportCsv}
      />

      {/* Technical NACHA Reference Modal */}
      <NachaSpecModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
      />
    </div>
  );
}
