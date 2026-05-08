<script>
  import { openLoginModal, openSignupModal } from '$lib/stores/auth.js';
  import Icon from './Icon.svelte';
  import BrandLink from './BrandLink.svelte';

  function handleLoginClick(e) {
    e.preventDefault();
    openLoginModal();
  }

  function handleSignupClick(e) {
    e.preventDefault();
    openSignupModal();
  }
</script>

<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <BrandLink variant="footer" />
        <h3 class="footer-brand-title">
          <BrandLink variant="text-only" />
        </h3>
        <p>
          Empowering students with quality education since 1997. Hong Bang International
          University is committed to academic excellence and global learning.
        </p>
      </div>

      <div class="footer-col">
        <h4>Quick Links</h4>
        <ul>
          <li><a href="/about">About Us</a></li>
          <li><a href="/steps">Steps to Apply</a></li>
          <li><a href="/contact">Contact</a></li>
          <li><a href="/" on:click={handleLoginClick}>Login</a></li>
          <li><a href="/" on:click={handleSignupClick}>Sign Up</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Programs</h4>
        <ul>
          <li><a href="/#programs">Undergraduate</a></li>
          <li><a href="/#programs">Postgraduate</a></li>
          <li><a href="/#programs">Doctoral</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Contact Us</h4>
        <div class="footer-contact-item">
          <Icon name="map-pin" size={16} />
          <span>215 Dien Bien Phu Street, Binh Thanh District, Ho Chi Minh City</span>
        </div>
        <div class="footer-contact-item">
          <Icon name="phone" size={16} />
          <span>(+84) 28 7308 3456</span>
        </div>
        <div class="footer-contact-item">
          <Icon name="mail" size={16} />
          <span>admissions@hiu.vn</span>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      © 2026 Hong Bang International University. All rights reserved. &nbsp;|&nbsp;
      <a href="/privacy">Privacy Policy</a> &nbsp;|&nbsp; <a href="/terms">Terms of Service</a>
    </div>
  </div>
</footer>

<style>
  .footer-brand {
    display: flex;
    flex-direction: column;
    gap: 14px;
    align-items: flex-start;
  }

  .footer-brand-title {
    margin: 0;
  }
</style>
