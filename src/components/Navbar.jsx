const pages = ['customers', 'overview', 'ledger', 'reminders'];

export default function Navbar({ activePage, onNavigate }) {
  return <aside className="sidebar"><div className="sidebar-brand"><div className="brand-mark">S</div><div className="brand-name">ShopTab</div></div><p className="sidebar-label">SHOP RECORDS</p><nav className="sidebar-nav">{pages.map((page) => <button key={page} className={activePage === page ? 'active' : ''} onClick={() => onNavigate(page)}>{page[0].toUpperCase() + page.slice(1)}</button>)}</nav><div className="sidebar-footer">Your customer book, all in one place.</div></aside>;
}
