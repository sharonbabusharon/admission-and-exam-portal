import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { findUserByEmail, addUser, userExists, isValidEmail } from './users.js';
import { ensureApplicationFor } from './applications.js';

const SESSION_KEY = 'admission_logged_in';
const REDIRECT_KEY = 'admission_redirect_after_login';

/* ------------------------------------------------------------------
 * Temporary maintenance flag.
 *
 *   AUTH_DISABLED = true   -> Login / Sign Up buttons show the
 *                             "Coming Soon" popup instead of the
 *                             auth modal. Existing sessions keep
 *                             working until the user logs out.
 *
 *   AUTH_DISABLED = false  -> Normal behaviour: login & signup work
 *                             as usual.
 *
 * To re-enable login & signup, simply change the value below to
 * `false` and save the file.
 * ------------------------------------------------------------------ */
export const AUTH_DISABLED = true;

function readSession() {
  if (!browser) return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSession(user) {
  if (!browser) return;
  if (user) sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else sessionStorage.removeItem(SESSION_KEY);
}

export const currentUser = writable(readSession());
currentUser.subscribe((u) => writeSession(u));

/* ---------- Modal UI state ---------- */
export const loginModalOpen = writable(false);
export const authMode = writable('login');
export const loginError = writable('');
export const signupError = writable('');
export const otpError = writable('');

export const pendingSignup = writable(null);

/* ---------- Coming Soon popup (used while AUTH_DISABLED is true) ---------- */
export const comingSoonOpen = writable(false);

export function openComingSoon() {
  comingSoonOpen.set(true);
}

export function closeComingSoon() {
  comingSoonOpen.set(false);
}

export function openLoginModal(redirectTo = null) {
  if (AUTH_DISABLED) {
    openComingSoon();
    return;
  }
  if (browser && redirectTo) sessionStorage.setItem(REDIRECT_KEY, redirectTo);
  authMode.set('login');
  loginError.set('');
  signupError.set('');
  otpError.set('');
  pendingSignup.set(null);
  loginModalOpen.set(true);
}

export function openSignupModal(redirectTo = null) {
  if (AUTH_DISABLED) {
    openComingSoon();
    return;
  }
  if (browser && redirectTo) sessionStorage.setItem(REDIRECT_KEY, redirectTo);
  authMode.set('signup');
  loginError.set('');
  signupError.set('');
  otpError.set('');
  pendingSignup.set(null);
  loginModalOpen.set(true);
}

export function closeLoginModal() {
  loginModalOpen.set(false);
  loginError.set('');
  signupError.set('');
  otpError.set('');
  pendingSignup.set(null);
  authMode.set('login');
}

export function switchAuthMode(mode) {
  authMode.set(mode);
  loginError.set('');
  signupError.set('');
  otpError.set('');
  if (mode !== 'verify-otp') pendingSignup.set(null);
}

/* ---------- Login ---------- */
export function tryLogin(email) {
  const cleaned = (email || '').trim().toLowerCase();
  if (!cleaned) {
    loginError.set('Please enter your email address.');
    return false;
  }
  if (!isValidEmail(cleaned)) {
    loginError.set('Please enter a valid email address.');
    return false;
  }
  const found = findUserByEmail(cleaned);
  if (!found) {
    loginError.set('Email not found. Please sign up first.');
    return false;
  }
  finishAuth(found);
  return true;
}

/* ---------- Signup (dummy email OTP) ---------- */
function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function startSignup({ name, email }) {
  const cleanedName = (name || '').trim();
  const cleanedEmail = (email || '').trim().toLowerCase();

  if (!cleanedName) {
    signupError.set('Please enter your name.');
    return false;
  }
  if (!isValidEmail(cleanedEmail)) {
    signupError.set('Please enter a valid email address.');
    return false;
  }
  if (userExists(cleanedEmail)) {
    signupError.set('This email is already registered. Please log in instead.');
    return false;
  }

  const otp = generateOtp();
  pendingSignup.set({
    name: cleanedName,
    email: cleanedEmail,
    otp,
    sent_at: new Date().toISOString()
  });
  signupError.set('');
  otpError.set('');
  authMode.set('verify-otp');
  return true;
}

export function resendOtp() {
  const pending = get(pendingSignup);
  if (!pending) return false;
  const otp = generateOtp();
  pendingSignup.set({ ...pending, otp, sent_at: new Date().toISOString() });
  otpError.set('');
  return true;
}

export function verifySignupOtp(input) {
  const pending = get(pendingSignup);
  if (!pending) {
    otpError.set('Signup session expired. Please start again.');
    return false;
  }
  const cleaned = (input || '').trim();
  if (!/^\d{6}$/.test(cleaned)) {
    otpError.set('Enter the 6-digit OTP sent to your email.');
    return false;
  }
  if (cleaned !== pending.otp) {
    otpError.set('Invalid OTP. Please check and try again.');
    return false;
  }

  const newUser = addUser({ email: pending.email, name: pending.name });
  if (!newUser) {
    otpError.set('Could not create account. Please try again.');
    return false;
  }
  pendingSignup.set(null);
  finishAuth(newUser);
  return true;
}

/* ---------- Common post-auth ---------- */
function finishAuth(user) {
  currentUser.set(user);
  ensureApplicationFor(user);

  let target = '/app/dashboard';
  if (browser) {
    const redirect = sessionStorage.getItem(REDIRECT_KEY);
    if (redirect) {
      sessionStorage.removeItem(REDIRECT_KEY);
      target = redirect;
    }
  }
  closeLoginModal();
  goto(target);
}

export function logout() {
  currentUser.set(null);
  if (browser) {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(REDIRECT_KEY);
  }
  goto('/');
}

export function isLoggedIn() {
  return !!get(currentUser);
}

export function getCurrentUser() {
  return get(currentUser);
}
