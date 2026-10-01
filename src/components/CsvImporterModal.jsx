import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, Check, AlertCircle, Sparkles } from 'lucide-react';

export function CsvImporterModal({ isOpen, onClose, onImport }) {
  const [csvText, setCsvText] = useState('');
  const [parsedPreview, setParsedPreview] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleParse = (text) => {
    setCsvText(text);
    setErrorMsg('');
    if (!text.trim()) {
      setParsedPreview([]);
      return;
    }

    try {
      const lines = text.trim().split(/\r?\n/);
      const entries = [];

      lines.forEach((line, idx) => {
        if (!line.trim()) return;
        // Skip header line if detected
        if (idx === 0 && (line.toLowerCase().includes('name') || line.toLowerCase().includes('routing') || line.toLowerCase().includes('amount'))) {
          return;
        }

        // Split by comma or tab or semicolon
        const cols = line.split(/,|\t|;/).map((c) => c.trim().replace(/^["']|["']$/g, ''));
        if (cols.length < 3) return;

        // Try to identify columns intelligently:
        // Expected order: Receiver Name, Routing #, Account #, Amount, TxCode, Receiver ID, Addenda
        let name = cols[0] || 'RECIPIENT';
        let routing = cols[1] ? cols[1].replace(/\D/g, '') : '';
        let account = cols[2] || '';
        let amount = cols[3] || '0.00';
        let txCode = cols[4] || '22';
        let indId = cols[5] || '';
        let addenda = cols[6] || '';

        // Standardize txCode
        if (!['22', '27', '32', '37', '23', '28', '33', '38'].includes(txCode)) {
          txCode = '22';
        }

        entries.push({
          individualName: name.toUpperCase(),
          routingNumber: routing,
          accountNumber: account,
          amount: amount,
          transactionCode: txCode,
          individualId: indId.toUpperCase(),
          discretionaryData: '',
          addenda: addenda,
        });
      });

      setParsedPreview(entries);
    } catch (err) {
      setErrorMsg('Error parsing CSV data. Please check formatting.');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        handleParse(evt.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleConfirm = () => {
    if (parsedPreview.length > 0) {
      onImport(parsedPreview);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '750px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileSpreadsheet size={20} style={{ color: '#3b82f6' }} />
            <span>Bulk Import ACH Entries (CSV / Excel)</span>
          </div>
          <button className="btn btn-secondary btn-icon btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="alert-banner info">
          <Sparkles size={16} style={{ flexShrink: 0 }} />
          <div>
            <strong>CSV Column Format:</strong> Name, Routing Number, Account Number, Amount, [TxCode], [Receiver ID], [Addenda]
            <br />
            <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>Example: <code>John Doe, 021000021, 12345678, 1250.00, 22, EMP-101, Payroll Sept</code></span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* File Upload Zone */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
              <Upload size={14} />
              <span>Select CSV File</span>
              <input type="file" accept=".csv,.txt,.tsv" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Or paste tabular data below:</span>
          </div>

          {/* Textarea */}
          <textarea
            className="form-textarea mono"
            rows={5}
            placeholder={`ALEX MORGAN, 021000021, 1102938475, 2850.00, 22, EMP-00101, PAYROLL\nJORDAN TAYLOR, 121000358, 4455667788, 3420.50, 22, EMP-00102, PAYROLL`}
            value={csvText}
            onChange={(e) => handleParse(e.target.value)}
          />

          {errorMsg && (
            <div className="alert-banner error">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedPreview.length > 0 && (
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#34d399', marginBottom: '0.5rem' }}>
                ✓ Parsed {parsedPreview.length} Record{parsedPreview.length > 1 ? 's' : ''} Ready to Import:
              </div>
              <div className="table-container" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Routing</th>
                      <th>Account</th>
                      <th>Amount</th>
                      <th>Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedPreview.slice(0, 10).map((row, i) => (
                      <tr key={i}>
                        <td>{row.individualName}</td>
                        <td className="mono">{row.routingNumber}</td>
                        <td className="mono">{row.accountNumber}</td>
                        <td className="mono" style={{ color: '#34d399' }}>${row.amount}</td>
                        <td className="mono">{row.transactionCode}</td>
                      </tr>
                    ))}
                    {parsedPreview.length > 10 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.78rem' }}>
                          ... and {parsedPreview.length - 10} more entries
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={parsedPreview.length === 0}
            onClick={handleConfirm}
          >
            <Check size={16} />
            <span>Import {parsedPreview.length} Record{parsedPreview.length !== 1 ? 's' : ''}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
