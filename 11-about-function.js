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