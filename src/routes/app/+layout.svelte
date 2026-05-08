<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import AppNavbar from '$lib/components/AppNavbar.svelte';
  import { currentUser } from '$lib/stores/auth.js';

  let ready = false;

  onMount(() => {
    if (!browser) return;
    if (!$currentUser) {
      goto('/');
      return;
    }
    ready = true;
  });
</script>

{#if ready}
  <div class="app-body">
    <AppNavbar />
    <slot />
  </div>
{:else}
  <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;color:#6b7280;">
    Loading…
  </div>
{/if}
