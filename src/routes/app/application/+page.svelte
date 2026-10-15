<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { currentUser } from '$lib/stores/auth.js';
  import {
    applications,
    blankApplication,
    ensureApplicationFor,
    saveApplicationFor
  } from '$lib/stores/applications.js';
  import { showToast } from '$lib/stores/toast.js';
  import Icon from '$lib/components/Icon.svelte';

  const TOTAL_STEPS = 6;
  let currentStep = 1;
  let app = null;
  $: readOnly = $page.url.searchParams.get('view') === 'readonly' || isReadOnly(app);

  function isReadOnly(application) {
    return $page.url.searchParams.get('view') === 'readonly' ||
      ['submitted', 'payment_done', 'exam_ready', 'exam_completed'].includes(application?.application_status) ||
      application?.payment_status === 'paid';
  }
  let educationRecords = [{ qualification: '', board: '', year: '', percentage: '' }];

  const stepLabels = ['Course', 'Personal', 'Education', 'Guardian', 'Documents', 'Submit'];

  const documentTypes = [
    { key: 'photograph', icon: 'camera', label: 'Recent Photograph', hint: 'Passport-size photo, JPG/PNG, max 1 MB', accept: 'image/*', required: true },
    { key: 'sslc_marksheet', icon: 'book-open', label: 'SSLC / 10th Marksheet', hint: 'PDF or image, max 2 MB', accept: '.pdf,image/*', required: true },
    { key: 'hsc_marksheet', icon: 'book-open', label: 'HSC / 12th Marksheet', hint: 'PDF or image, max 2 MB', accept: '.pdf,image/*', required: true },
    { key: 'aadhar_id', icon: 'credit-card', label: 'Aadhar Card', hint: 'PDF or image, max 2 MB', accept: '.pdf,image/*', required: true },
    { key: 'transfer_certificate', icon: 'document-text', label: 'Transfer Certificate (Optional)', hint: 'PDF or image', accept: '.pdf,image/*', required: false },
    { key: 'caste_certificate', icon: 'document-text', label: 'Caste / Income Certificate', hint: 'If applicable', accept: '.pdf,image/*', required: false }
  ];

  onMount(() => {
    if (!$currentUser) return;
    if (!isReadOnly($applications[$currentUser.email])) ensureApplicationFor($currentUser);
    app = JSON.parse(JSON.stringify($applications[$currentUser.email] || blankApplication($currentUser)));
    if (app.form_data.education_records?.length) {
      educationRecords = app.form_data.education_records.map((r) => ({ ...r }));
    }
    try {
      const interest = JSON.parse(sessionStorage.getItem('admission_program_interest') || 'null');
      if (!isReadOnly(app) && interest && !app.form_data.level_of_program && ['B.Tech', 'B.Sc', 'BCA', 'MBA', 'M.Tech', 'PhD'].includes(interest.name)) {
        app.form_data.level_of_program = interest.name;
        app.form_data.program_level = interest.level;
      }
    } catch { /* A program preference is optional. */ }
    const requestedStep = Number($page.url.searchParams.get('step'));
    currentStep = isReadOnly(app) ? (Number.isInteger(requestedStep) && requestedStep >= 1 && requestedStep <= TOTAL_STEPS ? requestedStep : 1) : findFirstIncompleteStep();
  });

  function findFirstIncompleteStep() {
    const sc = app?.step_completion || {};
    if (!sc.step1_register) return 1;
    if (!sc.step2_personal) return 2;
    if (!sc.step3_education) return 3;
    if (!sc.step4_guardian) return 4;
    if (!sc.step5_documents) return 5;
    return 6;
  }

  function goToStep(n) {
    if (n < 1) n = 1;
    if (n > TOTAL_STEPS) n = TOTAL_STEPS;
    currentStep = n;
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function validateRequired() {
    const stepEl = document.getElementById(`step-${currentStep}`);
    if (!stepEl) return true;
    const required = stepEl.querySelectorAll('[required]');
    for (const f of required) {
      if (!f.value || !f.value.trim()) {
        f.focus();
        f.style.borderColor = 'var(--color-danger)';
        const labelEl = f.previousElementSibling;
        const label = labelEl ? labelEl.textContent.replace('*', '').trim() : 'Required field';
        showToast(`Please fill: ${label}`, 'error');
        setTimeout(() => { f.style.borderColor = ''; }, 1500);
        return false;
      }
    }
    return true;
  }

  function saveCurrentStep() {
    if (readOnly) return;
    if (currentStep === 1) {
      app.step_completion.step1_register = true;
      if (app.application_status === 'not_started') app.application_status = 'in_progress';
    } else if (currentStep === 2) {
      app.step_completion.step2_personal = true;
    } else if (currentStep === 3) {
      app.form_data.education_records = educationRecords.filter((r) => r.qualification);
      app.step_completion.step3_education = true;
    } else if (currentStep === 4) {
      app.step_completion.step4_guardian = true;
    } else if (currentStep === 5) {
      app.step_completion.step5_documents = true;
      app.step_completion.step6_submitted = true;
      app.application_status = 'submitted';
    }
    saveApplicationFor($currentUser.email, app);
  }

  function handleNext() {
    if (readOnly) { goToStep(currentStep + 1); return; }
    if (!validateRequired()) return;
    saveCurrentStep();
    if (currentStep === 5) {
      showToast('Application submitted successfully!', 'success');
      setTimeout(() => goto('/app/dashboard'), 1000);
      return;
    }
    showToast(`Step ${currentStep} saved.`, 'success');
    goToStep(currentStep + 1);
  }

  function saveAndExit() {
    if (readOnly) { goto('/app/dashboard'); return; }
    app.form_data.education_records = educationRecords;
    if (app.application_status === "not_started") app.application_status = "in_progress";
    saveApplicationFor($currentUser.email, app);
    showToast("Your progress has been saved.", "success");
    goto("/app/dashboard");
  }

  function handlePrev() {
    goToStep(currentStep - 1);
  }

  function addEducationRow() {
    if (readOnly) return;
    educationRecords = [...educationRecords, { qualification: '', board: '', year: '', percentage: '' }];
  }

  function removeEducationRow(i) {
    if (readOnly) return;
    if (educationRecords.length <= 1) return;
    educationRecords = educationRecords.filter((_, idx) => idx !== i);
  }

  function handleFile(key, e) {
    if (readOnly) return;
    const file = e.target.files?.[0];
    if (!file) return;
    app.form_data.documents[key] = file.name;
    saveApplicationFor($currentUser.email, app);
    app = { ...app };
  }

  function getStepStatuses(currentApp) {
    const sc = currentApp?.step_completion || {};
    return [
      sc.step1_register,
      sc.step2_personal,
      sc.step3_education,
      sc.step4_guardian,
      sc.step5_documents,
      sc.step6_submitted
    ];
  }

  function isStepDone(currentApp, idx) {
    return !!getStepStatuses(currentApp)[idx];
  }

  function pillClass(currentApp, idx, currentStepLocal) {
    let cls = 'step-pill';
    if (isStepDone(currentApp, idx)) cls += ' done';
    if (idx + 1 === currentStepLocal) cls += ' active';
    return cls;
  }
</script>

<svelte:head>
  <title>Application Form — Hong Bang International University</title>
</svelte:head>

<main class="application-page">
  {#if app}
    <div class="form-container">
      <div class="form-header">
        <h1>Your application</h1>
        <p>{readOnly ? 'Read-only · Your saved application details' : `Step ${currentStep} of 6 · A little more about you. Your next chapter starts here.`}</p>
      </div>

      <div class="steps-bar">
        <span class="form-rail-title">YOUR APPLICATION CHECKLIST</span>
        {#each stepLabels as label, idx}
          <button type="button" class={pillClass(app, idx, currentStep)} disabled={!readOnly && idx + 1 > findFirstIncompleteStep()} aria-current={currentStep === idx + 1 ? 'step' : undefined} on:click={() => goToStep(idx + 1)}>
            <div class="step-pill-num">
              {#if isStepDone(app, idx)}
                <Icon name="check" size={14} strokeWidth={2.5} />
              {:else}
                {idx + 1}
              {/if}
            </div>
            <div class="step-pill-label">{label}</div>
          </button>
        {/each}
        <p class="form-rail-note">{readOnly ? 'Select any section to view your saved details. Your application and exam results remain unchanged.' : 'A little at a time is just fine. Save your progress and return whenever you’re ready.'}</p>
      </div>

      <fieldset class="application-fields" disabled={readOnly} aria-label={readOnly ? 'Saved application — read-only' : 'Application details'}>
      {#if readOnly}<div class="read-only-notice"><Icon name="lock-closed" size={14}/><span>Read-only application · Select a section in the checklist to view your details.</span></div>{/if}
      <!-- Step 1: Course & Contact -->
      {#if currentStep === 1}
        <section class="step-content" id="step-1">
          <h2>Step 1 — Course &amp; Contact Details</h2>
          <p>Choose your program and confirm your contact information.</p>

          <div class="form-section">
            <h3>Account Details</h3>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label" for="user_email">Email Address</label>
                <input id="user_email" type="email" class="form-input" value={app.user_email} readonly />
              </div>
              <div class="form-group">
                <label class="form-label" for="user_name">Full Name (as registered)</label>
                <input id="user_name" type="text" class="form-input" value={app.user_name} readonly />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Program Selection</h3>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label" for="program_level">Program Level <span class="required">*</span></label>
                <select id="program_level" class="form-select" bind:value={app.form_data.program_level} required>
                  <option value="">— Select —</option>
                  <option>Undergraduate</option>
                  <option>Postgraduate</option>
                  <option>Doctoral</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="level_of_program">Program <span class="required">*</span></label>
                <select id="level_of_program" class="form-select" bind:value={app.form_data.level_of_program} required>
                  <option value="">— Select —</option>
                  <option>B.Tech</option>
                  <option>B.Sc</option>
                  <option>BCA</option>
                  <option>MBA</option>
                  <option>M.Tech</option>
                  <option>PhD</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="specialization">Specialization <span class="required">*</span></label>
                <input id="specialization" type="text" class="form-input" bind:value={app.form_data.specialization} placeholder="e.g. Computer Science" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="nationality">Nationality <span class="required">*</span></label>
                <select id="nationality" class="form-select" bind:value={app.form_data.nationality} required>
                  <option value="">— Select —</option>
                  <option>Indian</option>
                  <option>NRI</option>
                  <option>Foreign National</option>
                </select>
              </div>
            </div>
          </div>
        </section>
      {/if}

      <!-- Step 2: Personal Details -->
      {#if currentStep === 2}
        <section class="step-content" id="step-2">
          <h2>Step 2 — Personal Details</h2>
          <p>Tell us about yourself.</p>

          <div class="form-section">
            <h3>Basic Information</h3>
            <div class="form-grid cols-3">
              <div class="form-group">
                <label class="form-label" for="title">Title <span class="required">*</span></label>
                <select id="title" class="form-select" bind:value={app.form_data.title} required>
                  <option value="">— Select —</option>
                  <option>Mr.</option>
                  <option>Ms.</option>
                  <option>Mrs.</option>
                  <option>Mx.</option>
                </select>
              </div>
              <div class="form-group" style="grid-column: span 2;">
                <label class="form-label" for="full_name">Full Name <span class="required">*</span></label>
                <input id="full_name" type="text" class="form-input" bind:value={app.form_data.full_name} placeholder="As per Aadhar" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="dob">Date of Birth <span class="required">*</span></label>
                <input id="dob" type="date" class="form-input" bind:value={app.form_data.dob} required />
              </div>
              <div class="form-group">
                <label class="form-label" for="gender">Gender <span class="required">*</span></label>
                <select id="gender" class="form-select" bind:value={app.form_data.gender} required>
                  <option value="">— Select —</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="blood_group">Blood Group</label>
                <select id="blood_group" class="form-select" bind:value={app.form_data.blood_group}>
                  <option value="">— Select —</option>
                  <option>A+</option><option>A-</option>
                  <option>B+</option><option>B-</option>
                  <option>O+</option><option>O-</option>
                  <option>AB+</option><option>AB-</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="religion">Religion</label>
                <input id="religion" type="text" class="form-input" bind:value={app.form_data.religion} />
              </div>
              <div class="form-group">
                <label class="form-label" for="category">Category <span class="required">*</span></label>
                <select id="category" class="form-select" bind:value={app.form_data.category} required>
                  <option value="">— Select —</option>
                  <option>General</option>
                  <option>OBC</option>
                  <option>SC</option>
                  <option>ST</option>
                  <option>EWS</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="differently_abled">Differently Abled</label>
                <select id="differently_abled" class="form-select" bind:value={app.form_data.differently_abled}>
                  <option value="">— Select —</option>
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Identification &amp; Contact</h3>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label" for="aadhar">Aadhar Number <span class="required">*</span></label>
                <input id="aadhar" type="text" class="form-input" bind:value={app.form_data.aadhar} placeholder="12-digit Aadhar number" maxlength="12" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="whatsapp">WhatsApp Number <span class="required">*</span></label>
                <input id="whatsapp" type="tel" class="form-input" bind:value={app.form_data.whatsapp} placeholder="+91 9876543210" required />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Address</h3>
            <div class="form-grid full">
              <div class="form-group">
                <label class="form-label" for="address_line1">Address Line <span class="required">*</span></label>
                <input id="address_line1" type="text" class="form-input" bind:value={app.form_data.address_line1} placeholder="Street, Area" required />
              </div>
            </div>
            <div class="form-grid cols-3">
              <div class="form-group">
                <label class="form-label" for="district">District <span class="required">*</span></label>
                <input id="district" type="text" class="form-input" bind:value={app.form_data.district} required />
              </div>
              <div class="form-group">
                <label class="form-label" for="state">State <span class="required">*</span></label>
                <input id="state" type="text" class="form-input" bind:value={app.form_data.state} required />
              </div>
              <div class="form-group">
                <label class="form-label" for="pin_code">PIN Code <span class="required">*</span></label>
                <input id="pin_code" type="text" class="form-input" bind:value={app.form_data.pin_code} maxlength="6" required />
              </div>
            </div>
          </div>
        </section>
      {/if}

      <!-- Step 3: Education -->
      {#if currentStep === 3}
        <section class="step-content" id="step-3">
          <h2>Step 3 — Educational Qualifications</h2>
          <p>Add all your past educational records. Click "Add Qualification" for more.</p>

          <div>
            {#each educationRecords as rec, i}
              <div class="education-row">
                <div class="form-group">
                  <label class="form-label" for={`qualification-${i}`}>Qualification</label>
                  <input id={`qualification-${i}`} type="text" class="form-input" bind:value={rec.qualification} placeholder="e.g. 10th / 12th / B.Tech" />
                </div>
                <div class="form-group">
                  <label class="form-label" for={`board-${i}`}>Board / University</label>
                  <input id={`board-${i}`} type="text" class="form-input" bind:value={rec.board} placeholder="e.g. CBSE" />
                </div>
                <div class="form-group">
                  <label class="form-label" for={`year-${i}`}>Year</label>
                  <input id={`year-${i}`} type="number" class="form-input" bind:value={rec.year} placeholder="2024" min="1980" max="2030" />
                </div>
                <div class="form-group">
                  <label class="form-label" for={`percentage-${i}`}>% / CGPA</label>
                  <input id={`percentage-${i}`} type="text" class="form-input" bind:value={rec.percentage} placeholder="85" />
                </div>
                <button type="button" class="btn-icon" title="Remove" on:click={() => removeEducationRow(i)}>
                  <Icon name="x-mark" size={16} strokeWidth={2.25} />
                </button>
              </div>
            {/each}
          </div>

          <button type="button" class="btn-add" on:click={addEducationRow}>
            <Icon name="plus" size={16} strokeWidth={2.25} />
            <span>Add Qualification</span>
          </button>
        </section>
      {/if}

      <!-- Step 4: Guardian -->
      {#if currentStep === 4}
        <section class="step-content" id="step-4">
          <h2>Step 4 — Guardian Details</h2>
          <p>Provide your parent / guardian information.</p>

          <div class="form-section">
            <h3>Father's Details</h3>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label" for="father_name">Father's Name <span class="required">*</span></label>
                <input id="father_name" type="text" class="form-input" bind:value={app.form_data.guardian.father_name} required />
              </div>
              <div class="form-group">
                <label class="form-label" for="father_phone">Phone <span class="required">*</span></label>
                <input id="father_phone" type="tel" class="form-input" bind:value={app.form_data.guardian.father_phone} required />
              </div>
              <div class="form-group">
                <label class="form-label" for="father_email">Email</label>
                <input id="father_email" type="email" class="form-input" bind:value={app.form_data.guardian.father_email} />
              </div>
              <div class="form-group">
                <label class="form-label" for="father_occupation">Occupation</label>
                <input id="father_occupation" type="text" class="form-input" bind:value={app.form_data.guardian.father_occupation} />
              </div>
              <div class="form-group">
                <label class="form-label" for="father_income">Annual Income</label>
                <select id="father_income" class="form-select" bind:value={app.form_data.guardian.father_income}>
                  <option value="">— Select —</option>
                  <option>Below 2 Lakhs</option>
                  <option>2 - 5 Lakhs</option>
                  <option>5 - 10 Lakhs</option>
                  <option>10 - 20 Lakhs</option>
                  <option>Above 20 Lakhs</option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Mother's Details</h3>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label" for="mother_name">Mother's Name <span class="required">*</span></label>
                <input id="mother_name" type="text" class="form-input" bind:value={app.form_data.guardian.mother_name} required />
              </div>
              <div class="form-group">
                <label class="form-label" for="mother_phone">Phone</label>
                <input id="mother_phone" type="tel" class="form-input" bind:value={app.form_data.guardian.mother_phone} />
              </div>
              <div class="form-group">
                <label class="form-label" for="mother_email">Email</label>
                <input id="mother_email" type="email" class="form-input" bind:value={app.form_data.guardian.mother_email} />
              </div>
              <div class="form-group">
                <label class="form-label" for="mother_occupation">Occupation</label>
                <input id="mother_occupation" type="text" class="form-input" bind:value={app.form_data.guardian.mother_occupation} />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Local Guardian (Optional)</h3>
            <div class="form-grid cols-3">
              <div class="form-group">
                <label class="form-label" for="guardian_name">Guardian Name</label>
                <input id="guardian_name" type="text" class="form-input" bind:value={app.form_data.guardian.guardian_name} />
              </div>
              <div class="form-group">
                <label class="form-label" for="guardian_relation">Relation</label>
                <input id="guardian_relation" type="text" class="form-input" bind:value={app.form_data.guardian.guardian_relation} />
              </div>
              <div class="form-group">
                <label class="form-label" for="guardian_phone">Phone</label>
                <input id="guardian_phone" type="tel" class="form-input" bind:value={app.form_data.guardian.guardian_phone} />
              </div>
            </div>
          </div>
        </section>
      {/if}

      <!-- Step 5: Documents -->
      {#if currentStep === 5}
        <section class="step-content" id="step-5">
          <h2>Step 5 — Upload Documents</h2>
          <p>Upload clear scanned copies of the documents below (PDF or image).</p>

          <div class="upload-grid">
            {#each documentTypes as doc}
              <div class="upload-box {app.form_data.documents[doc.key] ? 'uploaded' : ''}">
                <div class="upload-box-label">
                  <Icon name={doc.icon} size={18} />
                  <span>{doc.label} {#if doc.required}<span class="required">*</span>{/if}</span>
                </div>
                <div class="upload-box-hint">{doc.hint}</div>
                <input type="file" class="upload-input" accept={doc.accept} on:change={(e) => handleFile(doc.key, e)} />
                {#if app.form_data.documents[doc.key]}
                  <div class="upload-status">
                    <Icon name="check-circle" size={14} />
                    <span>Uploaded: {app.form_data.documents[doc.key]}</span>
                  </div>
                {/if}
              </div>
            {/each}
          </div>

          <div class="payment-summary" style="margin-top: 32px;">
            <div class="payment-row"><span>Application Fee</span><span>₹ 1,000.00</span></div>
            <div class="payment-row"><span>Processing Fee</span><span>₹ 50.00</span></div>
            <div class="payment-row"><span>GST (18%)</span><span>₹ 189.00</span></div>
            <div class="payment-row"><span>Total Amount</span><span>₹ 1,239.00</span></div>
          </div>
        </section>
      {/if}

      <!-- Step 6: Submitted -->
      {#if currentStep === 6}
        <section class="step-content" id="step-6">
          <div style="text-align: center; padding: 24px 0;">
            <div class="dashboard-card-icon icon-submitted" style="margin: 0 auto 24px;">
              <Icon name="check-circle" size={40} />
            </div>
            <h2>{readOnly ? 'Application Summary' : 'Application Submitted'}</h2>
            <p style="color: var(--color-text-light); margin: 12px 0 24px;">
              {readOnly ? 'Your saved application is available in the checklist. Return to your dashboard for your current payment and exam status.' : 'Your application has been submitted successfully. Head over to your dashboard to complete payment.'}
            </p>
            <a href="/app/dashboard" class="btn btn-primary btn-lg">
              <span>Go to Dashboard</span>
              <Icon name="arrow-right" size={18} />
            </a>
          </div>
        </section>
      {/if}
      </fieldset>

      <div class="form-actions">
        <div class="action-left">
        <button type="button" class="btn btn-ghost" on:click={handlePrev} disabled={currentStep === 1}>
          <Icon name="arrow-left" size={18} />
          <span>Previous</span>
        </button>
        {#if readOnly}<a class="save-exit" href="/app/dashboard">Back to dashboard</a>{:else}<button type="button" class="save-exit" on:click={saveAndExit}>Save &amp; exit</button>{/if}
        </div>
        <span class="action-context"><Icon name={readOnly ? 'lock-closed' : 'shield-check'} size={13}/> {readOnly ? 'Viewing only — no changes can be made' : 'Your progress, one step at a time'}</span>
        {#if currentStep < TOTAL_STEPS}
          <button type="button" class="btn btn-primary" on:click={handleNext}>
            <span>{readOnly ? 'Next section' : currentStep === 5 ? 'Submit Application' : 'Save & Next'}</span>
            <Icon name="arrow-right" size={18} />
          </button>
        {:else}
          <a href="/app/dashboard" class="btn btn-primary">
            <span>Go to Dashboard</span>
            <Icon name="arrow-right" size={18} />
          </a>
        {/if}
      </div>
    </div>
  {:else}
    <p style="text-align: center; padding: 40px;">Loading…</p>
  {/if}
</main>

<style>
  .application-fields { grid-column: 2; border: 0; padding: 0; margin: 0; min-width: 0; }
  .read-only-notice { display: flex; align-items: center; gap: 9px; padding: 11px 14px; margin-bottom: 14px; background: #f0f2e8; border: 1px solid #e0e5d5; border-radius: 6px; color: #68745d; font-size: 13px; }
  .application-fields:disabled :global(input), .application-fields:disabled :global(select) { opacity: 1; color: #566448; background: #f8f9f4; cursor: default; -webkit-text-fill-color: #566448; }
  .application-fields:disabled :global(.btn-add), .application-fields:disabled :global(.btn-icon), .application-fields:disabled :global(.upload-input) { display: none; }
  .upload-box-label {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .upload-status {
    display: flex;
    align-items: center;
    gap: 6px;
  }
</style>
