/* ============================================================================
   PROMISE — DEEP NOTES (first principles, runnable)
   Namaste JavaScript track. Format: commented-code. Every example runs; predicted
   output is annotated so you can verify, not trust.

   How to read this file: top to bottom is layered —
     problem  ->  what a promise is  ->  guarantees  ->  consuming  ->  creating
     ->  chaining  ->  errors  ->  microtask timing  ->  combinators  ->  async/await
     ->  pitfalls  ->  mental model.

   Run any section with:  node promise_deep_notes.js   (or paste blocks into a console)
   ============================================================================ */


/* ============================================================================
   LAYER 0 — WHY ASYNC EXISTS AT ALL (the ground floor)
   ============================================================================
   JS has ONE call stack and ONE main thread. "Single-threaded" means: at any
   instant, exactly one piece of JS is executing. There is no second worker
   pulling code off in parallel by default.

   Consequence: if a long operation (network request, timer, disk read) ran ON
   the stack, the stack would be occupied for its whole duration. Nothing else
   could run — no clicks, no rendering, no other code. The page would freeze.

   The fix is NOT threads. The fix is DELEGATION. Operations that take time are
   handed to the environment (browser Web APIs / Node's libuv), which does the
   waiting OFF the JS stack. When the work finishes, the environment needs a way
   to hand the result BACK into JS. That hand-back mechanism is a function you
   registered in advance — a CALLBACK.

   So callbacks are not a "feature for convenience". They are the structural
   consequence of: single thread + non-blocking I/O. You must leave a function
   behind to be called later, because you cannot block waiting for the answer.

   Promises do NOT replace this machinery. A promise is still resolved by a
   callback somewhere underneath. Promises change the *shape of the API* you
   program against, and the *trust guarantees* you get. That is the whole point.
*/


/* ============================================================================
   LAYER 1 — THE TWO PROBLEMS WITH RAW CALLBACKS
   ============================================================================
   Precision first: there are TWO distinct problems. People blur them. Don't.

   PROBLEM 1: Callback Hell (a.k.a. Pyramid of Doom)
     A *readability/structure* problem. Sequential async steps nest rightward.
*/

// createOrder(cart, function (orderId) {
//   proceedToPayment(orderId, function (paymentInfo) {
//     showOrderSummary(paymentInfo, function (balance) {
//       updateWalletBalance(balance, function () {
//         // ...the code grows sideways. Hard to read, hard to reorder, hard to
//         //   reason about error handling at each level.
//       });
//     });
//   });
// });

/* The nesting is ugly, but ugliness alone is survivable. The deeper problem is:

   PROBLEM 2: Inversion of Control  (THE important one)
     When you pass YOUR callback INTO someone else's function, you hand them
     control over IF / WHEN / HOW MANY TIMES / WITH WHAT your code runs.

         createOrder(cart, myCallback);   // I just gave away control of myCallback

     Now createOrder — possibly third-party code you did not write — decides:
       - whether to call myCallback at all       (it might silently drop it)
       - whether to call it once or 5 times      (double-charge a payment)
       - whether to call it too early / too late
       - what arguments to pass                  (could pass garbage)
       - whether to call it synchronously OR asynchronously, inconsistently
         (this last one is "releasing Zalgo": same API sometimes sync, sometimes
          async, which makes ordering unpredictable)
       - whether to swallow an error and never tell you

   THIS is the trust crisis. You are trusting foreign code with the execution of
   your code. That is the thing promises were built to fix. Keep callback hell
   and inversion of control SEPARATE in your head — chaining fixes the first,
   the promise object itself fixes the second.
*/


/* ============================================================================
   LAYER 2 — WHAT A PROMISE *IS*
   ============================================================================
   A Promise is an OBJECT. Specifically: a placeholder / container for a value
   that is not available yet but will be (or will fail) in the future — the
   eventual result of an async operation.

   The control flip:
     RAW CALLBACK:   createOrder(cart, myCallback)
                     -> I pass my code INTO createOrder. createOrder holds it.

     PROMISE:        const p = createOrder(cart)   // returns a promise object
                     p.then(myCallback)            // I attach to an object I HOLD

   The difference that matters: in the promise version, createOrder no longer
   holds my callback. It holds a promise object and its only job is to "settle"
   that object. *I* attach my handler to the object. Control stays with me. The
   promise machinery (the spec) guarantees how/when my handler fires. I am no
   longer trusting createOrder's discretion — I am trusting the Promise spec,
   which is fixed and uniform.

   Mental image: a promise is a "ticket" for a future value. You hold the ticket.
   When the value is ready, the ticket's registered handlers fire — under rules
   the spec enforces, not rules createOrder invents.
*/


/* ============================================================================
   LAYER 3 — PROMISE STATES + INTERNAL SLOTS
   ============================================================================
   A promise is ALWAYS in exactly one of three states:

     pending    -> initial. Not yet settled. No value yet.
     fulfilled  -> the async op succeeded. Has a *value*.
     rejected   -> the async op failed. Has a *reason* (usually an Error).

   Two transitions only, and each happens AT MOST ONCE:
     pending -> fulfilled
     pending -> rejected

   Once it leaves pending, it is SETTLED and FROZEN forever. It cannot change
   state again, and the value/reason cannot change. This immutability is a
   guarantee you'll lean on constantly.

   The engine tracks this with internal slots (you can see them in DevTools):
     [[PromiseState]]   : "pending" | "fulfilled" | "rejected"
     [[PromiseResult]]  : undefined while pending; the value or the reason once settled

   --- PRECISION TRAP: "settled" vs "resolved" vs "fulfilled" ---
   These are NOT synonyms.
     settled   = fulfilled OR rejected (i.e. no longer pending). A final outcome.
     fulfilled = settled WITH a value (the success branch specifically).
     resolved  = "locked in to a fate". A resolved promise is one that has been
                 told what to follow. If you resolve a promise with a *plain
                 value*, it becomes fulfilled immediately. But if you resolve it
                 with ANOTHER promise/thenable that is still pending, the promise
                 is "resolved" yet STILL PENDING — it's now chained to wait for
                 that other thenable.
   So: resolved ≠ fulfilled. A resolved promise can still be pending.
   Say "fulfilled" when you mean the success branch; "settled" when you mean
   "done one way or the other"; "resolved" only when you mean "its fate is tied".
*/


/* ============================================================================
   LAYER 4 — THE GUARANTEES (why a promise is *trustworthy*)
   ============================================================================
   Map each guarantee back to a Layer-1 betrayal it neutralizes:

   G1. Your handler is invoked AT MOST ONCE.
       -> kills the "called twice" betrayal (e.g. double payment). After settle,
          the state is frozen; attaching/firing again is impossible.

   G2. If the promise is ALREADY settled when you attach a handler, your handler
       STILL runs (asynchronously, soon).
       -> kills the "called before I attached / race on registration" betrayal.
          You cannot "miss" the result by attaching late.

   G3. Handlers ALWAYS run asynchronously — on the microtask queue — never
       synchronously inside .then(), even if the promise is already settled.
       -> kills Zalgo (the sometimes-sync-sometimes-async inconsistency). Timing
          is uniform and predictable. (Proof in Layer 8.)

   G4. State and value are IMMUTABLE once settled.
       -> kills the "value changed under me" betrayal.

   These four are why you can hand a promise to untrusted code and still reason
   about it: the guarantees come from the spec, not from the producer's goodwill.
*/


/* ============================================================================
   LAYER 5 — CONSUMING A PROMISE: .then / .catch / .finally
   ============================================================================
   .then(onFulfilled, onRejected)
       - onFulfilled runs if the promise fulfills, receiving the VALUE.
       - onRejected  runs if it rejects, receiving the REASON.
       - both are OPTIONAL. Missing handlers are "passed through" (Layer 7).

   .catch(onRejected)
       - is literally sugar for .then(undefined, onRejected).
       - it is NOT a separate mechanism; it's a .then with only the reject slot.

   .finally(onFinally)
       - runs on EITHER outcome. Receives NO argument (it doesn't know/needn't
         know whether it was value or reason). Use for cleanup (hide spinner,
         close handle). It PASSES THROUGH the original value/reason to the next
         link — it does not swallow or replace it (unless it throws).
*/

Promise.resolve(42).then((v) => console.log("L5 fulfilled with:", v));
// L5 fulfilled with: 42

Promise.reject(new Error("boom")).catch((e) => console.log("L5 caught:", e.message));
// L5 caught: boom

Promise.resolve("x")
  .finally(() => console.log("L5 finally ran (no arg)"))
  .then((v) => console.log("L5 value passed through finally:", v));
// L5 finally ran (no arg)
// L5 value passed through finally: x


/* ============================================================================
   LAYER 6 — CREATING A PROMISE (the producer side)
   ============================================================================
   new Promise(executor)
     - executor is a function (resolve, reject) => { ... }
     - CRITICAL: the executor runs SYNCHRONOUSLY and IMMEDIATELY, the moment you
       call `new Promise(...)`. It is NOT deferred. (Common misconception.)
     - resolve(value) : transitions pending -> fulfilled (or adopts, if value is
                        a thenable — see precision trap in Layer 3).
     - reject(reason) : transitions pending -> rejected.
     - A `throw` inside the executor is auto-converted into reject(thrownError).
     - Calling resolve/reject more than once: only the FIRST call counts; the
       rest are silently ignored (this is G1 enforced at the producer side).
*/

console.log("L6 before new Promise");
const made = new Promise((resolve, reject) => {
  console.log("L6 executor runs SYNC, right now");   // runs immediately
  resolve("done");
  resolve("ignored");      // ignored — already settled
  reject("also ignored");  // ignored
});
console.log("L6 after new Promise (promise is already settled but handler is async)");
made.then((v) => console.log("L6 handler:", v));
/* Predicted order:
   L6 before new Promise
   L6 executor runs SYNC, right now
   L6 after new Promise (...)
   L6 handler: done            <- async (microtask), so it's LAST
*/

// Promisifying a callback API (turning old-style into a promise):
function delay(ms, value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
// delay is now a promise-returning function built from a callback API (setTimeout).


/* ============================================================================
   LAYER 7 — CHAINING (this is what flattens the pyramid)
   ============================================================================
   THE ONE RULE THAT MAKES CHAINING WORK:
     .then() ALWAYS returns a NEW promise. (So does .catch and .finally.)
     The fate of that NEW promise depends on what your handler does:

       handler RETURNS a plain value   -> new promise FULFILLS with that value
       handler RETURNS a promise/thenable -> new promise ADOPTS it (waits, then
                                             takes its outcome) — this is the
                                             "resolved-but-pending" case
       handler RETURNS nothing (undefined) -> new promise fulfills with undefined
       handler THROWS                   -> new promise REJECTS with what was thrown

   Because each .then hands its result to the NEXT .then, you write a flat
   vertical chain instead of a rightward pyramid. THIS is the fix for callback
   hell (Problem 1 from Layer 1) — distinct from the inversion-of-control fix.

   Pyramid (bad)            ->     Chain (good)
   ----------------                -------------------
   a(() => {                       a()
     b(() => {                       .then(() => b())
       c(() => {})                   .then(() => c())
     })                              .then(() => d())
   })                                .catch(handleAnyError)
*/

delay(50, 2)
  .then((n) => {
    console.log("L7 step1 got:", n);
    return n * 10;            // plain value -> next fulfills with 20
  })
  .then((n) => {
    console.log("L7 step2 got:", n);
    return delay(50, n + 5);  // returns a PROMISE -> chain WAITS for it (adopts)
  })
  .then((n) => {
    console.log("L7 step3 got (after waiting):", n);  // 25
  });
/* Predicted:
   L7 step1 got: 2
   L7 step2 got: 20
   L7 step3 got (after waiting): 25
   Key insight: step3 only ran AFTER the inner delay(50,...) settled, because
   step2 RETURNED that promise. If you forget to `return` it, step3 runs
   immediately with `undefined` and does NOT wait. (Pitfall — Layer 11.)
*/


/* ============================================================================
   LAYER 8 — ERROR HANDLING & PROPAGATION DOWN A CHAIN
   ============================================================================
   A rejection travels DOWN the chain, skipping every .then that has no reject
   handler, until it hits the nearest onRejected / .catch. This is why ONE
   .catch at the end can cover the whole chain above it.

   After a .catch HANDLES the error (returns normally, doesn't re-throw), the
   chain RECOVERS: the promise .catch returns is FULFILLED, so the next .then
   runs on the success path again. A .catch is a recovery point, not a dead end.

   If the .catch itself throws or returns a rejected promise, the rejection
   keeps propagating to the next reject handler further down.

   A `throw` anywhere in a .then handler becomes a rejection of that link's
   output promise — so synchronous throws and async rejections are unified into
   ONE error channel. That unification is a major promise win over callbacks
   (where sync throws and async errors needed different handling).
*/

Promise.resolve("start")
  .then((v) => {
    console.log("L8 step1:", v);
    throw new Error("step1 failed");      // becomes a rejection
  })
  .then((v) => {
    console.log("L8 step2 (SKIPPED, no value here)", v); // skipped — upstream rejected
  })
  .catch((e) => {
    console.log("L8 caught:", e.message); // step1 failed
    return "recovered";                   // recovery -> downstream fulfills
  })
  .then((v) => {
    console.log("L8 after recovery:", v); // recovered
  });
/* Predicted:
   L8 step1: start
   L8 caught: step1 failed
   L8 after recovery: recovered
   (the "step2 SKIPPED" line never prints — that handler was bypassed)
*/

/* UNHANDLED REJECTION: a rejected promise with NO reject handler anywhere
   triggers an 'unhandledrejection' event (browser) / process warning (Node).
   This is the spec telling you "an error fell off the end of a chain". Always
   terminate chains with a .catch (or handle via try/catch under async/await). */


/* ============================================================================
   LAYER 9 — MICROTASK QUEUE & EVENT-LOOP TIMING (connects to your runtime notes)
   ============================================================================
   Promise handlers (.then/.catch/.finally callbacks) do NOT go to the same queue
   as setTimeout. There are (at least) two queues:

     MICROTASK QUEUE  : promise reactions, queueMicrotask, MutationObserver.
     MACROTASK / TASK QUEUE ("callback queue") : setTimeout, setInterval, I/O,
                                                 DOM events.

   The event loop rule (the part people get wrong):
     1. Run the current synchronous code to completion (until the call stack
        empties).
     2. DRAIN THE ENTIRE MICROTASK QUEUE — run every microtask, including any
        microtasks scheduled WHILE draining, until the queue is empty.
     3. THEN take ONE macrotask (e.g. one setTimeout callback).
     4. Drain microtasks again. Repeat.

   Practical consequence: a promise .then ALWAYS runs before a setTimeout(…, 0)
   that was scheduled at the same moment, because microtasks are fully drained
   before the next macrotask is even touched.

   Starvation warning: if microtasks keep scheduling more microtasks, step 2
   never finishes and macrotasks (and rendering) STARVE. Microtasks are
   higher-priority, which is power and footgun at once.
*/

console.log("L9 A (sync)");
setTimeout(() => console.log("L9 D (macrotask / setTimeout 0)"), 0);
Promise.resolve().then(() => console.log("L9 C (microtask / .then)"));
console.log("L9 B (sync)");
/* Predicted order — trace it before reading:
   L9 A (sync)        <- sync, runs now
   L9 B (sync)        <- sync, runs now
   L9 C (microtask)   <- stack empty -> drain microtasks FIRST
   L9 D (macrotask)   <- only after microtask queue is empty
   Memorize the shape: all sync -> all microtasks -> one macrotask.
*/


/* ============================================================================
   LAYER 10 — PROMISE COMBINATORS (the static methods)
   ============================================================================
   These take an ITERABLE of promises and return ONE promise. Learn them by
   their SETTLEMENT RULE — that's the only thing that distinguishes them.

   Promise.resolve(v) / Promise.reject(r)
       - shortcuts to an already-settled promise. Promise.resolve(thenable)
         ADOPTS the thenable (resolved-but-maybe-pending).

   Promise.all([...])
       - FULFILLS with an array of all values, IN INPUT ORDER (not completion
         order), once EVERY input fulfills.
       - REJECTS immediately on the FIRST rejection (fail-fast). The others keep
         running but their outcomes are discarded.
       - Use when you need ALL results and any failure dooms the whole batch.

   Promise.allSettled([...])
       - NEVER rejects. Always fulfills, once every input SETTLES, with an array
         of result objects:
             { status: "fulfilled", value }   or   { status: "rejected", reason }
       - Use when you want every outcome regardless of individual failures.

   Promise.race([...])
       - Settles as soon as the FIRST input SETTLES — adopting that outcome,
         whether it's a fulfillment OR a rejection. First to finish wins, even
         if it loses (rejects).
       - Use for timeouts: race(work, rejectAfter(5s)).

   Promise.any([...])
       - FULFILLS with the first FULFILLMENT (ignores rejections).
       - If ALL inputs reject, it rejects with an AggregateError (a bundle of all
         the reasons).
       - Use when ANY one success is enough.

   Quick contrast table (settlement triggers):
       all        : all fulfill -> fulfill ; any reject -> reject (fast)
       allSettled : all settle  -> fulfill (never rejects)
       race       : first settle -> adopt that outcome (win OR lose)
       any        : first fulfill -> fulfill ; all reject -> reject(AggregateError)
*/

Promise.all([delay(30, "a"), delay(10, "b"), delay(20, "c")])
  .then((vals) => console.log("L10 all (input order!):", vals));
// L10 all (input order!): [ 'a', 'b', 'c' ]   <- NOT completion order

Promise.race([delay(30, "slow"), delay(10, "fast")])
  .then((v) => console.log("L10 race winner:", v));
// L10 race winner: fast

Promise.allSettled([Promise.resolve(1), Promise.reject("nope")])
  .then((rs) => console.log("L10 allSettled:", rs));
// L10 allSettled: [ {status:'fulfilled',value:1}, {status:'rejected',reason:'nope'} ]


/* ============================================================================
   LAYER 11 — ASYNC / AWAIT (syntactic sugar OVER promises — not a replacement)
   ============================================================================
   Two facts unlock everything:

   FACT 1: An `async function` ALWAYS returns a promise.
       - `return x`  -> the returned promise fulfills with x (x is wrapped via
                        Promise.resolve, so returning a promise adopts it).
       - `throw e`   -> the returned promise rejects with e.

   FACT 2: `await p` PAUSES the async function until p settles.
       - if p fulfills -> await EVALUATES TO the value (await is an expression;
                          it produces a value — say it precisely).
       - if p rejects  -> await THROWS the reason (catch it with try/catch).
       - awaiting a non-promise wraps it via Promise.resolve first.

   Under the hood: `await` does NOT block the thread. It SUSPENDS the function,
   returns control to the caller, and schedules the REST of the function to
   resume as a microtask once p settles. So async/await runs on the exact same
   promise + microtask machinery from Layers 7–9. It only LOOKS synchronous.

   try/catch around await is the async/await equivalent of .catch — same error
   channel (Layer 8), nicer syntax.
*/

async function flow() {
  try {
    const a = await delay(20, 5);      // await EVALUATES TO 5
    console.log("L11 a:", a);
    const b = await delay(20, a * 2);  // 10
    console.log("L11 b:", b);
    return b + 1;                      // async fn returns a promise fulfilling with 11
  } catch (e) {
    console.log("L11 caught:", e.message);
  }
}
flow().then((r) => console.log("L11 flow resolved with:", r));
/* Predicted:
   L11 a: 5
   L11 b: 10
   L11 flow resolved with: 11
*/

/* SEQUENTIAL vs PARALLEL with await — a real performance mistake:
   await in a loop SERIALIZES (each waits for the previous). If the tasks are
   independent, that's wasted time. Kick them off first, then await together. */
// SLOW (serial): total ~ sum of durations
//   for (const job of jobs) { await job(); }
// FAST (parallel): total ~ max of durations
//   await Promise.all(jobs.map((job) => job()));


/* ============================================================================
   LAYER 12 — PITFALLS & ANTI-PATTERNS (where real bugs live)
   ============================================================================

   P1. FORGETTING TO `return` inside .then.
       .then(x => { doAsync(x); })   // returns undefined -> chain does NOT wait
       .then(x => doAsync(x))        // returns the promise -> chain waits. RIGHT.
       Symptom: the next step runs too early with `undefined`.

   P2. CALLING vs PASSING the handler (your known precision gap — HOF/callback):
       .then(handleResult)    // PASS the function reference. Promise calls it later
                              //   WITH the value. Correct.
       .then(handleResult())  // CALL it NOW; pass its RETURN VALUE as the handler.
                              //   Usually a bug: it ran immediately, and unless it
                              //   returned a function, .then got a non-function and
                              //   silently passes the value through.
       Precision: `handleResult` is a reference (an expression evaluating to a
       function value); `handleResult()` is an invocation (an expression
       evaluating to whatever it returns). Both are expressions that evaluate to
       a value — name the value each produces.

   P3. NESTING .then inside .then (rebuilding the pyramid you escaped):
       .then(a => { getB(a).then(b => { ... }); })   // pyramid is back
       Fix: RETURN the inner promise and chain flatly:
       .then(a => getB(a)).then(b => { ... })

   P4. SWALLOWING ERRORS: a chain with no .catch (or an empty catch) hides
       failures -> unhandled rejection, or worse, silent wrong behavior.

   P5. THE `new Promise` ANTI-PATTERN (explicit construction antipattern):
       Don't wrap an API that ALREADY returns a promise inside `new Promise`:
         // BAD: return new Promise((res, rej) => fetchThing().then(res, rej));
         // GOOD: return fetchThing();
       You only need `new Promise` to bridge a NON-promise (callback/event) API.

   P6. async with array .forEach does NOT await:
       arr.forEach(async x => { await work(x); });  // forEach ignores the returned
                                                     //   promises; nothing waits.
       Fix: `for (const x of arr) { await work(x); }`  (serial)
         or `await Promise.all(arr.map(x => work(x)));` (parallel)

   P7. Assuming Promise.all gives results in COMPLETION order. It gives them in
       INPUT order (Layer 10). Easy to misread when debugging.
*/


/* ============================================================================
   LAYER 13 — MENTAL MODEL + CROSS-TOPIC HOOKS (closures / GC / reachability)
   ============================================================================
   - A promise is a heap object holding [[PromiseState]] + [[PromiseResult]] +
     a list of reaction records (the handlers you attached while it was pending).

   - Your .then handler is a CLOSURE. It captures the surrounding lexical scope.
     While the promise is pending, the promise holds a reference to that handler,
     and the handler holds references to whatever it closes over. So those
     captured variables are REACHABLE and cannot be garbage-collected until the
     promise settles AND its reactions have run and been released. (This is the
     same reachability lens from your closures<->GC notes — a pending promise is
     a live root keeping its handlers' captured state alive.)

   - A promise that is pending forever with attached handlers is a small leak:
     its handlers (and their captured scope) stay reachable indefinitely.

   - The "settle once, frozen forever" rule (Layer 3/4) is what makes promises
     safe to share: hand the SAME promise to many consumers; each .then gets the
     same frozen value; no consumer can mutate the outcome for another.

   ONE-LINE SUMMARY OF THE WHOLE TOPIC:
   A promise is a trustworthy, immutable, single-settlement container for a future
   value; .then returns a new promise so outcomes flow down a flat chain; handlers
   run as microtasks under fixed spec guarantees; async/await is just nicer syntax
   over that same machinery.
   ============================================================================ */
