<script>
  import '../app.css';
  import '../design.css';
  import '../editorial.css';
  import LoginModal from '$lib/components/LoginModal.svelte';
  import ComingSoonModal from '$lib/components/ComingSoonModal.svelte';
  import Toast from '$lib/components/Toast.svelte';
</script>

<slot />
<LoginModal />
<ComingSoonModal />
<Toast />
