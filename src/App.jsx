import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db, firebaseReady } from './firebaseClient';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import Navbar from './components/Navbar';
import AuthPanel from './components/AuthPanel';
import PublicCreditBookDemo from './components/PublicCreditBookDemo';
import AddCustomer from './components/AddCustomer';
import CustomerList from './components/CustomerList';
import LedgerHistory from './components/LedgerHistory';
import RecordEntryModal from './components/RecordEntryModal';
import './styles.css';
import './auth.css';

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 5 || hour >= 21) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function App() {
  const [activePage, setActivePage] = useState('overview');
  const [greeting, setGreeting] = useState(getTimeGreeting);
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login');
  const [customers, setCustomers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState('');

  useEffect(() => {
    const updateGreeting = () => setGreeting(getTimeGreeting());
    const timerId = window.setInterval(updateGreeting, 60_000);
    return () => window.clearInterval(timerId);
  }, []);

  async function loadData(ownerUid, isCancelled) {
    setLoading(true);
    setDataError('');
    if (!firebaseReady || !db || !ownerUid) {
      setDataError('Firebase is not connected yet. Add your VITE_FIREBASE values to .env.');
      setLoading(false);
      return;
    }
    try {
      const [customerSnapshot, entrySnapshot] = await Promise.all([
        getDocs(query(collection(db, 'customers'), where('ownerUid', '==', ownerUid))),
        getDocs(query(collection(db, 'ledger_entries'), where('ownerUid', '==', ownerUid)))
      ]);
      if (isCancelled()) return;
      const customerRows = customerSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      const entryRows = entrySnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      customerRows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      entryRows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setCustomers(customerRows);
      setEntries(entryRows);
    } catch (error) {
      if (isCancelled()) return;
      setDataError('ShopTab opened, but Firestore could not be reached. Check Firebase and Firestore rules.');
      console.error(error);
    } finally {
      if (!isCancelled()) setLoading(false);
    }
  }

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }
    return onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthLoading(false);
    }, (error) => {
      console.error(error);
      setDataError('Could not verify your account. Please refresh and try again.');
      setAuthLoading(false);
    });
  }, []);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    if (authUser) {
      setCustomers([]);
      setEntries([]);
      setSelectedCustomer(null);
      setDataError('');
      loadData(authUser.uid, () => cancelled);
    } else {
      setCustomers([]);
      setEntries([]);
      setSelectedCustomer(null);
      setDataError('');
      setLoading(false);
    }
    return () => { cancelled = true; };
  }, [authUser, authLoading]);

  const selectedEntries = useMemo(
    () => entries.filter((entry) => entry.customer_id === selectedCustomer?.id),
    [entries, selectedCustomer]
  );

  function getBalance(customerId) {
    return entries.reduce((balance, entry) => {
      if (entry.customer_id !== customerId) return balance;
      return balance + (entry.type === 'credit' ? Number(entry.amount) : -Number(entry.amount));
    }, 0);
  }

  async function addCustomer(form) {
    if (!db || !authUser) { setDataError('Log in before adding customers.'); return; }
    const customerData = { ...form, ownerUid: authUser.uid };
    try {
      const customerRef = await addDoc(collection(db, 'customers'), customerData);
      const customer = { id: customerRef.id, ...customerData };
      setCustomers((current) => [customer, ...current]);
      setSelectedCustomer(customer);
    } catch (error) {
      console.error(error);
      setDataError('Could not add the customer. Check your connection and Firestore security rules.');
    }
  }

  async function addEntry(entry) {
    if (!db || !authUser) { setDataError('Log in before recording ledger entries.'); return; }
    const entryData = { ...entry, ownerUid: authUser.uid };
    try {
      const entryRef = await addDoc(collection(db, 'ledger_entries'), entryData);
      setEntries((current) => [{ id: entryRef.id, ...entryData }, ...current]);
      setShowEntryModal(false);
    } catch (error) {
      console.error(error);
      setDataError('Could not save the ledger entry. Check your connection and Firestore security rules.');
    }
  }

  async function logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
      setDataError('Could not log out. Please try again.');
    }
  }

  function sendReminder(customer = selectedCustomer) {
    if (!customer) return;
    const balance = getBalance(customer.id);
    const message = `Hello ${customer.name}, this is a friendly reminder from ShopTab. Your current balance is ₦${balance.toLocaleString()}. Thank you.`;
    window.open(`https://wa.me/${customer.phone}?text=${encodeURIComponent(message)}`, '_blank');
  }

  function openCustomer(customer) {
    setSelectedCustomer(customer);
    setActivePage('ledger');
  }

  const totalOutstanding = customers.reduce((sum, customer) => sum + getBalance(customer.id), 0);
  const openBalances = customers.filter((customer) => getBalance(customer.id) > 0);

  return (
    <div className="app-shell">
      {authUser && <Navbar activePage={activePage} onNavigate={setActivePage} />}
      <header className={authUser ? 'topbar' : 'topbar topbar-public'}>
        <span className="topbar-title">ShopTab</span>
        {authUser ? (
          <div className="topbar-account">
            <span className="muted">{authUser.email}</span>
            <button className="secondary-button" onClick={logout}>Log out</button>
          </div>
        ) : (
          <div className="topbar-actions">
            <button className={authMode === 'login' ? 'secondary-button active' : 'secondary-button'} onClick={() => setAuthMode('login')}>Log in</button>
            <button className={authMode === 'signup' ? 'primary-button active' : 'primary-button'} onClick={() => setAuthMode('signup')}>Sign up</button>
          </div>
        )}
      </header>
      {authLoading ? (
        <main className="auth-gate"><p className="muted">Checking your account…</p></main>
      ) : !authUser ? (
        <main className="public-home">
          <AuthPanel mode={authMode} authAvailable={firebaseReady} />
          <PublicCreditBookDemo />
        </main>
      ) : (
      <main className="content">
        {dataError && <div className="connection-banner">{dataError}</div>}
        <section className="page-heading">
          <div>
            <p className="eyebrow">{activePage.toUpperCase()}</p>
            <h1>{activePage === 'overview' ? `${greeting}, shopkeeper` : activePage[0].toUpperCase() + activePage.slice(1)}</h1>
            <p className="muted">Keep every customer balance clear and every reminder easy.</p>
          </div>
          <button className="primary-button" onClick={() => setShowEntryModal(true)} disabled={!selectedCustomer}>+ Record entry</button>
        </section>

        {activePage === 'overview' && (
          <Overview customers={customers} entries={entries} totalOutstanding={totalOutstanding} openBalances={openBalances} getBalance={getBalance} loading={loading} onSelect={openCustomer} />
        )}

        {activePage === 'customers' && (
          <section className="panel full-panel">
            <div className="panel-heading"><div><p className="eyebrow">CUSTOMERS</p><h2>Your customer book</h2></div></div>
            <AddCustomer onAdd={addCustomer} />
            <CustomerList customers={customers} getBalance={getBalance} selectedCustomer={selectedCustomer} onSelect={setSelectedCustomer} loading={loading} />
          </section>
        )}

        {activePage === 'ledger' && (
          <section className="ledger-layout">
            <div className="panel customer-panel"><div className="panel-heading"><div><p className="eyebrow">CUSTOMERS</p><h2>Choose a customer</h2></div></div><CustomerList customers={customers} getBalance={getBalance} selectedCustomer={selectedCustomer} onSelect={setSelectedCustomer} loading={loading} /></div>
            <div className="panel detail-panel"><LedgerHistory customer={selectedCustomer} entries={selectedEntries} balance={selectedCustomer ? getBalance(selectedCustomer.id) : 0} onRemind={() => sendReminder()} /></div>
          </section>
        )}

        {activePage === 'reminders' && (
          <Reminders customers={openBalances} getBalance={getBalance} onRemind={sendReminder} onSelect={openCustomer} />
        )}
      </main>
      )}
      {showEntryModal && <RecordEntryModal customer={selectedCustomer} onClose={() => setShowEntryModal(false)} onSave={addEntry} />}
    </div>
  );
}

function Overview({ customers, entries, totalOutstanding, openBalances, getBalance, loading, onSelect }) {
  return <>
    <section className="stat-grid">
      <div className="stat-card"><span>Outstanding</span><strong>₦{totalOutstanding.toLocaleString()}</strong></div>
      <div className="stat-card"><span>Customers</span><strong>{customers.length}</strong></div>
      <div className="stat-card"><span>Open balances</span><strong>{openBalances.length}</strong></div>
      <div className="stat-card"><span>Ledger entries</span><strong>{entries.length}</strong></div>
    </section>
    <section className="overview-grid">
      <div className="panel"><div className="panel-heading"><div><p className="eyebrow">BALANCES</p><h2>Customers who owe</h2></div></div><div className="customer-list">{openBalances.length ? openBalances.slice(0, 6).map((customer) => <button className="customer-row" key={customer.id} onClick={() => onSelect(customer)}><span><strong>{customer.name}</strong><small>{customer.phone}</small></span><span className="balance owing">₦{getBalance(customer.id).toLocaleString()}</span></button>) : <p className="muted empty-state">No open balances yet.</p>}</div></div>
      <div className="panel activity-panel"><div className="panel-heading"><div><p className="eyebrow">RECENT ACTIVITY</p><h2>Latest entries</h2></div></div><div className="ledger-list">{loading ? <p className="muted empty-state">Loading activity…</p> : entries.slice(0, 6).map((entry) => <div className="ledger-row" key={entry.id}><span><strong>{entry.type === 'credit' ? 'Credit recorded' : 'Payment received'}</strong><small>{entry.note || 'No note'} · {new Date(entry.created_at).toLocaleDateString()}</small></span><strong className={entry.type === 'credit' ? 'credit' : 'payment'}>{entry.type === 'credit' ? '+' : '-'}₦{Number(entry.amount).toLocaleString()}</strong></div>)}</div></div>
    </section>
  </>;
}

function Reminders({ customers, getBalance, onRemind, onSelect }) {
  return <section className="panel full-panel"><div className="panel-heading"><div><p className="eyebrow">WHATSAPP</p><h2>Customers to remind</h2><p className="muted">Send a polite balance reminder without leaving ShopTab.</p></div><span className="amber-pill">{customers.length} open</span></div><div className="reminder-list">{customers.length ? customers.map((customer) => <div className="reminder-row" key={customer.id}><button className="reminder-customer" onClick={() => onSelect(customer)}><strong>{customer.name}</strong><small>{customer.phone}</small></button><strong className="balance owing">₦{getBalance(customer.id).toLocaleString()}</strong><button className="whatsapp-button" onClick={() => onRemind(customer)}>Send reminder</button></div>) : <p className="muted empty-state">No reminders needed right now.</p>}</div></section>;
}

export default App;
