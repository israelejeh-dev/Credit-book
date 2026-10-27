import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseClient';

function getAuthErrorMessage(error, mode) {
  if (error.code === 'auth/user-not-found') {
    return 'No account was found for that email. Please sign up first.';
  }
  if (
    error.code === 'auth/invalid-credential'
    || error.code === 'auth/invalid-login-credentials'
    || error.code === 'auth/wrong-password'
  ) {
    return 'The email or password is incorrect. If you don’t have an account, choose Sign up.';
  }
  if (error.code === 'auth/email-already-in-use') {
    return 'An account already exists for that email. Please log in instead.';
  }
  if (error.code === 'auth/weak-password') {
    return 'Choose a password with at least 6 characters.';
  }
  if (error.code === 'auth/invalid-email') {
    return 'Enter a valid email address.';
  }
  return mode === 'login'
    ? 'Could not log in. Please check your connection and try again.'
    : 'Could not create your account. Please check your connection and try again.';
}

export default function AuthPanel({ mode, authAvailable }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setErrorMessage('');
    if (!auth) {
      setErrorMessage('Account access is not configured yet. Please contact the site administrator.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(getAuthErrorMessage(error, mode));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-gate">
      <form className="panel auth-panel" onSubmit={submit}>
        <p className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : 'NEW ACCOUNT'}</p>
        <h1>{mode === 'login' ? 'Log in to ShopTab' : 'Create your ShopTab account'}</h1>
        <p className="muted">
          {mode === 'login'
            ? 'Log in to access your customer book and dashboard.'
            : 'Sign up with your email address to get started.'}
        </p>
        {!authAvailable && (
          <div className="connection-banner" role="status">
            Account access is not configured yet. Please contact the site administrator.
          </div>
        )}
        {errorMessage && <div className="connection-banner auth-error" role="alert">{errorMessage}</div>}
        <label>
          Email
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            minLength="6"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button className="primary-button auth-submit" type="submit" disabled={submitting || !authAvailable}>
          {submitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
        </button>
      </form>
    </section>
  );
}
