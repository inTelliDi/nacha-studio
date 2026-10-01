import React from 'react';
import { 
  Building2, 
  FileText, 
  Sparkles, 
  HelpCircle, 
  Download, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Upload
} from 'lucide-react';
import { SAMPLE_PRESETS } from '../utils/sampleData';
import { formatCurrency } from '../utils/nachaGenerator';

export function Navbar({ 
  metrics, 
  errors, 
  warnings, 
  onLoadPreset, 
  onOpenCsvModal, 
  onOpenSpecModal,
  onReset,
  onDownload
}) {
  const hasErrors = errors && errors.length > 0;
  const hasWarnings = warnings && warnings.length > 0;

  return (
    <header className="navbar">
      <div className="brand-section">
        <div className="brand-logo">
          <Building2 size={22} />
        </div>
        <div>
          <div className="brand-title">NACHA Studio</div>
          <div className="brand-subtitle">ACH Payment Suite Generator</div>
        </div>
      </div>

      <div className="nav-controls">
        {/* Compliance Status Badge */}
        {hasErrors ? (
          <div className="badge-pill danger">
            <AlertTriangle size={14} />
            <span>{errors.length} Format Error{errors.length > 1 ? 's' : ''}</span>
          </div>
        ) : hasWarnings ? (
          <div className="badge-pill warning">
            <AlertTriangle size={14} />
            <span>{warnings.length} Warning{warnings.length > 1 ? 's' : ''}</span>
          </div>
        ) : (
          <div className="badge-pill success">
            <CheckCircle2 size={14} />
            <span>NACHA File Valid</span>
          </div>
        )}

        {/* Quick Summary Pill */}
        <div className="badge-pill">
          <FileText size={14} />
          <span>{metrics.totalEntries} Entries</span>
          <span style={{ color: 'var(--text-dim)' }}>|</span>
          <span style={{ color: '#34d399' }}>Cr: {formatCurrency(metrics.totalCredits)}</span>
          <span style={{ color: '#f87171' }}>Db: {formatCurrency(metrics.totalDebits)}</span>
        </div>

        {/* Preset Selector */}
        <div className="form-group" style={{ margin: 0 }}>
          <select 
            className="form-select" 
            defaultValue="" 
            onChange={(e) => {
              if (e.target.value) {
                onLoadPreset(e.target.value);
                e.target.value = '';
              }
            }}
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', background: 'var(--bg-card)' }}
          >
            <option value="" disabled>✨ Load Sample Template...</option>
            {SAMPLE_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        {/* Bulk CSV Import Button */}
        <button className="btn btn-secondary btn-sm" onClick={onOpenCsvModal} title="Import entries from CSV">
          <Upload size={14} />
          <span>Import CSV</span>
        </button>

        {/* NACHA Spec Guide */}
        <button className="btn btn-secondary btn-sm" onClick={onOpenSpecModal} title="View NACHA File Specifications">
          <HelpCircle size={14} />
          <span>ACH Specs</span>
        </button>

        {/* Reset Button */}
        <button className="btn btn-secondary btn-sm" onClick={onReset} title="Reset file data">
          <RotateCcw size={14} />
        </button>

        {/* Primary Download Button */}
        <button 
          className="btn btn-primary"
          onClick={onDownload}
          disabled={hasErrors}
          style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
        >
          <Download size={16} />
          <span>Download .ACH</span>
        </button>
      </div>
    </header>
  );
}
