<script>
  import { currentUser, logout } from '$lib/stores/auth.js';
  import BrandLink from './BrandLink.svelte';

  function getInitial(user) {
    return (user?.name || 'A').charAt(0).toUpperCase();
  }
</script>

<nav class="app-navbar">
  <BrandLink variant="compact" />

  <div class="app-navbar-user">
    <div class="user-avatar">{getInitial($currentUser)}</div>
    <div>
      <div class="user-name">{$currentUser?.name || 'Applicant'}</div>
      <span class="user-email">{$currentUser?.email || ''}</span>
    </div>
    <button type="button" class="btn-logout" on:click={logout}>Logout</button>
  </div>
</nav>
