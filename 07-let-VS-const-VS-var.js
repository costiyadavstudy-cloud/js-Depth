// =============================================================================
// EP 8 — let & const in JS, Temporal Dead Zone (TDZ)
// Namaste JavaScript (Akshay Saini) | Final clean notes (v1)
// Builds on: Ep 2 (two-phase execution / hoisting), Ep 7 (scope chain)
// =============================================================================


// -----------------------------------------------------------------------------
// 0. THE ONE SENTENCE THAT CONTROLS EVERYTHING
// -----------------------------------------------------------------------------
// let and const ARE hoisted — but they are left UNINITIALIZED.
// var is hoisted AND initialized to `undefined`.
//
// That single difference (uninitialized vs initialized-to-undefined) is the
// whole episode. The TDZ, the ReferenceError, all of it, falls out of it.


// -----------------------------------------------------------------------------
// 1. WHAT THE ENGINE DOES IN THE MEMORY-CREATION PHASE
// -----------------------------------------------------------------------------
// Before any line executes, the engine sets up memory for the scope:
//
//   var x       -> binding created AND set to `undefined`  (a placeholder value)
//   let y       -> binding created, NO value bound          (uninitialized)
//   const z     -> binding created, NO value bound          (uninitialized)
//
// So a `var` read before its line returns `undefined` (a real value sits there).
// A `let`/`const` read before its line THROWS, because there is nothing to read
// — not even `undefined`. The slot exists; the value does not yet.
//
// MISCONCEPTION TO KILL: "let/const get an `undefined` placeholder too."
// They do NOT. If they did, an early read would return `undefined` like var —
// and then the TDZ would have nothing to throw about. The point of let/const is
// that there is NO placeholder.


// -----------------------------------------------------------------------------
// 2. THE TEMPORAL DEAD ZONE (TDZ)
// -----------------------------------------------------------------------------
// Definition: the span of time during which a let/const binding exists but is
// still uninitialized. Any read of the variable in this span throws.
//
//   BEGINS: when the binding is hoisted in the MEMORY-CREATION phase
//           (i.e. when the scope is entered) — NOT "parse time".
//   ENDS:   when the variable's DECLARATION LINE executes and initializes it.
//
// Both endpoints happen during EXECUTION setup/run — parsing is not involved.
//
//   console.log(b);   // <-- b is in its TDZ here
//   let b = 20;       // <-- TDZ ends exactly here
//
// Error thrown for a read inside the TDZ:
//   ReferenceError: Cannot access 'b' before initialization
//   (note: "Cannot access" + the variable name in quotes; NOT "is undefined")


// -----------------------------------------------------------------------------
// 3. TWO DIFFERENT LOOKUPS — DON'T BLUR THEM
// -----------------------------------------------------------------------------
// (This was the sharp confusion: "isn't reading a missing thing the same?")
// No. `obj.prop` and bare `name` are DIFFERENT operations with different rules.
//
//   A) OBJECT PROPERTY ACCESS:  window.b
//      Reads property `b` off the object `window`. If the property is absent,
//      you get `undefined`. It NEVER throws (the object itself exists).
//
//   B) IDENTIFIER RESOLUTION:   bare  b
//      Resolves the NAME through the scope chain. Three outcomes:
//        - found & initialized          -> its value
//        - found but uninitialized (TDZ)-> ReferenceError: Cannot access 'b'...
//        - not found anywhere           -> ReferenceError: b is not defined
//
// "Missing" means different things:
//   missing object PROPERTY      -> undefined
//   missing IDENTIFIER in scope  -> ReferenceError: x is not defined
//   existing-but-uninitialized   -> ReferenceError: Cannot access 'x' before...


// -----------------------------------------------------------------------------
// 4. let/const ARE NOT ATTACHED TO THE GLOBAL OBJECT
// -----------------------------------------------------------------------------
//   var a = 10;   // top level
//   let b = 20;   // top level
//
//   window.a  -> 10          (var attaches to the global object)
//   window.b  -> undefined   (let/const live in a SEPARATE memory space,
//                             shown as "Script" scope in Chrome devtools)
//
// Why window.b is `undefined` (not an error): window.b is OBJECT PROPERTY access
// (see section 3A). `b` is not a property of window, and a missing property
// returns `undefined`. Meanwhile bare `b` resolves to 20 via the Script scope.
// Same name, two lookups, two answers.


// -----------------------------------------------------------------------------
// 5. THE THREE ERROR CLASSES — AND *WHEN* EACH IS CAUGHT (master table)
// -----------------------------------------------------------------------------
// This is the spine of the episode. The TYPE tells you the TIMING.
//
//   SyntaxError    -> PARSE-TIME. The code is not valid JS grammar. The engine
//                     parses the whole file, finds the problem, and REJECTS THE
//                     ENTIRE SCRIPT before executing a single line.
//                     Consequence: NOTHING runs — not even valid lines above it.
//
//   ReferenceError -> RUNTIME. A name-resolution problem: the binding is
//                     uninitialized (TDZ) or was never declared.
//                     ("I can't find / can't access this NAME.")
//
//   TypeError      -> RUNTIME. The name resolved fine, but the OPERATION is
//                     illegal on that target (e.g. reassigning a const).
//                     ("I found it — but you can't DO that to it.")
//
// MNEMONIC:
//   SyntaxError    = "this isn't even valid JS"        (caught before running)
//   ReferenceError = "can't find / can't access NAME"  (runtime)
//   TypeError      = "found it, illegal operation"      (runtime)


// -----------------------------------------------------------------------------
// 6. const RULES
// -----------------------------------------------------------------------------
//   const b;          // SyntaxError: Missing initializer in const declaration
//                     // -> parse-time. const MUST be initialized at declaration,
//                     //    because it can never be reassigned later (a const with
//                     //    no value would be permanently useless). Nothing runs.
//
//   const a = 10;
//   a = 20;           // TypeError: Assignment to constant variable.
//                     // -> runtime. Grammar is valid; the WRITE is the illegal
//                     //    operation. `a` resolves fine (it's 10) — no reference
//                     //    problem — so it can't be a ReferenceError.


// -----------------------------------------------------------------------------
// 7. let / var REDECLARATION RULES
// -----------------------------------------------------------------------------
//   let a = 10;
//   let a = 20;       // SyntaxError: Identifier 'a' has already been declared
//                     // -> parse-time. Redeclaring a let in the SAME scope is
//                     //    invalid grammar. Nothing runs at all.
//
//   var a = 10;
//   var a = 20;       // no error. var ALLOWS redeclaration in the same scope.
//   console.log(a);   // 20
//                     // The second `var a` is NOT a new variable — it's the same
//                     //    binding, and `= 20` just reassigns it. The later value
//                     //    wins. (let forbids exactly this.)


// -----------------------------------------------------------------------------
// 8. THREE DISTINCT STEPS — keep them apart
// -----------------------------------------------------------------------------
//   PARSE            : grammar check. SyntaxErrors are found here. No code runs.
//   MEMORY-CREATION  : bindings hoisted (var -> undefined; let/const -> uninit).
//                      The TDZ begins here.
//   EXECUTION        : lines run top-to-bottom. Values get assigned; TDZ ends at
//                      a variable's declaration line. ReferenceError/TypeError
//                      surface here.
//
// "Allocation" / "hoisting" is the MEMORY-CREATION phase — it is NOT parsing.


// -----------------------------------------------------------------------------
// 9. STATEMENT-LEVEL EXECUTION
// -----------------------------------------------------------------------------
//   let a = 10;
//   console.log(a);   // prints 10  (this statement fully runs first)
//   console.log(c);   // ReferenceError: Cannot access 'c' before initialization
//   let c = 30;
//
// A RUNTIME error aborts from its own line onward. Earlier statements that
// already ran have already produced their output. (So `10` prints, THEN it
// throws.) Contrast: a SyntaxError prints nothing at all, because it's caught
// before execution even begins.


// -----------------------------------------------------------------------------
// 10. BEST PRACTICE
// -----------------------------------------------------------------------------
// Declare AND initialize variables at the TOP of their scope.
// Why (the mechanism, not just "fewer bugs"): it shrinks the gap between
// hoisting and initialization — the TDZ — to nearly zero, so there are almost
// no lines where the variable can be read while still uninitialized. Fewer
// chances to hit a TDZ ReferenceError.
//
// Preference order in practice: const > let > var.
//   const by default; let when you must reassign; avoid var.


// -----------------------------------------------------------------------------
// 11. ANTI-PATTERN: CIRCULAR "WHY" (self-check)
// -----------------------------------------------------------------------------
// A reason is circular if it just restates the label backwards:
//   BAD : "it's a SyntaxError because it's syntactically wrong"
//   BAD : "it throws because it's in the TDZ"
// Dig one layer:
//   GOOD: "a duplicate let is invalid grammar, rejected before execution"
//   GOOD: "the binding is hoisted but UNINITIALIZED, so reading it throws"
//
// Test: if your 'because' reverses into 'it's wrong because it's wrong', go deeper.

// =============================================================================
// EP 8 QUIZ BANK — let & const, TDZ  | all 12 questions worked out
// Fixed bank of 12. Average: ~7.6/10.
// Each entry: QUESTION -> MODEL ANSWER (10/10) -> MY ANSWER -> SCORE.
// Rubric: 3 (output correct) + 5 (real mechanism) + 2 (precision).
// =============================================================================


// -----------------------------------------------------------------------------
// Q1  —  "let and const are not hoisted — only var is." True or false + mechanism.
// -----------------------------------------------------------------------------
// MODEL (10/10):
//   False. let and const ARE hoisted. The difference is initialization: in the
//   memory-creation phase, var is created AND set to `undefined`, while
//   let/const are created but left UNINITIALIZED (no value bound). That
//   uninitialized state is the TDZ.
//
// MY ANSWER:
//   "no. let/const are hoisted and given undefined as a placeholder, but hoisted
//    in a different scope called TDZ; var gets undefined in global scope..."
//
// SCORE: 5/10  (3 + 2 + 0)
//   Right: verdict (false / hoisted).
//   Wrong: let/const do NOT get an `undefined` placeholder (that's var); and TDZ
//          is a time window, NOT a scope. Self-contradiction: if they held
//          `undefined`, an early read would return it, not throw.


// -----------------------------------------------------------------------------
// Q2  —  (a) Define the TDZ in one sentence. (b) Exact error type + message.
// -----------------------------------------------------------------------------
// MODEL (10/10):
//   (a) The span from when a let/const binding is hoisted (uninitialized) until
//       the line that initializes it executes; any read during it throws.
//   (b) ReferenceError — "Cannot access 'x' before initialization".
//
// MY ANSWER:
//   (a) time between allocation and initialization of the let/const variable.
//   (b) reference error: can't access 'b' before initialization.
//
// SCORE: 10/10  (3 + 5 + 2)
//   (Casing of ReferenceError not penalized; concept + message content correct.)


// -----------------------------------------------------------------------------
// Q3  —  Trace + why.
//        Snippet A: console.log(a); var a = 10;
//        Snippet B: console.log(b); let b = 20;
// -----------------------------------------------------------------------------
// MODEL (10/10):
//   (a) undefined. var a is hoisted AND initialized to undefined; the log runs
//       before the `a = 10` line, so it reads the placeholder.
//   (b) ReferenceError: Cannot access 'b' before initialization. let b is
//       hoisted but uninitialized; the log reads it inside its TDZ.
//
// MY ANSWER:
//   (a) 10  [WRONG]   "var is accessible before init from global scope."
//   (b) ReferenceError, accessed during TDZ.  [correct]
//
// SCORE: 6/10  (1.5 + 2.5 + 2)
//   Trap: "accessible early" != "already holds 10". At the log, a is `undefined`;
//   `a = 10` runs on the NEXT line. Output is undefined, not 10.


// -----------------------------------------------------------------------------
// Q4  —  Top level: var a = 10; let b = 20;
//        (a) window.a? window.b?  (b) mechanism behind the difference.
// -----------------------------------------------------------------------------
// MODEL (10/10):
//   (a) window.a -> 10 ; window.b -> undefined
//   (b) var attaches to the global object (window). let/const live in a separate
//       "Script" memory space, not on window. window.b is OBJECT property access;
//       b isn't a property of window, and a missing property returns undefined
//       (it doesn't throw). Bare b would resolve to 20 via the Script scope.
//
// MY ANSWER:
//   window.a = 10 [correct]; window.b = "don't know, but not 20 — b is in a
//   separate scope named Script." [mechanism correct; value not given]
//
// SCORE: 7/10  (1.5 + 3.5 + 2)
//   Missing: window.b is `undefined` (missing object property -> undefined).


// -----------------------------------------------------------------------------
// Q5  —  const b; b = 10;
//        (a) what happens (b) error type (c) parse-time or runtime?
// -----------------------------------------------------------------------------
// MODEL (10/10):
//   (a) It throws and the script never runs a line.
//   (b) SyntaxError — "Missing initializer in const declaration".
//   (c) Parse-time. const MUST be initialized at declaration (it can never be
//       reassigned). Invalid grammar -> rejected before execution -> nothing runs.
//
// MY ANSWER:
//   (a) throws an error. (b) SyntaxError [correct]. (c) "no idea." [honest IDK]
//
// SCORE: 5/10  (3 + 0 + 2)
//   Type correct, but no mechanism — the parse-time/runtime idea WAS the (c) gap.


// -----------------------------------------------------------------------------
// Q6  —  const a = 10; a = 20;
//        (a) what happens (b) error type (c) why different from Q5 / when caught?
// -----------------------------------------------------------------------------
// MODEL (10/10):
//   (a) It throws — reassigning a constant binding.
//   (b) TypeError — "Assignment to constant variable."
//   (c) Q5 is a SyntaxError (invalid grammar) caught at parse-time -> nothing
//       runs. Q6 is valid grammar, so it runs and fails at RUNTIME on the illegal
//       reassignment. SyntaxError = before running; TypeError/ReferenceError =
//       while running.
//
// MY ANSWER:
//   (a) errors due to reassignment. (b) ReferenceError [WRONG -> TypeError].
//   (c) Q5 const not assigned at declaration -> SyntaxError; here `a = 20` is
//       syntactically valid but illegal const logic. [correct]
//
// SCORE: 5.5/10  (1.5 + 4 + 0)
//   It's a TypeError, not ReferenceError. `a` resolves fine (no name problem);
//   the WRITE is illegal -> TypeError. (Your own (c) reasoning implied this.)


// -----------------------------------------------------------------------------
// Q7  —  let a = 10; let a = 20;
//        (a) what happens (b) error type (c) does line 1 run / does anything run?
// -----------------------------------------------------------------------------
// MODEL (10/10):
//   (a) Breaks before running (parse-time).
//   (b) SyntaxError — "Identifier 'a' has already been declared".
//   (c) Nothing runs. A duplicate let is invalid grammar; parse-time rejection
//       throws out the whole script before line 1 executes.
//
// MY ANSWER:
//   (a) breaks before code runs. (b) SyntaxError. (c) nothing runs at all.
//
// SCORE: 10/10  (3 + 5 + 2)   [strongest answer — fully derived, coherent chain]


// -----------------------------------------------------------------------------
// Q8  —  var a = 10; var a = 20; console.log(a);
//        (a) output (b) why no error, unlike Q7?
// -----------------------------------------------------------------------------
// MODEL (10/10):
//   (a) 20.
//   (b) var permits redeclaring the same name in one scope. The second `var a`
//       is the SAME binding reassigned, not a new variable, so a becomes 20.
//       let would throw SyntaxError for this; var doesn't.
//
// MY ANSWER:
//   20; var redeclaration is allowed, second declaration "overlaps" the first.
//
// SCORE: 9/10  (3 + 4 + 2)
//   Sharpen "overlaps" -> the second var is the same binding reassigned.


// -----------------------------------------------------------------------------
// Q9  —  For each: error type + short why.
//        (a) read a let before its declaration line
//        (b) reassign a const
//        (c) redeclare a let in the same scope
// -----------------------------------------------------------------------------
// MODEL (10/10):
//   (a) ReferenceError — let is hoisted but uninitialized; reading it throws.
//   (b) TypeError — valid syntax, but reassigning a const is an illegal runtime
//       operation.
//   (c) SyntaxError — a duplicate let is invalid grammar, rejected before running.
//
// MY ANSWER:
//   (a) ReferenceError — accessing a var in the TDZ.
//   (b) TypeError — reassigning is valid in JS but illegal on that operation.
//   (c) SyntaxError — it's syntactically wrong.
//
// SCORE: 9/10  (3 + 4 + 2)
//   Types all correct; (b) why is strongest. Kill circular whys: "SyntaxError
//   because syntactically wrong" restates the label — say "invalid grammar".


// -----------------------------------------------------------------------------
// Q10 —  (a) When does a let's TDZ begin and end?
//        (b) Best practice to shrink the TDZ + why.
// -----------------------------------------------------------------------------
// MODEL (10/10):
//   (a) Begins when the binding is hoisted in the memory-creation phase (scope
//       entry); ends when its declaration line executes and initializes it.
//   (b) Declare + initialize at the top of the scope — it shrinks the hoist-to-
//       init window to near-zero, so almost no lines can read it while
//       uninitialized.
//
// MY ANSWER:
//   begins at allocation "during parsing phase" [WRONG label], ends at assignment
//   during running phase; write declaration+assignment at the top; reduces
//   unexpected errors.
//
// SCORE: 7.5/10  (3 + 3.5 + 1)
//   Allocation is the MEMORY-CREATION phase, NOT parsing. (b) why was too shallow
//   — the mechanism is the shrinking window, not just "fewer errors".


// -----------------------------------------------------------------------------
// Q11 —  let a = 10; console.log(a); console.log(c); let c = 30;
//        (a) what prints first (b) what happens at console.log(c) + why
// -----------------------------------------------------------------------------
// MODEL (10/10):
//   (a) 10.
//   (b) ReferenceError: Cannot access 'c' before initialization. c is hoisted but
//       uninitialized (its TDZ), so reading it throws. Line 2 already printed
//       because statements run in order; the error aborts only from line 3 on.
//
// MY ANSWER:
//   (a) 10. (b) ReferenceError, can't access 'c' before init — c still in TDZ.
//
// SCORE: 9/10  (3 + 4 + 2)
//   Good catch that 10 prints despite the later error (statement-level execution).
//   Push the why deeper: "uninitialized", not just "in the TDZ".


// -----------------------------------------------------------------------------
// Q12 —  (a) parse-time vs runtime for SyntaxError / TypeError / ReferenceError.
//        (b) console.log("hi"); let a; let a;  — does "hi" print? why?
// -----------------------------------------------------------------------------
// MODEL (10/10):
//   (a) SyntaxError -> parse-time ; TypeError, ReferenceError -> runtime.
//   (b) "hi" does NOT print. The duplicate `let a` is a SyntaxError, caught at
//       parse-time. The engine parses the whole file, sees the invalid grammar,
//       and rejects the entire script before executing any line — so the valid
//       console.log never runs.
//
// MY ANSWER:
//   (a) SyntaxError parse-time; TypeError/ReferenceError runtime. [correct]
//   (b) no; duplicate declaration -> SyntaxError, stops the file "and not even
//       parse the other code". [conclusion correct, "not even parse" imprecise]
//
// SCORE: 8/10  (3 + 4 + 1)
//   The parser DOES parse the whole file (that's how it finds the duplicate).
//   What never happens is EXECUTION. Parse: yes. Execute: never.


// =============================================================================
// SCORE SUMMARY
//   Q1:5  Q2:10  Q3:6  Q4:7  Q5:5  Q6:5.5  Q7:10  Q8:9  Q9:9  Q10:7.5  Q11:9  Q12:8
//   Average ~7.6/10
//
// TRAJECTORY: opened shaky (Q1 undefined-placeholder misconception); the
//   parse-time vs runtime framework landed mid-quiz and stuck (Q7-Q9 strongest).
//
// CARRY FORWARD:
//   1. Kill circular whys — dig one layer past the label.
//   2. Keep parse / memory-creation / execution as THREE distinct steps.
//   3. let/const are hoisted but UNINITIALIZED (no placeholder) — the core fact.
// =============================================================================