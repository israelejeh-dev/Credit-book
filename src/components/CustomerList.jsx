export default function CustomerList({ customers, getBalance, selectedCustomer, onSelect, loading }) {
  if (loading) return <p className="muted empty-state">Loading customers…</p>;
  if (!customers.length) return <p className="muted empty-state">Add your first customer to start the notebook.</p>;
  return <div className="customer-list">{customers.map((customer) => { const balance = getBalance(customer.id); return <button key={customer.id} className={`customer-row ${selectedCustomer?.id === customer.id ? 'selected' : ''}`} onClick={() => onSelect(customer)}><span><strong>{customer.name}</strong><small>{customer.phone}</small></span><span className={balance > 0 ? 'balance owing' : 'balance clear'}>₦{balance.toLocaleString()}</span></button>; })}</div>;
}
