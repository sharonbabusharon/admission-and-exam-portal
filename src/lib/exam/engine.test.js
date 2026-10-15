import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createAttempt, remainingSeconds, scoreAttempt, validAttempt } from './engine.js';

const paper = JSON.parse(readFileSync(new URL('../data/exam-paper.json', import.meta.url), 'utf8'));

test('question bank has unique IDs, four distinct options and documented sources', () => {
  assert.equal(paper.questions.length, 30);
  assert.equal(new Set(paper.questions.map(q => q.id)).size, 30);
  for (const q of paper.questions) {
    assert.equal(new Set(q.options).size, 4);
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4);
    assert.ok(paper.sources.find(s => s.id === q.sourceId && s.url.startsWith('https://')));
  }
  for (const subject of ['Physics', 'Chemistry', 'Biology']) {
    assert.equal(paper.questions.filter(q => q.subject === subject).length, 10);
  }
});

test('saved deadlines survive serialisation and elapsed time never goes negative', () => {
  const attempt = createAttempt(paper, 1000);
  const restored = JSON.parse(JSON.stringify(attempt));
  assert.equal(remainingSeconds(restored, 61000), 2640);
  assert.equal(remainingSeconds(restored, restored.deadline), 0);
  assert.equal(remainingSeconds(restored, restored.deadline + 60000), 0);
});

test('scoring counts unanswered and negative marks correctly', () => {
  const attempt = createAttempt(paper);
  const [a, b] = paper.questions;
  attempt.answers = { [a.id]: a.answer, [b.id]: (b.answer + 1) % 4 };
  assert.deepEqual(scoreAttempt(paper, attempt), {correct: 1, incorrect: 1, unanswered: 28, score: 3, maximum: 120});
  attempt.flagged = [a.id];
  assert.equal(scoreAttempt(paper, attempt).score, 3);
});

test('blank, perfect and all-wrong submissions produce expected scores', () => {
  const attempt = createAttempt(paper);
  assert.equal(scoreAttempt(paper, attempt).score, 0);
  attempt.answers = Object.fromEntries(paper.questions.map(q => [q.id, q.answer]));
  assert.equal(scoreAttempt(paper, attempt).score, 120);
  attempt.answers = Object.fromEntries(paper.questions.map(q => [q.id, (q.answer + 1) % 4]));
  assert.equal(scoreAttempt(paper, attempt).score, -30);
});

test('invalid storage cannot load a different paper or out-of-range responses', () => {
  const attempt = createAttempt(paper);
  assert.ok(validAttempt(attempt, paper));
  assert.ok(!validAttempt({...attempt, paperId:'old-paper'}, paper));
  assert.ok(!validAttempt({...attempt, current:30}, paper));
  assert.ok(!validAttempt({...attempt, answers:{q01:4}}, paper));
  assert.ok(!validAttempt({...attempt, answers:{unknown:0}}, paper));
});
