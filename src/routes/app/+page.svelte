<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  onMount(() => goto('/app/dashboard'));
</script>

<p style="padding:32px;">Redirecting to dashboard…</p>
