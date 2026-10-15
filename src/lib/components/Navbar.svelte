<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { currentUser, openLoginModal, openSignupModal } from '$lib/stores/auth.js';
  import BrandLink from './BrandLink.svelte';

  let menuOpen = false;

  function handleLoginClick(e) {
    e.preventDefault();
    menuOpen = false;
    if ($currentUser) {
      goto('/app/dashboard');
    } else {
      openLoginModal();
    }
  }

  function handleSignupClick(e) {
    e.preventDefault();
    menuOpen = false;
    openSignupModal();
  }

  function navLinkClass(currentPath, target) {
    return currentPath === target ? 'navbar-link active' : 'navbar-link';
  }
</script>

<nav class="navbar">
  <div class="navbar-inner">
    <div class="nav-brand"><BrandLink variant="navbar" /><span class="brand-divider"></span><a class="portal-label" href="/">ADMISSIONS <span>2026</span></a></div>

    <button
      type="button"
      class="hamburger"
      aria-label="Toggle menu"
      aria-expanded={menuOpen}
      on:click={() => (menuOpen = !menuOpen)}
    >
      <span></span><span></span><span></span>
    </button>

    <div class="navbar-links" class:active={menuOpen}>
      <a href="/" class={navLinkClass($page.url.pathname, '/')} on:click={() => (menuOpen = false)}>Overview</a>
      <a href="/about" class={navLinkClass($page.url.pathname, '/about')} on:click={() => (menuOpen = false)}>About</a>
      <a href="/steps" class={navLinkClass($page.url.pathname, '/steps')} on:click={() => (menuOpen = false)}>How to apply</a>
      <a href="/contact" class={navLinkClass($page.url.pathname, '/contact')} on:click={() => (menuOpen = false)}>Contact</a>


      {#if $currentUser}
        <button type="button" class="btn btn-primary navbar-cta" on:click={handleLoginClick}>
          Dashboard
        </button>
      {:else}
        <button type="button" class="btn btn-outline navbar-cta-secondary" on:click={handleLoginClick}>
          Login
        </button>
        <button type="button" class="btn btn-primary navbar-cta" on:click={handleSignupClick}>
          Sign Up
        </button>
      {/if}
    </div>
  </div>
</nav>

<style>
  .navbar-cta-secondary {
    margin-left: 12px;
    padding: 10px 18px;
    font-size: 0.9rem;
  }

  @media (max-width: 768px) {
    .navbar-cta-secondary {
      width: 100%;
      margin: 0;
    }
  }
</style>
