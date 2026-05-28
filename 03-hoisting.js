/* ============================================================================
 * FILE 2 / 4 — HOISTING
 *
 * "Hoisting" is one of the most misunderstood concepts in JS.
 * The popular explanation — "variables move to the top of the file" —
 * is wrong. Nothing physically moves. What actually happens is that the
 * CREATION phase has already populated memory before any code runs.
 *
 * This file rebuilds the concept from first principles.
 * ============================================================================
 */


/* ============================================================================
 * SECTION 1 — WHAT HOISTING ACTUALLY IS
 * ============================================================================
 */


// Hoisting is the OBSERVABLE BEHAVIOR that you can reference some identifiers
// before their declaration line in the source code, without throwing a
// ReferenceError.
//
// It's not a mechanism. It's a CONSEQUENCE of the two-phase execution model.
//
// The mechanism is: during the creation phase, the engine scans declarations
// top-to-bottom and allocates memory for each. By the time the execution
// phase begins, every var-declared identifier is already in memory (with
// value undefined), and every function-declared identifier is already
// bound to its function object.
//
// "Hoisting" is just our name for the appearance that those identifiers
// are usable "before" they appear in source order.


// Wrong mental model (popular but wrong):
//     "The engine moves all declarations to the top of the file."
//
// Right mental model:
//     "The engine has already allocated memory for all declarations
//     before executing any code. Source order is preserved; memory
//     is just populated first."


/* ============================================================================
 * SECTION 2 — WHAT GETS HOISTED, AND IN WHAT STATE
 * ============================================================================
 */


// ─── var ────────────────────────────────────────────────────────────────────

console.log(a);   // undefined
var a = 5;
console.log(a);   // 5

// Creation phase: a → undefined
// Execution phase:
//   line 1: log a → undefined
//   line 2: a reassigned to 5
//   line 3: log a → 5


// ─── function declaration ───────────────────────────────────────────────────

greet();   // "hi" — works, because greet is already bound in creation phase
function greet() {
  console.log("hi");
}

// Creation phase: greet → reference to function object (full function ready)
// Execution phase:
//   line 1: greet() invokes function object → logs "hi"


// ─── function expression assigned to var ────────────────────────────────────

sayHi();   // TypeError: sayHi is not a function
var sayHi = function () {
  console.log("hello");
};

// Why TypeError, not ReferenceError?
//   Creation phase: sayHi → undefined  (because it's a var declaration)
//   Execution phase:
//     line 1: sayHi() → trying to call `undefined` → TypeError
//     line 2: sayHi reassigned to the function object
//
// Critical distinction:
//   - undefined is a value. Calling undefined throws TypeError.
//   - ReferenceError happens when the identifier doesn't exist at all.


// ─── arrow function assigned to var ─────────────────────────────────────────

double();   // TypeError: double is not a function
var double = (n) => n * 2;

// Arrow functions assigned to variables behave the same as function
// expressions. Only the var is hoisted; the arrow function isn't bound
// until the assignment runs.


// ─── let and const (preview — full treatment in Ep 8) ───────────────────────

// console.log(x);   // ReferenceError — TDZ
// let x = 10;

// let and const ARE hoisted (the identifier is allocated), but they're
// in a Temporal Dead Zone until their declaration line. Accessing them
// before that throws ReferenceError.


/* ============================================================================
 * SECTION 3 — THE COLLISION RULE
 *
 * When the same identifier is declared twice — once as var and once as
 * function — what wins?
 * ============================================================================
 */


// Rule: FUNCTION DECLARATIONS TAKE PRECEDENCE OVER var DECLARATIONS in the
// creation phase.

console.log(typeof foo);   // "function"
var foo = "hello";
function foo() {}
console.log(typeof foo);   // "string"

// Creation phase trace, line by line:
//   1. var foo  → identifier `foo` allocated, set to undefined
//   2. function foo() {} → `foo` binding OVERWRITTEN with reference to
//                          the function object
//
//   End state: foo → reference to function object
//
// Execution phase:
//   line 1: typeof foo → "function" (still bound to the function object)
//   line 2: foo reassigned to the string "hello"
//   line 3: function declaration — already processed, no-op
//   line 4: typeof foo → "string"
//
// Why function wins:
//   The engine processes both declarations during creation. Because
//   function declarations carry MORE INFORMATION (a full function object),
//   they take precedence over the empty `undefined` slot a var would
//   create. After the function declaration is processed, the binding
//   points to the function object — and that's what's there when execution
//   begins.


/* ============================================================================
 * SECTION 4 — THE BOSS-LEVEL PATTERN
 *
 * Function declaration + function expression with the same identifier.
 * ============================================================================
 */


greet();                                       // "second"
var greet = function () { console.log("first"); };
function greet() { console.log("second"); }
greet();                                       // "first"

// CREATION PHASE:
//   1. var greet → allocated as undefined
//   2. function greet() {...} → binding overwritten with reference to
//                               function object logging "second"
//                               (function declaration precedence rule)
//
//   End state: greet → reference to function object logging "second"
//
// EXECUTION PHASE:
//   line 1: greet() invokes current binding → logs "second"
//   line 2: a NEW function object (logging "first") is created;
//           greet is REASSIGNED to point to it
//   line 3: function declaration — no-op at runtime
//   line 4: greet() invokes current binding → logs "first"
//
// Why the two calls differ:
//   greet was REASSIGNED between them. It points to a different function
//   object on each call. The identifier didn't change; the binding's value
//   did.


/* ============================================================================
 * SECTION 5 — THE TEMPLATE FOR ANY HOISTING QUESTION
 *
 * Memorize this structure. Use it on every hoisting problem.
 * ============================================================================
 */


// STEP 1 — Creation phase trace.
//   For each identifier in the snippet, scan the source top to bottom.
//   Note when each is allocated and what the binding holds at the end.
//   If two declarations collide, apply the precedence rule.
//
// STEP 2 — Final memory snapshot.
//   At the end of creation phase, what does each binding hold?
//
// STEP 3 — Execution phase trace.
//   Run the source top to bottom. For each line, note:
//     - what value is read
//     - what binding is assigned/reassigned
//     - what function is invoked
//     - what's logged
//
// STEP 4 — Predicted output, in order.
//
// STEP 5 — One-sentence explanation using mechanism vocabulary:
//   binding, reassigned, reference, function object, creation phase,
//   execution phase.


// A good answer is not "the output is X." A good answer is the trace
// that proves the output must be X.


/* ============================================================================
 * SECTION 6 — PRACTICE PATTERNS YOU'LL ENCOUNTER
 * ============================================================================
 */


// PATTERN A — var read before assignment
console.log(a);    // undefined
var a = 5;


// PATTERN B — function called before declaration
foo();             // works
function foo() { console.log("called"); }


// PATTERN C — function expression called before assignment
bar();             // TypeError
var bar = function () { console.log("expr"); };


// PATTERN D — var + function collision (function wins)
console.log(typeof x);   // "function"
var x = 1;
function x() {}


// PATTERN E — function decl + function expression, same name
foo();
var foo = function () { console.log("expr"); };
function foo() { console.log("decl"); }
foo();
// Predict: "decl" then "expr"


// PATTERN F — multiple vars
console.log(x, y);   // undefined undefined
var x = 1, y = 2;


// PATTERN G — variable shadowing across scopes
var name = "outer";
function show() {
  var name = "inner";
  console.log(name);   // "inner" — the function EC has its own binding
}
show();
console.log(name);     // "outer"


/* ============================================================================
 * SECTION 7 — COMMON MISTAKES IN HOISTING PROBLEMS
 * ============================================================================
 */


// MISTAKE 1 — Predicting ReferenceError for var read-before-assignment.
//   Wrong. var IS hoisted; the identifier exists in memory with value
//   undefined. You get `undefined`, not ReferenceError.

// MISTAKE 2 — Confusing TypeError with ReferenceError.
//   - ReferenceError: the identifier doesn't exist.
//   - TypeError: the identifier exists but you're using it incorrectly
//                (e.g., calling something that isn't a function).
//   Calling a var that holds undefined → TypeError.

// MISTAKE 3 — Forgetting the function declaration precedence rule.
//   When var and function declarations share a name, function wins.

// MISTAKE 4 — Treating the function expression's function as hoisted.
//   It isn't. Only the var part is hoisted. The function object is not
//   bound to the identifier until the assignment line runs.

// MISTAKE 5 — Skipping the creation phase trace and jumping to output.
//   You'll predict correctly sometimes by intuition and wrongly other
//   times. The trace is the only reliable path.


/* ============================================================================
 * SECTION 8 — TIPS FOR ANSWERING HOISTING QUESTIONS
 * ============================================================================
 */


// TIP 1 — Write the creation phase trace first, ALWAYS.
//   Even on easy questions. Building the habit on easy ones means it
//   shows up automatically on hard ones.


// TIP 2 — When two declarations share a name, draw an arrow showing
//   the binding being overwritten.
//
//     var foo;            → foo → undefined
//     function foo() {}   → foo → [function object]   ← overwrites
//
//   Visualizing the overwrite cements the precedence rule.


// TIP 3 — Distinguish read errors precisely.
//   - Reading var before assignment    → undefined (no error)
//   - Calling var that holds undefined → TypeError
//   - Reading let/const in TDZ          → ReferenceError
//   - Reading completely undeclared var → ReferenceError (in strict mode)
//                                         or implicit global (in sloppy mode)


// TIP 4 — Practice with adversarial snippets.
//   Find or write hoisting questions that look like trick questions.
//   The boss-level pattern (Section 4) is the template for the hardest
//   versions. If you can do that one cold, the rest are easier.


// TIP 5 — When you get a question wrong, REWRITE the trace from scratch.
//   Don't just patch the answer. Rerun the whole creation phase on
//   paper. The mistake almost always lives in the trace, not in the
//   output prediction.


// TIP 6 — Verbalize the rule when you apply it.
//   "Function declarations take precedence over var declarations on
//   identifier collision in the creation phase." Saying the rule out
//   loud while solving forces you to check whether it actually applies.
//   If you can't say the rule, you don't own it.


// ============================================================================
// END OF FILE 2 / 4
// Next: 03_global_execution_context.js
// ============================================================================

console.log(a);
var a = 10;
console.log(a);

// output:
// undefined
// 10

function outer() {
  console.log(b);
  var b = 20;
  console.log(b);
}
outer();

// output: 
// undefined
// 20

sayHi();
greet();

function sayHi() {
  console.log("Hi");
}

var greet = function() {
  console.log("Hello");
};

// output:
// Hi
// Type error greet is not a function

var x = 10;

function foo() {
  console.log(x);
  var x = 20;
  console.log(x);
}

foo();
console.log(x);

// output:
// undefined
// 20
// 10

console.log(typeof foo);
var foo = "hello";
function foo() {}
console.log(typeof foo);

// output: 
// function
// string

console.log("--- proof that declarations don't act at runtime ---");

console.log("--- proof that declarations don't act at runtime ---");

console.log(typeof baz);   // Predict: ?
function baz() {}
console.log(typeof baz);   // Predict: ?
baz = 42;                   // Pure assignment, no var/let
console.log(typeof baz);   // Predict: ?
function baz() {}           // ← does THIS line do anything?
console.log(typeof baz);   // Predict: ?

//output: 
// function
// function 
// number
// number

greet();
var greet = function() { console.log("first"); };
function greet() { console.log("second"); }
greet();

// //output: 
// // second
// // first
