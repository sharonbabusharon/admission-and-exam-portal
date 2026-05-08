<script>
  import { openLoginModal, currentUser } from '$lib/stores/auth.js';
  import { goto } from '$app/navigation';
  import Icon from '$lib/components/Icon.svelte';
  import content from '$lib/data/content.json';

  const kd = content.key_dates;

  function handleApply() {
    if ($currentUser) {
      goto('/app/dashboard');
    } else {
      openLoginModal('/app/dashboard');
    }
  }
</script>

<svelte:head>
  <title>Hong Bang International University — Admissions Open 2026</title>
</svelte:head>

<!-- Hero -->
<section class="hero">
  <div class="container hero-inner">
    <div>
      <span class="hero-badge">HBIU ADMISSIONS OPEN 2026</span>
      <h1>Your Future Starts at HBIU.</h1>
      <p class="hero-subtitle">
        Begin your journey at Hong Bang International University — applications are now open for
        undergraduate, postgraduate and doctoral programs across our campus locations.
      </p>
      <div class="hero-actions">
        <button type="button" class="btn btn-primary btn-lg" on:click={handleApply}>
          <span>Apply Now</span>
          <Icon name="arrow-right" size={18} />
        </button>
        <a href="/about" class="btn btn-outline btn-lg">Learn More</a>
      </div>
    </div>

    <div class="hero-card">
      <h3>
        <Icon name="calendar" size={20} />
        <span>Important Dates</span>
      </h3>
      <div class="hero-card-list">
        <div class="hero-card-item">
          <span class="hero-card-item-label">Application Opens</span>
          <span class="hero-card-item-value">{kd.application_open}</span>
        </div>
        <div class="hero-card-item">
          <span class="hero-card-item-label">Application Closes</span>
          <span class="hero-card-item-value">{kd.application_close}</span>
        </div>
        <div class="hero-card-item">
          <span class="hero-card-item-label">Entrance Exam</span>
          <span class="hero-card-item-value">{kd.exam_date}</span>
        </div>
        <div class="hero-card-item">
          <span class="hero-card-item-label">Results Date</span>
          <span class="hero-card-item-value">{kd.results_date}</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Highlights -->
<section class="highlights">
  <div class="container">
    <div class="highlights-grid">
      {#each content.stats as stat}
        <div class="highlight-card">
          <div class="highlight-icon"><Icon name={stat.icon} size={26} /></div>
          <div class="highlight-number">{stat.number}</div>
          <div class="highlight-label">{stat.label}</div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Programs -->
<section class="section" id="programs">
  <div class="container">
    <h2 class="section-title">Programs Offered</h2>
    <p class="section-subtitle">Choose from 42+ specialized programs across multiple disciplines</p>
    <div class="programs-grid">
      {#each content.programs as program}
        <div class="program-card">
          <span class="program-level">{program.level}</span>
          <h3 class="program-name">{program.name}</h3>
          <p class="program-specs">
            <strong>Specializations:</strong>
            {program.specializations}
          </p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Key Dates -->
<section class="section key-dates">
  <div class="container">
    <h2 class="section-title">Key Dates</h2>
    <p class="section-subtitle">Mark your calendar for the 2026 admission cycle</p>
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

<!-- Visit Official Site CTA -->
<section class="section visit-site">
  <div class="container">
    <div class="visit-site-card">
      <div class="visit-site-text">
        <h2>Discover more about HIU</h2>
        <p>
          Explore our programs, faculty, campuses, scholarships and student life on
          the official Hong Bang International University website.
        </p>
      </div>
      <a
        href="https://hiu.vn/en/home/"
        target="_blank"
        rel="noopener noreferrer"
        class="btn btn-primary btn-lg visit-site-btn"
      >
        <span>Visit Our Official Site</span>
        <Icon name="arrow-right" size={18} />
      </a>
    </div>
  </div>
</section>

<style>
  .hero-card h3 {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .visit-site-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 32px;
    padding: 40px 48px;
    background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
    color: #fff;
    border-radius: var(--radius-lg, 16px);
    box-shadow: var(--shadow-lg);
  }

  .visit-site-text h2 {
    margin: 0 0 8px 0;
    color: #fff;
    font-size: 1.6rem;
    font-weight: 700;
  }

  .visit-site-text p {
    margin: 0;
    color: rgba(255, 255, 255, 0.9);
    max-width: 640px;
    line-height: 1.6;
  }

  .visit-site-btn {
    flex-shrink: 0;
    background: #fff;
    color: var(--color-primary);
    border: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .visit-site-btn:hover {
    background: var(--color-bg-alt);
    color: var(--color-primary-dark);
    transform: translateY(-2px);
  }

  @media (max-width: 720px) {
    .visit-site-card {
      flex-direction: column;
      align-items: flex-start;
      padding: 28px 24px;
      gap: 20px;
    }

    .visit-site-btn {
      width: 100%;
      justify-content: center;
    }
  }
</style>
