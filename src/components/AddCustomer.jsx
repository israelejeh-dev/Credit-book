import { useState } from 'react';

export default function AddCustomer({ onAdd }) {
  const [form, setForm] = useState({ name: '', phone: '' });
  function submit(event) { event.preventDefault(); if (!form.name || !form.phone) return; onAdd({ ...form, created_at: new Date().toISOString() }); setForm({ name: '', phone: '' }); }
  return <form className="add-customer" onSubmit={submit}><input placeholder="Customer name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /><input placeholder="Phone e.g. 2348012345678" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /><button className="secondary-button">Add customer</button></form>;
}
