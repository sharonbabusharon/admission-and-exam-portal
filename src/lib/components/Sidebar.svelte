<script>
  import Icon from './Icon.svelte';

  export let status = 'not_started';

  const steps = [
    { key: 'application', label: 'Application' },
    { key: 'payment', label: 'Payment' },
    { key: 'exam', label: 'Exam' },
    { key: 'results', label: 'Results' }
  ];

  function getActiveIdx(currentStatus) {
    if (currentStatus === 'submitted') return 1;
    if (currentStatus === 'payment_done') return 2;
    if (currentStatus === 'exam_ready') return 2;
    if (currentStatus === 'exam_completed') return 3;
    return 0;
  }

  function getTrackerItemClass(idx, currentStatus) {
    const activeIdx = getActiveIdx(currentStatus);
    if (idx < activeIdx) return 'tracker-item done';
    if (idx === activeIdx) return 'tracker-item active';
    return 'tracker-item';
  }

  function isStepDone(idx, currentStatus) {
    return idx < getActiveIdx(currentStatus);
  }
</script>

<aside class="sidebar">
  <div class="sidebar-title">Application Tracker</div>
  <div class="tracker">
    {#each steps as s, idx}
      <svelte:element this={s.key === 'application' ? 'a' : 'div'} href={s.key === 'application' ? '/app/application?view=readonly' : undefined} class={getTrackerItemClass(idx, status)}>
        <div class="tracker-marker">
          {#if isStepDone(idx, status)}
            <Icon name="check" size={14} strokeWidth={2.5} />
          {:else}
            {idx + 1}
          {/if}
        </div>
        <div class="tracker-label">{s.label}</div>
      </svelte:element>
    {/each}
  </div>
  <div class="sidebar-help">
    <h4>Need Help?</h4>
    <p>Our admissions team is happy to assist you with any questions.</p>
    <a href="/contact">Contact Support</a>
  </div>
</aside>
