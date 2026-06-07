// =============================================================================
// EP 14 — CALLBACK FUNCTIONS ft. EVENT LISTENERS
// Notes + Quiz Log (Day 10)
// Namaste JavaScript (Akshay Saini). Vardhan.
// =============================================================================
//
// Quiz status when this file was written:
//   Q1 7.5 | Q2 8 | Q3 5 | Q4 10 | Q5 8.5 | Q6 10  -> running avg 8.17 over 6
//   Q7 POSED, NOT ATTEMPTED -> NO answer recorded here (no answer-key pre-print).
//   Q8-Q12 UNDELIVERED.
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
//   *** This was my Q3 miss: I had "C in queue" backwards. C = synchronous on
//       the stack. B = the deferred callback. Don't invert this again. ***

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
//   "registered & waiting" from "running."
// - One registration -> unlimited later calls, until removeEventListener detaches it.

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
//   The callback closes over attachCounter's scope, so its variables persist and
//   stay usable after the parent finishes.

// -----------------------------------------------------------------------------
// 8. MEMORY: event listeners are "heavy"
// -----------------------------------------------------------------------------
// - Because listeners form closures, the variables they capture are NOT freed
//   even when the call stack is empty - the engine can't know the listener won't
//   need them on a future event.
// - Many listeners (onClick, onHover, onScroll across a page) hold memory and can
//   slow the page down.
// - FIX: removeEventListener when a listener is no longer needed, so its closure
//   (and captured memory) can be garbage-collected.

// =============================================================================
// PART B — QUIZ LOG  (Q1-Q6 attempted & graded; Q7 open)
// Rubric: 3 result + 5 mechanism + 2 precision = 10
// =============================================================================

// -----------------------------------------------------------------------------
// Q1 — 7.5/10  (3 + 3.5 + 1)
// -----------------------------------------------------------------------------
// Q: (a) Define what "single-threaded" means for how JS executes code - the
//        actual constraint, not the label.
//    (b) What does passing a callback let you achieve, and what Ep 13 capability
//        makes handing a function to setTimeout/addEventListener possible?
//
// MY ANSWER:
//   (a) Single-threaded means JS can only process one piece of code at once; it
//       can't process multiple things at a time, because it has only one main
//       call stack which defines the order of processing - only a single
//       function/code can be processed at once.
//   (b) Callback helps unlock the asynchronous type of JS because it can be
//       processed regardless to the pattern of processing of code. The ability of
//       a function to be used as a value, stored in a variable, and passed
//       through different functions is what makes handling setTimeout /
//       addEventListener possible.
//
// WHERE I LOST IT: (b) was vague - "processed regardless to the pattern" hides
//   the mechanism. The real point is DEFERRAL: a callback defers execution to
//   later (timer expiry / event) so the main thread keeps running. Also JS isn't
//   "the asynchronous type"; it's synchronous + single-threaded.
//
// 10/10 MODEL:
//   (a) JS has exactly one call stack and executes one command at a time, top to
//       bottom, in order; it cannot run two operations simultaneously. The single
//       stack is the constraint.
//   (b) A callback defers a function's execution to a later point - fired when a
//       setTimeout timer expires or an addEventListener event occurs - so the main
//       thread continues instead of waiting. That deferral is how synchronous,
//       single-threaded JS achieves async behavior. Possible only because Ep 13
//       established functions as first-class values: a function can be passed as
//       an argument, so you hand it over to be called back later.

// -----------------------------------------------------------------------------
// Q2 — 8/10  (3 + 3.5 + 1.5)
// -----------------------------------------------------------------------------
// Q: (a) Why the name "callback" - what is called back, by whom?
//    (b) setTimeout(fn, 1000) vs setTimeout(fn(), 1000): what gets handed to
//        setTimeout in each case, and what does each do?
//
// MY ANSWER:
//   (a) A function passed as an argument is the callback; named callback because
//       it's going to be called back by the function it's passed to.
//   (b) First case: fn is passed as a reference, used to call fn back. Second
//       case: fn is getting called, which won't work because setTimeout needs a
//       reference to use in the callback.
//
// WHERE I LOST IT: (b) stopped at "won't work." Missing the two consequences:
//   (1) fn() runs IMMEDIATELY/synchronously now, not after 1000ms; (2) setTimeout
//   receives fn's RETURN VALUE, not fn. Timing is my known blind spot - state it.
//
// 10/10 MODEL:
//   (a) The callback is the function being called back: handed to a higher-order
//       function which invokes it later at the right moment. The receiving
//       function does the calling-back.
//   (b) setTimeout(fn, 1000): the reference fn is handed to setTimeout, stored,
//       invoked after ~1000ms. setTimeout(fn(), 1000): fn() executes immediately
//       and synchronously at that line; its return value is passed to setTimeout -
//       nothing is deferred, and if fn returns undefined the timer has nothing
//       useful to call.

// -----------------------------------------------------------------------------
// Q3 — 5/10  (3 + 2 + 0)   <- session low; model-inversion error
// -----------------------------------------------------------------------------
// Q: console.log("A"); setTimeout(()=>console.log("B"),0); console.log("C");
//    (a) Predict the output order.
//    (b) Delay is 0ms yet B isn't second. Why, at the single-call-stack level?
//
// MY ANSWER:
//   (a) A, C, B  (correct)
//   (b) B wasn't second because even at 0ms it was delayed for later; JS tries to
//       start its timer whenever it gets time, and since it's single-threaded and
//       "log(c) was also in queue," B didn't print second.
//
// WHERE I LOST IT: INVERTED the model. C is NOT queued - C is synchronous code
//   on the call stack, the next line, runs immediately. The ONLY deferred thing
//   is the callback B. "JS tries to start its timer whenever it gets time" is too
//   vague to show the real reasoning -> precision 0.
//
// 10/10 MODEL:
//   Output A, C, B. JS runs synchronous code top-to-bottom on the single call
//   stack: A logs, setTimeout registers the callback and returns immediately
//   (non-blocking), C logs. Only once all synchronous code is done and the stack
//   is empty can the deferred callback run -> B last. The 0 is a MINIMUM delay,
//   not a promise to run now; a deferred callback never cuts ahead of sync code.

// -----------------------------------------------------------------------------
// Q4 — 10/10  (3 + 5 + 2)   <- corrected the Q3 inversion on harder ground
// -----------------------------------------------------------------------------
// Q: start; setTimeout(timeout done, 1000); ~10s heavy sync loop; end.
//    (a) ~1s or ~10s+? Output order?
//    (b) What is "blocking the main thread"; why doesn't the timer fire at 1s?
//
// MY ANSWER:
//   (a) More than 10 seconds after start. Output: start, end, timeout done.
//   (b) The 10s heavy loop blocks the main thread; JS can't move on before the
//       loop ends because it's single-threaded and runs top-to-bottom and must
//       finish the synchronous loop first. Even though the 1s timer expires on
//       time, JS doesn't run the callback when the timer ends - it runs the
//       callback only when the call stack is free.
//
// NO DEDUCTIONS. This is the exact model I had backwards in Q3, fixed.
//
// 10/10 MODEL (mine, tightened):
//   The loop occupies the single call stack ~10s; single-threaded, so nothing
//   else runs until it finishes = blocking the main thread. setTimeout is
//   non-blocking: it registers the callback and returns immediately, and the 1s
//   timer expires on schedule in the background. But an expired timer can't force
//   its callback onto a busy stack. The callback runs only after the sync code
//   (loop + end) completes and the stack empties -> ~10s. Delay = minimum, never
//   a guarantee.
//   (Fold in next time: SAY OUT LOUD that setTimeout returns immediately.)

// -----------------------------------------------------------------------------
// Q5 — 8.5/10  (3 + 4 + 1.5)
// -----------------------------------------------------------------------------
// Q: btn.addEventListener("click", function(){ console.log("clicked"); });
//    (a) Identify the callback; who calls it back and when?
//    (b) Executed once now, or many times later? Why, re what addEventListener does?
//
// MY ANSWER:
//   (a) The anonymous function with log("clicked") is the callback;
//       addEventListener calls it back when #btn is clicked.
//   (b) Potentially many times later, because addEventListener uses the callback
//       and doesn't get closed when it calls it - it still runs in the background
//       and listens for clicks, so it can use the callback multiple times.
//
// WHERE I LOST IT: "runs in the background." A registered listener doesn't RUN;
//   it sits DORMANT. addEventListener stores a reference; the browser invokes the
//   stored callback per click. Distinguish "registered & waiting" from "running."
//
// 10/10 MODEL:
//   (a) The callback is the anonymous function logging "clicked"; addEventListener
//       registers it; the browser calls it back each time a click fires on #btn.
//   (b) Many times later (or never). addEventListener does NOT invoke it now - it
//       stores a reference as the element's click handler. The function stays
//       registered and idle; each click makes the browser invoke it. Stays
//       attached, fires any number of times, until removeEventListener detaches it.

// -----------------------------------------------------------------------------
// Q6 — 10/10  (3 + 5 + 2)   <- clean closure trace
// -----------------------------------------------------------------------------
// Q: attachCounter() defines let count=0, attaches a click listener that does
//    count++ and logs count, then returns.
//    (a) Where does count live; why isn't it destroyed after attachCounter returns?
//    (b) Name the mechanism and explain it.
//
// MY ANSWER:
//   (a) count lives in attachCounter's lexical environment; the callback holds a
//       reference to count, so it survives after attachCounter returns. The
//       attachCounter context is popped, but count stays alive in the lexical
//       environment stored by the anonymous function's closure - "dead for
//       everyone but not for the callback."
//   (b) The mechanism is the closure: the bundle of the lexical environment of
//       its lexical parents plus the function. Variables declared in the parent's
//       execution context are retained and usable by the function.
//
// NO DEDUCTIONS. Standout line: "dead for everyone but not for the callback."
//
// 10/10 MODEL (mine, tightened):
//   (a) count lives in attachCounter's lexical environment. On return its context
//       is popped, but the registered callback holds a closure over that
//       environment, so count is NOT garbage-collected. Each click mutates the
//       SAME count -> rises 1,2,3 instead of resetting. Unreachable to outer code,
//       alive for the callback.
//   (b) Closure: a function bundled with a reference to its lexical scope. The
//       callback closes over attachCounter's scope, so its variables persist and
//       remain usable after the parent finishes.
//   (Phrasing note: count has ONE home = attachCounter's env; the closure retains
//    a reference to that home - don't say count "lives in the callback.")

// -----------------------------------------------------------------------------
// Q7 — OPEN. POSED, NOT YET ATTEMPTED.  ***NO ANSWER RECORDED (no pre-print)***
// -----------------------------------------------------------------------------
// Q (construction):
//   (a) Write runnable code: a function makeButtonCounter() that, when called,
//       attaches a click listener to #btn so each click logs how many times the
//       button has been clicked (1,2,3...). Count must be PRIVATE (no global).
//       Then write the line that activates it.
//   (b) State which line creates the closure and which variable holds the private
//       state.
//   Watch the Ep 13 traps: anonymous function only legal in a value position;
//   `return` is a statement, not something to put inside console.log().
//
//   MY ANSWER: <pending - to be attempted live>
//   MODEL:     <withheld until attempted>

// Q8-Q12: undelivered.

// =============================================================================
// WEAK-SPOT TRACKER (live, from this episode)
// =============================================================================
// - PARSE vs RUNTIME / deferral model: Q3 inverted (C "queued"), Q4 corrected.
//   Trend = improving. Keep saying which thing is synchronous-on-stack vs deferred.
// - PRECISION ON "RUNNING" vs "REGISTERED": Q5 "runs in the background." A
//   listener is dormant until the event. Watch this word.
// - TIMING SUB-PARTS: Q2 - state WHEN (fn() runs now) every time, not just "won't
//   work." Don't leave the timing/consequence half implicit.
// - CONSTRUCTION (Q7, in progress): the live test of writing valid code.