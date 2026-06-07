// ================================================================
// EP 13 — CONSOLIDATION NOTES (built from your own Q1-Q7 answers)
// These crystallize the exact concepts you missed. Read before retrying.
// ================================================================


// ----------------------------------------------------------------
// 1. THE MISCONCEPTION THAT KEEPS RETURNING (Q7, and Q6)
//    "a value stored in a variable becomes a statement / an expression"
// ----------------------------------------------------------------
// NO. Storing a function in a variable (or binding it to a parameter)
// changes NOTHING about what the function is.
//   - A function written as a value (anonymous, or named expression)
//     IS and STAYS a function expression.
//   - statement vs expression is about HOW the function is WRITTEN in
//     source — not about where its value is later stored.
//   - The variable is just a REFERENCE / handle pointing at the value.
//   - Nothing "converts." Delete every "now it becomes a..." sentence
//     from your mental model.


// ----------------------------------------------------------------
// 2. CALLING THROUGH A REFERENCE (Q7)
// ----------------------------------------------------------------
//   function callIt(fn) { fn(); }
//   callIt(function () { console.log("called"); });
//
//   - `fn` is a local variable holding a REFERENCE to the passed function.
//   - `fn()` means: "invoke whatever function `fn` points to."
//   - The passed function never needed a name; you reach it through `fn`.
//   - `fn` is NOT the function's name, and the function is NOT converted
//     into anything. (See #1.)


// ----------------------------------------------------------------
// 3. THE ERROR-CLASS TRIO + TIMING (Q2, Q3, Q4) — repeat weak spot
// ----------------------------------------------------------------
//   SyntaxError    -> grammar broken; PARSE-TIME; the whole script is
//                     rejected; NOTHING runs (not even lines above).
//   TypeError      -> value used illegally (e.g. called a non-function);
//                     RUNTIME; earlier lines already ran.
//   ReferenceError -> name not found in any reachable scope; RUNTIME;
//                     earlier lines already ran.
//
//   Fast test:
//     code can't even parse?         -> SyntaxError
//     name doesn't exist anywhere?   -> ReferenceError
//     name resolves but misused?     -> TypeError


// ----------------------------------------------------------------
// 4. STATEMENT vs EXPRESSION HOISTING (Q3)
// ----------------------------------------------------------------
//   statement   function foo(){}      -> hoisted WITH its body
//                                      -> callable BEFORE its line.
//   expression  var bar = function(){} -> only the variable is hoisted
//                                      (var -> undefined). Calling early
//                                      = calling undefined = TypeError.


// ----------------------------------------------------------------
// 5. NAMED FUNCTION EXPRESSION (Q4)
// ----------------------------------------------------------------
//   var x = function abc(){};
//   - `abc` is bound ONLY inside the function's own scope (usable for
//     recursion). It is NOT added to the outer/global scope.
//   - `x()`   -> works (x is the outer handle).
//   - `abc()` outside -> ReferenceError.


// ----------------------------------------------------------------
// 6. PARAMETERS vs ARGUMENTS (Q5 — you nailed this)
// ----------------------------------------------------------------
//   parameter = the named placeholder in the DEFINITION (a local var
//               that receives a value per call).
//   argument  = the actual VALUE supplied at the CALL site.
//   The parameter is the slot; the argument fills it.


// ----------------------------------------------------------------
// 7. RETURNING A FUNCTION (concept — your Q8 is LEFT FOR YOU TO DERIVE)
// ----------------------------------------------------------------
// A function can RETURN another function (first-class). The returned
// function is a value; the caller receives it and can call it later. The
// returned function still sees the variables from where it was created.
//
// Illustrative example (NOT your Q8 — derive makeAdder yourself):
//   function makeGreeter(word) {
//     return function (name) { return word + ", " + name; };
//   }
//   const hi = makeGreeter("Hi");   // hi HOLDS the returned function
//   hi("Sam");                      // -> "Hi, Sam"
//
//   - `word` came from makeGreeter's call (the outer parameter).
//   - `name` came from the inner call hi("Sam").
//   - `hi` holds a reference to the returned function (see #1, #2).


// ----------------------------------------------------------------
// WEAK-SPOT DRILL (re-derive cold, no notes)
// ----------------------------------------------------------------
//  - Given any snippet: classify EACH function as statement or expression.
//  - Predict the error CLASS + TIMING, and whether the lines above ran.
//  - Write VALID code for each capability: assign / pass / return a fn.
//  - Trace returned-function calls: name what each variable is and where
//    it came from.
// ================================================================

// ================================================================
// EP 13 — NEW PRACTICE QUESTIONS  (10 questions, NO answers)
// Derive them yourself. To get them GRADED, run them live, one per turn.
// Targets your weak spots: statement vs expression, error class + timing,
// writing valid code, named-fn-expr scope, returning/passing functions.
// ================================================================


// P1. Classify each as a function STATEMENT or a function EXPRESSION:
//       (a) function sum(a, b) { return a + b; }
//       (b) const f = function () {};
//       (c) const g = function helper() {};


// P2. Predict exact output AND the error (class + timing + did the lines
//     above it run?):
//       console.log("A");
//       greet();
//       var greet = function () { console.log("B"); };
//       console.log("C");


// P3. Predict exact output, and error class + timing if any:
//       go();
//       function go() { console.log("go"); }


// P4. What happens with this line, and why (error class + timing)?
//       function () {}      // stands alone — not assigned, not called


// P5. Named function expression:
//       const h = function inner() { console.log("hi"); };
//       inner();
//     What happens, why, and which error class?


// P6. Write THREE separate one-line snippets, each demonstrating exactly
//     ONE first-class capability — (a) assign, (b) pass as argument,
//     (c) return. Each must be valid (no SyntaxError).


// P7. Identify the parameters vs the arguments:
//       function pay(amount, currency) { /* ... */ }
//       pay(500, "INR");


// P8. Trace and give exact output:
//       function twice(fn) { fn(); fn(); }
//       twice(function () { console.log("hit"); });


// P9. Returning a function — trace:
//       function multiplier(n) {
//         return function (x) { return n * x; };
//       }
//       const triple = multiplier(3);
//       console.log(triple(4));
//     State: what does `triple` hold? what are `n` and `x`, and where did
//     each come from? what is the exact output?


// P10. FIX this broken code so it VALIDLY returns a function, then state
//      what calling the fixed function (and then the returned one) gives:
//        function build() {
//          console.log(return function () { return 7; });
//        }
//      (Two distinct bugs to fix — name both.)
// ================================================================