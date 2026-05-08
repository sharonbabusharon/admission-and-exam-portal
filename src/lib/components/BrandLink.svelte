<script>
  /** @type {'navbar' | 'compact' | 'footer' | 'text-only'} */
  export let variant = 'navbar';

  const HBIU_URL = 'https://hiu.vn/en/home/';
</script>

<a
  href={HBIU_URL}
  target="_blank"
  rel="noopener noreferrer"
  class="brand-link brand-{variant}"
  aria-label="Hong Bang International University — visit hiu.vn"
>
  {#if variant === 'text-only'}
    <span class="brand-text">Hong Bang International University</span>
  {:else}
    <img
      src="/assets/hong_bang_university.png"
      alt="Hong Bang International University"
      class="brand-img"
    />
  {/if}
</a>

<style>
  .brand-link {
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    transition: opacity 0.2s ease;
  }

  .brand-link:hover {
    opacity: 0.85;
  }

  .brand-img {
    display: block;
    object-fit: contain;
  }

  /* Public navbar */
  .brand-navbar .brand-img {
    height: 40px;
    width: auto;
    max-width: 220px;
  }

  /* App navbar (slightly more compact) */
  .brand-compact .brand-img {
    height: 36px;
    width: auto;
    max-width: 200px;
  }

  /* Footer (larger, light background needed but we use original colors) */
  .brand-footer .brand-img {
    height: 56px;
    width: auto;
    max-width: 280px;
    background: #fff;
    padding: 8px 14px;
    border-radius: 10px;
  }

  /* Text-only (footer heading) */
  .brand-text-only {
    color: inherit;
    font-weight: 700;
  }

  .brand-text {
    font-size: 1.25rem;
    color: #fff;
  }

  .brand-text-only:hover .brand-text {
    color: var(--color-accent);
  }

  @media (max-width: 600px) {
    .brand-navbar .brand-img {
      height: 34px;
      max-width: 180px;
    }
    .brand-compact .brand-img {
      height: 32px;
      max-width: 170px;
    }
    .brand-footer .brand-img {
      height: 48px;
      max-width: 240px;
    }
  }
</style>
