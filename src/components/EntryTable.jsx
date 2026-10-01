import React from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Edit3, 
  CreditCard, 
  FileText, 
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { formatCurrency, validateRoutingNumber } from '../utils/nachaGenerator';

export function EntryTable({ 
  entries, 
  onAddEntry, 
  onEditEntry, 
  onDuplicateEntry, 
  onDeleteEntry,
  isBalanced 
}) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredEntries = entries.filter((e) => {
    const term = searchTerm.toLowerCase();
    return (
      (e.individualName || '').toLowerCase().includes(term) ||
      (e.individualId || '').toLowerCase().includes(term) ||
      (e.routingNumber || '').includes(term) ||
      (e.accountNumber || '').includes(term) ||
      (e.amount || '').includes(term)
    );
  });

  // Calculate totals
  let totalCredits = 0;
  let totalDebits = 0;

  entries.forEach((e) => {
    const amt = (parseFloat(e.amount) || 0) * 100;
    if (['27', '37', '28', '38', '29', '57'].includes(e.transactionCode)) {
      totalDebits += amt;
    } else {
      totalCredits += amt;
    }
  });

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <CreditCard size={18} />
          <span>Payment Entry Records (Record Type 6)</span>
          <span className="badge-pill" style={{ marginLeft: '0.5rem' }}>
            {entries.length} Record{entries.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input 
              type="text"
              className="form-input"
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2rem', fontSize: '0.8rem', width: '180px' }}
            />
          </div>

          <button className="btn btn-primary btn-sm" onClick={onAddEntry}>
            <Plus size={14} />
            <span>Add Payment Entry</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Tx Code / Type</th>
              <th>Receiver Name</th>
              <th>ABA Routing #</th>
              <th>Account #</th>
              <th>Receiver ID</th>
              <th>Amount ($)</th>
              <th>Addenda (Type 7)</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-dim)' }}>
                  <CreditCard size={32} style={{ margin: '0 auto 0.5rem auto', opacity: 0.4 }} />
                  <div>No payment entries added yet.</div>
                  <div style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>
                    Click <strong>"Add Payment Entry"</strong> or load a preset template to get started.
                  </div>
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry, idx) => {
                const isRoutingValid = validateRoutingNumber(entry.routingNumber);
                const isDebit = ['27', '37', '28', '38', '29', '57'].includes(entry.transactionCode);

                return (
                  <tr key={idx}>
                    <td className="mono" style={{ color: 'var(--text-dim)' }}>{idx + 1}</td>
                    <td>
                      <span className={`badge-pill ${isDebit ? 'danger' : 'success'}`} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                        {entry.transactionCode} - {getTransactionLabel(entry.transactionCode)}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{entry.individualName || '—'}</td>
                    <td className="mono">
                      <span style={{ color: isRoutingValid ? 'var(--text-main)' : '#f87171' }}>
                        {entry.routingNumber || '—'}
                      </span>
                      {!isRoutingValid && entry.routingNumber && (
                        <AlertCircle size={12} style={{ marginLeft: '4px', color: '#f87171', verticalAlign: 'middle' }} title="Invalid ABA routing check digit" />
                      )}
                    </td>
                    <td className="mono">{entry.accountNumber || '—'}</td>
                    <td className="mono" style={{ color: 'var(--text-muted)' }}>{entry.individualId || '—'}</td>
                    <td className="mono" style={{ fontWeight: 700, color: isDebit ? '#f87171' : '#34d399' }}>
                      {formatCurrency((parseFloat(entry.amount) || 0) * 100)}
                    </td>
                    <td>
                      {entry.addenda && entry.addenda.trim() ? (
                        <span className="badge-pill" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#2dd4bf', border: '1px solid rgba(45, 212, 191, 0.3)', fontSize: '0.7rem' }}>
                          <FileText size={11} />
                          <span title={entry.addenda}>{entry.addenda.slice(0, 18)}{entry.addenda.length > 18 ? '...' : ''}</span>
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>None</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                        <button 
                          className="btn btn-secondary btn-icon btn-sm" 
                          onClick={() => onEditEntry(idx)}
                          title="Edit entry"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button 
                          className="btn btn-secondary btn-icon btn-sm" 
                          onClick={() => onDuplicateEntry(idx)}
                          title="Duplicate entry"
                        >
                          <Copy size={13} />
                        </button>
                        <button 
                          className="btn btn-danger btn-icon btn-sm" 
                          onClick={() => onDeleteEntry(idx)}
                          title="Delete entry"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Batch Summary Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.82rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Total Credits: </span>
            <strong style={{ color: '#34d399' }}>{formatCurrency(totalCredits)}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Total Debits: </span>
            <strong style={{ color: '#f87171' }}>{formatCurrency(totalDebits)}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Net Difference: </span>
            <strong style={{ color: totalCredits === totalDebits ? '#34d399' : '#fbbf24' }}>
              {formatCurrency(Math.abs(totalCredits - totalDebits))}
            </strong>
          </div>
        </div>

        {isBalanced && (
          <div style={{ color: '#fbbf24', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CheckCircle2 size={14} />
            <span>Balanced Mode Active: Auto-generates Record Type 6 offset line upon download</span>
          </div>
        )}
      </div>
    </div>
  );
}

function getTransactionLabel(code) {
  switch (code) {
    case '22': return 'Checking Deposit (Credit)';
    case '27': return 'Checking Debit (Withdrawal)';
    case '32': return 'Savings Deposit (Credit)';
    case '37': return 'Savings Debit (Withdrawal)';
    case '23': return 'Checking Prenote (Credit)';
    case '28': return 'Checking Prenote (Debit)';
    case '33': return 'Savings Prenote (Credit)';
    case '38': return 'Savings Prenote (Debit)';
    default: return 'ACH Transaction';
  }
}
