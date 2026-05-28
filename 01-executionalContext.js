/* ============================================================================

 * The most important mental model in JavaScript, plus the precise
 * vocabulary you need to think about it.
 *
 * Programmers don't think in pictures. They think in words. The quality
 * of those words determines the quality of the thinking. So this file
 * starts with vocabulary before getting to the model itself.
 *
 * Every other concept — hoisting, closures, scope, `this` — sits on top
 * of these two foundations. If you can trace any snippet through both
 * phases correctly and explain it using the vocabulary below, you can
 * predict its output. If you can't, you're guessing.
 * ============================================================================
 */


/* ============================================================================
 * PRELUDE — FOUNDATIONAL VOCABULARY
 *
 * Six core terms + the banned words that signal you're not using them.
 * Learn each by example, not just definition.
 * ============================================================================
 */


// ─── IDENTIFIER ─────────────────────────────────────────────────────────────
//
// An identifier is a NAME you choose in code. The word itself.
//
//     var foo = 5;        // "foo" is the identifier
//     function greet(){}  // "greet" is the identifier
//
// The identifier is NOT the value. It is the NAME that points to a slot
// (a binding) which holds the value.
//
// Misconception:
//   Wrong → "the identifier stores 5"
//   Right → "the identifier 'foo' references a binding which holds 5"


// ─── BINDING ────────────────────────────────────────────────────────────────
//
// A binding is the NAMED SLOT in memory the engine creates for an identifier.
// The binding holds a value or a reference.
//
//   Identifier "foo" ──→ [ binding: holds value 5 ]
//
// During the creation phase, the engine CREATES the binding.
// During the execution phase, code ASSIGNS values into the binding.
//
// Two different bindings can hold REFERENCES to the same object — that's
// why at the browser top level, `this === window` is true: two bindings,
// one object.


// ─── REFERENCE ──────────────────────────────────────────────────────────────
//
// A reference is a POINTER to an object in memory. JS variables don't hold
// objects directly — they hold references to objects.

var a = { name: "Vardhan" };
var b = a;
b.name = "Changed";
console.log(a.name);   // "Changed" — a and b reference the SAME object

// Primitives (number, string, boolean) are copied by VALUE:

var p = 5;
var q = p;
q = 99;
console.log(p);   // 5 — p unchanged; q got its own copy

// Rule:
//   Objects, arrays, functions → held by REFERENCE
//   Numbers, strings, booleans, null, undefined → held by VALUE


// ─── FUNCTION OBJECT ────────────────────────────────────────────────────────
//
// In JS, functions are OBJECTS. When you declare a function, the engine
// creates an object in memory representing it — that's the function object.
// The identifier holds a REFERENCE to it.

function greet() { console.log("hi"); }

// What's in memory:
//   identifier "greet" → binding → reference → [function object]

var sayHi = greet;   // sayHi now references the SAME function object
sayHi();             // logs "hi"

// Because they're objects, you can attach properties:
greet.timesCalled = 3;
console.log(greet.timesCalled);   // 3

// When tutorials say "function whole code is in memory" — what's really
// in memory is the function OBJECT, with the body available. The body
// is not RUN until the function is invoked with ( ).


// ─── ALLOCATED ──────────────────────────────────────────────────────────────
//
// "Allocated" = memory space reserved. The slot exists. What's IN the slot
// depends on the declaration kind:
//
//   var:    allocated and initialized to undefined.
//   let:    allocated but UNINITIALIZED (TDZ — Ep 8).
//   const:  allocated but UNINITIALIZED (TDZ — Ep 8).
//   function declaration: allocated AND bound to a function-object reference.
//
// Do NOT confuse "allocated" with "executed":
//   - Allocation happens in CREATION phase. Nothing runs.
//   - Execution happens in EXECUTION phase. Code runs.
//
// Collapsing these two is the single most common beginner mistake.


// ─── REASSIGNED ─────────────────────────────────────────────────────────────
//
// To reassign = replace the value/reference held by an existing binding
// with a new one. The binding doesn't move; what's INSIDE it changes.

var name = "Vardhan";
name = "Vardhan Singh";   // reassigned — same binding, new value

// - var:   reassignable
// - let:   reassignable
// - const: NOT reassignable (binding is locked to its initial value)
//
// Misconception:
//   Wrong → "reassigned by var"
//   Right → "reassigned by the = operator"
//   var (or let) declares. The = operator assigns or reassigns.


// ─── BANNED WORDS — catch yourself before typing these ──────────────────────
//
//   "stored"        → use *allocated* or *bound to*
//                     (too generic; doesn't distinguish creation from execution)
//
//   "stuff"/"things" → name the specific thing
//                     (identifier, binding, function object, reference, ...)
//
//   "set up"        → set up WHAT? Hides the answer.
//
//   "made"          → "created", "allocated", "instantiated"
//
//   "executed" when meaning "allocated"
//                   → function bodies are ALLOCATED in creation phase;
//                     they EXECUTE only when invoked. Don't blur the phases.


// ─── SYMBOL TERMINOLOGY — don't mix these ───────────────────────────────────
//
// ( )   Parentheses
//         - function calls:           greet()
//         - function definitions:     function greet() {}
//         - grouping expressions:     (1 + 2) * 3
//         - conditional/loop heads:   if (...), while (...), for (...)
//
// { }   Braces (curly braces)
//         - object literals:          { name: "Vardhan" }
//         - function bodies:          function greet() { ... }
//         - block statements:         if (x) { ... }
//
// [ ]   Brackets (square brackets)
//         - array literals:           [1, 2, 3]
//         - index access:             arr[0]
//         - computed property:        obj["key"]
//
// An EMPTY OBJECT is `{}`.  Never call it "empty parenthesis."
// An EMPTY ARRAY  is `[]`.
// EMPTY PARENTHESES `()` are what you write for a no-argument function call.
//
// Three distinct constructs. Mixing them in writing means you'll mix
// them in code.


// ─── LANGUAGE TIPS YOU'LL USE EVERY DAY ─────────────────────────────────────
//
// TIP 1 — Read your own answers aloud before sending.
//   If a sentence sounds vague when spoken ("then the thing happens"),
//   it IS vague. Read-aloud is the cheapest editing pass.
//
// TIP 2 — When you don't know a word, mark it with [?] and continue.
//   Don't substitute a similar-sounding word from memory. That's how
//   "empty object" becomes "empty parenthesis" in your head.
//
// TIP 3 — Write the MECHANISM, not just the conclusion.
//   Conclusion only: "this equals window."
//   Mechanism:       "the `this` binding holds a reference to the global
//                     object; in a browser that object is window;
//                     therefore `this === window` is true."
//   The mechanism is the proof.
//
// TIP 4 — Reach for the harder word when both feel available.
//   "stored" vs "allocated" — choose "allocated." The comfortable word
//   is usually the cargo-cult word. The harder word forces you to ask
//   whether it actually fits.
//
// TIP 5 — Slow down on names. Typing "conetext" instead of "context"
//   is not just a typo; it's evidence your fingers moved faster than
//   your attention. Spelling errors in technical writing signal sloppy
//   thinking to reviewers and interviewers.


// With the vocabulary established, the model itself:
//



/* ============================================================================
 * SECTION 1 — WHAT IS AN EXECUTION CONTEXT?
 * ============================================================================
 */

// An Execution Context (EC) is the ENVIRONMENT in which a piece of JS code
// runs. Think of it as a sealed box that contains:
//
//   1. A MEMORY COMPONENT (a.k.a. Variable Environment)
//      Holds all the identifiers declared in that scope, mapped to their
//      bindings.
//
//   2. A CODE COMPONENT (a.k.a. Thread of Execution)
//      The instruction pointer — what line is currently running.
//
// There are TWO KINDS of Execution Contexts you'll meet:
//
//   - The Global Execution Context (GEC) — created once when the script loads.
//   - Function Execution Contexts — created every time a function is invoked.
//
// Function ECs are pushed onto the call stack when functions are called,
// and popped off when they return.


/* ============================================================================
 * SECTION 2 — THE CREATION PHASE (MEMORY PHASE)
 *
 * What happens BEFORE a single line of your code runs.
 * ============================================================================
 */


// When the engine enters an Execution Context, it does a first pass over
// the code WITHOUT executing anything. In this pass, it scans for
// declarations and allocates memory for each one.
//
// Rules:
//
//   var name;
//     → identifier `name` allocated
//     → binding initialized to the special value `undefined`
//
//   function greet() { ... }
//     → identifier `greet` allocated
//     → binding holds a reference to the function object
//        (the function object itself is created in this phase)
//
//   let x;     (covered fully in Ep 8)
//   const y;
//     → identifier allocated but UNINITIALIZED
//     → reading the identifier before its declaration line throws
//       ReferenceError — this region is called the Temporal Dead Zone (TDZ)
//
//   var x = 5;
//     → ONLY the declaration part runs in creation phase
//     → identifier `x` is allocated and set to undefined
//     → the `= 5` part does not happen until execution phase


// Verifying with mental trace:

console.log(a);        // ?
console.log(typeof greet);  // ?
var a = 10;
function greet() { console.log("hi"); }

// CREATION PHASE end state:
//     a     → undefined
//     greet → reference to function object
//
// EXECUTION PHASE:
//     line 1: console.log(a)            → "undefined"
//     line 2: console.log(typeof greet) → "function"
//     line 3: a is reassigned to 10
//     line 4: function declaration — no-op at runtime


// Key insight: the CREATION phase is why you can access identifiers
// "before" their declaration line in the source code. They're already
// in memory. The order they appear in source code doesn't determine
// when they exist; the creation phase already put them there.


/* ============================================================================
 * SECTION 3 — THE EXECUTION PHASE
 *
 * Now the engine RUNS the code, top to bottom.
 * ============================================================================
 */


// In the execution phase:
//
//   - Statements run in order, line by line.
//   - Assignments (`x = 5`) update bindings.
//   - Function calls (`greet()`) create NEW Execution Contexts and push
//     them onto the call stack.
//   - When a function returns, its EC is popped off the stack and discarded.
//   - Bare function declarations (`function foo() {}`) are no-ops here —
//     they were processed in creation phase.


// Trace this example fully:

function multiply(a, b) {
  return a * b;
}

var result = multiply(3, 4);
console.log(result);

// CREATION PHASE (of the Global EC):
//   multiply → reference to function object
//   result   → undefined
//
// EXECUTION PHASE (of the Global EC):
//   line 1: function declaration — no-op (already allocated)
//     ...
//   line 5: multiply(3, 4) invoked → creates a NEW Function EC
//
//     CREATION PHASE (of multiply's EC):
//       a → undefined          (parameter, set to argument value next)
//       b → undefined
//     (then a=3, b=4 — parameters get assigned)
//
//     EXECUTION PHASE (of multiply's EC):
//       return a * b → 12 → returned to caller, this EC is popped
//
//   line 5 continues: result is reassigned to 12
//   line 6: console.log(result) → "12"


// Tracing the call stack:
//
//   ┌──────────────────────┐
//   │ multiply EC          │ ← pushed when called, popped when returned
//   ├──────────────────────┤
//   │ Global EC            │ ← stays until script ends
//   └──────────────────────┘
//
// The Global EC is at the BOTTOM, always. Function ECs come and go on top.


/* ============================================================================
 * SECTION 4 — DECLARATION ≠ ASSIGNMENT (CRITICAL)
 *
 * This is the single most common source of confusion in beginner JS.
 * ============================================================================
 */


// Consider this one line:

var x = 5;

// It LOOKS like one thing. It's actually TWO things:
//
//   1. `var x;`   → a DECLARATION
//                   processed in CREATION PHASE
//                   allocates identifier `x`, sets binding to undefined
//
//   2. `x = 5;`   → an ASSIGNMENT
//                   processed in EXECUTION PHASE
//                   when the engine reaches this line at runtime,
//                   it reassigns x's binding to hold the value 5


// Why this distinction matters:

console.log(x);    // undefined — declaration ran in creation phase
var x = 5;         // assignment runs HERE, on this line, at execution time
console.log(x);    // 5

// If declaration and assignment were one thing, the first console.log
// would throw ReferenceError. It doesn't — it logs undefined. That's
// your proof that the two are separate.


// Vocabulary trap to avoid:
//     Wrong: "Declaration of x as 5 happens at execution phase."
//     Right: "Declaration of x happens at creation phase. ASSIGNMENT of
//            5 to x happens at execution phase."


/* ============================================================================
 * SECTION 5 — WHY THIS MODEL MATTERS IN PRACTICE
 * ============================================================================
 */


// Reason 1 — You can predict output without running code.
//   This is the difference between guessing and understanding. When you
//   can mentally trace any snippet through both phases, you can answer
//   "what does this log?" questions in interviews instantly.

// Reason 2 — You can debug variables that are mysteriously undefined.
//   Often: the assignment hasn't run yet. Knowing the two-phase model
//   tells you WHERE in the code the value comes alive.

// Reason 3 — You understand hoisting from first principles.
//   "Hoisting" is just a name for what the creation phase does.
//   Once you understand the phases, hoisting stops being magic.

// Reason 4 — You can reason about closures, scope chains, and the
//   event loop — all of which build on the EC model.


/* ============================================================================
 * SECTION 6 — COMMON MISTAKES IN TRACING
 * ============================================================================
 */


// MISTAKE 1 — Skipping the creation phase entirely.
//   Symptom: you read code top-to-bottom and predict ReferenceError on
//   lines that actually log undefined. The creation phase already populated
//   memory; ReferenceError doesn't apply to var.

// MISTAKE 2 — Thinking function bodies execute in creation phase.
//   They don't. The function OBJECT is allocated in creation phase; the
//   body only runs when the function is called.

// MISTAKE 3 — Forgetting that each function call gets its OWN EC.
//   Variables inside a function are local to THAT call's EC. Two calls
//   to the same function have two separate ECs, two separate sets of
//   bindings.

// MISTAKE 4 — Confusing the order of source code with the order of execution.
//   In creation phase, the engine reads source order to scan declarations.
//   In execution phase, the engine reads source order again to run code.
//   But during creation, what was declared LOWER in the source is already
//   available at the TOP of execution. That's the "hoisting" illusion.


/* ============================================================================
 * SECTION 7 — TIPS FOR MENTAL TRACING
 * ============================================================================
 */


// TIP 1 — Always write the two phases as a literal table.
//   Don't try to do it in your head. On paper:
//
//     Creation phase memory:
//       identifier_1 → value_1
//       identifier_2 → value_2
//       ...
//
//     Execution phase:
//       line 1: ...
//       line 2: ...
//
//   The table forces precision. Without it, you skip steps mentally
//   and predict wrong.


// TIP 2 — When a function is called, draw the new EC above the existing one.
//   Stack diagrams are not optional. They're the only way to see what
//   happens when you have nested calls.


// TIP 3 — Predict, then run. Always in that order.
//   If you run code first, you've learned nothing — you just confirmed
//   what the engine did. Predicting first surfaces wrong models. The
//   moment your prediction differs from the output is the moment you
//   actually learn.


// TIP 4 — When predicting fails, don't immediately fix and rerun.
//   STOP. Find the exact step in your trace where your model diverged
//   from the engine's behavior. Fix the model, not just the prediction.
//   Otherwise you'll make the same error tomorrow on a different snippet.


// TIP 5 — Use a code editor to write predictions as COMMENTS first.

// console.log(a);       // PREDICT: undefined
// var a = 1;
// console.log(a);       // PREDICT: 1

//   Then run and compare. Treat code as a quiz, not a chore.


// TIP 6 — When you can do this without notes for any snippet you encounter,
//   you've moved from "knowing about" the two-phase model to "owning" it.
//   That's the test.


// ============================================================================
// END OF FILE 1 / 4
// Next: 02_hoisting.js
// ============================================================================

// -------------------------< proving by code >-----------------------

console.log("first")
console.log("second")
console.log("third")

// hence these three lines run one by one we can say that javascirpt is a specific order