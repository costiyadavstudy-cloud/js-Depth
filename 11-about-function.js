// ================================================================
// EP 13 — FIRST CLASS FUNCTIONS ft. ANONYMOUS FUNCTIONS
// Namaste JavaScript (Akshay Saini) — study notes (Vardhan)
// ================================================================
//
// READ THIS FIRST: every section is a consequence of ONE fact —
// in JS, a function is a VALUE. Hold that and the rest derives.


// ----------------------------------------------------------------
// SECTION 0 — THE UMBRELLA: FIRST-CLASS FUNCTIONS
// ----------------------------------------------------------------
// "Functions are first-class citizens" = a function can be used
// anywhere a value can be used. There is no special restriction on
// it compared to a number, string, or object.
//
// The three concrete abilities (these are the SAME fact, not 3 rules):
//   (1) ASSIGN to a variable:        const f = function () {};
//   (2) PASS as an argument:         doThing(function () {});
//   (3) RETURN from a function:      function outer() { return function () {}; }
//
// This single property is what makes callbacks, higher-order
// functions, and closures possible. Keep the abstraction in mind:
// all three are just "a function used as a value / in an EXPRESSION
// position".


// ----------------------------------------------------------------
// SECTION 1 — FUNCTION STATEMENT vs FUNCTION EXPRESSION
// ----------------------------------------------------------------
// FUNCTION STATEMENT (a.k.a. function declaration):
//     function foo() { ... }
//   - Stands on its own as a statement.
//   - HOISTED WITH ITS FULL BODY in the memory/creation phase.
//   - => callable BEFORE its line in the source.
//
// FUNCTION EXPRESSION:
//     var bar = function () { ... };
//   - A function used as a VALUE, assigned to a variable.
//   - Only the VARIABLE is hoisted (var -> undefined; let/const -> TDZ).
//     The function value is assigned at RUNTIME, on that line.
//   - => NOT callable before its line.
//
// THE DERIVATION THAT MATTERS (hoisting consequence):
//     foo();   // works -> statement hoisted with body
//     bar();   // TypeError: bar is not a function
//     function foo() { console.log("foo"); }
//     var bar = function () { console.log("bar"); };
//   At the bar() call, `bar` is still `undefined` (value not yet
//   assigned). Calling undefined() = calling a non-function = TypeError,
//   at RUNTIME. Because it is a runtime error, "foo" already printed.


// ----------------------------------------------------------------
// SECTION 2 — ANONYMOUS FUNCTIONS
// ----------------------------------------------------------------
// An anonymous function is a function with NO name:  function () {}
//
// WHERE IT IS LEGAL: any EXPRESSION / VALUE position — i.e. anywhere
// JS expects a value. That covers all three first-class uses:
//   const f = function () {};      // assigned
//   doThing(function () {});       // passed
//   return function () {};         // returned
//
// WHERE IT IS ILLEGAL: as a standalone STATEMENT.
//     function () {}               // SyntaxError
//   A function STATEMENT requires a name. A nameless function in
//   statement position breaks the grammar -> SyntaxError, caught at
//   PARSE-TIME -> the whole script is rejected, NOTHING runs (not even
//   console.logs written above it).
//
// MENTAL MODEL: a name is only mandatory when the function stands as
// a statement. As a value, it does not need one.


// ----------------------------------------------------------------
// SECTION 3 — NAMED FUNCTION EXPRESSION
// ----------------------------------------------------------------
//     var x = function abc() { ... };
//
// TWO SEPARATE THINGS are created:
//   - the outer variable `x`  -> holds the function value, callable
//     from outside.
//   - the name `abc`          -> bound ONLY inside the function's own
//     scope. Reachable from WITHIN the function body (this is what
//     lets a function call itself by name = recursion). NOT added to
//     the outer / global scope.
//
// CONSEQUENCE:
//     x();     // "..."  -> works, x is the outer handle
//     abc();   // ReferenceError: abc is not defined
//   The name `abc` does not exist in any reachable outer scope, so the
//   lookup at runtime finds nothing -> ReferenceError.
//
// PRECISION: `abc` is NOT "a value inside x". It is the function's own
// internal name binding. `x` (the variable) and `abc` (the inner name)
// are two different things.


// ----------------------------------------------------------------
// SECTION 4 — PARAMETERS vs ARGUMENTS
// ----------------------------------------------------------------
//     function greet(name, greeting) {   // name, greeting = PARAMETERS
//       console.log(greeting + ", " + name);
//     }
//     greet("Vardhan", "Hello");         // "Vardhan", "Hello" = ARGUMENTS
//
// PARAMETER = the named placeholder in the function DEFINITION (a local
//   variable in the function's scope, with no value until the call).
// ARGUMENT  = the ACTUAL value passed in at CALL time.
//
// One-liner: parameters are the labels you declare; arguments are the
// values you hand over. The parameter is the slot; the argument fills it.


// ----------------------------------------------------------------
// SECTION 5 — THE ERROR-CLASS TRIO (lock this cold)
// ----------------------------------------------------------------
// These are THREE DISTINCT classes. Naming the wrong one signals the
// wrong concept.
//
//   SyntaxError    -> the code breaks JS GRAMMAR; the engine cannot
//                     even parse it. Caught at PARSE-TIME.
//                     e.g. anonymous function as a statement.
//
//   TypeError      -> the code parsed AND ran; at RUNTIME you used a
//                     value illegally (e.g. called a non-function,
//                     read a property of undefined).
//                     e.g. calling `bar` while it is still undefined.
//
//   ReferenceError -> at RUNTIME, you referenced a NAME that does not
//                     exist in any reachable scope.
//                     e.g. calling `abc` (a named-fn-expr name) outside.
//
// Quick test: does the name even EXIST?
//   - no name at all in scope        -> ReferenceError
//   - name exists but value misused  -> TypeError
//   - code can't be parsed at all    -> SyntaxError


// ----------------------------------------------------------------
// SECTION 6 — PARSE-TIME vs RUNTIME (repeat weak spot — re-derive cold)
// ----------------------------------------------------------------
// PARSE happens BEFORE execution. The engine reads the whole script,
// checks grammar, sets up memory.
//
//   PARSE-TIME error (SyntaxError): parsing fails -> the ENTIRE script
//     is rejected -> NO line runs. console.logs above it do NOT print.
//
//   RUNTIME error (TypeError, ReferenceError): the script parsed fine
//     and started executing line by line. Earlier lines DID run (their
//     output appears), THEN the error throws when control reaches the
//     bad line.
//
// Do not collapse "there is an error" into one model. The TIMING decides
// whether the lines above it executed.


// ----------------------------------------------------------------
// SECTION 7 — 60-SECOND MENTAL CHECKLIST
// ----------------------------------------------------------------
// - Is the function used as a VALUE (assigned/passed/returned)?  -> expression.
// - Does it stand alone with the `function` keyword first?        -> statement.
// - No name + statement position?                                 -> SyntaxError (parse-time).
// - Called before an expression was assigned?                     -> TypeError (runtime).
// - Named-fn-expr name used outside?                              -> ReferenceError (runtime).
// - Definition placeholders = parameters; call-time values = arguments.
// ================================================================

