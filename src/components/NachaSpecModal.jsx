import React from 'react';
import { X, BookOpen, CheckCircle, ExternalLink, HelpCircle, Layers, ShieldCheck } from 'lucide-react';

export function NachaSpecModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} style={{ color: 'var(--primary-amber)' }} />
            <span>NACHA ACH Technical Reference Guide</span>
          </div>
          <button className="btn btn-secondary btn-icon btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.85rem' }}>
          {/* Section 1: Standard Overview */}
          <div className="alert-banner info" style={{ margin: 0 }}>
            <ShieldCheck size={18} style={{ flexShrink: 0 }} />
            <div>
              <strong>Standard ACH File Overview:</strong> NACHA files are strict 94-character fixed-width ASCII files formatted into hierarchical record levels (File Header 1, Batch Header 5, Entry Detail 6, Addenda 7, Batch Control 8, File Control 9, and Filler Records 999).
            </div>
          </div>

          {/* Record Hierarchy Diagram */}
          <div>
            <h4 style={{ color: 'var(--primary-amber)', marginBottom: '0.5rem' }}>File Record Hierarchy Breakdown</h4>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Record Type</th>
                    <th>Code</th>
                    <th>Description & Specs</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ color: '#c084fc', fontWeight: 600 }}>File Header Record</td>
                    <td className="mono">Type 1</td>
                    <td>Contains Destination & Origin Routing IDs, File Creation Date/Time, Block factor (10), and Bank names.</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#60a5fa', fontWeight: 600 }}>Batch Header Record</td>
                    <td className="mono">Type 5</td>
                    <td>Contains SEC Code (PPD/CCD/WEB), Company ID, Effective Entry Date, and Originating DFI ID.</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#34d399', fontWeight: 600 }}>Entry Detail Record</td>
                    <td className="mono">Type 6</td>
                    <td>Individual payment transactions. 9-digit ABA Routing #, Account #, Dollar Amount in Cents, Tx Code, Receiver Name & ID.</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#2dd4bf', fontWeight: 600 }}>Addenda Record</td>
                    <td className="mono">Type 7</td>
                    <td>Optional/CCD+ remittance advice attached to Type 6 entry. 80-character payment information string.</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#fbbf24', fontWeight: 600 }}>Batch Control Record</td>
                    <td className="mono">Type 8</td>
                    <td>Summarizes entry counts, Hash total (sum of first 8 digits of routing numbers), and total Batch Debit/Credit sums.</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#f87171', fontWeight: 600 }}>File Control Record</td>
                    <td className="mono">Type 9</td>
                    <td>Summarizes total batches, block counts, total file entry counts, and total file Debit/Credit sums.</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#94a3b8', fontWeight: 600 }}>Filler Records</td>
                    <td className="mono">999...</td>
                    <td>Appended to pad total line count to a multiple of 10 (Blocking Factor requirement).</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Settlement Implementation Requirements */}
          <div>
            <h4 style={{ color: 'var(--accent-blue)', marginBottom: '0.5rem' }}>ACH Settlement Implementation Notes</h4>
            <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-muted)' }}>
              <li>
                <strong style={{ color: 'var(--text-main)' }}>Balanced vs. Unbalanced Files:</strong> Banking system setups specify whether your organization is required to submit a Balanced ACH File (where an offset Type 6 record for the company's settlement account balances debits and credits) or an Unbalanced File. NACHA Studio supports both via a single toggle!
              </li>
              <li>
                <strong style={{ color: 'var(--text-main)' }}>ABA Modulus 10 Check Digit:</strong> Every 9-digit routing number must pass the Federal Reserve check digit calculation: <code>3(d1+d4+d7) + 7(d2+d5+d8) + 1(d3+d6+d9) mod 10 === 0</code>.
              </li>
              <li>
                <strong style={{ color: 'var(--text-main)' }}>Transaction Codes:</strong> 
                <span className="mono" style={{ color: '#34d399', marginLeft: '0.2rem' }}>22</span> Checking Credit, 
                <span className="mono" style={{ color: '#f87171', marginLeft: '0.2rem' }}>27</span> Checking Debit, 
                <span className="mono" style={{ color: '#34d399', marginLeft: '0.2rem' }}>32</span> Savings Credit, 
                <span className="mono" style={{ color: '#f87171', marginLeft: '0.2rem' }}>37</span> Savings Debit.
              </li>
            </ul>
          </div>

          {/* Reference link */}
          <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <a 
              href="https://achdevguide.nacha.org/ach-file-overview" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: 'var(--primary-amber)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}
            >
              <span>Official NACHA Developer Guide</span>
              <ExternalLink size={14} />
            </a>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close Reference
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
