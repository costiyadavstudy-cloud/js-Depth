/* =============================================================================
   EP 7 — THE SCOPE CHAIN, SCOPE & LEXICAL ENVIRONMENT   (v2 — EDITED)
   Namaste JavaScript (Akshay Saini)  |  Day 5 clean reference
   v2 adds concepts surfaced by the full 12-question bank (Q8-Q12):
     - #7 extended: function names obey scope too (Q9)
     - #11 new: fresh environment per call, no persistence across calls (Q8)
     - #12 new: hoisting x shadowing (Q10)
     - #13 new: a failed lookup aborts only its own STATEMENT (Q12)
   =============================================================================
   HOW TO READ THIS FILE:
   Concepts first (the model), then the corrections from the quiz, then a
   question -> concept map. Every claim is the *mechanism*, not the label.
============================================================================= */


/* 1. SCOPE
   Scope = WHERE in the code a variable/function is accessible. Fixed by where
   things are written (lexically), not by where they are called. (See #3, #8.)
*/

/* 2. LEXICAL ENVIRONMENT  (two parts)
   (a) the LOCAL MEMORY of the execution context (its own variables/functions),
   (b) a REFERENCE to the lexical environment of its PARENT.
   A fresh lexical environment is created EVERY time an execution context is
   created -> every function call gets its own (see #11).
*/

/* 3. WHAT "LEXICAL" MEANS
   "Lexical" = the PHYSICAL PLACEMENT of code in the source text. A function's
   lexical parent is the scope it is WRITTEN inside, NOT where it is invoked.
   The single most important idea in the episode.
*/

/* 4. SCOPE CHAIN
   The chain formed by the parent references in #2. Lookup traverses it:
        current env -> parent -> parent's parent -> ... -> global -> null
*/

/* 5. LOOKUP MECHANISM  (how a name is resolved)
   - Look in the CURRENT env's local memory.
   - Not found -> follow the reference to the PARENT's lexical environment.
   - Repeat until found, or until global's parent (null) is reached.

   FOUR precise points (each was a correction in the quiz):
   (i)   FIRST MATCH WINS. Stops at the first env that has the name -> shadowing.
   (ii)  HOP IS ENVIRONMENT-TO-ENVIRONMENT, each step owned by the CURRENT env,
         using ITS OWN parent reference. Not one function reaching across levels.
         After env X fails, it is X that consults X's parent.
   (iii) IT IS A LOOKUP/READ PATH, NOT A VALUE RELAY. No parent grabs a value and
         passes it down. The engine reads the value DIRECTLY from the env where
         the name is found, on behalf of the code that needs it.
   (iv)  A function is NEVER its own parent. inner -> outer -> global.
*/

/* 6. CHAIN TERMINATION & LINK TO "NOT DEFINED" (Ep 6)
   The GLOBAL lexical environment's parent reference is null; the chain ends.
   Name not found by global -> search runs off into null -> ReferenceError:
   <name> is not defined.
   => "not defined" = a FAILED LOOKUP that ran off the end of the scope chain.
   Render the error type EXACTLY: `ReferenceError` (one capitalized identifier).
*/

/* 7. DIRECTIONALITY  (one-way access)  [EXTENDED in v2]
   Inner functions CAN read ancestor variables via the chain. Outer scopes
   CANNOT see an inner scope's variables. Access is inward-out only.

       function a() { var x = 5; function b() { console.log(x); } b(); } // 5
       a();
       console.log(x); // ReferenceError: x is not defined

   [v2] This applies to FUNCTION NAMES too, not just variables. A function
   declared inside another exists only in that parent's environment and is NOT
   callable from outside it:

       function outer() { function inner() { console.log("hi"); } }
       outer();
       inner(); // ReferenceError: inner is not defined
*/

/* 8. SIBLINGS  (the lexical-vs-call-site trap)
   Two functions defined at the same level are siblings; neither is in the
   other's chain. A function's chain links to its PARENT, never a sibling, even
   if a sibling is called from inside the other.

       var x = 10;
       function a() { console.log(x); }   // a's parent is global
       function b() { var x = 50; a(); }  // a is CALLED here, but...
       b();                               // prints 10, not 50
*/

/* 9. SHADOWING
   Same name at multiple levels -> lookup finds the NEAREST and stops; the outer
   same-name variable is shadowed.

       var x = 100;
       function f() { var x = 1; function g() { console.log(x); } g(); }
       f(); // 1 — nearest x wins; global x = 100 never reached
*/

/* 10. ASSIGNMENT vs DECLARATION inside the chain
   `x = 20`  (NO var) -> NOT a declaration. The name resolves UP THE CHAIN to an
                         EXISTING binding and mutates it. Outer variable changes.
   `var x = 20`       -> IS a declaration. Creates a NEW binding in the CURRENT
                         env, SHADOWING any outer same-name var. Outer untouched.

       function outer() {
         var x = 10;
         function inner() { x = 20; console.log(x); } // no var -> mutates outer x
         inner();         // 20
         console.log(x);  // 20
       }
       // with `var x = 20;` in inner -> inner logs 20, outer logs 10
*/

/* 11. FRESH ENVIRONMENT PER CALL — NO PERSISTENCE  [NEW in v2]   (from Q8)
   Each invocation creates a NEW execution context with its OWN fresh lexical
   environment. A function's locals are re-created from scratch on every call;
   values do NOT carry over between separate invocations.

       function counter() { var count = 0; count = count + 1; console.log(count); }
       counter(); // 1
       counter(); // 1  (NOT 2 — count is re-initialized to 0 each call)

   (Making state survive across calls is what closures do — Ep 10, later.)
*/

/* 12. HOISTING x SHADOWING  [NEW in v2]   (from Q10)
   If a function declares its own `var x`, that local x is HOISTED and therefore
   SHADOWS any outer same-name variable for the ENTIRE function body — including
   lines that run BEFORE the declaration. A pre-declaration read sees the local
   (still `undefined`), not the outer value.

       var x = 1;
       function a() {
         console.log(x);  // undefined  (local x hoisted; not yet assigned) NOT 1
         var x = 2;
         console.log(x);  // 2
         x = 3;           // mutates the LOCAL x
       }
       a();
       console.log(x);    // 1  (global x never touched)
*/

/* 13. A FAILED LOOKUP ABORTS ONLY ITS OWN STATEMENT  [NEW in v2]   (from Q12)
   A ReferenceError aborts the STATEMENT it occurs in. Separate statements that
   ran earlier have already executed (and printed). Contrast:

   - Three SEPARATE statements: earlier ones print, the offending one throws.
       console.log(a); console.log(b); console.log(c); // a, b print; c throws

   - Three names as arguments to ONE call: all arguments are evaluated before the
     call, so one bad name aborts the WHOLE call and NOTHING prints.
       console.log(a, b, c); // c undeclared -> nothing prints, throws
*/


/* =============================================================================
   MISCONCEPTIONS CAUGHT THIS SESSION  (watch list)
   =============================================================================
   - Naming the concept ("because of scope chain") is NOT describing the
     mechanism. "How" wants the motion, not the noun.
   - "global object" (window) != "global scope / global lexical environment".
   - The hop is env-to-env, owned by the current env; a function is not its own
     parent; inner does not reach across to global.
   - The chain is a LOOKUP path, not a value RELAY.
   - `var` = new local binding (shadow); no-`var` = reassign existing up-chain.
   - ReferenceError is caused by an UNDECLARED name (existence), not by a
     variable "having no value." A declared-but-unassigned var returns undefined.
   - Render error types exactly: `ReferenceError`.
   - Prose precision (no dropped prefixes, no run-ons, no typos) is the last 10%.
   - [v2] Half-answers: don't drop the explicitly-requested "why" sub-part.
============================================================================= */


/* =============================================================================
   QUESTION -> CONCEPT MAP  (full 12-question bank)
   =============================================================================
   Q1  -> directionality (#7) + failed lookup / ReferenceError (#6)
   Q2  -> shadowing & first-match-wins (#5i, #9)
   Q3  -> lexical-vs-call-site, siblings (#3, #8)
   Q4  -> multi-level failed lookup, termination at null (#5ii, #6)
   Q5  -> assignment vs declaration in the chain (#10)
   Q6  -> multi-level trace through an empty intermediate level (#5) +
          lookup-not-relay (#5iii)
   Q7  -> definition of lexical environment (#2) + meaning of "lexical" (#3)
   Q8  -> fresh environment per call, no persistence (#11)
   Q9  -> scope applies to function names too (#7 extended)
   Q10 -> hoisting x shadowing (#12)
   Q11 -> chain termination at null; "not defined" as failed lookup (#6)
   Q12 -> capstone: shadowing + local lookup + failed lookup; statement-level
          abort granularity (#9, #5, #13)
============================================================================= */

/* =============================================================================
   EP 7 — FULL QUIZ BANK (all 12) WITH WORKED ANSWERS
   The Scope Chain, Scope & Lexical Environment
   -----------------------------------------------------------------------------
   Q1–Q6: asked this session (your answers + scores are in day5_questions_log.js)
   Q7    : posed, not answered
   Q8–Q12: pre-written bank, not delivered — completed here for study
   Each entry: CODE -> ASKED -> OUTPUT/ANSWER (with the mechanism, not just the
   result).
============================================================================= */


/* --- Q1 ----------------------------------------------------------------------
   CODE:
     function a() { var x = 5; function b() { console.log(x); } b(); }
     a();
     console.log(x);
   ASKED: (a) the log inside b?   (b) the final log?
   OUTPUT/ANSWER:
     (a) 5  — b has no local x; lookup climbs to a's env and finds x = 5.
     (b) ReferenceError: x is not defined — x lives inside a; global has no x.
--------------------------------------------------------------------------- */

/* --- Q2 ----------------------------------------------------------------------
   CODE:
     var x = 100;
     function f() { var x = 1; function g() { console.log(x); } g(); }
     f();
   ASKED: (a) output?   (b) why that x and not the other? name the mechanism.
   OUTPUT/ANSWER:
     (a) 1
     (b) Scope chain, first-match-wins: g has no x; the nearest enclosing env
         with x is f (x = 1), so the lookup stops there. global x = 100 is
         shadowed and never reached.
--------------------------------------------------------------------------- */

/* --- Q3 ----------------------------------------------------------------------
   CODE:
     var x = 10;
     function a() { console.log(x); }
     function b() { var x = 50; a(); }
     b();
   ASKED: (a) output?   (b) why, given a() is called inside b?
   OUTPUT/ANSWER:
     (a) 10
     (b) Lexical (not call-site) scope: a and b are siblings. a's chain links to
         its parent — the global SCOPE where a is DEFINED — not to b where a is
         CALLED. So a reads global x = 10; b's x = 50 is irrelevant.
--------------------------------------------------------------------------- */

/* --- Q4 ----------------------------------------------------------------------
   CODE: (y is never declared anywhere)
     function outer() { function inner() { console.log(y); } inner(); }
     outer();
   ASKED: (a) what happens?   (b) trace the chain; name each level; where/why end?
   OUTPUT/ANSWER:
     (a) ReferenceError: y is not defined.
     (b) Chain: inner (no y) -> inner's parent outer (no y) -> outer's parent
         global (no y) -> global's parent reference is null. The search runs off
         the end of the chain into null and throws. Each hop is owned by the
         current env (env-to-env), not one function reaching across levels.
--------------------------------------------------------------------------- */

/* --- Q5 ----------------------------------------------------------------------
   CODE:
     function outer() {
       var x = 10;
       function inner() { x = 20; console.log(x); }  // no var
       inner();
       console.log(x);
     }
     outer();
   ASKED: (a) two outputs in order?  (b) why outer's x changes?
          (c) how/why both change if inner used `var x = 20;`?
   OUTPUT/ANSWER:
     (a) 20, 20
     (b) `x = 20` (no var) is NOT a declaration; the name resolves up the chain
         to outer's existing binding and mutates THAT binding -> both see 20.
     (c) With `var x = 20`: outputs become 20, 10. `var` DECLARES a new local x
         in inner, shadowing outer's. inner logs its own local 20; outer's
         separate x is never touched, so it stays 10.
--------------------------------------------------------------------------- */

/* --- Q6 ----------------------------------------------------------------------
   CODE:
     var n = 1;
     function a() {
       var n = 2;
       function b() { function c() { console.log(n); } c(); }
       b();
     }
     a();
   ASKED: (a) output?   (b) trace from c; name each level; note empty levels.
   OUTPUT/ANSWER:
     (a) 2
     (b) Chain: c (no n) -> b (no n — empty link, traversed) -> a (n = 2, found,
         stop). The value is READ DIRECTLY from a's environment on c's behalf;
         the chain is a lookup path, not a relay — b does not carry the value.
--------------------------------------------------------------------------- */

/* --- Q7 --- (posed, unanswered) ----------------------------------------------
   ASKED: (a) one precise sentence: define a lexical environment — its two parts?
          (b) one sentence: what does "lexical" refer to / what determines a
              function's lexical parent?
   ANSWER:
     (a) The local memory of an execution context PLUS a reference to the lexical
         environment of its parent.
     (b) "Lexical" = the physical placement of code in the source. A function's
         lexical parent is the scope it is WRITTEN inside (nested in), not the
         scope it is called from.
--------------------------------------------------------------------------- */

/* --- Q8 --- (new) ------------------------------------------------------------
   CODE:
     function counter() {
       var count = 0;
       count = count + 1;
       console.log(count);
     }
     counter();
     counter();
   ASKED: (a) what does this print, both calls?
          (b) why does the second call NOT print 2?
   OUTPUT/ANSWER:
     (a) 1, then 1.
     (b) Each call creates a NEW execution context with a FRESH lexical
         environment, so `count` is re-created and re-initialized to 0 every
         time. Locals do not persist between separate invocations.
         (Making state survive across calls is what closures do — Ep 10, later.)
--------------------------------------------------------------------------- */

/* --- Q9 --- (new) ------------------------------------------------------------
   CODE:
     function outer() {
       function inner() { console.log("hi"); }
     }
     outer();
     inner();
   ASKED: (a) what happens (both lines)?
          (b) why?
   OUTPUT/ANSWER:
     (a) outer() runs and prints nothing (inner is defined but never called
         inside outer). Then inner() throws: ReferenceError: inner is not defined.
     (b) Scope governs FUNCTION names too, not just variables. `inner` exists only
         in outer's lexical environment; it is not accessible from global. Access
         is one-way (inward-out): outer's internals are invisible outside outer.
--------------------------------------------------------------------------- */

/* --- Q10 --- (new) -----------------------------------------------------------
   CODE:
     var x = 1;
     function a() {
       console.log(x);   // (1)
       var x = 2;
       console.log(x);   // (2)
       x = 3;
     }
     a();
     console.log(x);     // (3)
   ASKED: (a) the three outputs in order?
          (b) why is output (1) not 1?
   OUTPUT/ANSWER:
     (a) undefined, 2, 1.
     (b) `var x` inside a is HOISTED, so a has its OWN local x (allocated
         undefined) from the very start of a's context. That local x SHADOWS the
         global x throughout the whole function — including line (1), which runs
         before the assignment. So (1) reads the local x while it is still
         undefined, not the global 1. `x = 3` then mutates the local x; global x
         stays 1, so (3) prints 1.
--------------------------------------------------------------------------- */

/* --- Q11 --- (new) -----------------------------------------------------------
   ASKED (conceptual):
     (a) one sentence: what does the global lexical environment's parent
         reference point to, and what does that imply for lookup?
     (b) one sentence: in scope-chain terms, what exactly IS
         "ReferenceError: x is not defined"?
   ANSWER:
     (a) null. The scope chain terminates at global; there is nowhere further to
         search, so a name not found by then cannot be found at all.
     (b) It is a lookup for `x` that traversed the entire chain (current -> ... ->
         global) without finding the name and ran off the end into null. "not
         defined" = a name that exists in NO environment along the chain.
--------------------------------------------------------------------------- */

/* --- Q12 --- (new, capstone) -------------------------------------------------
   CODE: (c is never declared anywhere)
     var a = 1;
     function one() {
       var a = 2;
       function two() {
         var b = 3;
         console.log(a);   // (1)
         console.log(b);   // (2)
         console.log(c);   // (3)
       }
       two();
     }
     one();
   ASKED: (a) what does each console.log do, in order?
          (b) for each, which environment supplies the value — or why it fails?
   OUTPUT/ANSWER:
     (a) prints 2, then 3, then throws ReferenceError: c is not defined.
     (b) (1) a: two has no a -> one has a = 2 -> prints 2 (nearest a; global a = 1
             shadowed).
         (2) b: found in two's own local env -> prints 3.
         (3) c: two -> one -> global, none has c -> off into null -> ReferenceError.
     KEY CONTRAST: these are three SEPARATE statements, so (1) and (2) execute
     and print BEFORE (3) throws. (In Q-A4 the three names were arguments to ONE
     console.log call, so the whole call aborted and NOTHING printed.) A failed
     lookup aborts the STATEMENT it sits in — earlier separate statements have
     already run.
--------------------------------------------------------------------------- */