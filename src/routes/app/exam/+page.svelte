<script>
  import { onMount, tick } from 'svelte';
  import { goto, beforeNavigate } from '$app/navigation';
  import { currentUser } from '$lib/stores/auth.js';
  import { getApplicationFor, saveApplicationFor, generateReferenceNumber } from '$lib/stores/applications.js';
  import paper from '$lib/data/exam-paper.json';
  import { createAttempt, remainingSeconds, scoreAttempt, validAttempt } from '$lib/exam/engine.js';

  const subjects = ['Physics', 'Chemistry', 'Biology'];
  let ready = false, allowed = false, agreed = false, attempt = null;
  let remaining = paper.durationMinutes * 60, confirmOpen = false, instructionsOpen = false;
  let review = false, storageError = '', notice = '', questionHeading;
  let key = '';
  function focusDialog(node) {
    const previous = document.activeElement;
    const controls = () => [...node.querySelectorAll('button:not(:disabled), a[href]')];
    controls()[0]?.focus();
    function handleKey(event) {
      if (event.key === 'Escape') { confirmOpen = false; instructionsOpen = false; }
      if (event.key === 'Tab') {
        const buttons = controls(), first = buttons[0], last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    }
    node.addEventListener('keydown', handleKey);
    return { destroy() { node.removeEventListener('keydown', handleKey); previous?.focus(); } };
  }
  $: question = paper.questions[attempt?.current || 0];
  $: answered = attempt ? Object.keys(attempt.answers).length : 0;
  $: result = attempt?.submittedAt ? scoreAttempt(paper, attempt) : null;
  $: clock = `${String(Math.floor(remaining / 3600)).padStart(2, '0')}:${String(Math.floor(remaining % 3600 / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;

  onMount(() => {
    const app = getApplicationFor($currentUser?.email);
    allowed = app?.payment_status === 'paid';
    key = `admission_exam:${$currentUser?.email}:${paper.id}`;
    if (allowed) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const saved = JSON.parse(raw);
          if (validAttempt(saved, paper)) attempt = saved;
          else notice = 'The saved attempt could not be restored. Please start a new attempt.';
        }
      } catch { notice = 'The saved attempt could not be restored. Please start a new attempt.'; }
      updateClock();
      if (attempt?.submittedAt) syncCompletion();
    }
    ready = true;
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  });

  beforeNavigate(({ cancel }) => {
    if (attempt && !attempt.submittedAt && !window.confirm('Leave the exam? Your answers are saved, but the timer will keep running.')) cancel();
  });

  function leaveWarning(event) {
    if (attempt && !attempt.submittedAt) { event.preventDefault(); event.returnValue = ''; }
  }
  function persist() {
    try { localStorage.setItem(key, JSON.stringify(attempt)); storageError = ''; }
    catch { storageError = 'Browser storage is unavailable. Keep this tab open to preserve your answers.'; }
  }
  function updateClock() {
    if (!attempt || attempt.submittedAt) return;
    remaining = remainingSeconds(attempt);
    if (remaining === 0) submit(true);
  }
  function start() {
    if (!allowed || !agreed || attempt) return;
    attempt = createAttempt(paper);
    persist(); updateClock();
    const app = getApplicationFor($currentUser.email);
    app.application_status = 'exam_ready'; app.exam_status = 'in_progress';
    saveApplicationFor($currentUser.email, app);
  }
  async function navigate(index) {
    if (index < 0 || index >= paper.questions.length) return;
    if (!review && remainingSeconds(attempt) === 0) { submit(true); return; }
    const id = paper.questions[index].id;
    attempt = { ...attempt, current: index, visited: [...new Set([...attempt.visited, id])] };
    persist();
    await tick(); questionHeading?.focus();
  }
  function choose(value) {
    if (attempt.submittedAt) return;
    if (remainingSeconds(attempt) === 0) { submit(true); return; }
    const answers = { ...attempt.answers };
    if (value === undefined) delete answers[question.id]; else answers[question.id] = value;
    attempt = { ...attempt, answers }; persist();
  }
  function flag() {
    if (attempt.submittedAt) return;
    if (remainingSeconds(attempt) === 0) { submit(true); return; }
    const flagged = attempt.flagged.includes(question.id) ? attempt.flagged.filter(id => id !== question.id) : [...attempt.flagged, question.id];
    attempt = { ...attempt, flagged }; persist();
  }
  function syncCompletion() {
    const app = getApplicationFor($currentUser?.email);
    if (!app) return;
    app.application_status = 'exam_completed'; app.exam_status = 'completed';
    app.exam_result = { ...scoreAttempt(paper, attempt), submitted_at: new Date(attempt.submittedAt).toISOString() };
    saveApplicationFor($currentUser.email, app);
  }
  function submit(automatic = false) {
    if (!attempt || attempt.submittedAt) return;
    attempt = { ...attempt, submittedAt: Date.now(), automatic };
    remaining = remainingSeconds(attempt);
    persist(); syncCompletion(); confirmOpen = false; instructionsOpen = false; review = false;
  }
  function restart() {
    if (!window.confirm('Start a fresh demo attempt? This replaces this student’s saved exam answers and result.')) return;
    try { localStorage.removeItem(key); } catch { storageError = 'Could not clear the previous saved attempt.'; return; }
    attempt = null; review = false; agreed = false; remaining = paper.durationMinutes * 60;
    const app = getApplicationFor($currentUser.email);
    app.application_status = 'payment_done'; app.exam_status = 'ready'; delete app.exam_result;
    saveApplicationFor($currentUser.email, app);
  }
  function state(q) {
    if (review) return attempt.answers[q.id] === undefined ? 'unvisited' : attempt.answers[q.id] === q.answer ? 'answered' : 'unanswered';
    if (attempt.flagged.includes(q.id)) return 'flagged';
    if (attempt.answers[q.id] !== undefined) return 'answered';
    return attempt.visited.includes(q.id) ? 'unanswered' : 'unvisited';
  }
</script>

<svelte:head><title>Entrance Examination — Hong Bang International University</title></svelte:head>
<svelte:window on:beforeunload={leaveWarning} on:focus={updateClock} />

<div class="exam-page">
  <div class="exam-topline"><span>ADMISSIONS 2026 <span class="slash">/</span> ENTRANCE EXAMINATION</span><span class="demo-badge">DEMONSTRATION</span></div>
  {#if storageError}<div class="alert error" role="alert">{storageError}</div>{/if}
  {#if notice}<div class="alert" role="status">{notice}</div>{/if}
  {#if !ready}
    <p class="loading">Preparing your examination…</p>
  {:else if !allowed}
    <section class="intro-card"><span class="eyebrow">ONE MORE STEP</span><h1>Complete your application payment</h1><p>Your entrance examination unlocks after the application fee is paid.</p><a class="primary action" href="/app/dashboard">Return to dashboard →</a></section>
  {:else if !attempt}
    <div class="intro-grid">
      <section class="intro-card">
        <span class="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
        <h1>Ready to put your<br />knowledge to the test?</h1>
        <p class="lead">Welcome, {$currentUser?.name}. Take a moment to read the instructions before you begin your medical entrance examination.</p>
        <div class="metrics"><div><strong>30</strong><span>Questions</span></div><div><strong>45 <small>min</small></strong><span>Time allowed</span></div><div><strong>120</strong><span>Maximum marks</span></div></div>
        <h2>Before you begin</h2>
        <ol class="instructions"><li>Choose one answer for each question. You can change or clear an answer before submitting.</li><li>Move freely between Physics, Chemistry, and Biology. Flag questions to return to them later.</li><li>Each correct answer earns <b>4 marks</b>. An incorrect answer deducts <b>1 mark</b>. Unanswered questions earn 0.</li><li>The timer starts when you begin and continues if you refresh or leave. At zero, your saved answers submit automatically.</li><li>Answers save automatically in this browser. Review your responses before the final submission.</li></ol>
        <div class="demo-note">A shortened NEET-based practice paper prepared for this demonstration. This is not an official NEET examination.</div>
        <div class="exam-ready-actions"><label class="agreement"><input type="checkbox" bind:checked={agreed} /> <span>I have read the instructions and I’m ready to begin.</span></label>
        <button class="primary action" disabled={!agreed} on:click={start}>Begin examination <span>→</span></button></div>
      </section>
      <aside class="candidate-card"><div class="candidate-avatar">{$currentUser?.name?.charAt(0).toUpperCase()}</div><span class="eyebrow">CANDIDATE DETAILS</span><h2>{$currentUser?.name}</h2><p>{$currentUser?.email}</p><div class="candidate-detail"><span>Application reference</span><strong>{generateReferenceNumber($currentUser?.email)}</strong></div><div class="candidate-detail"><span>Examination</span><strong>Medical Entrance</strong></div><div class="candidate-detail"><span>Language</span><strong>English</strong></div><div class="candidate-detail"><span>Payment status</span><strong class="green">✓ Confirmed</strong></div><div class="subject-preview"><h3>Your paper covers</h3>{#each subjects as subject,i}<div><span class="subject-dot s{i}"></span>{subject}<span>10 questions</span></div>{/each}</div><a href="/app/dashboard" class="back-link">← Back to dashboard</a></aside>
    </div>
  {:else if result && !review}
    <section class="result-card">
      <div class="success-seal">✓</div><span class="eyebrow">EXAMINATION COMPLETED</span><h1>Well done, {$currentUser?.name?.split(' ')[0]}.</h1><p>{attempt.automatic ? 'Time is up. Your saved answers have been submitted automatically.' : 'Your responses have been submitted successfully.'}</p>
      <div class="score-display"><strong>{result.score}</strong><span>/ {result.maximum}</span><p>Your total score</p></div>
      <div class="result-metrics"><div><strong class="green">{result.correct}</strong><span>Correct</span></div><div><strong class="red">{result.incorrect}</strong><span>Incorrect</span></div><div><strong>{result.unanswered}</strong><span>Unanswered</span></div><div><strong>{answered ? Math.round(result.correct / answered * 100) : 0}%</strong><span>Accuracy</span></div></div>
      <div class="subject-results">{#each subjects as subject}{@const qs = paper.questions.filter(q => q.subject === subject)}<div><strong>{subject}</strong><span>{qs.filter(q => attempt.answers[q.id] === q.answer).length} / {qs.length} correct</span></div>{/each}</div>
      <p class="result-note">Demo results are shown immediately for this presentation.</p>
      <div class="result-actions"><button class="primary action" on:click={() => { review = true; }}>Review answers →</button><a class="secondary action" href="/app/dashboard">Dashboard</a><a class="secondary action" href="/app/application?view=readonly">View application</a></div><button class="text-button" on:click={restart}>Start a fresh demo attempt</button>
    </section>
  {:else}
    <header class="exam-heading"><div><span class="eyebrow">{review ? 'YOUR RESPONSE SHEET' : 'MEDICAL ENTRANCE • ENGLISH'}</span><h1>{review ? 'Review your answers' : 'Entrance Examination'}</h1></div>{#if review}<button class="secondary action" on:click={() => review = false}>← Back to results</button>{:else}<div class:urgent={remaining <= 600} class="timer" role="timer" aria-label="Time remaining"><span>TIME REMAINING</span><strong>{clock}</strong></div>{/if}</header>
    {#if !review && remaining <= 600}<div class="alert" role="status">Less than 10 minutes remaining. Review your answers and submit before the timer ends.</div>{/if}
    <div class="exam-grid">
      <div class="question-column">
        <nav class="subject-tabs" aria-label="Exam subjects">{#each subjects as subject}<button class:active={question.subject === subject} on:click={() => navigate(paper.questions.findIndex(q => q.subject === subject))}>{subject}<span>{paper.questions.filter(q => q.subject === subject && attempt.answers[q.id] !== undefined).length}/10</span></button>{/each}</nav>
        <section class="question-card" aria-label="Current question">
          <div class="question-meta"><span>QUESTION {String(attempt.current + 1).padStart(2,'0')} <span class="muted">OF {paper.questions.length}</span></span><span class="marks"><b>+4</b><span>−1</span></span></div>
          <div class="topic">{question.subject} <span>•</span> {question.topic}</div>
          <h2 tabindex="-1" bind:this={questionHeading}>{question.text}</h2>
          <fieldset disabled={review}><legend class="sr-only">Choose one answer</legend>{#each question.options as option,i}<label class="answer-option" class:selected={attempt.answers[question.id] === i} class:correct={review && question.answer === i} class:wrong={review && attempt.answers[question.id] === i && question.answer !== i}><input type="radio" name={question.id} value={i} checked={attempt.answers[question.id] === i} on:change={() => choose(i)} /><span class="option-letter">{String.fromCharCode(65+i)}</span><span>{option}</span>{#if review && question.answer === i}<span class="option-verdict">✓ Correct</span>{/if}</label>{/each}</fieldset>
          {#if review}<div class="explanation"><strong>{attempt.answers[question.id] === undefined ? 'Not answered' : attempt.answers[question.id] === question.answer ? 'Correct answer' : 'Incorrect answer'}</strong><p>{question.explanation}</p><a href={paper.sources.find(s => s.id === question.sourceId)?.url} target="_blank" rel="noreferrer">Question source ↗</a></div>{:else}<div class="question-tools"><button class:marked={attempt.flagged.includes(question.id)} on:click={flag}>{attempt.flagged.includes(question.id) ? '⚑ Marked for review' : '⚑ Mark for review'}</button><button disabled={attempt.answers[question.id] === undefined} on:click={() => choose(undefined)}>Clear response</button></div>{/if}
        </section>
        <div class="question-navigation"><button class="secondary action" disabled={attempt.current === 0} on:click={() => navigate(attempt.current - 1)}>← Previous</button>{#if !review}<button class="submit-shortcut" on:click={() => confirmOpen = true}>Finish exam</button>{/if}<span class="save-status">{review ? 'Read-only response sheet' : storageError ? 'Saved in this tab only' : '✓ Answers saved automatically'}</span>{#if attempt.current < paper.questions.length - 1}<button class="primary action" on:click={() => navigate(attempt.current + 1)}>{review ? 'Next question' : 'Save & next'} →</button>{:else if !review}<button class="primary action" on:click={() => confirmOpen = true}>Review & submit →</button>{:else}<button class="primary action" on:click={() => review = false}>View results →</button>{/if}</div>
      </div>
      <aside class="palette-card"><div class="palette-candidate"><div class="mini-avatar">{$currentUser?.name?.charAt(0).toUpperCase()}</div><div><strong>{$currentUser?.name}</strong><span>{generateReferenceNumber($currentUser?.email)}</span></div></div><div class="progress-label"><span>{review ? 'Questions attempted' : 'Your progress'}</span><strong>{answered}/{paper.questions.length}</strong></div><div class="progress-track"><div style={`width:${answered / paper.questions.length * 100}%`}></div></div><div class="palette-title"><h2>Question palette</h2>{#if !review}<button on:click={() => instructionsOpen = true} aria-label="Read exam instructions">ⓘ</button>{/if}</div>
        {#each subjects as subject}<div class="palette-section"><h3>{subject}</h3><div class="number-grid">{#each paper.questions as q,i}{#if q.subject === subject}<button class={`number ${state(q)}`} class:current={attempt.current === i} aria-label={`Question ${i+1}, ${state(q)}`} aria-current={attempt.current === i ? 'step' : undefined} on:click={() => navigate(i)}>{i+1}{#if attempt.flagged.includes(q.id) && attempt.answers[q.id] !== undefined && !review}<span class="answered-dot"></span>{/if}</button>{/if}{/each}</div></div>{/each}
        <div class="legend"><span><i class="answered"></i>{review ? 'Correct' : 'Answered'}</span><span><i class="unanswered"></i>{review ? 'Incorrect' : 'Not answered'}</span>{#if !review}<span><i class="flagged"></i>For review</span>{/if}<span><i class="unvisited"></i>{review ? 'Unanswered' : 'Not visited'}</span></div>{#if !review}<button class="primary action submit-button" on:click={() => confirmOpen = true}>Submit examination →</button><p class="palette-note">You can review all responses before submitting.</p>{/if}
      </aside>
    </div>
  {/if}
  {#if confirmOpen || instructionsOpen}
    <div class="exam-overlay"><section class="exam-dialog" use:focusDialog role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabindex="-1"><span class="eyebrow">{confirmOpen ? 'FINAL CHECK' : 'EXAMINATION GUIDE'}</span><h2 id="dialog-title">{confirmOpen ? 'Ready to submit?' : 'Keep these in mind'}</h2>{#if confirmOpen}<p>You have answered <b>{answered} of {paper.questions.length}</b> questions.</p><div class="submission-summary"><div><strong>{paper.questions.length - answered}</strong><span>Unanswered</span></div><div><strong>{attempt.flagged.length}</strong><span>Marked for review</span></div></div><p>All selected answers count, including answers marked for review. After submission, your responses are final.</p><div class="dialog-actions"><button class="secondary action" on:click={() => confirmOpen = false}>Keep reviewing</button><button class="primary action" on:click={() => submit()}>Confirm submission</button></div>{:else}<p>30 questions · 45 minutes · +4 correct · −1 incorrect · 0 unanswered.</p><p>Use the palette to jump to a question. Flag questions for later. Responses save immediately; the timer keeps running when you leave. The exam automatically submits when time expires.</p><button class="primary action" on:click={() => instructionsOpen = false}>Back to examination</button>{/if}</section></div>
  {/if}
</div>

<style>
  .exam-ready-actions{position:fixed;bottom:0;left:0;right:0;z-index:110;background:#fffffff5;backdrop-filter:blur(10px);padding:13px max(24px,calc((100vw - 1120px)/2));border-top:1px solid #dfe5d3;display:flex;justify-content:space-between;align-items:center;gap:20px}.exam-ready-actions .agreement{margin:0;font-size:13px}.exam-ready-actions .action{flex-shrink:0}.submit-shortcut{font-size:13px;color:#963d43;text-decoration:underline;text-underline-offset:3px}.exam-page:has(.exam-ready-actions){padding-bottom:95px}@media(max-width:700px){.exam-ready-actions{padding:12px 16px;gap:14px}.exam-ready-actions .agreement{font-size:12px;line-height:1.5;align-items:flex-start;gap:7px}.exam-ready-actions .agreement input{flex-shrink:0}.exam-ready-actions .action{font-size:13px;padding:10px 12px}.submit-shortcut{font-size:12px}}

  .exam-page{min-height:calc(100vh - 76px);background:#f7f8f3;padding:24px max(24px,calc((100vw - 1320px)/2)) 50px;color:#43513a;font-size:16px}.exam-topline{display:flex;justify-content:space-between;align-items:center;font-size:13px;letter-spacing:1.5px;font-weight:700;color:#71829b;margin:0 0 16px}.slash{margin:0 12px;color:#b2becd}.demo-badge{color:#92702b;border:1px solid #ead9ad;background:#fff9eb;padding:4px 10px;border-radius:5px;font-size:12px}.eyebrow{display:block;font-size:13px;letter-spacing:1.6px;font-weight:700;color:#788d65;margin-bottom:12px}h1{font-family:'DM Serif Display',Georgia,serif;font-size:32px;font-weight:400;line-height:1.2;letter-spacing:-1px;color:#354130}h2{font-size:18px}p{color:#758297;line-height:1.8}.intro-grid{display:grid;grid-template-columns:minmax(0,1fr) 310px;gap:24px;max-width:1120px;margin:35px auto}.intro-card,.candidate-card,.question-card,.palette-card,.result-card{background:#fff;border:1px solid #e1e6d5;border-radius:14px;box-shadow:0 4px 18px #182d4810}.intro-card{padding:42px}.intro-card .lead{font-size:16px;max-width:590px;margin:20px 0}.metrics{display:flex;background:#f7f8ef;border-radius:9px;margin:28px 0;padding:22px 0}.metrics>div{flex:1;text-align:center;border-right:1px solid #dde5ee}.metrics>div:last-child{border:0}.metrics strong{display:block;font-size:29px;line-height:1.25}.metrics span,.metrics small{font-size:13px;color:#74849a;font-weight:500}.instructions{list-style:decimal;padding-left:18px;margin:15px 0}.instructions li{padding:0 0 11px 8px;color:#69798e;font-size:14px;line-height:1.8}.instructions b{color:#344b68}.demo-note{font-size:13px;background:#f8fafc;color:#7e8da0;padding:12px 15px;border-radius:6px;margin-top:12px}.agreement{display:flex;align-items:center;gap:10px;margin:22px 0;font-size:14px;color:#6d7a61}.agreement input{width:16px;height:16px;accent-color:#963d43}.action{display:inline-flex;align-items:center;justify-content:center;gap:16px;padding:12px 20px;border-radius:7px;font-size:14px;font-weight:600;line-height:1.5;text-decoration:none;transition:.15s}.primary{background:#963d43;color:#fff;border:1px solid #963d43}.primary:hover{background:#7a3036;color:white}.secondary{background:white;color:#48617e;border:1px solid #d9e1eb}.secondary:hover{background:#f2f6fb}button:disabled{opacity:.4;cursor:not-allowed}.candidate-card{padding:30px 25px;align-self:start;text-align:center;border-top:3px solid #d4af57}.candidate-avatar,.mini-avatar{display:grid;place-items:center;background:#f4eee5;color:#8f7556;font-weight:700;border-radius:50%}.candidate-avatar{width:64px;height:64px;font-size:25px;margin:0 auto 23px}.candidate-card h2{font-size:21px}.candidate-card p{font-size:13px;overflow-wrap:anywhere}.candidate-card .eyebrow{font-size:12px}.candidate-detail{display:flex;flex-direction:column;gap:4px;text-align:left;border-bottom:1px solid #eef1f6;padding:15px 0}.candidate-detail span{font-size:13px;color:#8c98a8}.candidate-detail strong{font-size:14px;font-weight:600}.green{color:#259178!important}.red{color:#c76163!important}.subject-preview{text-align:left;margin-top:22px}.subject-preview h3{font-size:13px;margin-bottom:15px}.subject-preview>div{display:flex;align-items:center;font-size:13px;margin:13px 0;gap:8px}.subject-preview>div>span:last-child{margin-left:auto;color:#98a4b2;font-size:13px}.subject-dot{width:7px;height:7px;border-radius:50%;background:#5d87b2}.s1{background:#af8a54}.s2{background:#539887}.back-link{display:block;font-size:13px;margin-top:25px;color:#8d9cb0}.exam-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}.exam-heading h1{font-size:27px}.exam-heading .eyebrow{margin-bottom:7px;font-size:12px}.timer{display:flex;align-items:center;gap:20px;background:white;border:1px solid #e1e6d5;border-radius:9px;padding:12px 20px}.timer span{font-size:12px;letter-spacing:1px;color:#7b8da5}.timer strong{font-size:24px;letter-spacing:2px;font-variant-numeric:tabular-nums}.timer.urgent{border-color:#f0b4af;background:#fff4f3;color:#bd5151}.exam-grid{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:24px}.subject-tabs{display:flex;gap:5px;border-bottom:1px solid #e1e6d5;margin-bottom:14px}.subject-tabs button{padding:13px 22px;color:#7c8870;font-size:14px;border-bottom:3px solid transparent;font-weight:600}.subject-tabs button.active{color:#963d43;border-bottom-color:#963d43}.subject-tabs button span{font-size:12px;margin-left:12px;color:#9cabbc}.question-card{padding:24px 28px;min-height:0}.question-meta{display:flex;justify-content:space-between;align-items:center;font-size:13px;letter-spacing:1.2px;font-weight:700}.muted{color:#a8b4c3;margin-left:5px}.marks{display:flex;gap:7px;letter-spacing:0}.marks b,.marks>span{padding:3px 8px;border-radius:4px;background:#eef8f3;color:#46846e;font-weight:500}.marks>span{background:#fff1f0;color:#ba7975}.topic{font-size:13px;color:#76846b;margin:12px 0}.topic span{margin:0 7px}.question-card h2{font-size:18px;line-height:1.7;font-weight:500;letter-spacing:-.2px;margin-bottom:18px;outline:none}.question-card fieldset{border:0;display:grid;gap:9px;min-width:0}.answer-option{display:flex;align-items:center;gap:14px;border:1px solid #e3e7d9;border-radius:8px;padding:10px 15px;cursor:pointer;font-size:15px;color:#6b785e;transition:.15s}.answer-option:hover{background:#f7f9fc}.answer-option.selected{border-color:#c2978b;background:#fbf3ef;color:#963d43}.answer-option input{accent-color:#963d43;flex-shrink:0;width:14px;height:14px}.option-letter{border:1px solid #e2e7d7;background:white;border-radius:5px;width:26px;height:26px;display:grid;place-items:center;font-size:13px;flex-shrink:0}.answer-option.correct{border-color:#80bca4;background:#f0faf5}.answer-option.wrong{border-color:#dba2a2;background:#fff3f1}.option-verdict{margin-left:auto;font-size:13px;color:#288465;white-space:nowrap}.question-tools{display:flex;justify-content:space-between;margin-top:18px;padding-top:14px;border-top:1px solid #ecefe3}.question-tools button{font-size:13px;color:#8d9aab}.question-tools .marked{color:#8c67b4}.question-navigation{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:20px}.save-status{color:#94a5a8;font-size:13px}.palette-card{align-self:start;padding:23px}.palette-candidate{display:flex;align-items:center;gap:11px;border-bottom:1px solid #ecefe3;padding-bottom:20px;margin-bottom:20px}.mini-avatar{width:38px;height:38px;flex-shrink:0}.palette-candidate strong{display:block;font-size:14px;overflow-wrap:anywhere}.palette-candidate span{display:block;font-size:12px;color:#9aa8b9;margin-top:3px}.progress-label{display:flex;justify-content:space-between;font-size:13px;color:#8b9aae}.progress-label strong{color:#697f54}.progress-track{height:4px;background:#eaf0df;border-radius:3px;margin:10px 0 23px}.progress-track>div{height:100%;background:#8fa970;border-radius:3px;transition:width .2s}.palette-title{display:flex;justify-content:space-between;align-items:center}.palette-title h2{font-size:14px}.palette-title button{color:#8da1bb}.palette-section{margin-top:18px}.palette-section h3{font-size:12px;text-transform:uppercase;color:#91a0b3;letter-spacing:1px;margin-bottom:10px}.number-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}.number{height:33px;border:1px solid #e2e7d7;border-radius:6px;font-size:13px;position:relative}.number.current{outline:2px solid #963d43;outline-offset:2px}.answered{background:#e2f3eb!important;border-color:#cae7d8!important;color:#36816b}.unanswered{background:#fbece9!important;border-color:#f0d6d0!important;color:#bb7768}.flagged{background:#eee7f8!important;border-color:#e0d2f1!important;color:#8c65b1}.unvisited{background:#f6f8f0!important;color:#9aa9bb}.answered-dot{position:absolute;right:2px;top:2px;background:#26997b;border:1px solid white;width:7px;height:7px;border-radius:50%}.legend{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:22px 0;font-size:11px;color:#8a99ad}.legend span{display:flex;gap:6px;align-items:center}.legend i{display:inline-block;width:12px;height:12px;border:1px solid #e2e7d7;border-radius:3px}.submit-button{width:100%;font-size:13px;padding-left:10px;padding-right:10px}.palette-note{font-size:12px;text-align:center;margin-top:12px}.result-card{max-width:730px;margin:40px auto;padding:40px 50px;text-align:center}.success-seal{display:grid;place-items:center;width:55px;height:55px;border-radius:50%;background:#e6f6ee;color:#388e71;margin:0 auto 20px;font-size:25px}.result-card>p{margin:15px 0;font-size:14px}.result-card h1{font-size:30px}.score-display{margin:30px auto;background:#f7f8ef;padding:18px;border-radius:10px}.score-display>strong{font-size:58px;font-weight:600;letter-spacing:-2px}.score-display>span{font-size:23px;color:#9baabc;margin-left:6px}.score-display p{font-size:13px;margin-top:-5px}.result-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:30px}.result-metrics strong{display:block;font-size:23px}.result-metrics span{font-size:13px;color:#8c9aae}.subject-results{border-top:1px solid #e5eaf1}.subject-results>div{display:flex;justify-content:space-between;border-bottom:1px solid #e5eaf1;padding:13px 0;font-size:13px}.subject-results span{color:#8a99ad}.result-actions{display:flex;justify-content:center;gap:12px}.text-button{font-size:13px;color:#8d9db1;text-decoration:underline;margin-top:22px}.result-note{font-size:13px!important}.explanation{margin-top:24px;background:#f6f9fc;padding:18px;border-radius:8px;font-size:14px}.explanation p{margin:5px 0;font-size:14px}.explanation a{font-size:13px;color:#6b89a8}.alert{background:#fff7e5;border:1px solid #eedcb4;color:#9d762e;font-size:14px;padding:12px 18px;border-radius:8px;margin-bottom:20px}.alert.error{background:#fff1ef;color:#b14d45;border-color:#efc7c1}.exam-overlay{position:fixed;inset:0;background:#14253c99;backdrop-filter:blur(4px);z-index:2000;display:grid;place-items:center;padding:24px}.exam-dialog{background:white;border-radius:15px;width:100%;max-width:510px;padding:35px;box-shadow:0 20px 80px #10223840}.exam-dialog h2{font-size:25px;margin-bottom:15px}.exam-dialog p{font-size:14px;margin:15px 0}.submission-summary{display:flex;gap:30px;background:#f5f7fb;padding:18px;border-radius:8px}.submission-summary strong{display:block;font-size:25px}.submission-summary span{font-size:13px;color:#8294a9}.dialog-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:25px}.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}button:focus-visible,a:focus-visible,label:focus-within{outline:2px solid #b48b77;outline-offset:3px}.loading{text-align:center;padding:80px}
  @media(min-width:1600px){.exam-page{padding-top:35px}.exam-grid{gap:30px}.question-card{min-height:520px}.answer-option{padding:18px}.question-card h2{margin-bottom:32px}}
  @media(max-width:950px){.intro-grid{grid-template-columns:1fr 260px;gap:16px}.intro-card{padding:28px}.intro-card h1{font-size:28px}.exam-grid{grid-template-columns:minmax(0,1fr) 245px;gap:16px}.palette-card{padding:18px}.question-card{padding:25px}.subject-tabs button{padding:12px 14px}.subject-tabs button span{margin-left:6px}.save-status{display:none}.number-grid{gap:7px}}
  @media(max-width:700px){.exam-page{padding:18px 16px 35px}.exam-topline{font-size:11px;letter-spacing:.7px}.demo-badge{font-size:11px}.intro-grid,.exam-grid{grid-template-columns:1fr}.intro-grid{margin:20px auto}.candidate-card{order:-1;text-align:left;padding:18px}.candidate-card .candidate-avatar,.candidate-card .candidate-detail,.candidate-card .subject-preview,.candidate-card .back-link,.candidate-card>.eyebrow{display:none}.candidate-card h2{font-size:18px}.intro-card{padding:25px}.intro-card h1{font-size:27px}.exam-heading h1{font-size:21px}.timer{padding:9px 12px;gap:0;flex-direction:column}.timer strong{font-size:21px}.timer span{font-size:10px}.subject-tabs{justify-content:space-between}.subject-tabs button{padding:12px 10px}.question-card{padding:22px 19px;min-height:0}.question-card h2{font-size:18px}.answer-option{font-size:14px;padding:13px 12px;gap:10px}.palette-card{margin-top:10px}.palette-candidate{display:none}.number-grid{grid-template-columns:repeat(10,1fr);gap:7px}.number{height:30px}.legend{font-size:13px}.result-card{padding:30px 22px;margin:20px auto}.result-card h1{font-size:27px}.result-metrics{gap:5px}.result-metrics strong{font-size:21px}.result-actions{flex-wrap:wrap}.dialog-actions{flex-direction:column}.exam-dialog{padding:25px}.option-verdict{font-size:12px}.question-navigation .action{padding:11px 14px;font-size:13px}}
  @media(max-width:390px){.number-grid{grid-template-columns:repeat(5,1fr)}.subject-tabs button{padding:12px 6px}.option-letter{display:none}}
</style>

