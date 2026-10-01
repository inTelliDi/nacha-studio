import React, { useState } from 'react';
import { 
  FileCode, 
  Copy, 
  Download, 
  Check, 
  AlertTriangle, 
  Info, 
  Layers, 
  Search,
  Eye
} from 'lucide-react';
import { inspectNachaLine } from '../utils/nachaGenerator';

export function NachaInspector({ 
  nachaResult, 
  onDownload 
}) {
  const [selectedLineIndex, setSelectedLineIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const { fileString, lines, metrics, errors, warnings } = nachaResult;
  const selectedLineObj = lines[selectedLineIndex] || lines[0];
  const inspectedFields = selectedLineObj ? inspectNachaLine(selectedLineObj) : [];

  const handleCopy = () => {
    navigator.clipboard.writeText(fileString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Real-time NACHA & FIS Horizon Validation Status */}
      <div className="card" style={{ marginBottom: 0 }}>
        <div className="card-header" style={{ marginBottom: '0.5rem', paddingBottom: '0.5rem' }}>
          <div className="card-title" style={{ fontSize: '0.95rem' }}>
            <Layers size={16} />
            <span>NACHA Standard Compliance</span>
          </div>
          <div className="badge-pill" style={{ fontSize: '0.72rem' }}>
            Block Count: <strong>{metrics.blockCount}</strong> ({metrics.totalLines} lines)
          </div>
        </div>

        {errors.length > 0 && (
          <div className="alert-banner error" style={{ marginBottom: '0.5rem' }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <div>
              <strong>NACHA Compliance Errors ({errors.length}):</strong>
              <ul style={{ paddingLeft: '1.2rem', marginTop: '0.2rem', fontSize: '0.78rem' }}>
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="alert-banner warning" style={{ marginBottom: '0.5rem' }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <div>
              <strong>Validation Warnings ({warnings.length}):</strong>
              <ul style={{ paddingLeft: '1.2rem', marginTop: '0.2rem', fontSize: '0.78rem' }}>
                {warnings.map((warn, i) => (
                  <li key={i}>{warn}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {errors.length === 0 && warnings.length === 0 && (
          <div className="alert-banner info" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#34d399', marginBottom: 0 }}>
            <Check size={16} style={{ flexShrink: 0 }} />
            <div>
              <strong>All Checks Passed!</strong> The file strictly complies with 94-character fixed-width NACHA operating rules.
            </div>
          </div>
        )}
      </div>

      {/* Raw 94-Character Line Monospace Code Viewer */}
      <div className="card" style={{ marginBottom: 0 }}>
        <div className="card-header">
          <div className="card-title" style={{ fontSize: '0.95rem' }}>
            <FileCode size={16} />
            <span>Generated NACHA File Viewer</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
              {copied ? <Check size={13} style={{ color: '#34d399' }} /> : <Copy size={13} />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <button className="btn btn-primary btn-sm" onClick={onDownload} disabled={errors.length > 0}>
              <Download size={13} />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem', fontSize: '0.7rem' }}>
          <span className="badge-pill" style={{ background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc' }}>Type 1: File Header</span>
          <span className="badge-pill" style={{ background: 'rgba(96, 165, 250, 0.15)', color: '#60a5fa' }}>Type 5: Batch Header</span>
          <span className="badge-pill" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399' }}>Type 6: Entry Detail</span>
          <span className="badge-pill" style={{ background: 'rgba(45, 212, 191, 0.15)', color: '#2dd4bf' }}>Type 7: Addenda</span>
          <span className="badge-pill" style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' }}>Type 8: Batch Control</span>
          <span className="badge-pill" style={{ background: 'rgba(248, 113, 113, 0.15)', color: '#f87171' }}>Type 9: File Control</span>
          <span className="badge-pill" style={{ background: 'rgba(100, 116, 139, 0.15)', color: '#94a3b8' }}>Filler Block (9s)</span>
        </div>

        {/* Code Container */}
        <div className="nacha-viewer">
          {lines.map((lObj, idx) => {
            const isSelected = idx === selectedLineIndex;
            return (
              <div 
                key={idx} 
                className={`nacha-line ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedLineIndex(idx)}
                title={`Click to inspect Record Type ${lObj.type} (${lObj.desc})`}
              >
                <span className="line-num">{(idx + 1).toString().padStart(2, '0')}</span>
                <span className={`line-text-${lObj.type}`}>
                  {lObj.line}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--text-dim)', textAlign: 'right' }}>
          💡 Click any line above to inspect its exact NACHA field positions & rules below.
        </div>
      </div>

      {/* Interactive Field Inspector Panel */}
      {selectedLineObj && (
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <div className="card-title" style={{ fontSize: '0.9rem' }}>
              <Eye size={16} style={{ color: 'var(--primary-amber)' }} />
              <span>
                Field Inspector — Line #{selectedLineIndex + 1}: Record Type {selectedLineObj.type} ({selectedLineObj.desc})
              </span>
            </div>
            <span className="badge-pill mono" style={{ fontSize: '0.7rem' }}>
              Length: {selectedLineObj.line.length} / 94 chars
            </span>
          </div>

          <div className="field-grid">
            {inspectedFields.map((f, i) => (
              <div key={i} className="field-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="field-pos">Pos {f.pos} ({f.len}ch)</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{f.req}</span>
                </div>
                <div className="field-name">{f.name}</div>
                <div className="field-val">{f.value || '(space)'}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
