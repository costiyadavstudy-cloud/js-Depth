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
