import { useState } from 'react';

export default function AddInvoiceModal({ customer, onClose, onSave }) {
  const [form, setForm] = useState({ total: '', paid: '', note: '' });
  const total = Number(form.total);
  const paid = Number(form.paid);
  const rawOwed = (Number.isFinite(total) ? total : 0) - (Number.isFinite(paid) ? paid : 0);
  const owes = Math.max(0, Math.round(rawOwed * 100) / 100);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (!customer || !(total > 0) || !(paid >= 0) || paid > total) return;

    onSave({
      type: 'invoice',
      amount: total,
      amount_paid: paid,
      amount_owed: owes,
      note: form.note,
      customer_id: customer.id,
      created_at: new Date().toISOString()
    });
  }

  return (
    <div className="modal-backdrop">
      <form className="modal invoice-modal" onSubmit={submit}>
        <div className="modal-heading">
          <div>
            <p className="eyebrow">NEW INVOICE</p>
            <h2>{customer?.name}</h2>
          </div>
          <button type="button" className="close-button" onClick={onClose}>×</button>
        </div>

        <label>
          Invoice total
          <input type="number" min="0.01" step="0.01" placeholder="4500" value={form.total} onChange={(event) => updateField('total', event.target.value)} required />
        </label>
        <label>
          Money paid
          <input type="number" min="0" step="0.01" placeholder="1500" value={form.paid} onChange={(event) => updateField('paid', event.target.value)} required />
        </label>
        <label>
          Money owed
          <input className="invoice-total" type="number" value={owes.toFixed(2)} readOnly />
        </label>
        <label>
          Item or note
          <input placeholder="Rice and provisions" value={form.note} onChange={(event) => updateField('note', event.target.value)} />
        </label>

        {paid > total && <p className="form-error">Money paid cannot be more than the invoice total.</p>}
        <button className="primary-button">Add invoice</button>
      </form>
    </div>
  );
}
