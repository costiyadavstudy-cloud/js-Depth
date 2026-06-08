
// =============================================================================
// EP 14 — CALLBACK FUNCTIONS ft. EVENT LISTENERS
// Notes + Full Quiz Log (Day 10)
// Namaste JavaScript (Akshay Saini). Vardhan.
// =============================================================================
//
// QUIZ COMPLETE — 12 of 12 attempted & graded (first full run-through).
//   Q1 7.5 | Q2 8  | Q3 5   | Q4 10
//   Q5 8.5 | Q6 10 | Q7 4.5 | Q8 3
//   Q9 10  | Q10 1 | Q11 8.5| Q12 10
//   AVG 7.17 / 12
//
//   THE PATTERN (read this, not the average):
//   STRONG (real evidence): four 10s — Q4, Q6, Q9, Q12 — all on the
//     runtime / deferral / closure / memory thread, incl. the Ep 11
//     setTimeout-plus-closure payoff (Q12) produced cold.
//   THREE LIVE GAPS:
//     - Q10=1  statement vs expression — REGRESSED (affirmed the misconception).
//              #1 priority; not closing on its own.
//     - Q8=3   uncaught-error-halt — parse-vs-runtime relapse.
//     - Q7=4.5 construction — right design, code that doesn't run.
//   MIDDLE (Q1,Q2,Q5,Q11): precision/timing losses, not broken models.
//
// =============================================================================
// PART A — CONCEPT NOTES (first principles)
// =============================================================================
 
// -----------------------------------------------------------------------------
// 1. THE EXECUTION MODEL: synchronous, single-threaded
// -----------------------------------------------------------------------------
// - JS has exactly ONE call stack and runs ONE command at a time, top to bottom,
//   in order. It cannot run two operations simultaneously.
// - The single call stack IS the constraint. "Single-threaded" is the label;
//   "one call stack, one operation at a time" is the mechanism.
// - So how does single-threaded JS ever do "later" / async work? -> CALLBACKS.
 
// -----------------------------------------------------------------------------
// 2. CALLBACK FUNCTIONS
// -----------------------------------------------------------------------------
// - A callback = a function PASSED AS AN ARGUMENT to another (receiving /
//   higher-order) function, to be invoked LATER, at the right moment.
// - Named "callback" because the receiving function "calls it back" later -
//   the receiving function does the calling, not you.
// - WHY this is even possible: Ep 13's first-class functions. A function is a
//   VALUE, so it can be passed as an argument. That single capability is what
//   lets you hand a function to setTimeout / addEventListener.
// - What it BUYS you: DEFERRAL. You defer a function's execution to a later
//   point (timer expiry / event firing) so the main thread keeps running
//   instead of waiting. Deferral is how sync, single-threaded JS does async.
//
//   NOTE: JS is NOT "an asynchronous language." It is synchronous + single-
//   threaded. Callbacks are how it *does* async things.
 
// -----------------------------------------------------------------------------
// 3. setTimeout — reference vs invocation (the fn vs fn() trap)
// -----------------------------------------------------------------------------
//   setTimeout(fn, 1000)
//     -> hands the REFERENCE fn to setTimeout. setTimeout stores it, returns
//        immediately (NON-BLOCKING), and invokes fn after ~1000ms. Deferred. OK.
//
//   setTimeout(fn(), 1000)
//     -> fn() RUNS IMMEDIATELY, synchronously, right now, at that line.
//        setTimeout receives fn's RETURN VALUE, not fn. If fn returns undefined,
//        setTimeout has nothing callable to defer -> timer fires, nothing useful.
//        Two consequences to always state: (1) timing = NOW, (2) what's passed
//        = the return value.
 
// -----------------------------------------------------------------------------
// 4. 0ms DOES NOT MEAN "RUN NOW / RUN SECOND"
// -----------------------------------------------------------------------------
//   console.log("A");
//   setTimeout(function(){ console.log("B"); }, 0);
//   console.log("C");
//   // OUTPUT: A, C, B
//
// - Synchronous code (A, then C) runs to completion ON THE CALL STACK FIRST.
//   C is SYNCHRONOUS - it is NOT queued/delayed; it's just the next line.
// - The CALLBACK (B) is the only deferred thing. It can run ONLY after all
//   synchronous code finishes and the stack is empty.
// - The delay value is a MINIMUM wait, never a guarantee to run now.
// - On a single thread a deferred callback never cuts ahead of synchronous code.
//
//   *** Q3 miss: I had "C in queue" backwards. C = synchronous on the stack.
//       B = the deferred callback. Don't invert this again. (Corrected in Q4.) ***
