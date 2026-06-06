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

// ================================================================
// EP 13 QUIZ — FIRST CLASS FUNCTIONS ft. ANONYMOUS FUNCTIONS
// Fixed bank: 12 questions (committed). One per turn.
// THIS FILE = Q1-Q4 (attempted + graded). Q5 posed, NOT yet answered.
// Q6-Q12 not delivered yet (committed, undisclosed per quiz contract).
// ================================================================
//
// Running scores: Q1=8, Q2=3, Q3=10, Q4=7.5   (avg so far ~7.1)


// ----------------------------------------------------------------
// Q1 / 12
// ----------------------------------------------------------------
//   function alpha() {}
//   var beta = function () {};
// (a) Name each construct by its precise term.
// (b) Term for a function with no name; is its use here legal + why?
//
// MY ANSWER:
//   (a) alpha -> function statement ; beta -> function expression
//   (b) anonymous function, yes legal because we can use an anonymous
//       function for a function expression, as an argument, and to
//       return a function.
//
// SCORE: 8/10 -> 3 (result) + 3.5 (mechanism) + 1.5 (precision)
//   - Lost mechanism: listed WHERE anonymous fns are legal, not the
//     unifying WHY (expression / value position).
//   - Lost 0.5 precision: "declaration of function expression" mashes
//     two terms the episode separates.
//
// 10/10 MODEL:
//   (a) alpha = function statement (function declaration).
//       beta  = function expression: a function assigned as a value.
//   (b) Anonymous function. Legal here because the RHS of `var beta =`
//       is an expression (value) position, and a function-as-value
//       needs no name. Illegal only as a standalone statement.


// ----------------------------------------------------------------
// Q2 / 12
// ----------------------------------------------------------------
//   function () {
//     console.log("hi");
//   }
// (a) What happens when JS processes this standalone anonymous fn?
// (b) Exact error class + timing (before/during execution) + what that
//     timing means for code on the lines ABOVE.
//
// MY ANSWER:
//   (a) throws error
//   (b) TypeError, happens before execution; "means during parse-time
//       or execution time"
//
// SCORE: 3/10 -> 2 (result) + 1 (mechanism) + 0 (precision)
//   - Wrong class: it is a SyntaxError, not TypeError (wrong concept).
//   - "before execution" was the right instinct (parse-time).
//   - Did not state the consequence; "parse-time OR execution time"
//     contradicts "before execution" -> precision 0.
//
// 10/10 MODEL:
//   (a) Throws a SyntaxError — a function statement requires a name, so
//       a nameless one is a grammar violation the engine won't parse.
//   (b) SyntaxError, parse-time (before execution). The parse fails, so
//       the whole script is rejected — nothing runs, and any console.log
//       on the lines above never prints.


// ----------------------------------------------------------------
// Q3 / 12
// ----------------------------------------------------------------
//   foo();
//   bar();
//   function foo() { console.log("foo"); }
//   var bar = function () { console.log("bar"); };
// (a) Exact output, line by line.
// (b) Mechanism: why one succeeds, one fails.
// (c) Failing one: error class, timing, did anything print before.
//
// MY ANSWER:
//   (a) foo / type error.
//       foo stored with full code in memory phase -> runs.
//       bar (var) stored as undefined before initialization -> calling
//       undefined as a function gives a type error.
//   (c) TypeError, runtime, foo gets printed.
//
// SCORE: 10/10 -> 3 + 5 + 2
//   - Output correct. Both mechanisms correct (statement hoisted with
//     body; var hoisted as undefined, assigned at runtime). Error class,
//     timing, and print-order all correct.
//   - Sharpening (not a deduction): exact message is
//     "TypeError: bar is not a function" = calling a non-function value.
//
// 10/10 MODEL:
//   (a) "foo" prints; then bar() throws TypeError: bar is not a function.
//   (b) foo = statement -> hoisted with full body -> callable early.
//       bar = var -> hoisted as undefined, assigned only at its line.
//   (c) TypeError, runtime. "foo" printed first (runtime errors let
//       earlier lines run).


// ----------------------------------------------------------------
// Q4 / 12
// ----------------------------------------------------------------
//   var x = function abc() { console.log("hi"); };
//   x();
//   abc();
// (a) Exact output — x() then abc().
// (b) Mechanism: what is the name `abc`, where is it accessible?
// (c) Failing call: error class + timing.
//
// MY ANSWER:
//   (a) hi / reference error: abc not defined.
//   (b) x() invokes x which holds the abc function as its value; abc()
//       fails because abc exists only "in x" and cannot be reached
//       directly/outside.
//   (c) ReferenceError (exact wording not memorized — meaning correct).
//
// SCORE: 7.5/10 -> 3 (result) + 3.5 (mechanism) + 1 (precision)
//   - Got the inside/outside boundary right; correctly flagged that the
//     ERROR CLASS matters, not the exact message string.
//   - Mechanism fuzzy: `abc` is NOT "a value inside x". It is the
//     function's own internal name binding (named function expression),
//     reachable only WITHIN the function body, not the outer scope.
//   - Lost 1 precision: dropped the TIMING in (c).
//
// 10/10 MODEL:
//   (a) x() prints "hi"; abc() throws ReferenceError: abc is not defined.
//   (b) Named function expression. `x` holds the value (callable from
//       outside). The name `abc` is bound only in the function's own
//       scope — usable inside (recursion), absent outside.
//   (c) ReferenceError, runtime. "hi" had already printed.


// ----------------------------------------------------------------
// Q5 / 12  —  POSED, NOT YET ATTEMPTED
// ----------------------------------------------------------------
//   function greet(name, greeting) {
//     console.log(greeting + ", " + name);
//   }
//   greet("Vardhan", "Hello");
// (a) Identify the parameters and the arguments — name them specifically.
// (b) State the parameter vs argument distinction precisely.
//
// MY ANSWER: <pending — to be derived on resume>
// (No output / model recorded here on purpose: this question is not yet
//  attempted, and un-attempted answers are never pre-printed.)


// ----------------------------------------------------------------
// Q6 - Q12 : committed in the bank, not yet delivered (one per turn).
// ----------------------------------------------------------------
// ================================================================
