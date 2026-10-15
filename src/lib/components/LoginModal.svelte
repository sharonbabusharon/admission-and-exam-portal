<script>
  import { onMount } from 'svelte';
  import {
    loginModalOpen,
    authMode,
    loginError,
    signupError,
    otpError,
    pendingSignup,
    closeLoginModal,
    switchAuthMode,
    tryLogin,
    startSignup,
    verifySignupOtp,
    resendOtp
  } from '$lib/stores/auth.js';
  import Icon from './Icon.svelte';
  import { dialog } from '$lib/actions/dialog.js';

  let loginEmail = '';
  let signupName = '';
  let signupEmail = '';
  let otpInput = '';

  function resetFields() {
    loginEmail = '';
    signupName = '';
    signupEmail = '';
    otpInput = '';
  }

  onMount(() => {
    const unsubscribe = loginModalOpen.subscribe((open) => {
      if (!open) resetFields();
    });
    return unsubscribe;
  });

  function handleLogin(e) {
    e.preventDefault();
    tryLogin(loginEmail);
  }

  function handleSignup(e) {
    e.preventDefault();
    startSignup({ name: signupName, email: signupEmail });
  }

  function handleVerify(e) {
    e.preventDefault();
    verifySignupOtp(otpInput);
  }

  function handleResend() {
    resendOtp();
    otpInput = '';
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) closeLoginModal();
  }

  function handleKey(e) {
    if (e.key === 'Escape') closeLoginModal();
  }

  function backToSignup() {
    switchAuthMode('signup');
    otpInput = '';
  }
</script>

<svelte:window on:keydown={handleKey} />

{#if $loginModalOpen}
  <div
    class="modal-overlay active"
    role="dialog"
    aria-modal="true"
    aria-labelledby="auth-title"
    on:click={handleOverlayClick}
  >
    <div class="modal auth-modal" use:dialog={closeLoginModal}>
      <div class="auth-story"><img src="/assets/hiu-campus.jpg" alt="Your future campus at Hong Bang International University"/><div class="auth-story-shade"></div><span class="auth-story-top">HONG BANG<br/>INTERNATIONAL UNIVERSITY</span><div class="auth-story-caption"><span>YOUR NEXT CHAPTER</span><h2>A small step.<br/>A world of<br/><em>possibility.</em></h2><p>One place for your application,<br/>your exam, and what comes next.</p></div></div>
      <div class="auth-content">
      <button type="button" class="modal-close" aria-label="Close" on:click={closeLoginModal}>
        <Icon name="x-mark" size={18} />
      </button>

      {#if $authMode === 'login'}
        <div class="modal-icon"><Icon name="lock-closed" size={28} /></div>
        <h2 class="modal-title" id="auth-title">Welcome back.</h2>
        <p class="modal-subtitle">Enter your registered email to continue your application to Hong Bang International University</p>

        <div class="auth-tabs">
          <button type="button" class="auth-tab active">Login</button>
          <button type="button" class="auth-tab" on:click={() => switchAuthMode('signup')}>Sign Up</button>
        </div>

        {#if $loginError}
          <div class="form-error active">{$loginError}</div>
        {/if}

        <form on:submit={handleLogin} novalidate>
          <div class="form-group">
            <label class="form-label" for="login-email">
              Email Address <span class="required">*</span>
            </label>
            <input
              id="login-email"
              type="email"
              class="form-input"
              placeholder="you@example.com"
              autocomplete="email"
              bind:value={loginEmail}
              required
            />
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg">Login / Continue</button>
        </form>

        <div class="modal-hint">
          <strong>Demo accounts:</strong>
          priya.sharma@gmail.com, rahul.verma@gmail.com, ananya.iyer@gmail.com
        </div>

      {:else if $authMode === 'signup'}
        <div class="modal-icon"><Icon name="user-plus" size={28} /></div>
        <h2 class="modal-title" id="auth-title">Your journey starts here.</h2>
        <p class="modal-subtitle">Create your applicant account. A few details today, a world of possibility tomorrow.</p>

        <div class="auth-tabs">
          <button type="button" class="auth-tab" on:click={() => switchAuthMode('login')}>Login</button>
          <button type="button" class="auth-tab active">Sign Up</button>
        </div>

        {#if $signupError}
          <div class="form-error active">{$signupError}</div>
        {/if}

        <form on:submit={handleSignup} novalidate>
          <div class="form-group">
            <label class="form-label" for="signup-name">
              Full Name <span class="required">*</span>
            </label>
            <input
              id="signup-name"
              type="text"
              class="form-input"
              placeholder="Your full name"
              autocomplete="name"
              bind:value={signupName}
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label" for="signup-email">
              Email Address <span class="required">*</span>
            </label>
            <input
              id="signup-email"
              type="email"
              class="form-input"
              placeholder="you@example.com"
              autocomplete="email"
              bind:value={signupEmail}
              required
            />
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg">Send OTP</button>
        </form>

        <div class="modal-hint">
          By creating an account, you'll receive an OTP to verify your email.
        </div>

      {:else if $authMode === 'verify-otp'}
        <div class="modal-icon" style="background: linear-gradient(135deg,#10b981,#34d399);">
          <Icon name="shield-check" size={28} />
        </div>
        <h2 class="modal-title" id="auth-title">Verify Your Email</h2>
        <p class="modal-subtitle">
          We sent a 6-digit code to
          <strong>{$pendingSignup?.email || 'your email'}</strong>
        </p>

        {#if $pendingSignup}
          <div class="otp-demo-box">
            <div class="otp-demo-label">Demo OTP (for testing)</div>
            <div class="otp-demo-code">{$pendingSignup.otp}</div>
            <div class="otp-demo-hint">In production, this would be sent to your email</div>
          </div>
        {/if}

        {#if $otpError}
          <div class="form-error active">{$otpError}</div>
        {/if}

        <form on:submit={handleVerify} novalidate>
          <div class="form-group">
            <label class="form-label" for="otp-input">
              Enter 6-digit OTP <span class="required">*</span>
            </label>
            <input
              id="otp-input"
              type="text"
              class="form-input otp-input"
              placeholder="123456"
              maxlength="6"
              inputmode="numeric"
              autocomplete="one-time-code"
              bind:value={otpInput}
              required
            />
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg">
            Verify &amp; Create Account
          </button>
        </form>

        <div class="otp-actions">
          <button type="button" class="link-btn" on:click={handleResend}>Resend OTP</button>
          <span class="dot-sep">•</span>
          <button type="button" class="link-btn" on:click={backToSignup}>Change email</button>
        </div>
      {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .auth-tabs {
    display: flex;
    background: var(--color-bg-alt);
    border-radius: var(--radius-sm);
    padding: 4px;
    margin-bottom: 22px;
    gap: 4px;
  }

  .auth-tab {
    flex: 1;
    padding: 10px 14px;
    background: transparent;
    border-radius: var(--radius-sm);
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-text-light);
    cursor: pointer;
    transition: var(--transition);
  }

  .auth-tab:hover { color: var(--color-text); }

  .auth-tab.active {
    background: #fff;
    color: var(--color-primary);
    box-shadow: var(--shadow-sm);
  }

  .otp-demo-box {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(59, 130, 246, 0.08));
    border: 1px dashed var(--color-success);
    border-radius: var(--radius-md);
    padding: 14px;
    text-align: center;
    margin-bottom: 18px;
  }

  .otp-demo-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--color-success);
    font-weight: 700;
    margin-bottom: 6px;
  }

  .otp-demo-code {
    font-family: 'Courier New', monospace;
    font-size: 1.8rem;
    font-weight: 800;
    letter-spacing: 6px;
    color: var(--color-text);
    margin-bottom: 4px;
  }

  .otp-demo-hint {
    font-size: 0.72rem;
    color: var(--color-text-light);
  }

  .otp-input {
    text-align: center;
    font-size: 1.4rem;
    letter-spacing: 8px;
    font-weight: 700;
    font-family: 'Courier New', monospace;
  }

  .otp-actions {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-top: 16px;
    font-size: 0.85rem;
  }

  .link-btn {
    background: none;
    color: var(--color-primary);
    font-weight: 600;
    cursor: pointer;
    padding: 4px;
    transition: var(--transition);
  }

  .link-btn:hover {
    color: var(--color-primary-dark);
    text-decoration: underline;
  }

  .dot-sep {
    color: var(--color-text-light);
  }
</style>
