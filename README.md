# ShopTab starter

A small React + CSS starter for customer credit tracking, payments, balances, ledger history, and WhatsApp reminders.

## Run it

1. Create a Firebase project and register a web app.
2. Enable Cloud Firestore.
3. Add these values to a `.env` file:

```bash
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

4. Run `npm install` then `npm run dev`.

The app uses two Firestore collections:

- `customers`: `name`, `phone`, `created_at`
- `ledger_entries`: `customer_id`, `type` (`credit` or `payment`), `amount`, `note`, `created_at`

The Firebase client is kept in `src/firebaseClient.js`. The React components use simple Firestore reads and writes with `async/await`.
