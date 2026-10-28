export default function LedgerHistory({ customer, entries, balance, onRemind }) {
  if (!customer) return <div className="empty-detail"><span className="detail-icon">L</span><h2>Select a customer</h2><p className="muted">Choose a name to view the ledger and record a payment or credit.</p></div>;
  return <><div className="detail-header"><div><p className="eyebrow">CUSTOMER PROFILE</p><h2>{customer.name}</h2><p className="muted">{customer.phone}</p></div><button className="whatsapp-button" onClick={onRemind}>Send WhatsApp reminder</button></div><div className="balance-callout"><span>Money owed</span><strong>₦{balance.toLocaleString()}</strong></div><div className="ledger-list">{entries.length ? entries.map((entry) => {
    const isInvoice = entry.type === 'invoice';
    const label = isInvoice ? 'Invoice' : entry.type === 'credit' ? 'Credit' : 'Payment';
    const amount = isInvoice ? entry.amount_owed : entry.amount;
    const amountClass = entry.type === 'payment' ? 'payment' : 'credit';
    const summary = isInvoice
      ? `Paid ₦${Number(entry.amount_paid).toLocaleString()} · owed ₦${Number(entry.amount_owed).toLocaleString()} · ${entry.note || 'No note'}`
      : entry.note || 'No note';
    const prefix = entry.type === 'payment' ? '-' : '+';
    return <div className="ledger-row" key={entry.id}><span><strong>{label}</strong><small>{summary} · {new Date(entry.created_at).toLocaleDateString()}</small></span><strong className={amountClass}>{prefix}₦{Number(amount).toLocaleString()}</strong></div>;
  }) : <p className="muted empty-state">No entries yet.</p>}</div></>;
}
