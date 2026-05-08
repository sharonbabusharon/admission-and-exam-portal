<script>
  import { openLoginModal } from '$lib/stores/auth.js';
  import Icon from '$lib/components/Icon.svelte';
  import content from '$lib/data/content.json';

  const kd = content.key_dates;
</script>

<svelte:head>
  <title>Steps to Apply — Hong Bang International University</title>
</svelte:head>

<header class="page-header">
  <div class="container">
    <h1>Steps to Apply</h1>
    <p>A simple 6-step process to complete your application</p>
  </div>
</header>

<section class="section">
  <div class="container">
    <div class="timeline">
      {#each content.apply_steps as step, idx}
        <div class="timeline-item">
          <div class="timeline-marker">{idx + 1}</div>
          <div class="timeline-card">
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<section class="section key-dates">
  <div class="container">
    <h2 class="section-title">Key Dates</h2>
    <p class="section-subtitle">Don't miss these important deadlines</p>
    <div class="key-dates-grid">
      {#each content.key_date_cards as card}
        <div class="key-date-card">
          <div class="key-date-icon"><Icon name={card.icon} size={24} /></div>
          <div class="key-date-label">{card.label}</div>
          <div class="key-date-value">{kd[card.value_key]}</div>
        </div>
      {/each}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <h2 class="section-title">Eligibility Criteria</h2>
    <p class="section-subtitle">Minimum requirements per program level</p>
    <div class="eligibility-grid">
      {#each content.eligibility as item}
        <div class="eligibility-card">
          <h3>{item.level}</h3>
          <p>{item.text}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<div class="container">
  <section class="cta-section">
    <h2>Ready to Apply?</h2>
    <p>Start your application today — it only takes a few minutes to begin.</p>
    <button type="button" class="btn btn-lg" on:click={() => openLoginModal('/app/dashboard')}>
      <span>Begin Application</span>
      <Icon name="arrow-right" size={18} />
    </button>
  </section>
</div>
