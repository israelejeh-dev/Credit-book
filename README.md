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

- `customers`: `name`, `phone`, `created_at`, `ownerUid`
- `ledger_entries`: `customer_id`, `type` (`credit` or `payment`), `amount`, `note`, `created_at`, `ownerUid`

The Firebase client is kept in `src/firebaseClient.js`. The React components use simple Firestore reads and writes with `async/await`.

## Secure Firestore access

The app filters records by the signed-in user's Firebase Authentication UID. This client-side filter is not a security boundary on its own: deploy the included `firestore.rules` to Firebase before using real customer data. The rules require authentication, enforce immutable ownership, and allow ledger entries only for customers owned by the same account.

Deploy the rules with the Firebase CLI from this directory:

```bash
firebase login
firebase deploy --only firestore:rules --project YOUR_FIREBASE_PROJECT_ID
```

Replace `YOUR_FIREBASE_PROJECT_ID` with the `VITE_FIREBASE_PROJECT_ID` value from your private `.env` file. Alternatively, publish the contents of `firestore.rules` in Firebase Console under **Firestore Database → Rules**.

Existing documents in `customers` and `ledger_entries` without an `ownerUid` are intentionally not visible under these rules. They are left unchanged and locked until ownership is assigned through a trusted migration. Do not assign ownership from an unauthenticated or user-controlled client.
