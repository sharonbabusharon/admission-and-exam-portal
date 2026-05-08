<script>
  import { onMount } from 'svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import PaymentModal from '$lib/components/PaymentModal.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { currentUser } from '$lib/stores/auth.js';
  import {
    applications,
    ensureApplicationFor,
    saveApplicationFor,
    generateReferenceNumber
  } from '$lib/stores/applications.js';
  import { showToast } from '$lib/stores/toast.js';

  let paymentOpen = false;

  onMount(() => {
    if ($currentUser) ensureApplicationFor($currentUser);
  });

  function getApp(user, allApps) {
    return user ? allApps[user.email] || null : null;
  }

  function getStatus(app) {
    return app?.application_status || 'not_started';
  }

  function confirmPayment() {
    const user = $currentUser;
    if (!user) return;
    const app = getApp(user, $applications);
    if (!app) return;
    app.payment_status = 'paid';
    app.application_status = 'payment_done';
    app.exam_status = 'scheduled';
    saveApplicationFor(user.email, app);
    showToast('Payment successful! Your exam has been scheduled.', 'success');
  }

  function continueExam() {
    const user = $currentUser;
    if (!user) return;
    const app = getApp(user, $applications);
    if (!app) return;
    app.application_status = 'exam_ready';
    saveApplicationFor(user.email, app);
    showToast('Exam module is being prepared.', 'success');
  }

  function startExam() {
    showToast('Exam module is under development.', 'success');
  }
</script>

<svelte:head>
  <title>Dashboard — Hong Bang International University</title>
</svelte:head>

<div class="app-shell">
  {#if $currentUser}
    {@const app = getApp($currentUser, $applications)}
    {@const status = getStatus(app)}
    {@const refNumber = generateReferenceNumber($currentUser.email)}

    <Sidebar {status} />

    <main class="app-main">
      <div class="welcome-header">
        <h1>Dashboard</h1>
        <p>Track your application progress and complete the next step</p>
      </div>

      <div class="dashboard-card">
        {#if status === 'not_started'}
          <div class="dashboard-card-icon icon-start">
            <Icon name="clipboard-document" size={36} />
          </div>
          <h2>Welcome, {$currentUser.name}.</h2>
          <p>Enter your details and submit your application to begin your journey with us.</p>
          <a href="/app/application" class="btn btn-primary btn-lg">
            <span>Start Your Application</span>
            <Icon name="arrow-right" size={18} />
          </a>

        {:else if status === 'in_progress'}
          <div class="dashboard-card-icon icon-progress">
            <Icon name="cog" size={36} />
          </div>
          <h2>Your Application is in Progress</h2>
          <p>Submit your application changes to continue your application.</p>
          <a href="/app/application" class="btn btn-primary btn-lg">
            <span>Continue Your Application</span>
            <Icon name="arrow-right" size={18} />
          </a>

        {:else if status === 'submitted'}
          <div class="dashboard-card-icon icon-submitted">
            <Icon name="check-circle" size={40} />
          </div>
          <h2>Application Submitted Successfully</h2>
          <p>Your application has been submitted successfully. Complete your payment to proceed.</p>
          <div class="info-block">
            <strong>Application Reference</strong>
            <span class="value">{refNumber}</span>
          </div>
          <br />
          <button type="button" class="btn btn-accent btn-lg" on:click={() => (paymentOpen = true)}>
            <span>Continue with Payment</span>
            <Icon name="arrow-right" size={18} />
          </button>

        {:else if status === 'payment_done'}
          <div class="dashboard-card-icon icon-payment">
            <Icon name="credit-card" size={36} />
          </div>
          <h2>Payment Confirmed</h2>
          <p>Payment confirmed. Your entrance exam has been scheduled.</p>
          <div class="exam-info-grid">
            <div class="exam-info-cell">
              <strong>Exam Date</strong>
              <span>15 July 2026</span>
            </div>
            <div class="exam-info-cell">
              <strong>Reporting Time</strong>
              <span>9:00 AM</span>
            </div>
            <div class="exam-info-cell">
              <strong>Duration</strong>
              <span>2 Hours</span>
            </div>
          </div>
          <button type="button" class="btn btn-primary btn-lg" on:click={continueExam}>
            <span>Continue with Entrance Exam</span>
            <Icon name="arrow-right" size={18} />
          </button>

        {:else if status === 'exam_ready'}
          <div class="dashboard-card-icon icon-exam">
            <Icon name="target" size={36} />
          </div>
          <h2>Your Exam is Ready</h2>
          <p>Your exam is ready to begin. Click below to start.</p>
          <div class="info-block">
            <strong>Reference Number</strong>
            <span class="value">{refNumber}</span>
          </div>
          <br />
          <button type="button" class="btn btn-accent btn-lg" on:click={startExam}>
            <span>Start Exam Now</span>
            <Icon name="arrow-right" size={18} />
          </button>
        {/if}
      </div>
    </main>
  {/if}
</div>

<PaymentModal bind:open={paymentOpen} on:confirm={confirmPayment} />
