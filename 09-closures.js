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


// ============================================================================
// EP 10 — CLOSURES — QUIZ BANK (IN PROGRESS)
// Fixed bank of 12. Q1–Q7 attempted, graded, and modeled below.
// Q8–Q12: NOT YET ATTEMPTED — to be derived one per turn on resume.
// Rubric: /10 = 3 (output) + 5 (mechanism) + 2 (precision).
// ============================================================================


// ----------------------------------------------------------------------------
// Q1  — basic closure persistence            SCORE: 3/10  (3 + 0 + 0)
// ----------------------------------------------------------------------------
// function outer() {
//   let count = 0;
//   function inner() { count++; console.log(count); }
//   return inner;
// }
// const fn = outer();
// fn(); fn();
//
// MY ANSWER: output 1, 1. Said inner keeps its lexical scope (correct definition).
// MISS: predicted 1,1. count is captured by REFERENCE -> one binding -> accumulates.
//       My (a) contradicted my own (b): persisted scope means count persists.
// MODEL:
//   (a) 1, then 2.
//   (b) outer() ran once -> one count. inner closes over that live binding (not a
//       copy). Both fn() calls mutate the same count: 0->1 (prints 1), 1->2 (prints 2).
//       By-value snapshot would give 1,1; by-reference gives 1,2.


// ----------------------------------------------------------------------------
// Q2  — independent closures per call         SCORE: 9.5/10  (3 + 5 + 1.5)
// ----------------------------------------------------------------------------
// function outer() { let count = 0; return function () { count++; console.log(count); }; }
// const a = outer(); const b = outer();
// a(); a(); b();
//
// MY ANSWER: 1, 2, 1. Each outer() gives a different lexical environment / different
//            count allocation, so a's increments don't affect b's.
// MISS (-0.5): led with "b is a different VARIABLE" — independence comes from the
//              second INVOCATION, not the variable name. (const b = a would SHARE.)
// MODEL:
//   (a) 1, 2, 1.
//   (b) Each call to outer() builds a new context with its own count (count_a, count_b).
//       Each returned fn closes over its OWN invocation's count. Two calls -> two
//       independent counts. a(): 1,2 ; b(): 1.


// ----------------------------------------------------------------------------
// Q3  — multiple closures share one binding   SCORE: 5/10  (3 + 5 + 0)... -> see note
// ----------------------------------------------------------------------------
// NOTE: actually graded 5/10 = 0 + 5 + 0 (output wrong, mechanism right, contradiction).
// function makeCounter() {
//   let count = 0;
//   return { inc: () => ++count, get: () => count };
// }
// const c = makeCounter();
// c.inc(); c.inc();
// console.log(c.get());
//
// MY ANSWER: output 1. (b) PERFECT: inc and get close over the SAME count by
//            reference, from the same lexical parent.
// MISS: output should be 2. Said "same count" then traced as if it didn't accumulate.
//       Knowing the RULE != doing the DERIVATION. Trace: inc,inc -> 0->1->2 ; get -> 2.
// MODEL:
//   (a) 2.
//   (b) One count. inc and get are defined in the same invocation's scope, so both
//       capture the same binding by reference. c.inc() x2: 0->1->2; c.get(): 2.


// ----------------------------------------------------------------------------
// Q4  — parameter capture / function factory  SCORE: 9.5/10  (3 + 5 + 1.5)
// ----------------------------------------------------------------------------
// function multiplier(factor) { return function (n) { return n * factor; }; }
// const double = multiplier(2); const triple = multiplier(3);
// console.log(double(5)); console.log(triple(5)); console.log(double(triple(2)));
//
// MY ANSWER: 10, 15, 12 (traced the nested call correctly). Parameters become part
//            of the lexical environment, so the returned fn closes over them.
// MISS (-0.5): said the closure "remembers the function which is returned" (circular).
//              The returned fn IS the closure; it carries the live binding `factor`.
// MODEL:
//   (a) 10, 15, 12.
//   (b) A parameter is a local var of the function's scope. multiplier(2)->factor=2,
//       multiplier(3)->factor=3 (separate calls -> separate bindings). Each returned
//       fn closes over its own factor by reference. 5*2=10; 5*3=15; double(6)=12.


// ----------------------------------------------------------------------------
// Q5  — value read at call time                SCORE: 5/10  (3 + 2 + 0)
// ----------------------------------------------------------------------------
// function makeFn() { let x = 1; const read = () => console.log(x); x = 99; return read; }
// makeFn()();
//
// MY ANSWER: 99. Noted x was reassigned to 99 before read runs. Honestly flagged "I
//            don't know" on by-value vs by-reference (correct to flag, not bluff).
// MISS: the by-ref/by-value contrast was the required sub-part and was unanswered.
// MODEL:
//   (a) 99.
//   (b) read holds a REFERENCE to x, not a snapshot. It reads x's CURRENT value when
//       it RUNS. x=99 ran before the call, so it prints 99. By-value would freeze 1
//       at creation -> print 1. Output 99 proves by-reference.


// ----------------------------------------------------------------------------
// Q6  — multi-level scope chain                SCORE: 9.5/10  (3 + 4.5 + 2)
// ----------------------------------------------------------------------------
// function a() { let x = 10; return function b() { let y = 20;
//   return function c() { console.log(x + y); }; }; }
// a()()();
//
// MY ANSWER: 30. c walks up the lexical ladder through its lexical parents to reach
//            x and y; closure = bundle of function + lexical environment; survives pop.
// MISS (-0.5): "what keeps them alive" was circular ("because they're in the closure").
//              Non-circular: c is reachable and holds a live reference UP the chain,
//              so a's/b's environments can't be garbage-collected.
// MODEL:
//   (a) 30.
//   (b) c's scope has neither -> climb to b (y=20) -> climb to a (x=10) -> 30.
//       c stays reachable and references the chain, so the engine can't reclaim a's
//       and b's environments. The reference is what blocks the cleanup.


// ----------------------------------------------------------------------------
// Q7  — encapsulation: variable vs property    SCORE: 6/10  (3 + 3 + 0)
// ----------------------------------------------------------------------------
// function secret() { let password = "abc"; return { check: (g) => g === password }; }
// const s = secret();
// console.log(s.check("abc")); console.log(s.password);
//
// MY ANSWER: true, undefined. Part 2 CORRECT: password is a variable in the lexical
//            env, not a property of s, so s.password is undefined.
// MISS: Part 1 WRONG + self-contradiction: said password "gets popped out... doesn't
//       exist." check("abc")===true PROVES it's alive. "Not a property" != "destroyed".
// MODEL:
//   (a) true, undefined.
//   (b) password survives (closure keeps secret's env alive; check uses it).
//       s.password is undefined ONLY because password is a VARIABLE, not a KEY on the
//       object {check}. Reading a missing property -> undefined. password is private,
//       reachable only through check.


// ----------------------------------------------------------------------------
// Q8–Q12 — NOT YET ATTEMPTED. Resume one per turn; derive before any answer is recorded.
// ----------------------------------------------------------------------------