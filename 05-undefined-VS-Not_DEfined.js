/* =========================================================================
   EP 6 — FINAL NOTES + QUIZ LOG
   "undefined vs not defined in JS" | Namaste JavaScript (Akshay Saini)
   Vardhan | Month 1: JS Depth | 30 May 2026
   =========================================================================

   HOW TO USE THIS FILE:
     PART A  - the ONE main idea of the episode (read first)
     PART B  - full concept reference (the 13 concepts)
     PART C  - every question mapped to OUTPUT -> CONCEPT -> MAIN CONCEPT
     PART D  - your weak spot + precision pattern to fix
     PART E  - next steps
   ========================================================================= */


/* ═════════════════════════════════════════════════════════════════════════
   PART A — THE MAIN CONCEPT (the spine of Ep 6)
   ═════════════════════════════════════════════════════════════════════════

   A name that is DECLARED exists in memory and READS as a value — possibly
   the placeholder `undefined`.
   A name that was NEVER declared does not exist, so reading it THROWS a
   ReferenceError ("not defined").

   `undefined`  = a REAL VALUE the engine places during the creation phase,
                  meaning "declared but not yet assigned".
   `not defined`= an ERROR STATE (not a value): the lookup found nothing.

   The single pivot between them is: WAS THE NAME DECLARED?
   ═════════════════════════════════════════════════════════════════════════ */


/* ═════════════════════════════════════════════════════════════════════════
   PART B — CONCEPT REFERENCE (13)
   ═════════════════════════════════════════════════════════════════════════

   1.  `undefined` is a REAL VALUE (not "empty", not "nothing"): the engine's
       placeholder, written into a variable's slot during the CREATION phase,
       before any line runs. Means "declared but not yet assigned".

   2.  `not defined` is NOT a value. It is the state of a name never declared
       anywhere reachable. Accessing it -> ReferenceError.

   3.  THE PIVOT IS DECLARATION:
         declared       -> exists -> reading returns its value (maybe `undefined`)
         never declared -> no record -> reading throws (not defined)

   4.  `typeof undefined` -> the STRING "undefined". undefined has its OWN type;
       that is the proof it is a real value ("something"), not absence.

   5.  `var p;` (no initializer) is a RUNTIME NO-OP (declaration already handled
       in the creation phase; nothing to execute).
       `var p = 5;` is NOT a no-op: the INITIALIZER `= 5` runs at runtime.
       => the only difference is the initializer.

   6.  An UNCAUGHT ReferenceError HALTS execution. Lines after it do not run.

   7.  There is only ONE `undefined`. Engine-set or you-set, same value.

   8.  Manually assigning `x = undefined` is BAD PRACTICE: it destroys the
       "not yet assigned" signal. (For deliberate emptiness use `null` — set
       by YOU, never by the engine.)

   9.  A `var` declared INSIDE a function exists only in that function's
       context. Accessing it from outside -> not defined.

   10. VOCAB: the term is "ALLOCATED" (space reserved in the creation phase),
       NOT "stored". Then the placeholder `undefined` is placed in that slot.

   11. JS is LOOSELY (weakly) TYPED: a variable is not bound to a data type;
       the type rides on the VALUE, not the variable. One var can hold a
       number, then a string, then a boolean.

   12. DON'T CONFLATE THE THREE STATES:
         undefined   -> declared + allocated, not yet assigned  (a VALUE)
         not defined -> never declared                          (an ERROR)
         null        -> deliberate emptiness, set by you         (a VALUE)

   13. `typeof` IS SAFE ON UNDECLARED NAMES: most reads throw on a name that
       was never declared, but `typeof` returns the string "undefined" instead
       of throwing. Lets you check existence without crashing.
         console.log(b);        // ReferenceError: b is not defined
         console.log(typeof b); // "undefined"  (no throw)
   ═════════════════════════════════════════════════════════════════════════ */


/* ═════════════════════════════════════════════════════════════════════════
   PART C — QUESTION -> OUTPUT -> CONCEPT MAP
   (Formal Ep 6 quiz, 10/10. Scores: 9,10,8,9,8,9,9,6,8,9  ->  avg ~8.5/10)
   ═════════════════════════════════════════════════════════════════════════ */

/* Q1 ──────────────────────────────────────────────────────────
     var a;
     console.log(a);
   OUTPUT:        undefined
   CONCEPT(S):    #1
   MAIN CONCEPT:  a declared var holds the placeholder `undefined` until assigned.
   SCORE:         9/10
*/

/* Q2 ──────────────────────────────────────────────────────────
     console.log(b);
     var b = 5;
     console.log(b);
   OUTPUT:        undefined
                  5
   CONCEPT(S):    #1, #3  (+ hoisting)
   MAIN CONCEPT:  HOISTING — a var is allocated (as undefined) before execution,
                  so accessing it before its line gives `undefined`, not an error.
   SCORE:         10/10
*/

/* Q3 ──────────────────────────────────────────────────────────
     console.log("start");
     console.log(m);          // m never declared
     console.log("end");
   OUTPUT:        start
                  ReferenceError: m is not defined   (thrown at LINE 2)
                  // "end" does NOT print
   CONCEPT(S):    #2, #6
   MAIN CONCEPT:  an UNCAUGHT ReferenceError halts execution; later lines never run.
   SCORE:         8/10  (had written the error came from "line 3"; it is line 2)
*/

/* Q4 ──────────────────────────────────────────────────────────
     var c;
     console.log(c);
     c = 10;
     console.log(c);
     c = undefined;
     console.log(c);
   OUTPUT:        undefined
                  10
                  undefined
   CONCEPT(S):    #7, #8
   MAIN CONCEPT:  undefined is a single real value; do NOT assign it manually
                  (it is the engine's "not yet assigned" signal).
   SCORE:         9/10
*/

/* Q5 ──────────────────────────────────────────────────────────
     function test() {
       console.log(x);
       var x = 5;
       console.log(y);        // y never declared
     }
     test();
   OUTPUT:        undefined
                  ReferenceError: y is not defined
   CONCEPT(S):    #1, #2, #3
   MAIN CONCEPT:  declared -> exists -> reads `undefined`; never declared ->
                  no record -> error. (The pivot is declaration.)
   SCORE:         8/10  (said "stored"; the term is "allocated")
*/

/* Q6 ──────────────────────────────────────────────────────────
     console.log(typeof a);
     console.log(typeof b);   // b never declared
     var a = 10;
   OUTPUT:        undefined    // typeof a -> string "undefined"
                  undefined    // typeof b -> string "undefined", NO throw
   CONCEPT(S):    #4, #13
   MAIN CONCEPT:  `typeof` is the SAFE operator — returns "undefined" for a
                  name that does not exist instead of throwing.
   SCORE:         9/10
*/

/* Q7 ──────────────────────────────────────────────────────────
     var x;
     console.log(x);
     x = 5;
     x = "five";
     console.log(x);
   OUTPUT:        undefined
                  five
   CONCEPT(S):    #11
   MAIN CONCEPT:  JS is LOOSELY TYPED — a variable is not bound to a type; the
                  type rides on the value.
   SCORE:         9/10
*/

/* Q8 ─────────────────────────────────────────────── WEAK SPOT ──
     var a = 1;
     var b;
     console.log(a, b, c);    // c never declared
   OUTPUT:        ReferenceError: c is not defined
                  // NOTHING prints — not even "1 undefined"
   CONCEPT(S):    #2  (+ argument evaluation order)
   MAIN CONCEPT:  console.log evaluates ALL its arguments BEFORE the call; an
                  undeclared name throws DURING evaluation, so the call never
                  runs and nothing prints. (`b` being undefined is fine; only
                  the UNDECLARED `c` is the problem.)
   SCORE:         6/10  <-- REVISIT THIS ONE
*/

/* Q9 ──────────────────────────────────────────────────────────
     function greet(name) {
       console.log("Hi " + name);
     }
     var msg = greet("Vardhan");
     console.log(msg);
   OUTPUT:        Hi Vardhan        // literal is "Hi " — note the SPACE
                  undefined
   CONCEPT(S):    default undefined return  (related to #1)
   MAIN CONCEPT:  a function with NO `return` returns `undefined` by default;
                  logging != returning.
   SCORE:         8/10  (dropped the space -> wrote "HiVardhan")
*/

/* Q10 ─────────────────────────────────────────────── CAPSTONE ──
     var x = 10;
     console.log(x);
     console.log(y);
     var y;
     console.log(z);          // z never declared
   OUTPUT:        10
                  undefined
                  ReferenceError: z is not defined
   CONCEPT(S):    #1, #2, #3, #6  (synthesis)
   MAIN CONCEPT:  THE THREE STATES at once —
                    x = has a value (declared + assigned before the log)
                    y = undefined  (declared/hoisted, never assigned)
                    z = not defined (never declared -> error -> halt)
   SCORE:         9/10  (spelling slips)
*/

/* ─── DIAGNOSTICS (informal, before the fixed quiz) ───────────────
   D1:  console.log(a); var a=5; console.log(a); console.log(b);
        -> undefined, 5, ReferenceError (b not defined)        [#1,#2,#6]
        Also surfaced: undefined is NOT "empty"; typeof undefined -> "undefined".
   D2:  console.log(p); var p; console.log(p); p=7; console.log(p);
        -> undefined, undefined, 7                              [#1,#5]
        Key: `var p;` is a runtime no-op; `var p = 5;` is not (the initializer runs).
   D3:  function calc(){ var total; console.log(total); console.log(count); } calc();
        -> undefined, ReferenceError (count not defined)        [#1,#2,#9]
        Key: "not defined" = a FAILED LOOKUP, not merely "no declaration".
   ───────────────────────────────────────────────────────────────── */


/* ═════════════════════════════════════════════════════════════════════════
   PART D — WEAK SPOT + PRECISION PATTERN
   ═════════════════════════════════════════════════════════════════════════

   WEAK SPOT (one concept to firm up):
     Q8 — WHY nothing prints when one argument is undeclared. Mechanism:
     arguments are evaluated BEFORE the call; an undeclared name throws during
     evaluation and aborts the whole line.

   PRECISION PATTERN (not concepts — carefulness):
     - dropped a space          ("HiVardhan" vs "Hi Vardhan")
     - "stored" vs "allocated"  (regressed after using it correctly)
     - self-contradiction       (Q3: "line 3" vs "line 2")
     - spelling/grammar slips   ("loggin", "loosly", "didn't assigned")
   Understanding is AHEAD of carefulness. In code, carelessness reads identically
   to not-knowing — the bug ships either way. Proofread before you submit.
   ═════════════════════════════════════════════════════════════════════════ */


/* ═════════════════════════════════════════════════════════════════════════
   PART E — NEXT STEPS
   ═════════════════════════════════════════════════════════════════════════
   1. WATCH Ep 6 once at 1x (this quiz was all PRE-WATCH). Watch for HOW Akshay
      describes the engine deciding a name is "not defined" (the failed lookup).
   2. Re-derive Q8 cold to confirm the argument-evaluation mechanism stuck.
   3. Day 5 = full graded Ep 6 cycle, starting on the "not defined" side.
   ═════════════════════════════════════════════════════════════════════════ */