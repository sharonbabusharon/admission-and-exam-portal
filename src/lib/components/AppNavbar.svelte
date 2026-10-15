<script>
  import { currentUser, logout } from '$lib/stores/auth.js';
  import BrandLink from './BrandLink.svelte';

  function getInitial(user) {
    return (user?.name || 'A').charAt(0).toUpperCase();
  }
</script>

<nav class="app-navbar">
  <div class="nav-brand"><BrandLink variant="compact" /><span class="brand-divider"></span><a class="portal-label" href="/app/dashboard">APPLICANT PORTAL <span>2026</span></a></div>

  <div class="app-navbar-user">
    <div class="user-avatar">{getInitial($currentUser)}</div>
    <div>
      <div class="user-name">{$currentUser?.name || 'Applicant'}</div>
      <span class="user-email">{$currentUser?.email || ''}</span>
    </div>
    <button type="button" class="btn-logout" on:click={logout}>Logout</button>
  </div>
</nav>

<style>
  @media (max-width: 700px) {
    nav.app-navbar { padding: 12px 16px; gap: 12px; }
    .app-navbar-user { min-width: 0; gap: 9px; }
    .app-navbar-user > div:not(.user-avatar) { min-width: 0; }
    .user-name { max-width: 110px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-email { display: none; }
    .user-avatar { display: none; }
    .btn-logout { padding: 7px 10px; font-size: 11px; }
  }
</style>
