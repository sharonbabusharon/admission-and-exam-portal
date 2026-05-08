# Hong Bang International University — Admissions Portal

A multi-page admissions portal for **Hong Bang International University (HBIU)**, built with **SvelteKit**. All state lives in `localStorage` / `sessionStorage` (no backend), and JSON files in `src/lib/data/` simulate the database. Includes signup with **dummy email OTP verification**.

> The university brand mark links to <https://hiu.vn/en/home/> (opens in a new tab) anywhere it appears in the navbar or footer.

## Quick Start

```bash
npm install
npm run dev
```

Then open `http://localhost:17606`.

## Authentication

> ### Auth currently disabled (maintenance mode)
>
> Login and Sign Up are temporarily blocked. Clicking either button shows a
> **"Coming Soon"** popup instead of the auth modal.
>
> **To re-enable login and signup:**
>
> 1. Open `src/lib/stores/auth.js`
> 2. Find the line near the top:
>    ```js
>    export const AUTH_DISABLED = true;
>    ```
> 3. Change it to:
>    ```js
>    export const AUTH_DISABLED = false;
>    ```
> 4. Save the file. That's it — the rest of the auth flow (login / signup / OTP /
>    sessions) is untouched and resumes immediately.
>
> _Existing logged-in sessions (in `sessionStorage`) keep working while
> `AUTH_DISABLED = true`; only **new** logins/signups are blocked._

There are **two ways** to enter the app:

### 1. Login (existing users)

Click **Login** in the navbar → enter a registered email → straight into the dashboard.

The seeded users from `src/lib/data/users.json`:

| Email                       | Name           |
| --------------------------- | -------------- |
| `priya.sharma@gmail.com`    | Priya Sharma   |
| `rahul.verma@gmail.com`     | Rahul Verma    |
| `ananya.iyer@gmail.com`     | Ananya Iyer    |

### 2. Sign Up (new users — dummy OTP flow)

1. Click **Sign Up** in the navbar
2. Enter your **name** and **email**
3. The app generates a **dummy 6-digit OTP** and shows it inline in the modal (since there's no real email backend, the OTP is displayed for testing)
4. Enter the OTP and click **Verify & Create Account**
5. The new user is appended to the `users` store (which persists to `localStorage` under `admission_users`, mirroring the JSON schema)
6. Session is set, application record is created, and the user is redirected to the dashboard

> The `users.json` file is the **seed**. Once the app boots, the users store is initialized from `users.json`, then merged with anything previously stored under `localStorage.admission_users`. New signups are appended to the local copy. To "reset" users back to seed only, run `localStorage.removeItem('admission_users')` in the browser console.

## Routes

All routes are file-based (SvelteKit conventions). The `(public)` group folder is just for organizing the public layout — it doesn't affect URLs.

| URL                  | File                                                  | Access     |
| -------------------- | ----------------------------------------------------- | ---------- |
| `/`                  | `src/routes/(public)/+page.svelte`                    | Public     |
| `/about`             | `src/routes/(public)/about/+page.svelte`              | Public     |
| `/steps`             | `src/routes/(public)/steps/+page.svelte`              | Public     |
| `/contact`           | `src/routes/(public)/contact/+page.svelte`            | Public     |
| `/app`               | `src/routes/app/+page.svelte` (redirects to dashboard)| Protected  |
| `/app/dashboard`     | `src/routes/app/dashboard/+page.svelte`               | Protected  |
| `/app/application`   | `src/routes/app/application/+page.svelte`             | Protected  |

### Layouts

| Layout file                                      | Wraps                                              |
| ------------------------------------------------ | -------------------------------------------------- |
| `src/routes/+layout.svelte`                      | All routes (mounts global CSS, login modal, toast) |
| `src/routes/(public)/+layout.svelte`             | Public routes (adds Navbar + Footer)               |
| `src/routes/app/+layout.svelte`                  | Protected routes (auth guard + AppNavbar)          |

### Auth Guard

`src/routes/app/+layout.svelte` checks `currentUser` in `onMount` and calls `goto('/')` if no user is logged in.

## Folder Structure

```
src/
├── app.html                              SvelteKit page template
├── app.css                               Global styles
│
├── lib/
│   ├── data/
│   │   ├── users.json                    Seed users (read-only template)
│   │   ├── applications.json             Application data schema (template)
│   │   └── content.json                  Hardcoded site content + icon names
│   │
│   ├── components/
│   │   ├── BrandLink.svelte              HBIU logo + external link to hiu.vn
│   │   ├── Icon.svelte                   Reusable SVG icon component (~30 icons)
│   │   ├── Navbar.svelte                 Public navbar (Login + Sign Up buttons)
│   │   ├── Footer.svelte                 Public footer
│   │   ├── LoginModal.svelte             Tabbed Login / Sign Up / OTP modal
│   │   ├── AppNavbar.svelte              Protected navbar
│   │   ├── Sidebar.svelte                Application progress tracker
│   │   ├── PaymentModal.svelte           Simulated payment modal
│   │   └── Toast.svelte                  Global toast notification
│   │
│   └── stores/
│       ├── users.js                      Users store (seeded + localStorage)
│       ├── auth.js                       Login + signup + OTP logic
│       ├── applications.js               Applications store + helpers
│       └── toast.js                      Toast store + showToast()
│
└── routes/
    ├── +layout.svelte                    Root layout
    ├── +layout.js                        ssr=false, prerender=false
    │
    ├── (public)/
    │   ├── +layout.svelte                Public layout with Navbar + Footer
    │   ├── +page.svelte                  Home (`/`)
    │   ├── about/+page.svelte            About (`/about`)
    │   ├── steps/+page.svelte            Steps (`/steps`)
    │   └── contact/+page.svelte          Contact (`/contact`)
    │
    └── app/
        ├── +layout.svelte                Protected layout (auth guard + AppNavbar)
        ├── +page.svelte                  Redirects to /app/dashboard
        ├── dashboard/+page.svelte        Dashboard with 5 application states
        └── application/+page.svelte      6-step application form
```

## State Management

Everything goes through Svelte stores:

| Store                             | Backing storage                                    | Purpose                              |
| --------------------------------- | -------------------------------------------------- | ------------------------------------ |
| `users`                           | `localStorage["admission_users"]`                  | Registered users (seeded + signups)  |
| `currentUser`                     | `sessionStorage["admission_logged_in"]`            | Logged-in user `{ email, name }`     |
| `loginModalOpen`                  | in-memory                                          | Login modal open/close                |
| `authMode`                        | in-memory                                          | `'login'` / `'signup'` / `'verify-otp'` |
| `loginError` / `signupError` / `otpError` | in-memory                                  | Inline form errors                    |
| `pendingSignup`                   | in-memory                                          | `{ email, name, otp }` while verifying |
| `applications`                    | `localStorage["admission_applications"]`           | All users' application data          |
| `contactInquiries`                | `localStorage["admission_contact_inquiries"]`      | Contact form messages                |
| `toast`                           | in-memory                                          | Toast notification                   |

Stores auto-persist via `subscribe()` callbacks in their respective files.

## Auth Helpers (`src/lib/stores/auth.js`)

| Function                              | What it does                                           |
| ------------------------------------- | ------------------------------------------------------ |
| `openLoginModal(redirectTo?)`         | Open modal in Login mode                                |
| `openSignupModal(redirectTo?)`        | Open modal in Sign Up mode                              |
| `closeLoginModal()`                   | Close modal & reset all errors / pending state          |
| `switchAuthMode('login' \| 'signup')` | Switch between tabs                                     |
| `tryLogin(email)`                     | Validate email against `users` store, login on match    |
| `startSignup({ name, email })`        | Validate inputs, generate OTP, set pending signup       |
| `resendOtp()`                         | Generate a fresh OTP for the pending signup             |
| `verifySignupOtp(otp)`                | Match OTP, append user to `users` store, log them in    |
| `logout()`                            | Clear session and redirect to `/`                       |

## Icon Component

All emojis throughout the app have been replaced with SVG icons via `src/lib/components/Icon.svelte`. Usage:

```svelte
<script>
  import Icon from '$lib/components/Icon.svelte';
</script>

<Icon name="check" size={16} strokeWidth={2.5} />
```

Available icons: `mail`, `phone`, `map-pin`, `clock`, `calendar`, `book-open`, `pencil-square`, `trophy`, `academic-cap`, `building-library`, `users`, `check`, `check-circle`, `x-mark`, `arrow-right`, `arrow-left`, `lock-closed`, `credit-card`, `target`, `cog`, `clipboard-document`, `camera`, `document-text`, `building-office`, `map`, `envelope-open`, `user-plus`, `shield-check`, `key`, `plus`, `sparkles`. (Heroicons-style outline, 24×24 viewBox.)

## Application Flow

1. Visit `/` → click **Sign Up** (or **Apply Now**) → modal opens
2. Sign Up tab: enter name + email → **Send OTP** → 6-digit OTP appears in the modal
3. Enter OTP → **Verify & Create Account** → user added to `users` store, session set, redirected to `/app/dashboard`
4. (Or, if already registered) click **Login** → enter email → straight to dashboard
5. Dashboard renders one of 5 states based on `application_status`:
   - `not_started` → "Start Your Application"
   - `in_progress` → "Continue Your Application"
   - `submitted` → "Continue with Payment"
   - `payment_done` → "Continue with Entrance Exam"
   - `exam_ready` → "Start Exam Now"
6. The 6-step form auto-saves on every Next click and resumes at the first incomplete step on reload

## Branding

The HBIU brand mark (`static/assets/hong_bang_university.png`) is rendered through `src/lib/components/BrandLink.svelte` in three variants:

| Variant       | Used in           | Behavior                                      |
| ------------- | ----------------- | --------------------------------------------- |
| `navbar`      | Public navbar     | Logo image, height ~40px                      |
| `compact`     | App navbar        | Logo image, height ~36px                      |
| `footer`      | Footer brand col  | Logo on white pill background (footer is dark)|
| `text-only`   | Footer h3 heading | Plain "Hong Bang International University" text |

Every variant wraps an `<a target="_blank" rel="noopener noreferrer" href="https://hiu.vn/en/home/">`, so clicking the logo (or the textual brand title in the footer) opens the official HBIU website in a new tab.

## Resetting Demo Data

Open the browser DevTools console:

```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```
