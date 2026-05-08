<script>
  import Icon from '$lib/components/Icon.svelte';
  import { addContactInquiry } from '$lib/stores/applications.js';
  import { showToast } from '$lib/stores/toast.js';
  import content from '$lib/data/content.json';

  const inst = content.institution;

  let name = '';
  let email = '';
  let phone = '';
  let subject = '';
  let message = '';
  let success = false;

  function handleSubmit(e) {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      showToast('Please fill all required fields.', 'error');
      return;
    }
    addContactInquiry({ name, email, phone, subject, message });
    success = true;
    name = email = phone = subject = message = '';
    showToast('Your message has been sent!', 'success');
    setTimeout(() => (success = false), 5000);
  }
</script>

<svelte:head>
  <title>Contact Us — Hong Bang International University</title>
</svelte:head>

<header class="page-header">
  <div class="container">
    <h1>Get in Touch</h1>
    <p>We'd love to hear from you — reach us anytime</p>
  </div>
</header>

<section class="section">
  <div class="container">
    <div class="contact-grid">
      <div>
        <div class="contact-info-card">
          <h3>Contact Information</h3>
          <div class="contact-info-item">
            <div class="contact-info-icon"><Icon name="map-pin" size={20} /></div>
            <div class="contact-info-text">
              <h4>Address</h4>
              <p>{inst.address}</p>
            </div>
          </div>
          <div class="contact-info-item">
            <div class="contact-info-icon"><Icon name="phone" size={20} /></div>
            <div class="contact-info-text">
              <h4>Phone</h4>
              <p>{inst.phone}</p>
            </div>
          </div>
          <div class="contact-info-item">
            <div class="contact-info-icon"><Icon name="mail" size={20} /></div>
            <div class="contact-info-text">
              <h4>Email</h4>
              <p>{inst.email}</p>
            </div>
          </div>
          <div class="contact-info-item">
            <div class="contact-info-icon"><Icon name="clock" size={20} /></div>
            <div class="contact-info-text">
              <h4>Office Hours</h4>
              <p>{inst.office_hours}</p>
            </div>
          </div>
        </div>
        <div class="map-placeholder">
          <Icon name="map" size={28} />
          <span>{inst.name} — Ho Chi Minh City Campus</span>
        </div>
      </div>

      <div class="contact-form-card">
        <h3 style="margin-bottom: 6px;">Send us a Message</h3>
        <p style="color: var(--color-text-light); margin-bottom: 24px; font-size: 0.95rem;">
          Fill the form below and our team will get back to you shortly.
        </p>

        {#if success}
          <div class="form-success active">
            Your message has been sent! We'll get back to you within 24 hours.
          </div>
        {/if}

        <form on:submit={handleSubmit} novalidate>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label" for="c_name">
                Name <span class="required">*</span>
              </label>
              <input id="c_name" class="form-input" placeholder="Your full name" bind:value={name} required />
            </div>
            <div class="form-group">
              <label class="form-label" for="c_email">
                Email <span class="required">*</span>
              </label>
              <input
                id="c_email"
                type="email"
                class="form-input"
                placeholder="you@example.com"
                bind:value={email}
                required
              />
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label" for="c_phone">Phone</label>
              <input id="c_phone" type="tel" class="form-input" placeholder="+91 9876543210" bind:value={phone} />
            </div>
            <div class="form-group">
              <label class="form-label" for="c_subject">
                Subject <span class="required">*</span>
              </label>
              <select id="c_subject" class="form-select" bind:value={subject} required>
                <option value="">— Select —</option>
                <option>Admissions</option>
                <option>Fee</option>
                <option>Exam</option>
                <option>General</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="c_message">
              Message <span class="required">*</span>
            </label>
            <textarea
              id="c_message"
              class="form-textarea"
              rows="5"
              placeholder="Tell us how we can help..."
              bind:value={message}
              required
            ></textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-lg btn-block">Send Message</button>
        </form>
      </div>
    </div>
  </div>
</section>

<style>
  .map-placeholder {
    gap: 12px;
  }
</style>
