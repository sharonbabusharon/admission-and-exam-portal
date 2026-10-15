# Admissions and exam demo

Run `npm run dev`, then open http://localhost:17606.

## Presentation walkthrough

1. Choose **Sign Up**, enter a name and email, and use the demo OTP displayed in the modal.
2. Open **Start Your Application** and complete the existing form.
3. Submit the application, choose **Continue with Payment**, and confirm the simulated payment.
4. The exam instructions open immediately. Accept the instructions and choose **Begin examination**.
5. Answer questions, switch subjects, use the numbered palette, mark a question for review, or clear a response.
6. Choose **Submit examination**, review the unanswered count, and confirm. Scores and answer explanations are available immediately.
7. Use **Start a fresh demo attempt** on the results screen to repeat the presentation without repeating payment.

## Exam configuration

- 30 questions: 10 Physics, 10 Chemistry, 10 Biology.
- 45 minutes. Correct +4, incorrect −1, unanswered 0. Maximum 120.
- A fixed deadline and selected answers are saved in this browser, separately for each student. Refreshing preserves progress. Leaving does not pause the timer; expired attempts submit on returning.
- Attempts and payment are browser simulations. The answer key is intentionally bundled with the frontend for this demo.
- Existing already-paid students can choose **Continue with Entrance Exam** from the dashboard.

Question content and settings: `src/lib/data/exam-paper.json`.
Each question includes its source ID, options, zero-based answer index and explanation. Source URLs are listed in the same file and linked from answer review.

The shortened paper uses reworded selections from the NEET UG 2024 R1 paper and SATHEE IIT Kanpur NEET/AIPMT collections. Some options were supplied or reordered. It is not a complete official NEET paper; collection year labels are not independently authenticated.

## Checks

Run `node --test src/lib/exam/engine.test.js` for question-bank, scoring, persistence and timer checks. Run `npm run build` for a production build.

Browser walkthrough verified signup, the application/payment handoff, answer changes, review flags, refresh recovery, submission, read-only review, dashboard results, restarting, expired-timer submission, payment gating and mobile layout.

## UI and presentation

The public website, applicant dashboard, registration dialog, form, payment dialog and exam share a warm ivory, charcoal and university red palette. Fonts are served locally. Campus photography is retained locally from the university website.

Application navigation stays fixed at the bottom, including Save & exit. The exam start controls remain visible, and Finish exam is available next to question navigation. Program selections on the public page prefill the application when it starts.

Design research: [Full Fabric applicant portals](https://www.fullfabric.com/products/student-application-management-system), [Niche registration case study](https://jordanluevano.com/niche), [CCCApply case study](https://johnpastordesign.com/project/cccapply-application-ux-ui-design), and the supplied registration screenshots. These informed the task hierarchy, form density and branded applicant journey.

Campus image source: https://hiu.vn/wp-content/uploads/2020/02/IMG_1066.jpg. Fonts: DM Sans and DM Serif Display from Google Fonts.
