<script>
  import Icon from '$lib/components/Icon.svelte';
  import content from '$lib/data/content.json';
</script>

<svelte:head>
  <title>About — Hong Bang International University</title>
</svelte:head>

<header class="page-header">
  <div class="container">
    <h1>About {content.institution.name}</h1>
    <p>Empowering students with quality education since {content.institution.founded}</p>
  </div>
</header>

<section class="section">
  <div class="container">
    <div class="about-grid">
      <div>
        <h2>Our Vision</h2>
        <p>
          To be a globally recognized centre of academic excellence and innovation, fostering
          knowledge, creativity and leadership in students from diverse backgrounds. Hong Bang
          International University strives to be among the leading universities in Vietnam and
          across the region.
        </p>
        <h2 style="margin-top: 24px;">Our Mission</h2>
        <p>
          We are committed to delivering world-class education through experienced faculty, modern
          infrastructure and a vibrant learning ecosystem. Our students graduate with the skills,
          values and confidence to lead meaningful careers and contribute to society.
        </p>
        <p>
          <strong>Founded:</strong>
          {content.institution.founded} &nbsp;•&nbsp;
          <strong>Programs:</strong>
          {content.stats[0].number}+ &nbsp;•&nbsp;
          <strong>Students:</strong>
          {content.stats[3].number}
        </p>
      </div>
      <div class="about-image">
        <Icon name="building-office" size={80} strokeWidth={1.25} />
      </div>
    </div>
  </div>
</section>

<section class="section key-dates">
  <div class="container">
    <h2 class="section-title">Accreditations &amp; Recognitions</h2>
    <p class="section-subtitle">Quality verified by national bodies</p>
    <div class="accreditation-grid">
      {#each content.accreditations as item}
        <div class="accreditation-card">{item}</div>
      {/each}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <h2 class="section-title">Why Choose Us</h2>
    <p class="section-subtitle">Six reasons that set us apart</p>
    <div class="feature-list">
      {#each content.why_choose_us as feature}
        <div class="feature-item">
          <div class="feature-check">
            <Icon name="check" size={16} strokeWidth={2.5} />
          </div>
          <div class="feature-text">
            <strong>{feature.title}</strong>
            <span>{feature.subtitle}</span>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<section class="section key-dates">
  <div class="container">
    <h2 class="section-title">Director's Message</h2>
    <div style="max-width: 820px; margin: 0 auto;">
      <div class="message-box">
        "Education is more than a degree — it is a transformation. At our institution, every
        student is empowered to discover their passion, sharpen their skills and grow into
        responsible global citizens. We invite you to join a community that values curiosity,
        collaboration and excellence."
        <span class="author">— Dr. A. Sundaram, Director</span>
      </div>
    </div>
  </div>
</section>
