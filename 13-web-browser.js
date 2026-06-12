/******************************************************************************
 *  NAMASTE JAVASCRIPT — DEEP NOTES
 *  PART 1: BEHIND THE SCENES (Execution Context & Call Stack)   [Ep 1–2]
 *  PART 2: THE JS RUNTIME ENVIRONMENT (JRE, Web APIs, Event Loop) [Ep 15–16]
 *
 *  Same rules as the Ep-16 notes:
 *  - Every claim has a WHY.
 *  - Trace exercises are embedded. DO THEM ON PAPER before reading answers.
 *  - When confused, stop and re-derive. Scrolling past confusion = 0 learning.
 ******************************************************************************/


/******************************************************************************
 * SECTION 0 — THE TWO SENTENCES THAT RULE THESE NOTES
 ******************************************************************************/

// 1. "EVERYTHING in JavaScript happens inside an EXECUTION CONTEXT."
// 2. "The ENGINE alone cannot run real-world JS. It needs the RUNTIME
//     ENVIRONMENT around it — the engine is just one organ in a body."
//
// Part 1 explains sentence 1 (what happens INSIDE the engine's execution).
// Part 2 explains sentence 2 (what surrounds the engine, and why async
// is even possible in a single-threaded language).


/******************************************************************************
 *
 *  PART 1 — BEHIND THE SCENES: EXECUTION CONTEXT
 *
 ******************************************************************************/

/******************************************************************************
 * SECTION 1 — WHAT AN EXECUTION CONTEXT IS
 ******************************************************************************/

// An EXECUTION CONTEXT (EC) is the environment in which JS code is evaluated.
// Think of it as a box with TWO components:
//
//   +--------------------------------------------------+
//   |               EXECUTION CONTEXT                  |
//   |                                                  |
//   |  1) MEMORY COMPONENT          2) CODE COMPONENT  |
//   |     ("Variable Environment")     ("Thread of     |
//   |                                   Execution")    |
//   |     key : value storage          executes code   |
//   |     variables & functions        ONE line at a   |
//   |     live here                    time            |
//   +--------------------------------------------------+
//
// Two facts that follow:
//   - JS is SYNCHRONOUS SINGLE-THREADED: one code component = one command
//     executed at a time, in order. JS cannot natively "do two things at
//     once". (Then how does setTimeout work?! -> Part 2. Hold the question.)
//   - Every EC is built in TWO PHASES (next section). This two-phase build
//     is the MECHANISM behind "hoisting" — hoisting is not magic, it is a
//     side effect of phase 1.


/******************************************************************************
 * SECTION 2 — THE TWO PHASES (this is the core mechanism of Part 1)
 ******************************************************************************/

// PHASE 1 — MEMORY CREATION PHASE:
//   The engine scans the code in the current scope BEFORE executing anything,
//   and allocates memory for every variable and function declaration:
//     - var variables          -> stored with the placeholder  undefined
//     - function DECLARATIONS  -> stored with the ENTIRE function code
//     - (let/const             -> allocated but kept UNINITIALIZED in a
//        separate space; touching them before their line throws — the
//        "Temporal Dead Zone". Ep 8 detail, noted here for completeness.)
//
// PHASE 2 — CODE EXECUTION PHASE:
//   The engine runs the code top-to-bottom, one line at a time:
//     - assignments REPLACE the placeholders with real values,
//     - every FUNCTION CALL creates a brand-new EC (with its own two
//       phases!) and pushes it onto the CALL STACK.

// ---- TRACE EXERCISE 1 (paper first!) ----------------------------------

var n = 2;
function square(num) {
  var ans = num * num;
  return ans;
}
var square2 = square(n);
var square4 = square(4);

// PHASE 1 of the GLOBAL EC (before ANY line "runs"):
//   memory: { n: undefined,
//             square: <entire function code>,
//             square2: undefined,
//             square4: undefined }
//
// PHASE 2, line by line:
//   line `var n = 2`        -> memory.n: undefined -> 2
//   function declaration    -> nothing to DO (already in memory)
//   line `square(n)`        -> NEW EC created for square:
//        its PHASE 1: { num: undefined, ans: undefined }
//        its PHASE 2: num <- 2; ans <- 4; `return` hands 4 back to the
//                     calling line AND DESTROYS this EC (popped off stack)
//   memory.square2: undefined -> 4
//   line `square(4)`        -> ANOTHER fresh EC (num:4, ans:16) -> 16,
//                              destroyed again.
//   memory.square4: undefined -> 16
//
// KEY INSIGHT: every CALL gets a FRESH, ISOLATED memory. That is why
// `num` and `ans` from the two calls never collide. "Local variables"
// are not a rule someone decreed — they are a CONSEQUENCE of each call
// building its own EC.


/******************************************************************************
 * SECTION 3 — HOISTING, DEMYSTIFIED (it's just Phase 1)
 ******************************************************************************/

// ---- TRACE EXERCISE 2: predict all three outputs BEFORE reading on ----

console.log(b);        // ?
getName();             // ?
console.log(getName);  // ?

var b = 7;
function getName() { console.log("Namaste JavaScript"); }

// ANSWERS + MECHANISM:
//   console.log(b)       -> undefined
//        because Phase 1 already allocated b with placeholder undefined.
//        NOT an error — the variable EXISTS, its value doesn't yet.
//   getName()            -> "Namaste JavaScript"
//        because Phase 1 stored the ENTIRE function, callable immediately.
//   console.log(getName) -> prints the whole function source
//
// CONTRAST — what actually errors:
//   console.log(c); // ReferenceError: c is not defined
//        c was NEVER declared anywhere -> no Phase-1 allocation -> the
//        engine has no entry for it at all.
//
// PRECISION DRILL (these three are DIFFERENT, never blur them):
//   undefined          = declared, allocated, no value assigned YET.
//   not defined        = never declared; no memory entry exists.
//   TDZ ReferenceError = let/const declared, allocated, but accessed
//                        before its initialization line.
//
// And the arrow-function trap:
var getAge = () => 20;
//   In Phase 1, getAge is a VAR -> placeholder undefined.
//   Calling getAge() ABOVE this line -> TypeError: getAge is not a function
//   (you'd be calling undefined). Only function DECLARATIONS are stored
//   whole; function EXPRESSIONS/arrows follow variable rules.


/******************************************************************************
 * SECTION 4 — THE CALL STACK (execution bookkeeping)
 ******************************************************************************/

// The CALL STACK tracks "who is running and who called whom".
//   - Program starts  -> GLOBAL EC pushed (bottom of stack, always).
//   - Function called -> its new EC PUSHED on top. Top of stack = currently
//                        executing code.
//   - Function returns-> its EC POPPED and destroyed.
//   - Program ends    -> Global EC popped. Stack empty.
//
//   square4 call moment:        after everything:
//   | EC: square(4) |  <- top
//   | GLOBAL EC     |           |  (empty)  |
//   +---------------+           +-----------+
//
// PRECISION (my Ep-16 test error, corrected forever): the call stack does
// NOT "hand machine code to the CPU". It is BOOKKEEPING for execution
// contexts. The CPU runs the engine's machine code (Ep-16 notes, Sec 0).
//
// CONNECTIONS to the Ep-16 notes:
//   - Call cost = create EC + push + bind args + pop. THIS is the overhead
//     that INLINING deletes (Ep-16 notes, Sec 6a).
//   - Stack overflow = ECs pushed faster than popped (e.g., recursion with
//     no base case) until the stack's memory limit is hit.

function overflow() { overflow(); }   // overflow(); -> RangeError:
                                      // Maximum call stack size exceeded
// Mechanism: each call pushes a new EC, none ever returns/pops.

// ALIASES you'll meet in docs/devtools for the same thing: execution
// context stack, program stack, control stack, machine stack.
// Different names, one mechanism.


/******************************************************************************
 *
 *  PART 2 — THE JS RUNTIME ENVIRONMENT (the body around the engine)
 *
 ******************************************************************************/

/******************************************************************************
 * SECTION 5 — WHY THE ENGINE ALONE IS NOT ENOUGH
 ******************************************************************************/

// Sit with this: the call stack executes whatever enters it IMMEDIATELY,
// one thing at a time, and JS has ONE thread. There is no "wait" inside
// the engine. So how can this possibly work:

setTimeout(() => console.log("later"), 5000);
console.log("now");
// prints "now" first, "later" ~5s after — WITHOUT freezing for 5 seconds.

// It works because setTimeout IS NOT JAVASCRIPT. Neither is the DOM,
// fetch, localStorage, or even console. None of them are in the
// ECMAScript spec. They are FACILITIES PROVIDED BY THE ENVIRONMENT
// hosting the engine. Which brings us to:
//
//   JS RUNTIME ENVIRONMENT (JRE) = a container with everything needed
//   to run JS programs:
//
//   +------------------------------------------------------------------+
//   |                    JS RUNTIME ENVIRONMENT                        |
//   |                                                                  |
//   |   +----------------+         +-------------------------------+   |
//   |   |   JS ENGINE    |         |  APIs ("superpowers" given     |   |
//   |   | (Ep-16 notes:  |         |  by the environment)           |   |
//   |   |  parser, JIT,  | <-----> |  Browser: setTimeout, DOM,     |   |
//   |   |  call stack,   |         |   fetch, console, localStorage,|   |
//   |   |  heap, GC)     |         |   location, alert ...          |   |
//   |   +----------------+         |  Node: setTimeout, fs, http,   |   |
//   |        ^                     |   process, crypto ...          |   |
//   |        |                     +-------------------------------+   |
//   |        |                              |                          |
//   |   EVENT LOOP  <---- MICROTASK QUEUE <-+ (promise callbacks)      |
//   |        ^                              |                          |
//   |        +----------- CALLBACK QUEUE  <-+ (timer/event callbacks)  |
//   +------------------------------------------------------------------+
//
// The browser is ONE runtime environment. Node.js is ANOTHER (same V8
// engine, different surrounding facilities — no DOM in Node, no `fs` in
// the browser). ANYTHING can be a runtime environment if it embeds an
// engine and supplies APIs — that's how JS runs in browsers, servers,
// even smart appliances.


/******************************************************************************
 * SECTION 6 — WEB APIs AND THE window OBJECT
 ******************************************************************************/

// In the browser, the environment's facilities are exposed to your code
// through the GLOBAL OBJECT: `window`.
//   setTimeout(...)  is really  window.setTimeout(...)
//   console.log(...) is really  window.console.log(...)
// You omit `window.` because the global object is the default scope.
//
// MENTAL MODEL: your JS code is a guest; `window` is the hotel's front
// desk. Room service (timers), concierge (DOM), phone line (fetch) —
// all hotel services, not things the guest carries.
//
// WHY this matters mechanically: when you call a Web API, the WORK
// (waiting 5s, fetching over the network, listening for a click) happens
// IN THE BROWSER'S MACHINERY, OUTSIDE the JS thread. The single JS
// thread never waits. It registers a CALLBACK and moves on. The question
// becomes: how does the callback get BACK into the single thread safely?
// Answer: the queues + the event loop.


/******************************************************************************
 * SECTION 7 — THE EVENT LOOP AND THE TWO QUEUES (the core of Part 2)
 ******************************************************************************/

// THE PIECES:
//   CALLBACK QUEUE (a.k.a. task/macrotask queue):
//       callbacks from setTimeout/setInterval, DOM events (clicks), etc.
//       wait here in line.
//   MICROTASK QUEUE:
//       callbacks from PROMISES (.then/.catch/.finally) and
//       MutationObserver wait here. SEPARATE queue, HIGHER priority.
//   EVENT LOOP:
//       a tireless gatekeeper running one rule forever:
//
//       >>> "If the CALL STACK IS EMPTY:
//            first drain the ENTIRE microtask queue,
//            then move ONE task from the callback queue onto the stack." <<<
//
// Consequences you must be able to DERIVE, not memorize:
//   (a) Nothing from any queue can run while the stack is busy. EVER.
//   (b) Microtasks beat macrotasks. All pending promise callbacks run
//       before the next setTimeout callback gets its turn.
//   (c) STARVATION: if microtasks keep spawning more microtasks, the
//       callback queue may wait indefinitely — the event loop never gets
//       past the "drain ALL microtasks" step.

// ---- TRACE EXERCISE 3: the classic. Predict the full output order. ----

console.log("A");

setTimeout(() => console.log("B"), 0);     // 0ms delay. ZERO. Trap armed.

Promise.resolve().then(() => console.log("C"));

console.log("D");

// ANSWER: A, D, C, B.
// MECHANISM, step by step:
//   1. "A" — synchronous, runs on the stack immediately.
//   2. setTimeout: the TIMER is handed to the Web-API side; the callback
//      will be placed in the CALLBACK QUEUE when the timer fires (0ms =
//      essentially immediately). It still must WAIT IN THE QUEUE.
//   3. Promise callback -> goes to the MICROTASK queue.
//   4. "D" — synchronous.
//   5. Global code finishes -> STACK EMPTY -> event loop acts:
//      drain microtasks first -> "C". Then one task from callback
//      queue -> "B".
//
// THE LESSON INSIDE THE TRAP: `setTimeout(fn, 0)` does NOT mean "run in
// 0ms". It means "queue me; run me when the stack is empty AND the
// microtask queue is drained AND it's my turn." The delay parameter is a
// MINIMUM, never a guarantee. If the stack is blocked by heavy
// synchronous code for 10 seconds, your 0ms callback runs after 10s.
// (This is exactly the "trust issue" Ep 17 builds on.)

// ---- TRACE EXERCISE 4: event listeners live OUTSIDE your code's life ----

// document.getElementById("btn")
//   .addEventListener("click", function handler() { console.log("clicked"); });
//
// Mechanism: registering the listener stores `handler` in the BROWSER'S
// machinery, attached to that event. Your script finishes; its global EC
// pops; and the handler STILL EXISTS, waiting. Every click: browser puts
// handler into the CALLBACK QUEUE -> event loop -> stack -> runs.
// This is why listeners (and their closures!) hold memory until you
// removeEventListener — a classic real-world LEAK source. (Connect to
// Ep-16 notes Sec 7: reachable-from-roots — the browser's registry IS
// keeping that function reachable.)


/******************************************************************************
 * SECTION 8 — PUTTING PART 1 AND PART 2 TOGETHER (one unified picture)
 ******************************************************************************/

// Follow one async program through EVERY mechanism in both files:

console.log("start");                       // [1]
setTimeout(function timer() {               // [2]
  console.log("timer done");
}, 1000);
fetchLikeWork();                            // pretend: heavy sync loop, 3s
console.log("end");                         // [3]

function fetchLikeWork() { /* imagine 3s of synchronous looping */ }

// THE FULL STORY:
//  Phase 1 (memory): fetchLikeWork stored whole; nothing else fancy.
//  Phase 2:
//   [1] Global EC on stack -> "start".
//   [2] setTimeout runs ON the stack for a microsecond — just long enough
//       to REGISTER timer+callback with the environment — then returns.
//       The countdown proceeds OUTSIDE the JS thread.
//   fetchLikeWork() -> new EC pushed -> 3 SECONDS of stack occupation.
//       Meanwhile the 1000ms timer fires at t=1s: callback moves to the
//       CALLBACK QUEUE... and WAITS. Rule (a): busy stack = nobody enters.
//   [3] fetchLikeWork pops -> "end" -> global code done -> stack empty.
//   Event loop: microtasks (none) -> callback queue -> timer() pushed ->
//       "timer done" prints at t≈3s, NOT t=1s.
//
// If you can narrate that trace cold, you own both files.


/******************************************************************************
 * SECTION 9 — SELF-CHECK (closed book; say each mechanism aloud)
 ******************************************************************************/

// 1. An execution context = memory component + code component; built in
//    two phases (memory creation, then code execution).
// 2. Hoisting is not magic; it is Phase 1: var -> undefined placeholder,
//    function declarations -> stored whole, let/const -> allocated but in
//    the TDZ.
// 3. undefined ≠ not defined ≠ TDZ error — three different mechanisms.
// 4. Every function CALL builds a fresh EC on the call stack; return pops
//    and destroys it. Locals are a consequence, not a decree.
// 5. JS is synchronous single-threaded; the ENVIRONMENT (browser/Node),
//    not the language, supplies timers, DOM, fetch, console via the
//    global object (window in browsers).
// 6. Async pattern: register callback with the environment -> work happens
//    outside the JS thread -> finished callback waits in a QUEUE.
// 7. Event loop rule: stack empty -> drain ALL microtasks (promises) ->
//    then ONE callback-queue task. Hence A, D, C, B — and hence
//    setTimeout's delay is a minimum, never a promise.
//
// Fail any item -> return to its section, re-derive, retry closed-book.

/******************************************************************************
 * END — these notes + ep16_deep_notes.js form one picture:
 * Ep-16 file = inside the engine. This file = inside the EC, and the
 * environment wrapped around the engine. Next test can draw from both.
 ******************************************************************************/

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