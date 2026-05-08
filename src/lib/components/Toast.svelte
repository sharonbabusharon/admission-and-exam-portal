<script>
  import { toast } from '$lib/stores/toast.js';
</script>

<div class="toast {$toast.show ? 'show' : ''} {$toast.type || ''}">
  {$toast.message}
</div>
