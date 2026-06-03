// ===========================================================================
// EP 9 — BLOCK SCOPE & SHADOWING IN JS  (Namaste JavaScript, Akshay Saini)
// Clean reference notes. Quiz avg this episode: ~8.5/10 (12 questions).
// Builds directly on: Ep 7 (scope chain, shadowing) + Ep 8 (let/const, TDZ,
// hoisting, error classes). Cross-links to those are marked [-> Ep N].
// ===========================================================================


// ---------------------------------------------------------------------------
// 1. WHAT A BLOCK IS
// ---------------------------------------------------------------------------
// A block is `{ ... }`. It groups multiple statements where JS syntactically
// expects ONE statement (e.g. the body after an `if`, `for`, `while`).
// Also called a "compound statement".
// A block is a SCOPE-CREATING construct for let/const -- but NOT for var.


// ---------------------------------------------------------------------------
// 2. THE ONE RULE THAT DRIVES THE WHOLE EPISODE
// ---------------------------------------------------------------------------
//   let / const  ->  BLOCK-scoped     (boundary = the nearest { })
//   var          ->  FUNCTION-scoped  (boundary = the nearest function;
//                                       global ONLY when there is no function)
//
// "var is global" is the trap. var is NOT inherently global. It is
// function-scoped. It just *looks* global at the top level because there is
// no enclosing function to stop it.
//
//   { let a = 10; }
//   console.log(a);   // ReferenceError: a is not defined  (let died with block)
//
//   { var b = 10; }
//   console.log(b);   // 10  (var ignored the block, attached to global scope)
//
//   function f() { { var y = 5; } console.log(y); }
//   f();              // 5  (var attached to f's FUNCTION scope, not global --
//                     //     log y OUTSIDE f and you'd get "not defined")
//
// DevTools: let/const in a block show under a separate "Block" scope;
// top-level let/const show under "Script" (NOT the global object) [-> Ep 8];
// var shows under "Global".


// ---------------------------------------------------------------------------
// 3. THE SCOPE CHAIN  [-> Ep 7]
// ---------------------------------------------------------------------------
// Identifier resolution for a name:
//   1. Look in the CURRENT scope.
//   2. Not found? Climb to the lexical PARENT scope.
//   3. Repeat until found. FIRST MATCH WINS -- resolution STOPS there.
//   4. End of the chain without a match -> ReferenceError "not defined".
//
//   let p = 1;
//   {
//     let p = 2;
//     { console.log(p); }   // 2 -- innermost block has no p, climbs to parent
//   }                       //     block (p=2), finds it, STOPS. Never reaches
//                           //     the global p=1.


// ---------------------------------------------------------------------------
// 4. SHADOWING -- REAL vs FAKE
// ---------------------------------------------------------------------------
// Shadowing = an inner-scope variable reusing an outer name. Inside the inner
// scope the name resolves to the inner binding.
//
// REAL shadowing needs TWO SEPARATE BINDINGS:
//   let x = 10;
//   { let x = 20; console.log(x); }  // 20  (inner binding shadows outer)
//   console.log(x);                  // 10  (outer binding untouched)
//   // The outer surviving as 10 is the PROOF that two bindings existed.
//
// FAKE "shadowing" with var = only ONE binding (var ignores the block):
//   var x = 10;
//   { var x = 20; }                  // SAME binding -- this is reassignment,
//   console.log(x);                  // 20  NOT shadowing. No new variable made.
//
// KEY DISCIPLINE: always ask "how many bindings exist?"
//   - new let/const declaration in a nested scope -> NEW binding -> shadowing
//   - var in a block, or bare `x = ...` with no keyword -> SAME binding -> reassign


// ---------------------------------------------------------------------------
// 5. DECLARATION vs ASSIGNMENT (no new binding without a keyword)
// ---------------------------------------------------------------------------
//   let q = 5;
//   { q = 10; console.log(q); }   // 10
//   console.log(q);               // 10
//
// `q = 10` has NO keyword -> ASSIGNMENT, not declaration. No new binding.
// Resolution climbs to the one outer q and reassigns it. Exactly ONE q
// throughout, observed from two places.


// ---------------------------------------------------------------------------
// 6. ILLEGAL SHADOWING
// ---------------------------------------------------------------------------
// You CANNOT shadow a let/const with a var when the var would land in the SAME
// scope as the let/const.
//
//   let w = 1;
//   { var w = 2; }     // SyntaxError: Identifier 'w' has already been declared
//
// WHY: var is not block-scoped, so `var w` LEAKS UP out of the block into the
// enclosing (global) scope -- the same scope where `let w` already lives. Two
// declarations of `w` in one scope, one of them lexical (let), violates the
// grammar. Caught at PARSE-TIME [-> Ep 8], so NOTHING runs.
//
// LEGAL counterparts:
//   var w = 1; { let w = 2; }              // legal -- let stays in the block
//   let w = 1; function f(){ var w = 2; }  // legal -- function boundary stops
//                                          //          var reaching the outer w
//
// The asymmetry is pure CONTAINMENT:
//   - let stays inside the block (separate scope) -> no collision
//   - var escapes the block (function/global scope) -> collision
//   - a FUNCTION boundary contains var; a BLOCK boundary does not.


// ---------------------------------------------------------------------------
// 7. TDZ INSIDE A BLOCK  [-> Ep 8]
// ---------------------------------------------------------------------------
//   let r = 1;
//   {
//     console.log(r);   // ReferenceError: Cannot access 'r' before initialization
//     let r = 2;
//   }
//
// WHY it does NOT print the outer r=1:
//   - `let r = 2` is HOISTED to the top of the BLOCK's scope, UNINITIALIZED.
//   - So from block entry, the block OWNS an `r` sitting in its TDZ.
//   - At console.log(r), resolution finds `r` in the current (block) scope --
//     it EXISTS -- so it stops there and never climbs to the outer r.
//   - But that block r is uninitialized -> TDZ ReferenceError.
//
// TDZ = the span from hoisting (memory-creation phase) to the declaration line
// executing. The block creates its own TDZ for its own let/const.


// ---------------------------------------------------------------------------
// 8. var HOISTING INSIDE A BLOCK  [-> Ep 8]
// ---------------------------------------------------------------------------
//   {
//     console.log(z);   // undefined   (NOT an error)
//     var z = 5;
//   }
//
// WHY undefined (not a ReferenceError):
//   - var is hoisted AND initialized to `undefined` in the MEMORY-CREATION phase.
//   - var ignores the block, so it hoists to the GLOBAL scope (here).
//   - The early read returns the `undefined` placeholder. No error.
//
// CONTRAST with let (the Ep 8 distinction, core of this whole family):
//   var early read  -> undefined   (placeholder exists)
//   let early read  -> THROWS      (hoisted but UNINITIALIZED, no placeholder; TDZ)


// ---------------------------------------------------------------------------
// 9. ERROR CLASSES + TIMING -- recap from Ep 8, used constantly here
// ---------------------------------------------------------------------------
// SyntaxError    = PARSE-TIME. Invalid grammar. Whole script rejected.
//                  NOTHING runs (not even earlier console.logs).
//                  e.g. illegal shadowing (section 6).
//
// ReferenceError = RUNTIME. Name resolution failure. TWO flavors:
//                  (a) TDZ:         "Cannot access 'x' before initialization"
//                                   -> binding EXISTS in scope but uninitialized
//                  (b) not defined: "x is not defined"
//                                   -> NO binding by that name in any reachable scope
//
// TypeError      = RUNTIME. Target resolves fine; the OPERATION is illegal.
//                  e.g. reassigning a const, calling a non-function.
//
// MNEMONIC [-> Ep 8]:
//   ReferenceError = "can't find / can't access this NAME"
//   TypeError      = "found it, illegal operation ON it"
//
// STATEMENT-LEVEL EXECUTION [-> Ep 8]: a RUNTIME error lets earlier statements
// run (and print) first, then aborts. A PARSE-TIME error prints nothing -- it
// is caught before execution begins. That is exactly why illegal shadowing's
// console.log never runs: SyntaxError beats execution to the punch.


// ---------------------------------------------------------------------------
// 10. THE THREE PHASES -- where each thing happens  [-> Ep 8, two-phase model]
// ---------------------------------------------------------------------------
//   PARSE            -> grammar check. SyntaxError surfaces here.
//   MEMORY-CREATION  -> hoisting. var = undefined; let/const = uninitialized
//                       (TDZ begins). NOT "parsing". This is runtime setup.
//   EXECUTION        -> lines run top to bottom. TDZ ends at the declaration
//                       line. ReferenceError / TypeError surface here.


// ---------------------------------------------------------------------------
// 11. BEST PRACTICES
// ---------------------------------------------------------------------------
//   - Declare + initialize at the TOP of a scope -> shrinks the TDZ to near zero.
//   - Preference order: const > let > var.
//   - Prefer block scoping (let/const): tighter, predictable, no var leakage.
//   - Avoid var precisely because it ignores blocks and leaks unexpectedly.


// ---------------------------------------------------------------------------
// 12. HOW EP 9 STITCHES INTO THE WIDER PICTURE
// ---------------------------------------------------------------------------
// Ep 7  (Scope chain & shadowing): introduced the chain + shadowing concept.
//        Ep 9 = the SAME chain, now applied to BLOCK-level scopes, plus the
//        sharpened real-vs-fake shadowing distinction (section 4).
//
// Ep 8  (let/const, TDZ, hoisting, error classes): supplied the machinery.
//        Ep 9 reuses ALL of it inside { } -- block-level TDZ (section 7),
//        var's undefined placeholder vs let's no-placeholder (section 8),
//        and the parse-time/runtime error timing (section 9).
//
// Execution model (two-phase): every behavior above is just memory-creation
//        then execution playing out at block granularity.
//
// ONE-LINE SUMMARY:
//   "let/const respect the block; var respects only the function. Everything
//    else -- shadowing, TDZ, illegal shadowing, undefined-vs-throw -- falls out
//    of that single fact plus the scope chain."


