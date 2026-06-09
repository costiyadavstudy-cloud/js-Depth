// =============================================================================
// EP 15 — ASYNCHRONOUS JAVASCRIPT & EVENT LOOP FROM SCRATCH  —  NOTES
// Namaste JavaScript (Akshay Saini). Vardhan — Day 11.
// Bank: 12 Qs, completed in full. Avg 7.83 / 10 (vs Ep 14 = 7.17).
// Watch-check: Ep 15 verified by title ("...EVENT LOOP from scratch"), watched
// end to end. Ep 11 & Ep 12 STILL formally UNVERIFIED.
// =============================================================================


// =============================================================================
// PART A — CONCEPTS CRYSTALLIZED (11 sections)
// =============================================================================

// 1. CALL STACK
//    One stack. Executes synchronous execution contexts, one at a time, top to
//    bottom. It has NO built-in concept of time, timers, or "waiting". Nothing
//    on the stack can pause itself.

// 2. WEB APIs ARE NOT JAVASCRIPT
//    setTimeout, fetch, console, the DOM (document), localStorage etc. are NOT
//    part of the JS language (ECMAScript). The browser supplies them as Web APIs
//    and attaches them to the global `window` object.
//    - You call them as window.setTimeout(...), but drop the prefix.
//    - WHY droppable: window IS the global object. An unqualified identifier
//      (console, setTimeout) is resolved up the scope chain to the global object,
//      where it finds window.<name>. Same lookup. The prefix is optional, which
//      is exactly why host APIs feel native.

// 3. setTimeout IS NON-BLOCKING
//    The setTimeout CALL runs synchronously: it registers (callback + timer) in
//    the Web API env and RETURNS IMMEDIATELY. Only the callback defers. Control
//    passes straight to the next line — that's why a 10s loop can run "after" a
//    setTimeout. fn vs fn(): setTimeout(fn,t) passes the reference (deferred);
//    setTimeout(fn(),t) runs fn NOW and passes its return value.

// 4. THE DEFERRAL FLOW
//    callback registered in Web API env  ->  timer expires  ->  callback moved to
//    the TASK (callback) queue  ->  event loop sees an empty stack  ->  pushes the
//    callback onto the stack  ->  it runs.
//    Timer expiry only ENQUEUES; it does not execute. Execution needs (i) callback
//    queued AND (ii) call stack empty.

// 5. EVENT LOOP
//    Gatekeeper. When the call stack is empty, it moves a queued callback onto the
//    stack. Crucially: it DRAINS THE ENTIRE MICROTASK QUEUE — including microtasks
//    enqueued DURING the drain — before taking even ONE task-queue callback.

// 6. TWO QUEUES — the mapping (memorise the split)
//    MICROTASK queue  <-  Promise callbacks (.then/.catch/.finally) + Mutation
//                         Observer. ONLY these.
//    TASK / CALLBACK  <-  setTimeout, setInterval, and ALL DOM event callbacks
//                         (click, etc.).
//    Priority: all microtasks run before each task. (A click is a TASK, not a
//    microtask — the Q4 miss.)

// 7. STARVATION
//    "Many microtasks" only DELAYS a setTimeout callback — a big pile still drains,
//    then the task runs. True starvation (NEVER runs) needs SELF-REGENERATION: a
//    microtask that schedules ANOTHER microtask each time it runs. The queue never
//    empties -> the event loop never reaches the task queue -> the callback is
//    starved forever.

// 8. EVENT LISTENERS
//    addEventListener REGISTERS a dormant callback in the Web API env. Each event
//    enqueues a FRESH copy to the task queue. The listener PERSISTS (setTimeout is
//    one-shot) -> its closure / captured variables CANNOT be GC'd while registered
//    -> removeEventListener frees them. To remove, you must pass the SAME function
//    reference -> an anonymous inline handler is UNREMOVABLE (keep no reference).

// 9. UNCAUGHT-ERROR HALT  (carryover [P3] from Ep 8/9)
//    An UNCAUGHT throw halts the CURRENT synchronous run. Lines after it are never
//    reached (a setTimeout after a throw never even REGISTERS — "never registered"
//    != "registered but never fired"). A CAUGHT error (try/catch) does NOT halt;
//    control jumps to catch and execution continues.
//    - Error CLASS (TypeError/ReferenceError/SyntaxError) is ORTHOGONAL to
//      caught/uncaught. The class never decides caught-ness; the try/catch does.
//    - PARSE-time (SyntaxError): whole file rejected, NOTHING runs (not even line 1).
//      RUNTIME (throw, ReferenceError, TypeError): halts mid-run, earlier lines
//      already ran — that's the TELL for which it is.
//    - Sync throw -> caught only by try/catch. Promise rejection -> handled by
//      .catch (or .then's 2nd arg). .then's FIRST arg is the success path, NOT an
//      error handler.

// 10. STATEMENT vs EXPRESSION  ([P1], surfaced via callbacks)
//    A function sitting where a VALUE is expected (e.g. an argument) is an
//    EXPRESSION. Position is fixed at WRITE-TIME by where the code physically sits.
//    An ANONYMOUS function can ONLY be an expression (a function STATEMENT requires
//    a name). Storing in a variable or passing as an argument NEVER converts it —
//    a variable merely REFERENCES the value; nothing "becomes" anything.

// 11. WHERE ASYNCHRONY COMES FROM
//    NOT the language, and NOT the window object (window is just the namespace
//    exposing the APIs). It comes from (a) the browser's Web APIs doing work OFF
//    the main JS thread (timers, network, DOM event-listening), and (b) the event
//    loop + queues feeding completed callbacks back onto the stack. The JS engine
//    stays strictly synchronous; the ENVIRONMENT supplies the concurrency.


// =============================================================================
// PART B — FULL Q1-Q12 LOG  (student answer condensed | score | miss | model)
// =============================================================================

// Q1 — 8.5/10 (3 + 5 + 0.5)
//   STUDENT: (a) stack runs commands one at a time, no timer/waiting, those come
//   from Web APIs [correct]. (b) not JS, Web APIs provide it; then described the
//   CALLBACK lifecycle instead of the access path.
//   MISS (precision): the path to REACH setTimeout = the global `window` object
//   (window.setTimeout, prefix droppable). Described the callback's journey (Q3/Q4
//   territory) instead. Phrasing 2-way readable, so half-slice only.
//   MODEL: (a) executes execution contexts (sync code), one at a time; no concept
//   of time/waiting. (b) not part of JS; browser supplies it as a Web API on the
//   global window object; reached via window.setTimeout(...), prefix dropped.

// Q2 — 9/10 (3 + 4 + 2)
//   STUDENT: order correct; (b) registered via window, loop runs, at 5s callback
//   to queue, at 10s stack empty -> event loop pushes. Got the gating.
//   MISS (mechanism, 1 stage): didn't name that setTimeout is NON-BLOCKING —
//   registers + RETURNS IMMEDIATELY, which is WHY the loop runs at all.
//   MODEL: register (window) + return immediately -> 10s loop seizes stack -> 5s
//   timer expiry moves fn to queue (enqueue != execute) -> 10s stack empties ->
//   event loop pushes fn.

// Q3 — 8.5/10 (3 + 4.5 + 1)
//   STUDENT: (a) not JS. (b) console lives on window (tested via this.console),
//   window is browser-provided; no prefix needed.
//   MISS (mechanism): the OMISSION mechanism — window IS the global object; an
//   unqualified `console` resolves up the scope chain to it. Stated the fact, not
//   the why. "this gives something" too vague.
//   MODEL: console is host-provided, attached to global window; unqualified
//   console resolves to window.console — same object, prefix optional.

// Q4 — 6.5/10 (3 + 3.5 + 0)
//   STUDENT: (a) routed the click callback to the MICROTASK queue [WRONG].
//   (b) listener reference persists in Web API -> closure not GC'd; setTimeout
//   one-shot -> released. (b) excellent.
//   MISS (precision, wrong queue): clicks/setTimeout -> TASK queue. Microtask
//   queue is Promises + MutationObserver ONLY. (Contradicts his own Q1 "microtask
//   priority" — knew both queues exist, not which cb goes where.)
//   MODEL: dormant in Web API -> each click enqueues a fresh copy to the TASK
//   queue -> event loop pushes when stack empty. Listener persists -> closure not
//   GC'd; fix = removeEventListener.

// Q5 — 10/10 (3 + 5 + 2)
//   STUDENT: A D C B; setTimeout->task, promise->microtask; microtask drained
//   before task -> C before B. Corrected the Q4 queue error one question later.
//   MODEL: A,D sync first; C(microtask) drained fully before B(task).

// Q6 — 6/10 (3 + 2.5 + 0.5)
//   STUDENT: named STARVATION; said "many microtasks delay setTimeout". No
//   concrete scenario.
//   MISS (mechanism): "many" only DELAYS (drains eventually). NEVER-runs needs
//   SELF-REGENERATING microtasks keeping the queue non-empty so the loop never
//   reaches the task queue.
//   MODEL: a .then that re-schedules a .then inside itself; queue never empties;
//   setTimeout(fn,0) starved forever.

// Q7 — 4.5/10 (1.5 + 3 + 0)  [CONSTRUCTION — now the #1 open gap]
//   STUDENT: getElementById(start) [unquoted -> ReferenceError]; addEventListener
//   ('click', fn) [correct casing+quotes, fixed from Ep14]; count++ then log ->
//   1,2,3 [correct, fixed from Ep14]; (c) not attempted ("not in video").
//   MISS (precision): unquoted `start` must be the STRING "start". (c): anonymous
//   inline handler is UNREMOVABLE — needs a NAMED reference at registration.
//   MODEL:
//     let count = 0;
//     function handleClick(){ count++; console.log(count); }
//     const startBtn = document.getElementById("start");
//     startBtn.addEventListener("click", handleClick);
//     startBtn.removeEventListener("click", handleClick);   // (c)

// Q8 — 7.5/10 (3 + 4 + 0.5)  [P3 carryover]
//   STUDENT: first output wrongly listed 2 and 3; corrected to "1, uncaught error"
//   and concluded none of the remaining lines run [correct]. Did NOT answer
//   parse-vs-runtime.
//   MISS (precision, unanswered sub-part): halts at RUNTIME — "1" printing proves
//   the file parsed and ran to the throw; a parse-time SyntaxError would block
//   even line 1. Nuance: setTimeout after the throw never REGISTERS.
//   MODEL: output = 1, Uncaught Error. throw uncaught (no try/catch) halts the
//   sync run; lines after never reached; runtime (line 1 ran).

// Q9 — 8/10 (3 + 4.5 + 0.5)
//   STUDENT: (a) doesn't run immediately, sync continues — but spurious "if
//   async/await not used" qualifier. (b) mechanism correct; got "0 doesn't
//   guarantee instant EXECUTION".
//   MISS (precision): async/await is IRRELEVANT to setTimeout (Promise/microtask
//   machinery); setTimeout always defers unconditionally. 0 = MINIMUM delay before
//   eligible to queue, not a guarantee of run time.
//   MODEL: setTimeout call is synchronous (registers, returns); fn deferred; 0 is
//   a minimum, guarantees nothing about WHEN it runs.

// Q10 — 9.5/10 (3 + 4.5 + 2)  *** [P1] REGRESSION CLOSED (Day 10 Q10 = 1) ***
//   STUDENT: (a) expression [correct]. (b) function in value-expected position =
//   expression; storing/passing does NOT change it [correct — reversed the Day-10
//   misconception cold].
//   MISS (minor mechanism): didn't state write-time fixity / anonymous-can-only-
//   be-expression as reinforcement.
//   MODEL: expression; position fixed at write-time; anonymous fn can only be an
//   expression (statement needs a name); variable just references the value.

// Q11 — 8.5/10 (3 + 4 + 1.5)
//   STUDENT: A E C D B [correct]; traced C -> inner promise schedules D -> D ->
//   B. Showed the outcome but didn't crisply state the rule; run-on wording.
//   MISS (mechanism): name the rule — microtask queue drained to ZERO (incl.
//   mid-drain additions) before ANY task; so D (added during drain) beats B.
//   MODEL: as above; D joins the same drain pass, runs before the loop touches
//   the task queue.

// Q12 — 7.5/10 (3 + 3.5 + 1)
//   STUDENT: (a) browser — "mainly due to window object" [misattribution].
//   (b) task queue stores deferred cb [correct]; event loop gates on empty stack
//   + pushes [correct].
//   MISS (mechanism/precision): window is the NAMESPACE, not the source.
//   Asynchrony = Web APIs running off-thread + event loop/queues feeding callbacks
//   back. Engine stays synchronous; environment supplies concurrency.
//   MODEL: as in concept section 11.


// =============================================================================
// PART C — WEAK-SPOT TRACKER (re-ranked after Ep 15)
// =============================================================================

// [#1 OPEN] CONSTRUCTION ([P2]) — Q7 = 4.5. Unquoted-argument bug fired AGAIN.
//   Tracing/reasoning run well ahead of writing runnable code. Will NOT close by
//   tracing — needs WRITING reps. Candidate: ep13_practice_questions.js (P1-P10,
//   still unattempted), or a dedicated write-code drill.

// [HOLDING] PARSE vs RUNTIME / uncaught halt ([P3]) — Q8 = 7.5. Improved but
//   needed scaffolding and left the TIMING sub-part blank. Keep deriving parse-vs-
//   runtime explicitly (it's a DERIVATION, not a rule to be handed).

// [RECOVERED IN-SESSION] Queue mapping (task vs microtask) — Q4 6.5 -> Q5 10,
//   Q11 8.5. The split + drain rule now hold.

// [REVISIT] STARVATION — Q6 = 6. The "regenerating vs merely many" distinction.

// [TIC] ATTRIBUTION — attaching a wrong qualifier/source to a correct idea
//   (async/await in Q9; window object in Q12). Instinct right, attribution loose.

// [CLOSED] STATEMENT vs EXPRESSION ([P1]) — Q10 = 9.5 (was Day-10 = 1, misconception
//   AFFIRMED). Reversed cleanly and cold. Monitor, no longer top priority.


// =============================================================================
// PART D — STATUS
// =============================================================================
// - Ep 15 done in full: 94/120 = 7.83 avg (Ep 14 = 7.17).
// - Ep 11 & Ep 12 STILL formally UNVERIFIED (closure/async core keeps holding
//   wherever it surfaces, but no on-record quiz).
// - Next-direction is the student's call (curriculum autonomy). Strongest fit for
//   what actually broke: a CONSTRUCTION drill (write code, don't trace).
// =============================================================================

// =============================================================================
// EP 15 — ASYNCHRONOUS JAVASCRIPT & EVENT LOOP FROM SCRATCH
// QUIZ BANK — fixed bank of 12, committed in advance, delivered one per turn.
// (Namaste JavaScript, Akshay Saini.)  Vardhan — Day 11.
//
// Bank rules honoured: 10-15 Qs, total stated up front, escalating difficulty,
// 1-3 sub-parts each stated up front, no chaining (each standalone), no reactive
// creation. Questions only here; answers/models/scores live in the notes file.
// =============================================================================

// -----------------------------------------------------------------------------
// Q1  (2 sub-parts)
// (a) The JS engine has one call stack. State precisely what it executes, and
//     whether it has any built-in concept of a timer or "waiting".
// (b) Is setTimeout a feature of the JavaScript LANGUAGE itself? If not, name
//     what actually provides it, and the exact path your code travels to reach it.

// -----------------------------------------------------------------------------
// Q2  (2 sub-parts)
//   setTimeout(fn, 5000) is the first line; then a heavy synchronous loop that
//   takes 10 seconds to finish.
// (a) State the order of events, from the setTimeout call to fn finally running.
// (b) fn does NOT run at the 5s mark. Explain the precise mechanism for why —
//     name every stage involved.

// -----------------------------------------------------------------------------
// Q3  (2 sub-parts)
//   console.log is used constantly and treated as "just part of JavaScript".
// (a) Is console part of the JS language, or not? Commit to an answer.
// (b) Justify with the underlying mechanism — and explain why, if your answer is
//     what I think it is, you've never had to type the full access path to use it.

// -----------------------------------------------------------------------------
// Q4  (2 sub-parts)
//   button.addEventListener("click", handleClick); user then clicks 3 times.
// (a) Trace the route handleClick takes EACH time — where it lives after
//     registration and the path it travels to actually execute.
// (b) Contrast with a setTimeout callback in one precise respect: after running
//     once, what difference is there in what remains registered — and what is the
//     memory consequence?

// -----------------------------------------------------------------------------
// Q5  (2 sub-parts)
//   console.log("A");
//   setTimeout(() => console.log("B"), 0);
//   Promise.resolve().then(() => console.log("C"));
//   console.log("D");
// (a) Predict the exact output order.
// (b) Justify it: name which callback lands in which queue, and explain the
//     event-loop rule that makes one deferred callback run before the other.

// -----------------------------------------------------------------------------
// Q6  (2 sub-parts)
//   The event loop empties the WHOLE microtask queue before each task-queue cb.
// (a) Describe a concrete scenario where this priority rule delays a setTimeout
//     callback far past its timer — or makes it never run at all.
// (b) Name this problem precisely, and explain the exact mechanism that produces it.

// -----------------------------------------------------------------------------
// Q7  (3 sub-parts)  — WRITE REAL, RUNNABLE CODE, not pseudocode.
// (a) Select the element whose id is `start` and register a click handler on it.
// (b) The handler logs a running click count: 1 on the first click, then 2, 3, ...
// (c) Write the single statement that later unregisters THIS EXACT handler.

// -----------------------------------------------------------------------------
// Q8  (2 sub-parts)  [rescoped Day 11: original had an out-of-scope event-loop/error
//                     interaction; stripped to in-scope Ep 8/9 carryover only]
//   console.log("1");
//   throw new Error("boom");
//   setTimeout(() => console.log("2"), 0);
//   console.log("3");
// (a) Predict exactly what appears in the console, in order.
// (b) Account for each line after the throw: which runs, which never runs, and
//     why — and state whether this halts at parse-time or runtime.

// -----------------------------------------------------------------------------
// Q9  (2 sub-parts)
//   A developer writes setTimeout(fn, 0) expecting fn to run immediately.
// (a) Does it? State what happens to fn relative to the synchronous code after it.
// (b) Explain the precise mechanism, and state what the 0 GUARANTEES — and what
//     it does NOT.

// -----------------------------------------------------------------------------
// Q10 (2 sub-parts)
//   setTimeout(function () { console.log("hi"); }, 1000);
// (a) The first argument — function STATEMENT or function EXPRESSION? Commit.
// (b) Justify with the rule that DECIDES it. Then: does storing a function in a
//     variable, or passing it as an argument, ever CHANGE which one it is?

// -----------------------------------------------------------------------------
// Q11 (2 sub-parts)
//   console.log("A");
//   setTimeout(() => console.log("B"), 0);
//   Promise.resolve().then(() => {
//     console.log("C");
//     Promise.resolve().then(() => console.log("D"));
//   });
//   console.log("E");
// (a) Predict the exact output order.
// (b) Justify why D prints BEFORE B, referencing how the event loop treats a
//     microtask scheduled DURING the microtask drain.

// -----------------------------------------------------------------------------
// Q12 (2 sub-parts)
// (a) JS is single-threaded and synchronous, yet setTimeout/fetch/listeners are
//     called "asynchronous". Given the engine only does one thing at a time,
//     where does the asynchrony actually come from?
// (b) Name the two structures that let a deferred callback run later WITHOUT
//     blocking the main thread, and give each one's job in a single line.

// =============================================================================
// END OF BANK (12 questions).
// =============================================================================