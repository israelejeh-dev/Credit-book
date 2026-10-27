import { useState } from 'react';

const demoCustomers = [
  { name: 'Mama Ngozi', balance: 120000 },
  { name: 'Femi Stores', balance: 310000 },
  { name: 'Kunle & Sons', balance: 95000, overdue: true }
];

export default function PublicCreditBookDemo() {
  const [showReminderPreview, setShowReminderPreview] = useState(false);

  return (
    <section className="public-demo" aria-labelledby="public-demo-title">
      <div className="public-demo-intro">
        <p className="eyebrow">A LOOK INSIDE THE BOOK</p>
        <h2>See who still has a balance.</h2>
        <p className="muted">Keep a simple record of credit and payments, and send a reminder when you need to.</p>
      </div>
      <div className="public-demo-card">
        <header className="public-demo-header">
          <div className="public-demo-brand">
            <span className="public-demo-icon" aria-hidden="true">▤</span>
            <h3 id="public-demo-title">ShopTab</h3>
          </div>
          <span className="public-demo-overdue">1 overdue</span>
        </header>

        <div className="public-demo-summary">
          <div>
            <span>Still to collect</span>
            <strong>₦525,000</strong>
          </div>
          <div>
            <span>Payments logged</span>
            <strong>₦215,000</strong>
          </div>
        </div>

        <div className="public-demo-customers">
          {demoCustomers.map((customer) => (
            <div className="public-demo-customer" key={customer.name}>
              <div className="public-demo-customer-label">
                <strong>{customer.name}</strong>
                <span>₦{customer.balance.toLocaleString('en-NG')}{customer.overdue ? ' · overdue' : ''}</span>
              </div>
            </div>
          ))}
        </div>

        <button
          className="public-demo-reminder"
          onClick={() => setShowReminderPreview((shown) => !shown)}
          aria-expanded={showReminderPreview}
        >
          {showReminderPreview ? 'Close reminder preview' : 'Send a reminder'}
        </button>
        {showReminderPreview && (
          <p className="public-demo-note" role="status">
            This is a sample preview. Log in to send reminders to your own customers.
          </p>
        )}
      </div>
      <p className="public-demo-disclaimer">Example figures only.</p>
    </section>
  );
}
