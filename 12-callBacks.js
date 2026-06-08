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

// -----------------------------------------------------------------------------
// 5. BLOCKING THE MAIN THREAD
// -----------------------------------------------------------------------------
//   console.log("start");
//   setTimeout(function(){ console.log("timeout done"); }, 1000);
//   // heavy synchronous loop here, ~10 seconds
//   console.log("end");
//   // OUTPUT: start, end, timeout done  (timeout done at ~10s, NOT ~1s)
//
// - A long synchronous task occupies the single call stack -> nothing else can
//   run until it finishes. That is "blocking the main thread."
// - setTimeout is NON-BLOCKING: it registers the callback and returns at once.
//   The 1s timer expires on schedule in the background.
// - BUT an expired timer cannot force its callback onto a BUSY stack. The
//   callback runs only after the synchronous loop completes and the stack clears.
// - Lesson: never block the main thread with long synchronous work; it freezes
//   everything, including timers and UI.

// -----------------------------------------------------------------------------
// 6. EVENT LISTENERS
// -----------------------------------------------------------------------------
//   document.getElementById("btn").addEventListener("click", function(){
//     console.log("clicked");
//   });
//
// - The anonymous function is the CALLBACK. addEventListener REGISTERS it as the
//   click handler on #btn (stores a reference). The browser's event system
//   invokes it each time a click fires.
// - It is NOT called once now. It runs potentially MANY times later (or never,
//   if never clicked).
// - A registered listener does NOT "run in the background." It sits DORMANT /
//   registered until an event occurs, then the browser invokes it. Distinguish
//   "registered & waiting" from "running."  (Q5 precision miss.)
// - One registration -> unlimited later calls, until removeEventListener detaches.

// -----------------------------------------------------------------------------
// 7. CLOSURES + EVENT LISTENERS (private state)
// -----------------------------------------------------------------------------
//   function attachCounter() {
//     let count = 0;
//     document.getElementById("btn").addEventListener("click", function(){
//       count++;
//       console.log(count);  // 1, 2, 3, ... rising across clicks
//     });
//   }
//   attachCounter();
//
// - count lives in attachCounter's LEXICAL ENVIRONMENT (one home).
// - attachCounter runs and returns -> its execution context is POPPED off the
//   call stack. But the click callback holds a CLOSURE over that environment, so
//   count is NOT garbage-collected. It's the SAME count, mutated on each click,
//   which is why it rises instead of resetting.
// - count is unreachable to outer code but fully alive for the callback:
//   "dead for everyone but not for the callback."
// - CLOSURE = a function bundled together with a REFERENCE to its lexical scope.
// - PHRASING DISCIPLINE: the variable has ONE home (the enclosing scope); the
//   closure RETAINS A REFERENCE to it. Do NOT say state "lives in the callback."

// -----------------------------------------------------------------------------
// 8. MEMORY: event listeners are "heavy"
// -----------------------------------------------------------------------------
// - Because listeners FORM CLOSURES, the variables they capture are NOT freed
//   even when the call stack is empty - the engine can't know the listener won't
//   need them on a future event (it can't predict when the user triggers it).
// - Many listeners (onClick, onHover, onScroll across a page) hold memory and can
//   slow the page down.
// - FIX: removeEventListener when a listener is no longer needed. Once nothing
//   references the callback, GARBAGE COLLECTION can reclaim it and its captured
//   lexical environment.

// -----------------------------------------------------------------------------
// 9. CLOSURE CAPTURES THE VARIABLE, NOT A VALUE-SNAPSHOT (Ep 11 payoff)
// -----------------------------------------------------------------------------
//   function setup() {
//     let n = 10;
//     console.log("a");
//     setTimeout(function(){ console.log(n); }, 0);
//     n = 20;
//     console.log("b");
//   }
//   setup();
//   // OUTPUT: a, b, 20   (NOT 10)
//
// - The callback closes over the VARIABLE n (a reference to the binding), not a
//   copy of n's value at registration time.
// - The callback is DEFERRED: it runs only after setup's synchronous code
//   finishes (after n = 20) and the stack is empty.
// - It reads n's CURRENT value at execution time -> 20.
// - This is the core of the Ep 11 setTimeout + closure interview question.

// =============================================================================
// PART B — FULL QUIZ LOG  (Q1-Q12, attempted & graded)
// Rubric: 3 result + 5 mechanism + 2 precision = 10
// =============================================================================

// -----------------------------------------------------------------------------
// Q1 — 7.5/10  (3 + 3.5 + 1)
// -----------------------------------------------------------------------------
// Q: (a) Define what "single-threaded" means for how JS executes code.
//    (b) What does a callback let you achieve, and what Ep 13 capability makes
//        handing a function to setTimeout/addEventListener possible?
// MY ANSWER:
//   (a) JS processes one piece of code at once; can't do multiple at a time,
//       because it has only one main call stack defining the order; only a single
//       function/code processed at once.
//   (b) Callback unlocks the asynchronous type of JS because it can be processed
//       regardless of the pattern of processing; the ability to use a function as
//       a value, store it, and pass it makes setTimeout/addEventListener possible.
// LOST IT: (b) vague - "regardless of the pattern" hides the mechanism. Real
//   point = DEFERRAL. Also JS isn't "the asynchronous type"; it's sync + single-
//   threaded.
// 10/10 MODEL:
//   (a) One call stack, one command at a time, top to bottom, in order; cannot run
//       two operations at once. The single stack is the constraint.
//   (b) A callback defers execution to later (timer expiry / event) so the main
//       thread keeps running. Possible because Ep 13 made functions first-class
//       values - a function can be passed as an argument, called back later.

// -----------------------------------------------------------------------------
// Q2 — 8/10  (3 + 3.5 + 1.5)
// -----------------------------------------------------------------------------
// Q: (a) Why "callback" - what's called back, by whom?
//    (b) setTimeout(fn,1000) vs setTimeout(fn(),1000) - what's handed in, what
//        does each do?
// MY ANSWER:
//   (a) A function passed as an argument; called back by the function it's passed
//       to. (correct)
//   (b) First: fn passed as reference, used to call it back. Second: fn is called,
//       won't work because setTimeout needs a reference.
// LOST IT: (b) stopped at "won't work." Missing: (1) fn() runs IMMEDIATELY now,
//   not after 1000ms; (2) setTimeout gets fn's RETURN VALUE, not fn.
// 10/10 MODEL:
//   (a) The callback is invoked by the higher-order function it's handed to, later.
//   (b) setTimeout(fn,1000): reference fn stored, invoked after ~1000ms.
//       setTimeout(fn(),1000): fn() runs immediately/synchronously now; its return
//       value is passed; nothing deferred; if it returns undefined, nothing useful.

// -----------------------------------------------------------------------------
// Q3 — 5/10  (3 + 2 + 0)   <- session low; model-inversion
// -----------------------------------------------------------------------------
// Q: log A; setTimeout(B,0); log C. (a) order? (b) why isn't B second?
// MY ANSWER:
//   (a) A, C, B  (correct)
//   (b) B delayed for later even at 0ms; JS starts its timer whenever it gets
//       time; single-threaded; "log(c) was also in queue" so B didn't print 2nd.
// LOST IT: INVERTED. C is NOT queued - it's synchronous code on the stack, the
//   next line. Only the callback B is deferred. Vague phrasing -> precision 0.
// 10/10 MODEL:
//   A, C, B. Sync code runs top-to-bottom on the single stack: A logs, setTimeout
//   registers the callback and returns immediately (non-blocking), C logs. Only
//   once all sync code is done and the stack is empty does the deferred callback
//   run -> B last. 0 = minimum delay, not "run now."

// -----------------------------------------------------------------------------
// Q4 — 10/10  (3 + 5 + 2)   <- corrected the Q3 inversion on harder ground
// -----------------------------------------------------------------------------
// Q: start; setTimeout(timeout done,1000); ~10s sync loop; end.
//    (a) ~1s or ~10s+? order? (b) blocking the main thread; why not at 1s?
// MY ANSWER:
//   (a) >10s. Output: start, end, timeout done.
//   (b) The 10s loop blocks the main thread; single-threaded, top-to-bottom, must
//       finish the sync loop first. Timer expires on time, but JS runs the
//       callback only when the call stack is free, not when the timer ends.
// NO DEDUCTIONS.
// 10/10 MODEL:
//   Loop occupies the single stack ~10s = blocking the main thread. setTimeout is
//   non-blocking: registers callback, returns immediately; timer expires in the
//   background. An expired timer can't force its callback onto a busy stack. The
//   callback runs only after sync code (loop + end) finishes and the stack empties
//   -> ~10s. Delay = minimum.
//   (Fold in: SAY OUT LOUD that setTimeout returns immediately.)

// -----------------------------------------------------------------------------
// Q5 — 8.5/10  (3 + 4 + 1.5)
// -----------------------------------------------------------------------------
// Q: btn.addEventListener("click", fn). (a) callback? who/when? (b) once now or
//    many times later? why?
// MY ANSWER:
//   (a) The anonymous fn with log("clicked"); addEventListener calls it on click.
//   (b) Many times later; addEventListener uses the callback, doesn't get closed,
//       still runs in the background and listens, so can use it multiple times.
// LOST IT: "runs in the background." A registered listener is DORMANT.
//   addEventListener stores a reference; the browser invokes it per click.
//   "registered & waiting" != "running."
// 10/10 MODEL:
//   (a) Anonymous fn logging "clicked"; addEventListener registers it; browser
//       calls it on each click on #btn.
//   (b) Many times later (or never). Not invoked now - stored as the click handler.
//       Dormant until a click; browser then invokes it. Fires any number of times
//       until removeEventListener detaches it.

// -----------------------------------------------------------------------------
// Q6 — 10/10  (3 + 5 + 2)   <- clean closure trace
// -----------------------------------------------------------------------------
// Q: attachCounter() with let count=0 + click listener doing count++/log; returns.
//    (a) where does count live; why not destroyed after return? (b) name+explain.
// MY ANSWER:
//   (a) count lives in attachCounter's lexical environment; callback holds a
//       reference, so it survives after return. attachCounter context popped, but
//       count alive in the lexical env stored by the closure - "dead for everyone
//       but not for the callback."
//   (b) Closure: the bundle of the lexical environment of its parents + the
//       function; parent's variables retained and usable by the function.
// NO DEDUCTIONS. Standout: "dead for everyone but not for the callback."
// 10/10 MODEL:
//   (a) count lives in attachCounter's lexical env. On return its context is
//       popped, but the callback's closure keeps it from being GC'd. Same count,
//       mutated per click -> 1,2,3. Unreachable to outer code, alive for callback.
//   (b) Closure = a function bundled with a reference to its lexical scope; the
//       callback closes over attachCounter's scope so its variables persist.
//   (Phrasing: count has ONE home - the enclosing scope; closure retains a
//    reference. Don't say it "lives in the callback.")

// -----------------------------------------------------------------------------
// Q7 — 4.5/10  (1 + 3 + 0.5)   <- CONSTRUCTION: design right, code doesn't run
// -----------------------------------------------------------------------------
// Q (construction): write makeButtonCounter() that attaches a click listener to
//   #btn logging click count (1,2,3...), count PRIVATE (no global), + activation
//   line. (b) which line creates the closure; which variable holds private state.
// MY ANSWER:
//   makeButtonCounter() {
//     let count = 0
//     document.getElementById(btn).addeventlistener(click,function(){
//       console.log(count++)
//     })
//   makeButtonCounter()
//   (b) function(){console.log(count++)} creates the closure; I think the callback
//       function holds the private state.
// RIGHT: the DESIGN - count in the enclosing scope (private), inner callback
//   increments/logs it. That's the closure-for-private-state architecture.
// DEFECTS (code does not run):
//   1. missing `function` keyword -> SyntaxError, parse-time, nothing runs.
//   2. function body never closed with `}` before the call (call must be OUTSIDE).
//   3. getElementById(btn) -> btn unquoted = variable lookup (ReferenceError).
//      Needs the STRING "btn".
//   4. addeventlistener -> addEventListener (case-sensitive; lowercase = undefined
//      -> calling it = TypeError). Identifiers are exact.
//   5. click unquoted -> needs "click" (else ReferenceError).
//   6. console.log(count++) post-increment logs OLD value: 0,1,2. Spec wants
//      1,2,3 -> use ++count, or count++ then log count.
//   (b) closure line ~ok (inner fn). Private state WRONG: it's the VARIABLE count,
//       not "the callback." Callback closes over count; count holds the state.
// 10/10 MODEL:
//   function makeButtonCounter() {
//     let count = 0;                       // private state - this scope, not global
//     document.getElementById("btn").addEventListener("click", function () {
//       count++;                           // increment first...
//       console.log(count);                // ...then log -> 1, 2, 3
//     });
//   }                                      // body closes HERE
//   makeButtonCounter();                   // activation: run it so listener attaches
//   (b) Closure = the inner anonymous fn passed to addEventListener (closes over
//       count). Private state = the variable `count` in makeButtonCounter's scope.

// -----------------------------------------------------------------------------
// Q8 — 3/10  (1.5 + 1.5 + 0)   <- uncaught-error-halt RELAPSE
// -----------------------------------------------------------------------------
// Q: greet(); setTimeout(log "later",1000); function greet(){ console.log(message) }
//    // message never declared. (a) throw? class? parse/runtime? (b) does "later"
//    log? why, re timing vs the setTimeout line?
// MY ANSWER:
//   (a) ReferenceError, message not defined, runtime. (CORRECT)
//   (b) Yes, "later" logs - after throwing the error JS would print later because
//       no command remaining in the call stack. (WRONG)
// LOST IT (b): An UNCAUGHT runtime error HALTS execution - everything after the
//   throw does not run. AND greet() is the FIRST line; the setTimeout line is
//   AFTER it, so it's NEVER REACHED - the callback is never registered, can't
//   fire. "later" never logs. (Deferral model misapplied - it only matters if
//   setTimeout actually ran.)
// 10/10 MODEL:
//   (a) ReferenceError, runtime (greet is hoisted, runs; reference lookup fails).
//   (b) No. greet() runs first, throws an uncaught ReferenceError -> script halts.
//       The setTimeout line (after greet()) is never reached, callback never
//       registered, never fires. Uncaught error stops everything past the throw.

// -----------------------------------------------------------------------------
// Q9 — 10/10  (3 + 5 + 2)
// -----------------------------------------------------------------------------
// Q: why event listeners are "heavy"; what to do, and what does that allow?
// MY ANSWER:
//   (a) Once used, they can't free their memory / the callback's lexical env even
//       when the stack is empty; it doesn't know when the user triggers the event,
//       hence heavy on memory.
//   (b) Remove the listeners; then the engine can free up the memory / lexical env.
// NO DEDUCTIONS. (Tighten: NAME them - it's a CLOSURE, and freeing = GARBAGE
//   COLLECTION. You described both precisely; land the words.)
// 10/10 MODEL:
//   (a) Listeners form CLOSURES: the callback closes over its lexical env. While
//       registered, the engine must keep it alive (event could fire anytime), so
//       captured variables can't be GC'd even when the stack is empty.
//   (b) removeEventListener detaches it; once nothing references it, the garbage
//       collector reclaims the callback and its captured env.

// -----------------------------------------------------------------------------
// Q10 — 1/10  (1 + 0 + 0)   <- #1 MISCONCEPTION REGRESSED
// -----------------------------------------------------------------------------
// Q: btn.addEventListener("click", function(){...}).
//    (a) statement or expression position? justify.
//    (b) T/F: storing/passing a function converts it from a statement into an
//        expression.
// MY ANSWER:
//   (a) Statement position, because an anonymous function without a name sits in
//       statement position. (WRONG - inverted)
//   (b) True; can't explain. (WRONG - it's False; affirmed the misconception)
// THE FIX:
//   - The function is an ARGUMENT = a value being handed in = EXPRESSION position.
//   - The tell I already had: an ANONYMOUS function can ONLY be an expression,
//     because a function STATEMENT REQUIRES A NAME. A nameless function that
//     parses fine PROVES it's in an expression slot. I used the right observation
//     to reach the opposite conclusion.
//   - (b) FALSE. Nothing "converts." Statement-vs-expression is fixed by WHERE the
//     code is WRITTEN, at write-time. A function in a value slot was ALREADY an
//     expression; a variable just holds a reference. KILL the word "becomes."
// 10/10 MODEL:
//   (a) Expression position - it's an argument passed to addEventListener; that's
//       exactly why the anonymous form is legal.
//   (b) False. Position is fixed by where a function is written, not by storing or
//       passing it. A function in a value slot is already an expression; the
//       variable merely references it. Nothing converts.

// -----------------------------------------------------------------------------
// Q11 — 8.5/10  (3 + 4 + 1.5)
// -----------------------------------------------------------------------------
// Q: log 1; setTimeout(2,0); log 3; setTimeout(4,0); log 5.
//    (a) order? (b) why both callbacks after every sync log?
// MY ANSWER:
//   (a) 1,3,5,2,4 (correct)
//   (b) Callbacks end up after sync because the engine puts the async commands
//       somewhere else to run when the stack is empty.
// LOST IT: vague. The setTimeout CALL itself runs synchronously (registers
//   callback, returns immediately, non-blocking); only the CALLBACK is set aside.
//   "asynchronous command" blurs that; last clause restates instead of explains.
// 10/10 MODEL:
//   (a) 1,3,5,2,4.
//   (b) Sync logs 1,3,5 run first on the single stack. Each setTimeout runs
//       synchronously - registers its callback, returns immediately. A deferred
//       callback runs only once the stack is fully empty (after all sync code), so
//       2,4 come last, in registration order (2 before 4).

// -----------------------------------------------------------------------------
// Q12 — 10/10  (3 + 5 + 2)   <- Ep 11 payoff, produced cold
// -----------------------------------------------------------------------------
// Q: setup(){ let n=10; log a; setTimeout(log n,0); n=20; log b } setup().
//    (a) order + exact value logged? (b) why - tie deferral + closure.
// MY ANSWER:
//   (a) a, b, 20. Value = 20.
//   (b) Logs 20 because the callback holds the REFERENCE of the variable, not the
//       actual value; when the timeout actually runs, n was 20, so it prints 20.
// NO DEDUCTIONS.
// 10/10 MODEL:
//   (a) a, b, 20.
//   (b) The closure holds a reference to the variable n, not a value-snapshot. The
//       callback is deferred - runs only after sync code finishes (after n=20) and
//       the stack is empty - and reads n's current value at execution time -> 20.

// =============================================================================
// WEAK-SPOT TRACKER (final, this episode)
// =============================================================================
// [PRIORITY 1] STATEMENT vs EXPRESSION — REGRESSED (Q10=1). Not closing on its
//   own; today I AFFIRMED the misconception ("storing converts statement->
//   expression" = True; called an argument-position fn a "statement"). Rule to
//   burn in: position is fixed at WRITE-TIME by WHERE the code sits; anonymous
//   fn => can only be an expression (statements need a name); nothing "becomes."
// [PRIORITY 2] CONSTRUCTION (Q7=4.5) — design right, code broken: missing
//   `function`, unquoted strings, addEventListener casing, post- vs pre-increment.
//   Understanding runs ahead of construction. Needs WRITING reps, not just traces.
// [PRIORITY 3] UNCAUGHT-ERROR-HALT / parse-vs-runtime (Q8=3) — an uncaught runtime
//   error halts everything AFTER the throw; also mind SOURCE ORDER (a line after
//   the crash never runs / never registers).
// [PRECISION/TIMING] state WHEN (immediacy), name the concept (closure, GC),
//   "registered" != "running", setTimeout call is sync (only the callback defers).
//
// HOLDING UP (real, not flattery): deferral + closure + memory + runtime - four
//   10s (Q4, Q6, Q9, Q12), incl. the Ep 11 setTimeout+closure payoff produced cold.
//   Ep 11/12 remain UNVERIFIED on record, but the setTimeout+closure idea is solid.