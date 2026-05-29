/* =========================================================================
   DAY 4 — STUDY LOG
   Vardhan | Namaste JavaScript (Akshay Saini) | Month 1: JS Depth
   Date: Sat, 30 May 2026
   Episode: Ep 6 — "undefined vs not defined in JS"
   ========================================================================= */


/* -------------------------------------------------------------------------
   0. WHAT HAPPENED TODAY
   -------------------------------------------------------------------------
   - Q7 (Day-3 carryover: outer/inner scope-chain assignment) was DROPPED
     by your choice. NOTE: the concept underneath it (a failed scope-chain
     lookup) reappears as Ep 6's "not defined", so it is not truly skipped.
   - Ran Ep 6 first as an informal DIAGNOSTIC PRETEST (section 2).
   - Then formalised it into a FIXED 10-question quiz (section 3).
   - Negotiated and locked a NEW QUIZ CONTRACT (section 4).
   - Cleared up Ep numbering confusion: the YouTube playlist has an intro
     video at slot 1, so "Ep 6" physically sits at playlist position 7.
     Navigate by the TITLE ("undefined vs not defined"), not the slot number.

   CURRENT STATUS:
   - Formal Ep 6 quiz PAUSED at Q6/10. Q1–Q5 graded below.
   - This is still PRE-WATCH. Ep 6 video not yet watched.
   ------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------
   1. CONCEPTS CRYSTALLISED (Day 4)
   -------------------------------------------------------------------------
   1. `undefined` is a REAL VALUE, not "empty" and not "nothing".
      It is the engine's PLACEHOLDER, written into a variable's memory slot
      during the CREATION (memory) phase, before any line of code runs.
      It means: "this name is declared but not yet assigned a value."

   2. `not defined` is NOT a value. It is the state of a name that was never
      declared anywhere reachable. Accessing it -> ReferenceError.

   3. THE PIVOT IS DECLARATION:
        declared      -> exists in memory -> reading it returns its value
                         (possibly `undefined`)
        never declared -> no record exists -> reading it throws (not defined)

   4. `typeof undefined` -> "undefined" (a STRING).
      undefined has its OWN dedicated type. That is the proof it is a real
      value ("something"), not absence.

   5. `var p;` with NO initializer is a RUNTIME NO-OP:
        - the DECLARATION half was already handled in the creation phase
        - there is no initializer to execute, so the line does nothing at runtime
      `var p = 5;` is NOT a no-op:
        - declaration half: still creation-phase (no-op by itself)
        - INITIALIZER `= 5`: this is the part that actually executes at runtime
      => the only difference is the initializer.

   6. An UNCAUGHT ReferenceError HALTS execution. Lines after the throw do
      not run.

   7. There is only ONE `undefined`. Whether the engine sets it (creation
      phase) or you assign it manually, it is the same value.

   8. Manually assigning `x = undefined` is BAD PRACTICE. It destroys the
      engine's signal of "not yet assigned" — you can no longer tell
      "engine never touched this" from "I deliberately emptied it".
      (For deliberate emptiness there is a separate value, `null` — file away,
       it is beyond this episode.)

   9. A `var` declared INSIDE a function exists only inside that function's
      context. Accessing it from outside -> not defined.

   10. VOCAB PRECISION: the term is "ALLOCATED" (space reserved in the
       creation phase), not "stored". Then the placeholder `undefined` is
       placed into that allocated slot.
   ------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------
   2. PRE-QUIZ DIAGNOSTIC (informal, before the fixed quiz)
   ------------------------------------------------------------------------- */

/* D1 ─────────────────────────────────────────────────────────
     console.log(a);   // line 1
     var a = 5;
     console.log(a);   // line 3
     console.log(b);   // line 4   (b never declared)

   OUTPUT:
     undefined
     5
     ReferenceError: b is not defined   // line 4 throws; halts here

   SCORE: 6/10  (trace correct; you SKIPPED the required justification of
                 "undefined" vs "not defined" — the actual point of Ep 6)
*/

/* D1b — definition check: "what is undefined vs not defined?"
   MISCONCEPTION CAUGHT: you called undefined an "empty value".
   FIX: undefined is not empty/absence — it is a present placeholder VALUE
        that the engine puts into the slot.
   SCORE: 7/10
*/

/* D1c — `typeof undefined` -> "undefined"; therefore undefined is "something".
   (Teacher note: I over-drilled this single 5-second fact across turns and
    owned it. Fact itself is locked.)
*/

/* D2 ─────────────────────────────────────────────────────────
     console.log(p);   // 1
     var p;            // declared, NO initializer
     console.log(p);   // 2
     p = 7;
     console.log(p);   // 3

   OUTPUT:
     undefined
     undefined
     7

   SCORES:
     trace ............................. 10/10
     "why is `var p;` a no-op" ..........  8/10  (you said "already declared";
                                                  missed the "no initializer" half)
     follow-up: if it were `var p = 5;`?   9/10  (correct: NOT a no-op, the
                                                  initializer `= 5` runs at runtime)
*/

/* D3 ─────────────────────────────────────────────────────────
     function calc() {
       var total;
       console.log(total);   // 1
       console.log(count);   // 2   (count never declared)
     }
     calc();

   OUTPUT:
     undefined
     ReferenceError: count is not defined   // line 2 throws; halts

   SCORE: 8/10
   YOUR MODEL: the "bus" analogy (seat = declaration, napkin = undefined,
               passenger = value). Good model.
   REFINEMENT:
     - the napkin is placed by the CONDUCTOR (engine, creation phase),
       not the passenger (undefined exists before any value does)
     - "not defined" = a FAILED LOOKUP: the engine searches the whole scope
       chain and finds nothing — not merely "no declaration"
*/


/* -------------------------------------------------------------------------
   3. FORMAL Ep 6 QUIZ  (fixed bank — 10 questions)
   ------------------------------------------------------------------------- */

/* Q1 of 10 ───────────────────────────────────────────────────
     var a;
     console.log(a);

   OUTPUT:
     undefined

   SCORE: 9/10
   KEY: declared, never assigned -> placeholder `undefined`, set in the
        CREATION phase. ("as default" slightly blurs WHEN it is set.)
*/

/* Q2 of 10 ───────────────────────────────────────────────────
     console.log(b);
     var b = 5;
     console.log(b);

   OUTPUT:
     undefined
     5

   SCORE: 10/10
   KEY: line 1 does not throw because b is allocated with `undefined` in the
        creation phase, so it EXISTS (lookup succeeds). If b were never
        declared, the engine would have no record of it -> error.
*/

/* Q3 of 10 ───────────────────────────────────────────────────
     console.log("start");
     console.log(m);        // m never declared
     console.log("end");

   OUTPUT:
     start
     ReferenceError: m is not defined   // thrown at LINE 2
     // "end" does NOT print — the uncaught error halts execution

   SCORE: 7/10 -> revised 8/10
   ISSUE: you wrote the error was "thrown by third line" but also "stops
          after second line" — self-contradiction. The throw is at LINE 2.
   LESSON: in code, "it was a typo" is the postmortem on a shipped bug;
           the artifact you submit is what is judged. Proofread.
*/

/* Q4 of 10 ───────────────────────────────────────────────────
     var c;
     console.log(c);
     c = 10;
     console.log(c);
     c = undefined;
     console.log(c);

   OUTPUT:
     undefined
     10
     undefined

   SCORE: 9/10
   KEYS:
     - last-line undefined is the SAME value the engine used at the start
       (there is only one `undefined`)
     - manual `c = undefined` is BAD PRACTICE: destroys the "not yet assigned"
       signal; you lose the ability to tell "untouched" from "deliberately
       emptied". (Use `null` for deliberate emptiness — beyond this episode.)
*/

/* Q5 of 10 ───────────────────────────────────────────────────
     function test() {
       console.log(x);
       var x = 5;
       console.log(y);     // y never declared
     }
     test();

   OUTPUT:
     undefined
     ReferenceError: y is not defined   // thrown at the console.log(y) line

   SCORE: 8/10
   KEY (rule): declared -> exists in memory -> reads `undefined`;
               never declared -> no record -> error.
   REGRESSION FLAGGED: you wrote x's value was "STORED" — the term is
                       "ALLOCATED". (You had used "allocated" correctly in D2.)
   GOOD: you self-corrected x -> y in the error message (proofreading applied).
*/

/* Q6 of 10 ───────────────────────────────────────────── PENDING ──
   (Flag: part 2 may go slightly beyond the Ep 6 video; core JS regardless.)

     console.log(typeof a);
     console.log(typeof b);    // b never declared
     var a = 10;

   STATUS: POSED, NOT YET ANSWERED. (Answer key intentionally omitted —
           this is your live question.)
   Sub-parts:
     1. both outputs? (does either line throw?)
     2. one line: console.log(b) would throw, yet typeof b does not — why?
*/

/* Q7–Q10 of 10 — NOT YET POSED. */


/* -------------------------------------------------------------------------
   4. NEW QUIZ CONTRACT  (locked in, applies going forward)
   -------------------------------------------------------------------------
   - Fixed bank of 10–15 questions, written in advance. Total count shown first.
   - Questions are NOT created reactively and are NOT modified after your answer.
   - No question references another (no chaining / "as in the last question...").
   - All sub-parts stated up front, 1–3 per question.
   - Any "why / explain the mechanism" demand is baked INTO the question as a
     sub-part (rigor moves inside the question; the difficulty bar does NOT drop).
   - Short, precise explanations — no walls of text.
   - /10 rating on every question.

   (Inherited rules still active: acknowledge what's right before what's wrong;
    "I don't know" is valid and preferred over a confident guess; easier start,
    escalate; stay in episode scope, flag previews.)
   ------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------
   5. REPEATED MISTAKES TO WATCH (carried + new)
   -------------------------------------------------------------------------
   - "stored" instead of "allocated"  (REGRESSED today after using it right)
   - Submitting only HALF a question (skipping the justification sub-part)
   - Echoing the teacher's word instead of DERIVING it ("it is something")
   - Self-contradicting answers from rushing (Q3: "third line" vs "second line")
   - Sloppy spelling/grammar = rushed thinking
     (e.g. "sujesting", "introduduce", "didn't assigned", "throw a error")
   - Misreading numbers (read "Ep 6" as "Ep 8") — in code a misread index is a bug
   ------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------
   6. NEXT STEPS (Day 5 plan)
   -------------------------------------------------------------------------
   1. Finish the Ep 6 quiz (resume at Q6, then Q7–Q10).
   2. WATCH Ep 6 once at 1x. Watch specifically for: HOW Akshay describes the
      engine deciding a name is "not defined" (the failed-lookup mechanism).
   3. Day 5 = full graded Ep 6 cycle, starting on the "not defined" side, and
      test whether your "bus" model survives contact with the real lookup.
   ------------------------------------------------------------------------- */