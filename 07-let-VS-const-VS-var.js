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

