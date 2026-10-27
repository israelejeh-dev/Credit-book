import { useState } from 'react';

const demoCustomers = [
  { name: 'Mama Ngozi', balance: 120000, progress: 68 },
  { name: 'Femi Stores', balance: 310000, progress: 30 },
  { name: 'Kunle & Sons', balance: 95000, progress: 90, overdue: true }
];

export default function PublicCreditBookDemo() {
  const [showReminderPreview, setShowReminderPreview] = useState(false);

  return (
    <section className="public-demo" aria-labelledby="public-demo-title">
      <div className="public-demo-intro">
        <p className="eyebrow">YOUR SHOP, IN ONE PLACE</p>
        <h2>Stay on top of every balance.</h2>
        <p className="muted">Keep track of customer credit, payments, and reminders with ShopTab.</p>
      </div>
      <div className="public-demo-card">
        <header className="public-demo-header">
          <div className="public-demo-brand">
            <span className="public-demo-icon" aria-hidden="true">▤</span>
            <h3 id="public-demo-title">ShopTab</h3>
          </div>
          <span className="public-demo-overdue">2 overdue</span>
        </header>

        <div className="public-demo-summary">
          <div>
            <span>They owe you</span>
            <strong>₦640,000</strong>
          </div>
          <div>
            <span>They have paid</span>
            <strong>₦215,000</strong>
          </div>
        </div>

        <div className="public-demo-customers">
          {demoCustomers.map((customer) => (
            <div className="public-demo-customer" key={customer.name}>
              <div className="public-demo-customer-label">
                <strong>{customer.name}</strong>
                <span>₦{customer.balance.toLocaleString('en-NG')}</span>
              </div>
              <div
                className="public-demo-progress"
                role="img"
                aria-label={`${customer.name}: sample balance progress`}
              >
                <span
                  className={customer.overdue ? 'overdue' : ''}
                  style={{ width: `${customer.progress}%` }}
                />
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
      <p className="public-demo-disclaimer">Interactive preview with sample data only. No real customer information is shown.</p>
    </section>
  );
}
