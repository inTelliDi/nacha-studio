import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, CreditCard, FileText } from 'lucide-react';
import { validateRoutingNumber } from '../utils/nachaGenerator';

export function EntryModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  editIndex 
}) {
  const [formData, setFormData] = useState({
    transactionCode: '22',
    routingNumber: '',
    accountNumber: '',
    amount: '',
    individualId: '',
    individualName: '',
    discretionaryData: '',
    addenda: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        transactionCode: initialData.transactionCode || '22',
        routingNumber: initialData.routingNumber || '',
        accountNumber: initialData.accountNumber || '',
        amount: initialData.amount || '',
        individualId: initialData.individualId || '',
        individualName: initialData.individualName || '',
        discretionaryData: initialData.discretionaryData || '',
        addenda: initialData.addenda || '',
      });
    } else {
      setFormData({
        transactionCode: '22',
        routingNumber: '',
        accountNumber: '',
        amount: '',
        individualId: '',
        individualName: '',
        discretionaryData: '',
        addenda: '',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const isRoutingValid = validateRoutingNumber(formData.routingNumber);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, editIndex);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={20} style={{ color: 'var(--primary-amber)' }} />
            <span>{editIndex !== null ? 'Edit Payment Entry' : 'Add New Payment Entry'}</span>
          </div>
          <button className="btn btn-secondary btn-icon btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-grid">
            {/* Transaction Code Selector */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">
                <span>Transaction Code / Account Type <span className="req">*</span></span>
              </label>
              <select 
                className="form-select mono"
                value={formData.transactionCode}
                onChange={(e) => setFormData({ ...formData, transactionCode: e.target.value })}
                required
              >
                <optgroup label="Credit Transactions (Deposits)">
                  <option value="22">22 - Checking Deposit (Credit)</option>
                  <option value="32">32 - Savings Deposit (Credit)</option>
                  <option value="23">23 - Checking Pre-notification (Credit)</option>
                  <option value="33">33 - Savings Pre-notification (Credit)</option>
                </optgroup>
                <optgroup label="Debit Transactions (Withdrawals)">
                  <option value="27">27 - Checking Debit (Withdrawal)</option>
                  <option value="37">37 - Savings Debit (Withdrawal)</option>
                  <option value="28">28 - Checking Pre-notification (Debit)</option>
                  <option value="38">38 - Savings Pre-notification (Debit)</option>
                </optgroup>
              </select>
            </div>

            {/* Receiver Name */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">
                <span>Receiver Name / Individual Name <span className="req">*</span></span>
              </label>
              <input 
                type="text" 
                className="form-input"
                maxLength={22}
                placeholder="ALEX MORGAN / GLOBAL TECH LLC"
                value={formData.individualName}
                onChange={(e) => setFormData({ ...formData, individualName: e.target.value })}
                required
              />
              <span className="form-hint">Max 22 chars (left-justified, space-padded)</span>
            </div>

            {/* ABA Routing Number */}
            <div className="form-group">
              <label className="form-label">
                <span>Receiving DFI Routing # <span className="req">*</span></span>
                {formData.routingNumber && (
                  <span style={{ fontSize: '0.7rem', color: isRoutingValid ? '#34d399' : '#f87171' }}>
                    {isRoutingValid ? '✓ Valid' : '⚠ Mod 10 Error'}
                  </span>
                )}
              </label>
              <input 
                type="text" 
                className={`form-input mono ${formData.routingNumber && !isRoutingValid ? 'error' : ''}`}
                maxLength={9}
                placeholder="021000021"
                value={formData.routingNumber}
                onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value.replace(/\D/g, '') })}
                required
              />
              <span className="form-hint">9-digit ABA Transit Routing #</span>
            </div>

            {/* Account Number */}
            <div className="form-group">
              <label className="form-label">
                <span>DFI Account Number <span className="req">*</span></span>
              </label>
              <input 
                type="text" 
                className="form-input mono"
                maxLength={17}
                placeholder="1102938475"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                required
              />
              <span className="form-hint">Receiver account # (Max 17 chars)</span>
            </div>

            {/* Payment Amount */}
            <div className="form-group">
              <label className="form-label">
                <span>Amount ($ USD) <span className="req">*</span></span>
              </label>
              <input 
                type="number" 
                step="0.01"
                min="0.01"
                className="form-input mono"
                placeholder="1500.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
              <span className="form-hint">Dollar amount (e.g. 1500.50)</span>
            </div>

            {/* Receiver Identification */}
            <div className="form-group">
              <label className="form-label">Individual / Receiver ID</label>
              <input 
                type="text" 
                className="form-input mono"
                maxLength={15}
                placeholder="EMP-00101 / INV-9901"
                value={formData.individualId}
                onChange={(e) => setFormData({ ...formData, individualId: e.target.value })}
              />
              <span className="form-hint">Max 15 chars (Employee ID / Customer ID)</span>
            </div>

            {/* Discretionary Data */}
            <div className="form-group">
              <label className="form-label">Discretionary Data Code</label>
              <input 
                type="text" 
                className="form-input mono"
                maxLength={2}
                placeholder="S "
                value={formData.discretionaryData}
                onChange={(e) => setFormData({ ...formData, discretionaryData: e.target.value })}
              />
              <span className="form-hint">Max 2 chars (e.g. S for Same-Day ACH)</span>
            </div>

            {/* Type 7 Addenda Information */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={14} style={{ color: '#2dd4bf' }} />
                <span>Type 7 Addenda Remittance Information (Optional)</span>
              </label>
              <textarea 
                className="form-textarea mono"
                rows={2}
                maxLength={80}
                placeholder="INV# 98231 DATED 09/15 DISCOUNT 2% NET 30 REMITTANCE ADVICE"
                value={formData.addenda}
                onChange={(e) => setFormData({ ...formData, addenda: e.target.value })}
                style={{ resize: 'none' }}
              />
              <span className="form-hint">Max 80 chars payment-related information attached as Record Type 7</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={16} />
              <span>{editIndex !== null ? 'Save Changes' : 'Add Entry Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
