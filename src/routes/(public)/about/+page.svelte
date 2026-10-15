<script>
 import {currentUser,openSignupModal} from '$lib/stores/auth.js';
 import {goto} from '$app/navigation';
 import Icon from '$lib/components/Icon.svelte';
 function apply(){if($currentUser)goto('/app/dashboard');else openSignupModal('/app/dashboard');}
</script>
<svelte:head><title>A place for your ambition — Hong Bang International University</title></svelte:head>
<main class="editorial-page">
 <header class="editorial-header"><span class="page-kicker">THE UNIVERSITY • HO CHI MINH CITY, VIETNAM</span><h1>A place to discover<br/>who you <em>could become.</em></h1><p>At Hong Bang International University, your next chapter starts with curiosity, community, and the courage to try.</p></header>
 <section class="university-story"><div class="university-photo"><img src="/assets/hiu-campus.jpg" alt="Students gathering at the entrance to Hong Bang International University"/><span>HONG BANG INTERNATIONAL UNIVERSITY · EST. 1997</span></div><div class="story-copy"><span class="page-kicker">YOUR AMBITION BELONGS HERE</span><h2>More than a destination.<br/>A beginning.</h2><p>Choosing a university is choosing where your story goes next. Explore your interests, meet new people, and take the first step towards the future you imagine.</p><p>Our applicant portal brings your journey together — from your first application to your entrance examination. Clear next steps, at your own pace.</p><button class="btn btn-primary" on:click={apply}>Start your application <Icon name="arrow-right" size={15}/></button><a class="story-official" href="https://hiu.vn/en/home/" target="_blank" rel="noreferrer">Explore the official university website ↗</a></div></section>
 <section class="editorial-values">{#each [{icon:'academic-cap',title:'Follow your curiosity',text:'Explore undergraduate, postgraduate and doctoral pathways.'},{icon:'users',title:'Find your community',text:'Begin a new chapter in Ho Chi Minh City, Vietnam.'},{icon:'arrow-right',title:'Take your next step',text:'Apply, complete your payment and sit your entrance exam in one place.'}] as item}<div><Icon name={item.icon} size={22}/><h3>{item.title}</h3><p>{item.text}</p></div>{/each}</section>
</main>
