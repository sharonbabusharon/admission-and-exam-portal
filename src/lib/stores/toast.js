import { writable } from 'svelte/store';

export const toast = writable({ show: false, message: '', type: '' });

let timer = null;

export function showToast(message, type = '') {
  if (timer) clearTimeout(timer);
  toast.set({ show: true, message, type });
  timer = setTimeout(() => toast.set({ show: false, message: '', type: '' }), 3000);
}
