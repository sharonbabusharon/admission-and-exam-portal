<script>
  import { createEventDispatcher } from 'svelte';
  import Icon from './Icon.svelte';

  export let open = false;

  const dispatch = createEventDispatcher();

  function close() {
    open = false;
    dispatch('close');
  }

  function confirm() {
    dispatch('confirm');
    close();
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) close();
  }
</script>

{#if open}
  <div class="modal-overlay active" role="dialog" aria-modal="true" on:click={handleOverlayClick}>
    <div class="modal" style="max-width: 520px;">
      <button type="button" class="modal-close" aria-label="Close" on:click={close}>
        <Icon name="x-mark" size={18} />
      </button>
      <div class="modal-icon" style="background: linear-gradient(135deg, #8b5cf6, #a78bfa);">
        <Icon name="credit-card" size={28} />
      </div>
      <h2 class="modal-title">Application Fee Payment</h2>
      <p class="modal-subtitle">Pay your application fee securely to proceed.</p>

      <div class="payment-summary">
        <div class="payment-row"><span>Application Fee</span><span>₹ 1,000.00</span></div>
        <div class="payment-row"><span>Processing Fee</span><span>₹ 50.00</span></div>
        <div class="payment-row"><span>GST (18%)</span><span>₹ 189.00</span></div>
        <div class="payment-row"><span>Total Amount</span><span>₹ 1,239.00</span></div>
      </div>

      <button type="button" class="btn btn-primary btn-block btn-lg" on:click={confirm}>
        Pay ₹ 1,239.00 (Simulated)
      </button>
      <p class="modal-hint" style="margin-top: 14px;">
        This is a demo payment. No real charge will be made.
      </p>
    </div>
  </div>
{/if}
