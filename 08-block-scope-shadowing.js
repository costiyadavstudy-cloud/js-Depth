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


// ===========================================================================
// EP 9 QUIZ BANK -- all 12 questions, Vardhan's answers, scores, models.
// Block Scope & Shadowing. Rubric: 3 (result) + 5 (mechanism) + 2 (precision).
// Scores: 9.5, 5, 9.5, 9.5, 9.5, 6.5, 9, 6, 9, 10, 9.5, 9.5  ->  avg ~8.5/10
// (Ep 8 avg was ~7.6, so this is a clear step up.)
// ===========================================================================


// ---------------------------------------------------------------------------
// Q1 -- 9.5/10  (3 + 4.5 + 2)
// ---------------------------------------------------------------------------
//   { let a = 10; }
//   console.log(a);
//
// ANSWER: ReferenceError. The "not defined" kind, because let is block-scoped --
//   a lives only in the block, gone after it, so global lookup finds nothing.
// LOST 0.5: did not spell out that "not defined" means resolution walked the
//   whole chain and found NO reachable binding (vs TDZ = binding exists but
//   uninitialized).
// MODEL: ReferenceError, "not defined". `let a` is block-scoped; once the block
//   ends the binding is gone. console.log(a) searches global + up the chain,
//   finds no reachable a -> "a is not defined".


// ---------------------------------------------------------------------------
// Q2 -- 5/10  (3 + 2 + 0)   <-- session low; misconception, later corrected
// ---------------------------------------------------------------------------
//   { var b = 10; }
//   console.log(b);
//
// ANSWER: 10, "because var is global no matter where it is created".
// THE ERROR: "var is global no matter where" is FALSE. var is FUNCTION-scoped;
//   it ignores BLOCK boundaries but respects FUNCTION boundaries. It is global
//   HERE only because there is no enclosing function.
// MODEL: prints 10. The block is not a scope boundary for var, so `var b = 10`
//   attaches to the nearest function scope -- or global if none. No function
//   here -> b is global -> reachable after the block. Inside a function this
//   same b would be local and unreachable outside.


// ---------------------------------------------------------------------------
// Q3 -- 9.5/10  (3 + 5 + 1.5)
// ---------------------------------------------------------------------------
//   let p = 1;
//   { let p = 2; { console.log(p); } }
//
// ANSWER: 2. Lookup starts in the innermost block, no p, climbs to lexical
//   parent (p=2), finds it, STOPS without climbing to the global p=1.
// LOST 0.5: called the inner block an "inner block function" -- a block is not
//   a function (that distinction is the spine of this episode).
// MODEL: prints 2. Resolution starts innermost (no p), climbs to the parent
//   block (p=2), resolves and stops -- first match wins, never reaches global.


// ---------------------------------------------------------------------------
// Q4 -- 9.5/10  (3 + 5 + 1.5)
// ---------------------------------------------------------------------------
//   let q = 5;
//   { q = 10; console.log(q); }
//   console.log(q);
//
// ANSWER: 10, 10. No new binding (no declaration); q got reassigned. Engine
//   climbs the chain to the outer q and reassigns it.
// LOST 0.5: said the value "changed in both block and global scope" -- implies
//   two bindings. There is ONE q (the outer), visible from two places.
// MODEL: both 10. `q = 10` is an assignment, not a declaration -> no new
//   binding. Resolved up the chain to the single outer q and reassigned to 10.


// ---------------------------------------------------------------------------
// Q5 -- 9.5/10  (3 + 4.5 + 2)
// ---------------------------------------------------------------------------
//   let r = 1;
//   { console.log(r); let r = 2; }
//
// ANSWER: ReferenceError, TDZ kind. Engine finds r in the block scope (it
//   exists) but it is not yet initialized -> TDZ. Not "not defined" because r
//   IS declared, just used before initialization.
// LOST 0.5: did not name WHY the block already has its own r -- `let r = 2` is
//   HOISTED to the top of the block (uninitialized), which is what makes it
//   shadow the outer r from block entry, so the lookup stops locally.
// MODEL: throws ReferenceError (TDZ). `let r = 2` is hoisted to the top of the
//   block, uninitialized; lookup finds the block's r and stops, never reaching
//   the outer r=1; reading it in the TDZ throws.


// ---------------------------------------------------------------------------
// Q6 -- 6.5/10  (3 + 3 + 0.5)   <-- half-answer
// ---------------------------------------------------------------------------
//   const s = 1;
//   { const s = 2; console.log(s); }
//   console.log(s);
//
// ANSWER: 2, 1. Explained shadowing (inner const block-scoped, doesn't touch
//   outer) -- but did NOT answer the asked question: WHY is it legal despite
//   const's no-redeclare / no-reassign rules?
// THE GAP: const's "no redeclare" is per SAME scope -- these are different
//   scopes. const's "no reassign" needs `s = 2` (an assignment) -- this is a
//   fresh declaration. So it is a brand-new binding in a new scope: neither
//   rule fires. It simply shadows.
// MODEL: 2, 1. Legal because the inner `const s = 2` is a new binding in a
//   different scope -- not a same-scope redeclaration, not a reassignment.
//   Inside, s -> inner const (2); after the block, s -> untouched outer const (1).


// ---------------------------------------------------------------------------
// Q7 -- 9/10  (3 + 4.5 + 1.5)
// ---------------------------------------------------------------------------
//   var v = 1;
//   { var v = 2; console.log(v); }
//   console.log(v);
//
// ANSWER: 2, 2. No new binding, not shadowing; both v are the same binding in
//   the same scope; the second var declaration is ignored, just reassigned.
//   Correctly added "var's boundaries are affected by function scope not block".
// LOST 1.5: still LED with "var is a global scope binding" -- in tension with
//   the correct function-scope clause that followed. Lead with the right
//   framing: var is function-scoped, global only as a special case.
// MODEL: both 2. var ignores the block, so the inner `var v = 2` is the SAME
//   binding as the outer; the declaration is ignored, `= 2` reassigns the one
//   binding. Not shadowing -- shadowing needs two separate bindings.


// ---------------------------------------------------------------------------
// Q8 -- 6/10  (3 + 2.5 + 0.5)   <-- explained the wrong "why"
// ---------------------------------------------------------------------------
//   let w = 1;
//   { var w = 2; }
//   console.log(w);
//
// ANSWER: SyntaxError, parse-time, console.log won't run -- BUT explained why
//   there is an ERROR (let/var collision), not why NOTHING EXECUTES.
// THE GAP: "there's a conflict so it won't run" is too coarse -- a RUNTIME
//   error would still let earlier lines run. The real reason nothing executes:
//   a SyntaxError is caught at PARSE-TIME, before execution begins, so the
//   whole script is rejected and no line runs.
// MODEL: (a) throws (b) SyntaxError, parse-time (c) no. `var w` leaks out of
//   the block into the global scope where `let w` lives -> two declarations in
//   one scope -> SyntaxError, caught at parse-time -> entire script rejected
//   before execution -> console.log never runs. (Runtime errors run earlier
//   lines first; this is not one.)


// ---------------------------------------------------------------------------
// Q9 -- 9/10  (3 + 5 + 1)
// ---------------------------------------------------------------------------
//   function f() { { var y = 5; } console.log(y); }
//   f();
//
// ANSWER: 5. var ignores the block; its boundary is set by function scope; y is
//   reachable in the whole f function but not outside it. (Mechanism correct.)
// LOST 1: still wrote "var is a global binding" -- a self-contradiction, since
//   "not reachable outside f" means it is NOT global. Retire the phrase.
// MODEL: prints 5. var ignores the block; its scope is the nearest function, f.
//   y lives in f's function scope -- reachable throughout f, not outside it.
//   Not global: there is an enclosing function, so var stops at f.


// ---------------------------------------------------------------------------
// Q10 -- 10/10  (3 + 5 + 2)   <-- clean
// ---------------------------------------------------------------------------
//   var k = 1;
//   { let k = 2; console.log(k); }
//   console.log(k);
//
// ANSWER: 2, 1. Legal shadowing -- let is block-scoped, different scope from
//   the global var k, no collision, no redeclaration. Correct illegal contrast:
//   swap them and "var is a functional scope" leaks into let's scope ->
//   SyntaxError. (Note: used "function-scoped" -- the bad phrase was gone.)
// MODEL: 2, 1. let k is block-scoped, confined to the block, never collides
//   with the global var k -> legal. Opposite arrangement: var leaks into the
//   outer let's scope -> two declarations in one scope -> SyntaxError, parse-time.
//   Asymmetry is pure containment: let stays in the block, var escapes it.


// ---------------------------------------------------------------------------
// Q11 -- 9.5/10  (3 + 5 + 1.5)
// ---------------------------------------------------------------------------
//   { console.log(z); var z = 5; }
//
// ANSWER: undefined. var hoisted as the undefined placeholder in the
//   memory-allocating phase; early read returns undefined. With let it would
//   throw because let is hoisted uninitialized in the TDZ. (Both correct, and
//   correctly said "memory phase", not "parsing".)
// LOST 0.5: said let "would throw an error" without naming the class -- it is a
//   ReferenceError (TDZ flavor).
// MODEL: prints undefined. var is hoisted AND set to undefined in the
//   memory-creation phase (and hoists to global, ignoring the block); the early
//   read returns undefined. With let: hoisted uninitialized, block-scoped, in
//   the block's TDZ -> reading it first throws ReferenceError (TDZ).


// ---------------------------------------------------------------------------
// Q12 -- 9.5/10  (3 + 4.5 + 2)   <-- capstone
// ---------------------------------------------------------------------------
//   let val = 1;
//   function outer() {
//     let val = 2;
//     { let val = 3; console.log(val); }
//     console.log(val);
//   }
//   outer();
//   console.log(val);
//
// ANSWER: 3, 2, 1. Three separate val bindings (script=1, outer fn=2, block=3);
//   traced execution order; each log -> its own scope's val. (Clear step format.)
// LOST 0.5: reported the OUTCOME per scope without stating the LOOKUP -- for
//   each log, resolution starts in the current scope, finds a local val, and
//   HALTS without climbing (that is "why it stops there").
// MODEL: 3, 2, 1. Three separate val bindings, one per scope. Each log resolves
//   to the nearest val in the current scope and stops because that scope owns
//   one -- inner shadows outer all the way down the chain.


// ---------------------------------------------------------------------------
// PATTERNS TO CARRY INTO EP 10
// ---------------------------------------------------------------------------
// WINS:
//   - Scope-chain resolution: mastered (Q3, Q5, Q12).
//   - var-vs-let placeholder (the old Ep 8 weak spot): solid now (Q11).
//   - Legal/illegal shadowing asymmetry: clean (Q10).
//   - Self-corrected the "var is global" misconception MID-QUIZ (Q2 -> Q10).
//
// WATCH:
//   - HALF-ANSWERS: answer the EXACT sub-part asked, not a neighbor of it
//     (Q6 = why-legal; Q8 = why-no-execution).
//   - NAME THE ERROR CLASS, even on contrasts (Q11 let case).
//   - PARSE-TIME => nothing runs; RUNTIME => earlier lines run first. Do not
//     collapse "there's an error" into "nothing executes" (Q8).
//   - PROSE: run-ons crept back in the back half; proofread.