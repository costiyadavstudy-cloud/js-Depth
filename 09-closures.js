// ============================================================================
// EP 10 — CLOSURES IN JS  (Namaste JavaScript, Akshay Saini)
// Clean concept notes. Reference material only.
// Covers concepts crystallized through Q1–Q4 of the fixed bank.
// Builds on: Ep 7 (scope chain / lexical environment) + Ep 4 (function execution
//            context / variable environment).
// ============================================================================


// ----------------------------------------------------------------------------
// 0. ONE-LINE DEFINITION
// ----------------------------------------------------------------------------
// A closure = a function bundled together with (references to) the variables of
// its lexical environment.
//
// PRECISION: the returned/inner function IS the closure. It does NOT "remember
// another function" — it carries LIVE REFERENCES to the variable bindings that
// lived in its lexical parent's scope. (Self-correction from Q4: don't say
// "the closure remembers the function which is returned".)


// ----------------------------------------------------------------------------
// 1. CAPTURE BY REFERENCE, NOT BY VALUE   (the central Ep 10 nuance)
// ----------------------------------------------------------------------------
// A closure holds the ACTUAL variable binding, not a snapshot/copy of its value
// at creation time. Consequences:
//   - Mutations to the variable PERSIST across calls (the binding is one, shared).
//   - If the variable changes later, the closure sees the NEW value.
//
// Q1 pattern — a returned counter:
//   function outer() {
//     let count = 0;
//     return function () { count++; console.log(count); };
//   }
//   const fn = outer();
//   fn(); // 1
//   fn(); // 2   <-- NOT 1. One count, captured by reference, so it ACCUMULATES.
//
// By-VALUE snapshot would have printed 1, 1. By-REFERENCE live binding prints 1, 2.


// ----------------------------------------------------------------------------
// 2. ONE INVOCATION = ONE SET OF BINDINGS  (independence comes from the CALL)
// ----------------------------------------------------------------------------
// Each CALL to the outer function builds a NEW execution context with its OWN
// fresh variables. Two calls => two independent environments => two independent
// closures.
//
// Q2 pattern:
//   const a = outer();  // context A, its own count_a
//   const b = outer();  // context B, its own count_b
//   a(); a(); // count_a: 1, 2
//   b();      // count_b: 1   <-- b does NOT continue from a
//
// PRECISION: independence is caused by the second INVOCATION creating a fresh
// binding — NOT by `a` and `b` being different variable names.
// Test: `const a = outer(); const b = a;` => SAME closure, SHARED count.


// ----------------------------------------------------------------------------
// 3. MULTIPLE CLOSURES FROM ONE INVOCATION SHARE THE BINDINGS
// ----------------------------------------------------------------------------
// The flip side of #2. If one invocation returns several functions, they all
// close over the SAME variables (same references) — shared private state.
//
// Q3 pattern:
//   function makeCounter() {
//     let count = 0;
//     return { inc: () => ++count, get: () => count };
//   }
//   const c = makeCounter();
//   c.inc(); c.inc();      // same count: 0 -> 1 -> 2
//   console.log(c.get());  // 2   <-- inc and get share ONE count
//
// inc and get are different functions but defined in the SAME invocation's scope,
// so both capture the same `count` binding by reference.


// ----------------------------------------------------------------------------
// 4. PARAMETERS ARE CAPTURED TOO  (function factories)
// ----------------------------------------------------------------------------
// A parameter is just a local variable in the function's own scope, so it is
// part of the lexical environment and gets closed over like any other variable.
//
// Q4 pattern:
//   function multiplier(factor) {        // `factor` is a local var of this scope
//     return function (n) { return n * factor; };
//   }
//   const double = multiplier(2);  // closure carries factor = 2
//   const triple = multiplier(3);  // closure carries factor = 3 (separate call!)
//   double(5);            // 10
//   triple(5);            // 15
//   double(triple(2));    // double(6) => 12   <-- trace nested calls carefully
//
// double/triple are independent for the SAME reason as Q2: two separate calls to
// multiplier, two separate `factor` bindings.


// ----------------------------------------------------------------------------
// 5. WHY THE MEMORY SURVIVES  (link to Ep 4 + Ep 7)
// ----------------------------------------------------------------------------
// - Ep 4: calling a function pushes an execution context (with its variable
//   environment) onto the call stack; when the function returns, that context is
//   popped off.
// - Normally its variables would be gone. But if a returned (or otherwise
//   persisted) inner function still REFERENCES those variables, the environment
//   is kept alive — it can't be reclaimed while a live reference exists.
// - Ep 7: the inner function resolves names via the SCOPE CHAIN / its lexical
//   environment. The closure is precisely that lexical environment, preserved.


// ----------------------------------------------------------------------------
// 6. DISCIPLINE NOTE — knowing the RULE != doing the DERIVATION
// ----------------------------------------------------------------------------
// Recurring weak spot (Q1, Q3): I stated "captured by reference" correctly, then
// traced the output as if it were by value (predicted 1,1 / 1).
// FIX: don't stop at naming the rule. TRACE it line by line — update the shared
// variable on every call and CARRY THE NEW VALUE FORWARD to the next line.
//   "Same shared binding + N increments => the value accumulates to N."


// ----------------------------------------------------------------------------
// 7. VALUE IS READ AT CALL TIME, NOT CREATION TIME   (Q5)
// ----------------------------------------------------------------------------
// A closure holds a REFERENCE to the binding, so when the inner function runs it
// looks up the variable's CURRENT value — not the value frozen at creation.
//   function makeFn() {
//     let x = 1;
//     const read = () => console.log(x);
//     x = 99;            // reassigned BEFORE read is ever called
//     return read;
//   }
//   makeFn()();          // 99  -> by-reference: current value at CALL time
// A by-VALUE snapshot would print 1 (frozen at creation). Output 99 IS the proof
// that closures capture by reference. Mantra: read happens when the closure RUNS.


// ----------------------------------------------------------------------------
// 8. ENCAPSULATION / PRIVATE VARIABLES   (Q7)
// ----------------------------------------------------------------------------
// A closed-over variable is NOT a property of the returned object. It stays
// private — reachable ONLY through the functions that close over it.
//   function secret() {
//     let password = "abc";
//     return { check: (g) => g === password };
//   }
//   const s = secret();
//   s.check("abc");   // true       -> proves password is ALIVE (closure holds it)
//   s.password;       // undefined  -> the object {check} has no `password` KEY
//
// TWO DISTINCT FACTS — do NOT fuse them (Q7 miss):
//   (i)  password EXISTS. The closure keeps secret's environment alive; `check`
//        uses it, and check("abc") === true is the proof.
//   (ii) s.password is undefined ONLY because password is a VARIABLE in the
//        lexical environment, not a PROPERTY on the returned object.
//   "Not exposed as a property"  !=  "destroyed". The closure is the only door in.


// ----------------------------------------------------------------------------
// 9. MANY CLOSURES, ONE SHARED BINDING, READ LATE   (Q8, Q9)
// ----------------------------------------------------------------------------
// When several functions are created inside ONE invocation, they all close over
// the SAME bindings (by reference). Combined with "read at call time" (§7), they
// all observe the variable's CURRENT value when they RUN — not the value at the
// moment each was created.
//   Q8: deposit/withdraw/getBalance share one `balance`; every write is visible.
//   Q9: two functions pushed at different times share one `i`:
//       let i = 0; funcs.push(() => i); i = 5; funcs.push(() => i);
//       funcs[0](); funcs[1]();   // 5 5  -> both read the FINAL i, not 0/5
// Intuition trap: a closure created while i was 0 does NOT "remember 0". There is
// no snapshot — it reads the live `i` when it is called.


// ----------------------------------------------------------------------------
// 10. THE "ONCE" / GATE PATTERN   (Q10)
// ----------------------------------------------------------------------------
// A flag held in a closure can GATE behavior across calls.
//   function once(fn) {
//     let called = false;
//     return function () { if (called) return; called = true; fn(); };
//   }
// `called` persists between calls (one binding, kept alive). First call flips it
// to true and runs fn; every later call sees true and bails. Classic closure use.
// PRECISION (Q10): once RETURNS one wrapper; `called` is CAPTURED (not returned);
// `fn` is the ARGUMENT passed in. Three distinct roles — don't fuse them.


// ----------------------------------------------------------------------------
// 11. PERSISTENT ACCUMULATOR + INDEPENDENCE + INTERLEAVING   (Q11)
// ----------------------------------------------------------------------------
// Closures combine independence (§2) and persistence (§1) at the same time.
//   function makeAdder(step) {
//     let total = 0;
//     return function () { total += step; return total; };
//   }
//   const inc2 = makeAdder(2), inc10 = makeAdder(10);
//   inc2(); inc2(); inc10(); inc2();   // 2, 4, 10, 6
// - INDEPENDENCE: inc2 and inc10 are separate calls -> separate `total` bindings.
//   inc10's calls cannot touch inc2's total.
// - PERSISTENCE: inc2's `total` is ONE binding kept alive between ITS calls, so it
//   accumulates (2 -> 4 -> 6). Interleaving an inc10 call in the middle changes
//   nothing about inc2's total.
// TWO DIFFERENT FACTS (Q11 weak spot): "remembers its own state" = the binding
// survives between calls; "not affected by inc10" = it's a different binding.


// ----------------------------------------------------------------------------
// 12. THE LOOP-CLOSURE TRAP   (Q12)  [previews Ep 11]
// ----------------------------------------------------------------------------
//   let funcs = [];
//   for (var i = 0; i < 3; i++) { funcs.push(function () { return i; }); }
//   funcs[0](); funcs[1](); funcs[2]();   // 3, 3, 3   (NOT 0, 1, 2)
// WHY:
//   - `var i` is function/global-scoped: ONE binding, NOT recreated per iteration.
//   - All three closures capture that SAME `i` by reference.
//   - They run LATER (at call time), after the loop has already finished.
//   - By then `i` is its FINAL value -> all three read the same number.
//
// THE OFF-BY-ONE (Q12 miss): the final `i` is 3, not 2. for-loop execution order:
//     init  ->  [ check condition -> body -> update ]  repeating
//   The UPDATE (i++) runs BEFORE the next condition check. Tail of the loop:
//     i=2  -> 2<3 true -> body (3rd push) -> i++ => i=3 -> 3<3 FALSE -> EXIT.
//   Body runs for i = 0,1,2 (three pushes) but `i` LANDS on 3. So all print 3.
//   Takeaway: the counter ends ONE PAST the last value its body actually used.
//
// (Ep 11 will show: `let` in the loop head creates a NEW binding each iteration,
//  so the closures capture 0, 1, 2 separately -> prints 0, 1, 2. Not covered here.)


// ============================================================================
// EP 10 — CLOSURES — QUIZ BANK (COMPLETE, Q1–Q12)
// Fixed bank of 12, one per turn. Q9 was scaffolded -> ungraded.
// Rubric: /10 = 3 (output) + 5 (mechanism) + 2 (precision).
// FINAL AVERAGE (11 graded): ~7.45/10
// Scores: 3, 9.5, 5, 9.5, 5, 9.5, 6, 9.5, [Q9 n/a], 9.5, 8.5, 7
// ============================================================================


// ----------------------------------------------------------------------------
// Q1  — basic closure persistence            SCORE: 3/10  (3 + 0 + 0)
// ----------------------------------------------------------------------------
// function outer() {
//   let count = 0;
//   function inner() { count++; console.log(count); }
//   return inner;
// }
// const fn = outer(); fn(); fn();
//
// MY ANSWER: output 1, 1. Said inner keeps its lexical scope (correct definition).
// MISS: predicted 1,1. count is captured by REFERENCE -> one binding -> accumulates.
//       (a) contradicted my own (b): persisted scope means count persists.
// CORRECT:
//   (a) 1, then 2.
//   (b) outer() ran once -> one count. inner closes over that live binding (not a
//       copy). Both fn() calls mutate the same count: 0->1 (1), 1->2 (2).
//       By-value snapshot => 1,1; by-reference => 1,2.


// ----------------------------------------------------------------------------
// Q2  — independent closures per call         SCORE: 9.5/10  (3 + 5 + 1.5)
// ----------------------------------------------------------------------------
// const a = outer(); const b = outer(); a(); a(); b();   // outer as in Q1
//
// MY ANSWER: 1, 2, 1. Each outer() gives a different lexical environment / count.
// MISS (-0.5): led with "b is a different VARIABLE". Independence comes from the
//              second INVOCATION, not the name. (const b = a would SHARE.)
// CORRECT:
//   (a) 1, 2, 1.
//   (b) Each call to outer() builds a new context with its own count (count_a,
//       count_b). Each returned fn closes over its OWN count. a(): 1,2 ; b(): 1.


// ----------------------------------------------------------------------------
// Q3  — multiple closures share one binding   SCORE: 5/10  (0 + 5 + 0)
// ----------------------------------------------------------------------------
// function makeCounter() {
//   let count = 0;
//   return { inc: () => ++count, get: () => count };
// }
// const c = makeCounter(); c.inc(); c.inc(); console.log(c.get());
//
// MY ANSWER: output 1. (b) PERFECT: inc and get share the SAME count by reference.
// MISS: output should be 2. Stated "same count" then traced as if it didn't
//       accumulate. Knowing the RULE != doing the DERIVATION.
// CORRECT:
//   (a) 2.
//   (b) One count, shared by inc and get (same invocation's scope, by reference).
//       c.inc() x2: 0->1->2; c.get(): 2.


// ----------------------------------------------------------------------------
// Q4  — parameter capture / function factory  SCORE: 9.5/10  (3 + 5 + 1.5)
// ----------------------------------------------------------------------------
// function multiplier(factor) { return function (n) { return n * factor; }; }
// const double = multiplier(2); const triple = multiplier(3);
// double(5); triple(5); double(triple(2));
//
// MY ANSWER: 10, 15, 12 (nested call traced correctly). Parameters become part of
//            the lexical environment, so the returned fn closes over them.
// MISS (-0.5): said the closure "remembers the function which is returned"
//              (circular). The returned fn IS the closure; it carries `factor`.
// CORRECT:
//   (a) 10, 15, 12.
//   (b) A parameter is a local var. multiplier(2)->factor=2, multiplier(3)->factor=3
//       (separate calls -> separate bindings). Each returned fn closes over its own
//       factor by reference. 5*2=10; 5*3=15; double(6)=12.


// ----------------------------------------------------------------------------
// Q5  — value read at call time                SCORE: 5/10  (3 + 2 + 0)
// ----------------------------------------------------------------------------
// function makeFn() { let x = 1; const read = () => console.log(x); x = 99; return read; }
// makeFn()();
//
// MY ANSWER: 99. Noted x reassigned to 99 before read runs. Honestly flagged
//            "I don't know" on by-value vs by-reference (correct to flag).
// MISS: the by-ref/by-value contrast was the required sub-part, unanswered.
// CORRECT:
//   (a) 99.
//   (b) read holds a REFERENCE to x, not a snapshot; it reads x's CURRENT value
//       when it RUNS. x=99 ran before the call -> 99. By-value would freeze 1.
//       Output 99 proves by-reference.


// ----------------------------------------------------------------------------
// Q6  — multi-level scope chain                SCORE: 9.5/10  (3 + 4.5 + 2)
// ----------------------------------------------------------------------------
// function a() { let x = 10; return function b() { let y = 20;
//   return function c() { console.log(x + y); }; }; }
// a()()();
//
// MY ANSWER: 30. c walks up the lexical ladder to reach x and y; closure = bundle
//            of function + lexical environment; survives pop.
// MISS (-0.5): "what keeps them alive" was circular ("because they're in the
//              closure"). Real reason: c is reachable and references the chain, so
//              a's/b's environments can't be garbage-collected.
// CORRECT:
//   (a) 30.
//   (b) c's scope has neither -> climb to b (y=20) -> climb to a (x=10) -> 30.
//       c stays reachable and references the chain, so the engine can't reclaim
//       a's/b's environments. The reference blocks the cleanup.


// ----------------------------------------------------------------------------
// Q7  — encapsulation: variable vs property    SCORE: 6/10  (3 + 3 + 0)
// ----------------------------------------------------------------------------
// function secret() { let password = "abc"; return { check: (g) => g === password }; }
// const s = secret(); console.log(s.check("abc")); console.log(s.password);
//
// MY ANSWER: true, undefined. Part 2 CORRECT: password is a variable in the lexical
//            env, not a property of s.
// MISS: Part 1 WRONG + self-contradiction: said password "gets popped out...
//       doesn't exist". check("abc")===true PROVES it's alive. "Not a property"
//       != "destroyed".
// CORRECT:
//   (a) true, undefined.
//   (b) password SURVIVES (closure keeps secret's env alive; check uses it).
//       s.password is undefined ONLY because password is a VARIABLE, not a KEY on
//       the object {check}. Reading a missing property -> undefined. Private,
//       reachable only through check.


// ----------------------------------------------------------------------------
// Q8  — shared mutable state across methods    SCORE: 9.5/10  (3 + 5 + 1.5)
// ----------------------------------------------------------------------------
// function createAccount() {
//   let balance = 0;
//   return {
//     deposit:    (amt) => { balance += amt; },
//     withdraw:   (amt) => { balance -= amt; },
//     getBalance: () => balance,
//   };
// }
// const acc = createAccount();
// acc.deposit(100); acc.withdraw(30); acc.deposit(50); console.log(acc.getBalance());
//
// MY ANSWER: 120. One balance, shared by all three; traced +100/-30/+50=120.
//            (Best derivation of the session — traced line by line.)
// MISS (-0.5): said "the object and its inner functions have reference of balance".
//              The OBJECT doesn't close over balance; only the FUNCTIONS do. The
//              object is just a container.
// CORRECT:
//   (a) 120.
//   (b) ONE balance. All three functions are defined in the same invocation's
//       scope, so all three close over the same balance by reference (the object
//       is just a container). 0->100->70->120; getBalance() reads 120.


// ----------------------------------------------------------------------------
// Q9  — collection of closures share one i     SCORE: n/a  (SCAFFOLDED)
// ----------------------------------------------------------------------------
// let funcs = [];
// function build() {
//   let i = 0;
//   funcs.push(() => i);   // (() => i  ===  function () { return i; })
//   i = 5;
//   funcs.push(() => i);
// }
// build();
// console.log(funcs[0](), funcs[1]());
//
// MY ANSWER: 5 5 (after a full guided trace — I supplied only the last step).
//            Also wrote it stacked; console.log(a, b) prints on ONE line: "5 5".
// NOTE: ungraded — concept was walked through, not derived solo.
// CORRECT:
//   (a) 5 5.
//   (b) build() ran once -> ONE i. Both pushed functions close over that same i.
//       i ends at 5. Closures read at CALL time, so both return 5 (not 0/5).


// ----------------------------------------------------------------------------
// Q10 — the "once" / gate pattern              SCORE: 9.5/10  (3 + 5 + 1.5)
// ----------------------------------------------------------------------------
// function once(fn) {
//   let called = false;
//   return function () { if (called) return; called = true; fn(); };
// }
// const init = once(() => console.log("init"));
// init(); init(); init();
//
// MY ANSWER: prints "init" once. Traced called: false -> (set true, run fn) ->
//            true -> true. Persists via shared closure.
// MISS (-0.5): muddled the parts — once RETURNS the wrapper; `called` is CAPTURED
//              (not returned); the arrow `fn` is the ARGUMENT passed in.
// CORRECT:
//   (a) "init" once.
//   (b) once returns one wrapper closing over called=false. init #1: called false
//       -> set true -> run fn -> prints. init #2/#3: called true -> return early.
//       The single shared `called` is the gate.


// ----------------------------------------------------------------------------
// Q11 — accumulator + independence + interleaving   SCORE: 8.5/10  (3 + 4 + 1.5)
// ----------------------------------------------------------------------------
// function makeAdder(step) {
//   let total = 0;
//   return function () { total += step; return total; };
// }
// const inc2 = makeAdder(2); console.log(inc2()); console.log(inc2());
// const inc10 = makeAdder(10); console.log(inc10()); console.log(inc2());
//
// MY ANSWER: 2, 4, 10, 6 (interleaving traced correctly). Explained independence
//            fully; came back and added the persistence part.
// MISS (-1.5): persistence gestured, not mechanized (didn't say total is ONE
//              binding kept alive between calls). Tail clause muddled: "didn't
//              remember anything" — inc2 DOES remember its own total.
// CORRECT:
//   (a) 2, 4, 10, 6.
//   (b) INDEPENDENCE: separate makeAdder calls -> separate total bindings; inc10
//       can't touch inc2's total. PERSISTENCE: inc2's total is one binding kept
//       alive between its calls -> accumulates 0->2->4->6.


// ----------------------------------------------------------------------------
// Q12 — the loop-closure trap                  SCORE: 7/10  (0 + 5 + 2)
// ----------------------------------------------------------------------------
// let funcs = [];
// for (var i = 0; i < 3; i++) { funcs.push(function () { return i; }); }
// console.log(funcs[0](), funcs[1](), funcs[2]());
//
// MY ANSWER: 2 2 2 (stacked). Mechanism FLAWLESS: one var binding, shared, by
//            reference, read at call time.
// MISS: output is 3 3 3, not 2 2 2. Off-by-one — the loop UPDATE (i++) runs before
//       the failing condition check, so i lands on 3. (Format: one line, "3 3 3".)
// CORRECT:
//   (a) 3 3 3.
//   (b) var i = ONE function/global-scoped binding (not recreated per iteration).
//       All three closures capture it by reference; they run at call time, after
//       the loop. for-loop order: init -> [check -> body -> update]. Tail:
//       i=2 -> true -> push -> i++ => i=3 -> 3<3 false -> exit. Final i = 3 -> 3 3 3.
//   (Ep 11: `let` in the head makes a fresh binding per iteration -> 0 1 2.)