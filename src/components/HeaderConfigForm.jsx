import React from 'react';
import { Settings, ShieldCheck, Building, Calendar, Hash, FileCheck, Layers } from 'lucide-react';
import { validateRoutingNumber } from '../utils/nachaGenerator';

export function HeaderConfigForm({ 
  header, 
  setHeader, 
  activeBatch, 
  setActiveBatch 
}) {
  const isDestRoutingValid = validateRoutingNumber(header.immediateDestinationRouting);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <Settings size={18} />
          <span>ACH File & Batch Envelope Settings</span>
        </div>
        <div className="badge-pill" style={{ fontSize: '0.72rem' }}>
          <ShieldCheck size={13} style={{ color: '#34d399' }} />
          <span>94-Char Fixed Width ASCII Format</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Section 1: Record 1 File Header Controls */}
        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary-amber)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            1. File Header Specifications (Record Type 1)
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                <span>Immediate Destination ABA <span className="req">*</span></span>
                {header.immediateDestinationRouting && (
                  <span style={{ fontSize: '0.7rem', color: isDestRoutingValid ? '#34d399' : '#f87171' }}>
                    {isDestRoutingValid ? '✓ Valid ABA' : '⚠ Invalid ABA'}
                  </span>
                )}
              </label>
              <input 
                type="text" 
                className={`form-input mono ${!isDestRoutingValid && header.immediateDestinationRouting ? 'error' : ''}`}
                maxLength={9}
                placeholder="071000013"
                value={header.immediateDestinationRouting || ''}
                onChange={(e) => setHeader({ ...header, immediateDestinationRouting: e.target.value })}
              />
              <span className="form-hint">ODFI 9-digit Fed Routing # (e.g. Chase 071000013)</span>
            </div>

            <div className="form-group">
              <label className="form-label">Destination Bank Name</label>
              <input 
                type="text" 
                className="form-input"
                maxLength={23}
                placeholder="FEDERAL RESERVE BANK"
                value={header.immediateDestinationName || ''}
                onChange={(e) => setHeader({ ...header, immediateDestinationName: e.target.value })}
              />
              <span className="form-hint">Max 23 chars (blank padded)</span>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Immediate Origin (ODFI Routing / Tax ID) <span className="req">*</span></span>
              </label>
              <input 
                type="text" 
                className="form-input mono"
                maxLength={10}
                placeholder="103913502"
                value={header.immediateOriginId || ''}
                onChange={(e) => setHeader({ ...header, immediateOriginId: e.target.value })}
              />
              <span className="form-hint">MapleMark Bank ODFI Routing or Tax ID</span>
            </div>

            <div className="form-group">
              <label className="form-label">Originating Bank Name (Immediate Origin)</label>
              <input 
                type="text" 
                className="form-input"
                maxLength={23}
                placeholder="MAPLEMARK BANK"
                value={header.immediateOriginName || ''}
                onChange={(e) => setHeader({ ...header, immediateOriginName: e.target.value })}
              />
              <span className="form-hint">Max 23 chars</span>
            </div>

            <div className="form-group">
              <label className="form-label">File Ref Code / Tracking</label>
              <input 
                type="text" 
                className="form-input mono"
                maxLength={8}
                placeholder="ACHPAY1"
                value={header.referenceCode || ''}
                onChange={(e) => setHeader({ ...header, referenceCode: e.target.value })}
              />
              <span className="form-hint">Optional 8-char audit code</span>
            </div>
          </div>
        </div>

        {/* Section 2: Record 5 Batch Header Controls */}
        <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '1rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--accent-blue)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            2. Batch Header Specifications (Record Type 5)
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Company Name (Batch Origin)</label>
              <input 
                type="text" 
                className="form-input"
                maxLength={16}
                placeholder="ACME CORP PAYROLL"
                value={activeBatch.companyName || ''}
                onChange={(e) => setActiveBatch({ ...activeBatch, companyName: e.target.value })}
              />
              <span className="form-hint">Max 16 chars displayed to receiver</span>
            </div>

            <div className="form-group">
              <label className="form-label">Company Identification ID</label>
              <input 
                type="text" 
                className="form-input mono"
                maxLength={10}
                placeholder="1987654321"
                value={activeBatch.companyId || ''}
                onChange={(e) => setActiveBatch({ ...activeBatch, companyId: e.target.value })}
              />
              <span className="form-hint">Assigned 10-char ACH Company ID</span>
            </div>

            <div className="form-group">
              <label className="form-label">Standard Entry Class (SEC Code)</label>
              <select 
                className="form-select mono"
                value={activeBatch.secCode || 'PPD'}
                onChange={(e) => setActiveBatch({ ...activeBatch, secCode: e.target.value })}
              >
                <option value="PPD">PPD - Prearranged Payment & Deposit (Consumer/Payroll)</option>
                <option value="CCD">CCD - Corporate Credit or Debit (B2B Commercial)</option>
                <option value="WEB">WEB - Internet-Initiated Entry (Online Customer)</option>
              </select>
              <span className="form-hint">Payment classification standard</span>
            </div>

            <div className="form-group">
              <label className="form-label">Company Entry Description</label>
              <input 
                type="text" 
                className="form-input mono"
                maxLength={10}
                placeholder="PAYROLL"
                value={activeBatch.companyEntryDescription || ''}
                onChange={(e) => setActiveBatch({ ...activeBatch, companyEntryDescription: e.target.value })}
              />
              <span className="form-hint">Max 10 chars (e.g. PAYROLL, VENDOR PAY)</span>
            </div>

            <div className="form-group">
              <label className="form-label">Effective Settlement Date</label>
              <input 
                type="date" 
                className="form-input"
                value={activeBatch.effectiveDate ? activeBatch.effectiveDate.slice(0, 10) : ''}
                onChange={(e) => setActiveBatch({ ...activeBatch, effectiveDate: e.target.value })}
              />
              <span className="form-hint">Intended ACH settlement date</span>
            </div>

            {/* Balanced Settlement Toggle */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Balanced Settlement Mode</label>
              <div className="toggle-group" style={{ marginTop: '0.2rem' }}>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={activeBatch.isBalanced ?? true}
                    onChange={(e) => setActiveBatch({ ...activeBatch, isBalanced: e.target.checked })}
                  />
                  <span className="slider"></span>
                </label>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600', color: activeBatch.isBalanced ? '#fbbf24' : 'var(--text-muted)' }}>
                    {activeBatch.isBalanced ? 'Balanced File (Include ODFI Offset Entry)' : 'Unbalanced File'}
                  </div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-dim)' }}>
                    {activeBatch.isBalanced 
                      ? 'Generates an offset Type 6 record balancing Debits and Credits for your settlement account.' 
                      : 'Batch total debit/credit hash calculated in Record 8; no explicit offset line.'}
                  </div>
                </div>
              </div>
            </div>

            {activeBatch.isBalanced && (
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Company Offset Settlement Account #</label>
                <input 
                  type="text" 
                  className="form-input mono"
                  maxLength={17}
                  placeholder="9900112233"
                  value={activeBatch.offsetAccountNumber || ''}
                  onChange={(e) => setActiveBatch({ ...activeBatch, offsetAccountNumber: e.target.value })}
                />
                <span className="form-hint">Account number used for the offset settlement transaction line</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
