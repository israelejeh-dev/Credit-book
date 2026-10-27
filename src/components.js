export function Navbar() { return <header className="navbar"><div className="brand-mark">L</div><div className="brand-name">ShopTab</div><span className="nav-caption">CREDIT NOTEBOOK</span></header>; }

export function AddCustomer({ onAdd }) {
  const [form, setForm] = useState({ name: '', phone: '' });
  function submit(event) { event.preventDefault(); if (!form.name || !form.phone) return; onAdd({ ...form, created_at: new Date().toISOString() }); setForm({ name: '', phone: '' }); }
  return <form className="add-customer" onSubmit={submit}><input placeholder="Customer name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /><input placeholder="Phone e.g. 2348012345678" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /><button className="secondary-button">Add customer</button></form>;
}

export function CustomerList({ customers, getBalance, selectedCustomer, onSelect, loading }) {
  if (loading) return <p className="muted empty-state">Loading customers…</p>;
  if (!customers.length) return <p className="muted empty-state">Add your first customer to start the notebook.</p>;
  return <div className="customer-list">{customers.map((customer) => { const balance = getBalance(customer.id); return <button key={customer.id} className={`customer-row ${selectedCustomer?.id === customer.id ? 'selected' : ''}`} onClick={() => onSelect(customer)}><span><strong>{customer.name}</strong><small>{customer.phone}</small></span><span className={balance > 0 ? 'balance owing' : 'balance clear'}>₦{balance.toLocaleString()}</span></button>; })}</div>;
}

export function LedgerHistory({ customer, entries, balance, onRemind }) {
  if (!customer) return <div className="empty-detail"><span className="detail-icon">L</span><h2>Select a customer</h2><p className="muted">Choose a name to view the ledger and record a payment or credit.</p></div>;
  return <><div className="detail-header"><div><p className="eyebrow">CUSTOMER PROFILE</p><h2>{customer.name}</h2><p className="muted">{customer.phone}</p></div><button className="whatsapp-button" onClick={onRemind}>Send WhatsApp reminder</button></div><div className="balance-callout"><span>Current balance</span><strong>₦{balance.toLocaleString()}</strong></div><div className="ledger-list">{entries.length ? entries.map((entry) => <div className="ledger-row" key={entry.id}><span><strong>{entry.type === 'credit' ? 'Credit' : 'Payment'}</strong><small>{entry.note || 'No note'} · {new Date(entry.created_at).toLocaleDateString()}</small></span><strong className={entry.type === 'credit' ? 'credit' : 'payment'}>{entry.type === 'credit' ? '+' : '-'}₦{Number(entry.amount).toLocaleString()}</strong></div>) : <p className="muted empty-state">No entries yet.</p>}</div></>;
}

export function RecordEntryModal({ customer, onClose, onSave }) {
  const [form, setForm] = useState({ type: 'credit', amount: '', note: '' });
  function submit(event) { event.preventDefault(); if (!form.amount || !customer) return; onSave({ ...form, amount: Number(form.amount), customer_id: customer.id, created_at: new Date().toISOString() }); }
  return <div className="modal-backdrop"><form className="modal" onSubmit={submit}><div className="modal-heading"><div><p className="eyebrow">NEW LEDGER ENTRY</p><h2>{customer?.name}</h2></div><button type="button" className="close-button" onClick={onClose}>×</button></div><div className="segmented"><button type="button" className={form.type === 'credit' ? 'active' : ''} onClick={() => setForm({ ...form, type: 'credit' })}>Credit</button><button type="button" className={form.type === 'payment' ? 'active' : ''} onClick={() => setForm({ ...form, type: 'payment' })}>Payment</button></div><label>Amount<input type="number" min="0" placeholder="4500" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></label><label>Note<input placeholder={form.type === 'credit' ? 'Rice and provisions' : 'Cash payment'} value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} /></label><button className="primary-button">Save entry</button></form></div>;
}
