import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'admission_applications';

function readStore() {
  if (!browser) return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStore(value) {
  if (!browser) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export const applications = writable(readStore());
applications.subscribe((v) => writeStore(v));

export function blankApplication(user) {
  return {
    user_email: user.email,
    user_name: user.name,
    application_status: 'not_started',
    payment_status: 'pending',
    exam_status: 'not_assigned',
    last_updated: new Date().toISOString(),
    step_completion: {
      step1_register: false,
      step2_personal: false,
      step3_education: false,
      step4_guardian: false,
      step5_documents: false,
      step6_submitted: false
    },
    form_data: {
      program_level: '',
      specialization: '',
      nationality: '',
      level_of_program: '',
      title: '',
      full_name: user.name || '',
      dob: '',
      gender: '',
      blood_group: '',
      religion: '',
      category: '',
      differently_abled: '',
      aadhar: '',
      whatsapp: '',
      address_line1: '',
      district: '',
      state: '',
      pin_code: '',
      education_records: [],
      guardian: {
        father_name: '', father_phone: '', father_email: '',
        father_occupation: '', father_income: '',
        mother_name: '', mother_phone: '', mother_email: '',
        mother_occupation: '',
        guardian_name: '', guardian_relation: '', guardian_phone: ''
      },
      documents: {
        photograph: null,
        sslc_marksheet: null,
        hsc_marksheet: null,
        aadhar_id: null,
        transfer_certificate: null,
        caste_certificate: null
      }
    }
  };
}

export function ensureApplicationFor(user) {
  if (!user || !user.email) return null;
  const all = get(applications);
  if (!all[user.email]) {
    all[user.email] = blankApplication(user);
    applications.set({ ...all });
  }
  return all[user.email];
}

export function getApplicationFor(email) {
  if (!email) return null;
  const all = get(applications);
  return all[email] || null;
}

export function saveApplicationFor(email, application) {
  if (!email || !application) return;
  application.last_updated = new Date().toISOString();
  applications.update((all) => ({ ...all, [email]: application }));
}

export function generateReferenceNumber(email) {
  if (!email) return 'ADM-2026-000000';
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = ((hash << 5) - hash) + email.charCodeAt(i);
    hash |= 0;
  }
  const num = Math.abs(hash) % 1000000;
  return `ADM-2026-${num.toString().padStart(6, '0')}`;
}

export const contactInquiries = writable(
  browser
    ? JSON.parse(localStorage.getItem('admission_contact_inquiries') || '[]')
    : []
);
contactInquiries.subscribe((v) => {
  if (browser) localStorage.setItem('admission_contact_inquiries', JSON.stringify(v));
});

export function addContactInquiry(inquiry) {
  contactInquiries.update((list) => [...list, { ...inquiry, submitted_at: new Date().toISOString() }]);
}
