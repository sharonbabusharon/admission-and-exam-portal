export function remainingSeconds(attempt, now = Date.now()) {
  return Math.max(0, Math.ceil((attempt.deadline - now) / 1000));
}

export function createAttempt(paper, now = Date.now()) {
  return { paperId: paper.id, startedAt: now, deadline: now + paper.durationMinutes * 60000,
    answers: {}, flagged: [], visited: [paper.questions[0].id], current: 0, submittedAt: null };
}

export function scoreAttempt(paper, attempt) {
  let correct = 0, incorrect = 0;
  for (const q of paper.questions) {
    const answer = attempt.answers[q.id];
    if (answer === undefined) continue;
    if (answer === q.answer) correct++; else incorrect++;
  }
  return { correct, incorrect, unanswered: paper.questions.length - correct - incorrect,
    score: correct * paper.marking.correct + incorrect * paper.marking.incorrect,
    maximum: paper.questions.length * paper.marking.correct };
}

export function validAttempt(value, paper) {
  return value && value.paperId === paper.id && Number.isFinite(value.startedAt) &&
    Number.isFinite(value.deadline) && value.deadline > value.startedAt &&
    Number.isInteger(value.current) && value.current >= 0 && value.current < paper.questions.length &&
    value.answers && typeof value.answers === 'object' && !Array.isArray(value.answers) &&
    Object.entries(value.answers).every(([id, answer]) => paper.questions.some(q => q.id === id) && Number.isInteger(answer) && answer >= 0 && answer < 4) &&
    Array.isArray(value.flagged) && Array.isArray(value.visited) &&
    (value.submittedAt === null || Number.isFinite(value.submittedAt));
}
