<script>
  import { comingSoonOpen, closeComingSoon } from '$lib/stores/auth.js';
  import content from '$lib/data/content.json';
  import Icon from './Icon.svelte';

  const inst = content.institution;

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) closeComingSoon();
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') closeComingSoon();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if $comingSoonOpen}
  <div
    class="modal-overlay active"
    role="dialog"
    aria-modal="true"
    aria-labelledby="coming-soon-title"
    on:click={handleOverlayClick}
  >
    <div class="modal coming-soon-modal">
      <button
        type="button"
        class="modal-close"
        aria-label="Close"
        on:click={closeComingSoon}
      >
        <Icon name="x-mark" size={18} />
      </button>

      <div class="modal-icon coming-soon-icon">
        <Icon name="sparkles" size={28} />
      </div>

      <h2 id="coming-soon-title" class="modal-title">Coming Soon</h2>

      <p class="modal-subtitle">
        Online applications for <strong>{inst.name}</strong> are not open yet.
        We're putting the final touches on the admissions portal — please check
        back shortly.
      </p>

      <button
        type="button"
        class="btn btn-primary btn-block btn-lg"
        on:click={closeComingSoon}
      >
        Got it
      </button>

      <div class="modal-hint">
        For urgent enquiries, please visit our
        <a href="/contact" on:click={closeComingSoon}>Contact page</a>.
      </div>
    </div>
  </div>
{/if}

<style>
  .coming-soon-icon {
    background: linear-gradient(135deg, #f59e0b, #fbbf24);
    color: #fff;
  }

  .coming-soon-modal :global(strong) {
    color: var(--color-text);
    font-weight: 600;
  }
</style>
