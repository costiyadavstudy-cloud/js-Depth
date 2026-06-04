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