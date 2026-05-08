import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import seed from '$lib/data/users.json';

const STORAGE_KEY = 'admission_users';

function readStore() {
  const seedUsers = (seed.users || []).map((u) => ({ ...u }));
  if (!browser) return seedUsers;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedUsers;
    const list = JSON.parse(raw);
    const existingEmails = new Set(list.map((u) => u.email.toLowerCase()));
    seedUsers.forEach((s) => {
      if (!existingEmails.has(s.email.toLowerCase())) list.push(s);
    });
    return list;
  } catch {
    return seedUsers;
  }
}

export const users = writable(readStore());

users.subscribe((value) => {
  if (browser) localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
});

export function findUserByEmail(email) {
  if (!email) return null;
  const all = get(users);
  const cleaned = email.trim().toLowerCase();
  return all.find((u) => u.email.toLowerCase() === cleaned) || null;
}

export function userExists(email) {
  return !!findUserByEmail(email);
}

export function addUser({ email, name }) {
  const cleaned = {
    email: (email || '').trim().toLowerCase(),
    name: (name || '').trim(),
    created_at: new Date().toISOString().slice(0, 10)
  };
  if (!cleaned.email || !cleaned.name) return null;
  users.update((list) => {
    if (list.some((u) => u.email.toLowerCase() === cleaned.email)) return list;
    return [...list, cleaned];
  });
  return cleaned;
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim());
}
