/******************************************************************************
 *  NAMASTE JAVASCRIPT — DEEP NOTES
 *  HIGHER-ORDER FUNCTIONS & FUNCTIONAL ARRAY METHODS   [Ep 18 + 19/20/21]
 *
 *  Same rules as your other notes:
 *  - Every claim has a WHY.
 *  - Trace exercises are embedded. Do them on PAPER before reading answers.
 *  - When confused, STOP and re-derive. Scrolling past confusion = 0 learning.
 *
 *  Companion file: hof_quiz_questions.md  (the 9 graded questions + answers)
 ******************************************************************************/


/******************************************************************************
 * SECTION 0 — THE SENTENCES THAT RULE THESE NOTES
 ******************************************************************************/

// 1. "A higher-order function is the RECEIVER or RETURNER of a function.
//     The function passed IN is the CALLBACK. Never confuse the two."
//        -> This exact confusion cost me points twice (Q1B, Q9). Burn it in.
//
// 2. "Each array method does ONE blind job with whatever the callback
//     returns: filter reads it as a TRUE/FALSE test; map stores it as
//     DATA; reduce folds it into an accumulator."
//        -> The callback does not know or care which method called it.


/******************************************************************************
 * SECTION 1 — FIRST-CLASS FUNCTIONS (the foundation HOFs are built on)
 ******************************************************************************/

// In JS, functions are FIRST-CLASS CITIZENS (a.k.a. first-class functions /
// first-class values). This means a function is treated like any other VALUE:
//   - assign it to a variable          const f = function () {};
//   - pass it as an argument           doSomething(f);
//   - return it from another function   function g() { return function(){}; }
//   - store it in arrays/objects        const arr = [f]; const o = { f };
//
// CAUSAL DIRECTION (precision — I slipped on this in Q1):
//   FIRST-CLASS FUNCTIONS = the LANGUAGE FEATURE (functions are values).
//   HIGHER-ORDER FUNCTIONS = what that feature LETS YOU BUILD.
//   Foundation vs construction. They are NOT the same thing.
//   Without first-class functions, HOFs would be impossible.


/******************************************************************************
 * SECTION 2 — WHAT MAKES A FUNCTION "HIGHER-ORDER"  (the definition)
 ******************************************************************************/

// DEFINITION (read it like a contract — there are TWO qualifying conditions):
//
//   A function is a HIGHER-ORDER FUNCTION if it does AT LEAST ONE of:
//     (a) takes a function as an argument,   OR
//     (b) returns a function.
//
//   The "OR" is load-bearing. EITHER ALONE qualifies. A definition that says
//   "takes AND returns" is WRONG.

// --- Condition (a): takes a function ---
function greet() { console.log("good morning"); }   // note: STRING is quoted!
function greeting(x) { x(); }                        // HOF: receives a function
greeting(greet);   // pass greet ITSELF — no parentheses.
// CRITICAL: greeting(greet)  passes the function value.
//           greeting(greet()) would pass greet's RETURN value (undefined here)
//           and call greet immediately — a classic bug.

// --- Condition (b): returns a function ---
function outer() {
  return function inner() { return 42; };           // HOF: returns a function
}

// --- ROLE SEPARATION in  x.y(z)  (the trap from Q1B) ---
//   const nums = [1,2,3];
//   nums.map(x => x * 2);
//        ^      ^      ^
//      object  HOF   callback
//   - nums  is the DATA (an array — it is NOT a function, cannot be a HOF)
//   - map   is the HIGHER-ORDER FUNCTION (it takes a function)
//   - x=>x*2 is the CALLBACK (the function passed in)
//   The HOF is ALWAYS the function, NEVER the data it operates on.


/******************************************************************************
 * SECTION 3 — WHY HOFs EXIST: THE DRY PRINCIPLE
 ******************************************************************************/

// DRY = "Don't Repeat Yourself." HOFs are the tool that lets you obey it
// when the only thing varying between two functions is a small piece of logic.

// THE PROBLEM (two functions, near-identical):
const radii = [3, 1, 2];
function calculateArea_BAD(radii) {
  const output = [];
  for (let i = 0; i < radii.length; i++) output.push(Math.PI * radii[i] ** 2);
  return output;
}
function calculateCircumference_BAD(radii) {
  const output = [];
  for (let i = 0; i < radii.length; i++) output.push(2 * Math.PI * radii[i]);
  return output;
}
// WHAT IS REPEATED (the INVARIANT): const output=[], the for loop, the push,
//                                    the return. Identical scaffolding.
// WHAT DIFFERS  (the VARIANT):       ONLY the per-element formula.
//   -> Diagnose precisely: the varying part is "a transformation that takes
//      one radius and returns one number." That phrasing IS the solution
//      forming — it could be a function passed IN.

// THE FIX: extract the invariant into a HOF; pass the variant as a callback.
function area(r) { return Math.PI * r * r; }          // small logic function
function circumference(r) { return 2 * Math.PI * r; } // small logic function

function calculate(logic, radii) {        // <- the HOF
  const output = [];                       // <- NOTE: const, never bare `output=[]`
  for (let i = 0; i < radii.length; i++) {
    output.push(logic(radii[i]));          // apply the swappable behavior
  }
  return output;
}
calculate(area, radii);          // pass area as a VALUE (no parentheses)
calculate(circumference, radii);

// WHAT THE HOF BOUGHT YOU (state it on the CORRECT axis):
//   It separated the REUSABLE STRUCTURE (the loop) from the SWAPPABLE
//   BEHAVIOR (the formula), so a new operation = one tiny function, no
//   rewriting the loop. This is MAINTAINABILITY / REUSABILITY / DRY.
//
//   !!! MISCONCEPTION I MADE (Q2B) — kill it forever: !!!
//   HOFs are NOT about SPEED. The refactor does not make code faster — an
//   indirect call (logic(...)) is, if anything, a hair MORE work than an
//   inlined formula (Ep-16 notes: a call costs an execution context).
//   READABILITY/REUSABILITY  !=  PERFORMANCE.  Different axes. Judge a
//   design choice on the axis it actually affects.


/******************************************************************************
 * SECTION 4 — CLOSURES: how a returned function remembers (the deep one)
 ******************************************************************************/

// A CLOSURE = a function BUNDLED WITH ITS LEXICAL ENVIRONMENT (the variables
// in scope where the function was CREATED).

function multiplier(factor) {
  return function (x) { return x * factor; };  // inner fn closes over `factor`
}
const double = multiplier(2);   // a closure capturing factor = 2
const triple = multiplier(3);   // a SEPARATE closure capturing factor = 3
double(5);          // 10
triple(5);          // 15
double(triple(2));  // triple(2)=6, then double(6)=12

// THE MECHANISM — connect this to your Ep-16 GC notes (Section 7):
//   Normally, when multiplier(2) returns, its execution context is popped
//   and `factor` would become unreachable garbage. BUT the returned inner
//   function holds a REFERENCE to `factor` via the closure. By the
//   REACHABILITY rule (root -> double -> closure -> factor), `factor` stays
//   ALIVE. The garbage collector CANNOT reclaim it. The closure isn't magic;
//   it just keeps the variable reachable.
//
// PRECISION (Q3 slip): the closure is formed AUTOMATICALLY when the inner
// function is CREATED — it is the inner function TOGETHER WITH its captured
// scope, travelling as one unit. It isn't a separate object "returned".
// double and triple are TWO INDEPENDENT closures over SEPARATE `factor`
// values — that independence is WHY they don't interfere.

// --- CLOSURES CAPTURE REFERENCES, NOT SNAPSHOTS (the key to mutation) ---
function once(fn) {
  let called = false;     // lives in the closure, by REFERENCE
  let result;             // lives in the closure, by REFERENCE
  return function (...args) {
    if (!called) {        // condition EVALUATES to true/false; block runs or is skipped
      called = true;
      result = fn(...args);
    }
    return result;
  };
}
function add(a, b) { return a + b; }
const addOnce = once(add);
addOnce(2, 3);     // 5   -> if-block runs: called->true, result->5
addOnce(10, 20);   // 5   -> !called is false, block SKIPPED, stale result returned
addOnce(100, 200); // 5   -> same; new args never reach fn(...args)
//
// WHY this works: the closure retains LIVE REFERENCES to `called`/`result`,
// not frozen copies. So the inner function can MUTATE them and the change
// PERSISTS between calls. If closures captured copies, `once` would be
// impossible. (This is the Q4 insight — the deepest one in the quiz.)
//
// WHY calls 2 & 3 ignore new args: the ONLY line that uses the args is
// `result = fn(...args)`, and that line lives INSIDE the if-block, which is
// skipped once `called` is true. The args aren't "ignored by a rule" — the
// line that would use them simply never executes.
//
// PRECISION on control flow (Q4 slip): say "the condition evaluates to
// false, so the block is skipped" — NOT "called contradicts the if". In a
// bug hunt, "condition evaluated false" tells you where to look.


/******************************************************************************
 * SECTION 5 — ...args : THE REST / SPREAD OPERATOR
 ******************************************************************************/

// In a PARAMETER position, ...args is REST: COLLECT all remaining arguments
// into a real array named args.
function showAll(...args) { console.log(args); }
showAll(1, 2, 3);   // args === [1, 2, 3]

// In a CALL position, ...args is SPREAD: UNPACK an array back into separate
// arguments.
//   result = fn(...args);   // if args=[2,3], this calls fn(2, 3)
//
// WHY both appear in `once`: rest collects however many args the caller
// gave; spread forwards them to `fn` unchanged. This makes the wrapper
// GENERIC — it works for fn of ANY arity, instead of hardcoding (a, b).


/******************************************************************************
 * SECTION 6 — BUILT-IN HOFs: filter, map, reduce
 ******************************************************************************/

// Mental model to keep above all three:
//   filter -> callback returns a BOOLEAN (a test). Keeps passing elements.
//   map    -> callback returns a TRANSFORMED VALUE (data). Keeps all of them.
//   reduce -> callback folds each element into an ACCUMULATOR -> one value.
// The callback is dumb; the METHOD decides how to read its return value.

/* ---- 6a. filter -------------------------------------------------------- */
[1, 2, 3, 4, 5].filter(n => n % 2 === 0);   // [2, 4]
// MECHANISM: filter calls the callback on EACH element; the callback returns
// a BOOLEAN; filter KEEPS the element when the boolean is true, DISCARDS it
// when false. filter (not the callback) builds the new array.
//
// !!! Q5 MISCONCEPTION — the callback does NOT return "the value to keep",
// and the callback does NOT push. It returns a TEST RESULT. Proof:
[1, 2, 3, 4, 5].filter(n => n * 10);   // [1,2,3,4,5]  -- NOT [10,20,...]
// every n*10 is truthy -> every element kept, UNCHANGED. The return value
// was used as a truth test, never as data.

/* ---- 6b. map ----------------------------------------------------------- */
[1, 2, 3, 4].map(n => n * 2);   // [2, 4, 6, 8]
// MECHANISM: map calls the callback on EACH element; the callback returns a
// TRANSFORMED value; map collects ALL of them into a NEW array.
// Output length ALWAYS equals input length.
//
// !!! Q6 MISCONCEPTION — there is no such thing as a "non-real operation".
// A comparison is an operation; it EVALUATES TO a boolean, and map stores it:
[1, 2, 3, 4].map(n => n > 2);   // [false, false, true, true]
// map blindly collects whatever the callback returns — booleans included.
//
// The mirror pair to memorize:
//   filter(n => n * 10)  -> [1,2,3,4,5]          (number used as a TEST)
//   map(n => n > 2)      -> [false,false,true,true] (boolean used as DATA)

/* ---- 6c. reduce (the one that breaks people) --------------------------- */
[1, 2, 3, 4].reduce((acc, curr) => acc + curr, 0);   // 10
// MECHANISM:
//   acc  = the ACCUMULATOR — a running value CARRIED FORWARD across
//          iterations. Each iteration's RETURN becomes the next acc.
//   0    = the INITIAL VALUE of acc (the 2nd argument to reduce).
//   curr = the current element.
//
//   iteration | acc (before) | curr | returns (acc+curr) -> next acc
//       1      |      0       |  1   |        1
//       2      |      1       |  2   |        3
//       3      |      3       |  3   |        6
//       4      |      6       |  4   |       10  <- final result
//
// NO INITIAL VALUE — still works, with a DIFFERENT start:
[1, 2, 3, 4].reduce((acc, curr) => acc + curr);   // 10
//   acc starts as the FIRST element (1), curr starts as the SECOND (2).
//   This is reduce's default behavior.
//
// !!! THE REAL-WORLD TRAP (always pass an initial value): !!!
// [].reduce((a, c) => a + c);     // TypeError: Reduce of empty array with
//                                 // no initial value
// [].reduce((a, c) => a + c, 0);  // 0  -- safe.
// With no initial value, reduce grabs the first element as acc — an empty
// array has none -> it throws. PASS THE INITIAL VALUE unless you have a
// specific reason not to. (Common bug: reducing a list that filtered to [].)


/******************************************************************************
 * SECTION 7 — CHAINING (the pattern you'll use constantly in React)
 ******************************************************************************/

const people = [
  { name: "vardhan", age: 26 },
  { name: "akshay",  age: 30 },
  { name: "rahul",   age: 17 },
  { name: "priya",   age: 22 },
];
people.filter(u => u.age >= 18).map(u => u.name);   // ["vardhan","akshay","priya"]

// WHY CHAINING WORKS:
//   filter RETURNS A NEW ARRAY. Because the return value is itself an array,
//   every array method (including map) is immediately callable on it. So you
//   call map directly on filter's result without naming it. Methods run
//   LEFT TO RIGHT, each operating on the OUTPUT of the previous one,
//   SEQUENTIALLY (filter finishes fully, THEN map runs).
//   (Precision Q8: filter returns a NEW, SHORTER array of passing elements —
//    not a "copy".)

// !!! ORDER MATTERS — the silent-bug demo (Q8 iii): !!!
people.map(u => u.name).filter(u => u.age >= 18);   // []  <-- WRONG ORDER
// map first -> ["vardhan","akshay","rahul","priya"] (an array of STRINGS).
// filter then reads u.age on a STRING -> undefined. undefined >= 18 -> false.
// EVERY element fails -> []. NO error is thrown. This is a SILENT LOGIC BUG —
// code that runs fine but returns the wrong thing. Exactly the class of bug
// AI-generated code produces and you must catch.
//
// Precision: accessing a MISSING property -> undefined (no crash).
//            calling a METHOD on undefined (undefined.toString()) -> TypeError.
//            Know which is which.


/******************************************************************************
 * SECTION 8 — WRITING YOUR OWN HOF (proves you understand the machine)
 ******************************************************************************/

// Call `action` n times, passing the 0-based index each time.
function repeat(n, action) {
  for (let j = 0; j < n; j++) {
    action(j);
  }
}
repeat(3, i => console.log("Iteration:", i));   // 0, 1, 2
// WHY it's a HOF: it TAKES a function (action) as a parameter — condition (a).
// PRECISION (Q9 slip): repeat is the HOF (the RECEIVER); action is the
// CALLBACK (the RECEIVED). The received function is NOT the HOF.

// EXTENSION — collect each RETURN VALUE into an array (you just rebuilt map):
function repeatCollect(n, action) {
  const results = [];
  for (let j = 0; j < n; j++) {
    results.push(action(j));   // capture the RETURN VALUE of action, NOT j
  }
  return results;
}
repeatCollect(3, i => i * 10);   // [0, 10, 20]
// PRECISION (Q9 slip): the goal is the return value of action(j), not j.
// Pushing j would just rebuild [0,1,2] and ignore what action computed.
// This most resembles MAP — "call a function per item, collect what it
// returns" — except it iterates over a COUNT (0..n-1) instead of an
// existing array's elements.


/******************************************************************************
 * SECTION 9 — SELF-CHECK (closed book; say each mechanism aloud)
 ******************************************************************************/

// 1. HOF = takes a function OR returns a function (either alone qualifies).
//    The HOF is the RECEIVER/RETURNER; the CALLBACK is the passed function.
// 2. First-class functions (functions are values) is the FEATURE; HOFs are
//    what it lets you BUILD.
// 3. HOFs serve DRY: separate the invariant (structure) from the variant
//    (behavior passed as a callback). This is MAINTAINABILITY, not speed.
// 4. A closure = function + its lexical environment; it keeps captured
//    variables REACHABLE (so GC can't collect them) and captures them by
//    REFERENCE (so they can be mutated and persist between calls).
// 5. filter: callback returns a BOOLEAN test -> keep passing elements.
//    map:    callback returns a TRANSFORMED value -> keep all, same length.
//    reduce: callback folds into an ACCUMULATOR -> one value; pass an
//            initial value to stay safe on empty arrays.
// 6. Chaining works because each method returns an array; methods run
//    left-to-right on the previous output; ORDER matters (silent bugs).
// 7. Every expression evaluates to a VALUE; methods collect that value
//    blindly. Never classify operations as "real" vs "not real".
//
// Fail any item -> return to its section, re-derive, retry closed-book.

/******************************************************************************
 * END — pairs with hof_quiz_questions.md (the graded questions + answers).
 * Recurring weaknesses to drill: (1) HOF vs callback wording;
 * (2) "every expression evaluates to a value" (no 'non-real operations').
 ******************************************************************************/


/******************************************************************************
 *  HIGHER-ORDER FUNCTIONS QUIZ — QUESTIONS, CORRECT OUTPUTS & MECHANISMS
 *  Companion to hof_deep_notes.js
 *
 *  FINAL SCORE: 88/110 -> 80%   (up from 57% on the Ep-16 engine test)
 *  Q1 8 . Q1B 7 . Q2A 8.5 . Q2B 7.5 . Q3 9 . Q4 9 . Q5 6.5 . Q6 8 .
 *  Q7 9.5 . Q8 9 . Q9 8
 *
 *  HOW TO USE: read the question, COVER the answer, solve it, then check.
 *  The MECHANISM comments are the part that must live in your head.
 ******************************************************************************/


/******************************************************************************
 * Q1 — Define a higher-order function — (8/10)
 ******************************************************************************/
// CONCEPT: definition of a HOF; first-class functions.
//
// CORRECT ANSWER: a function is higher-order if it TAKES a function as an
//   argument OR RETURNS a function (either alone qualifies — the "OR" is
//   essential). Possible because functions are FIRST-CLASS CITIZENS (values).
//
// MECHANISM: first-class functions = the LANGUAGE FEATURE (functions are
//   values: assignable, passable, returnable). HOFs = what that feature lets
//   you BUILD. Foundation vs construction — not the same thing.
//
// WHERE YOU WENT WRONG: stated first-class citizens and HOFs almost as equals
//   — keep the causal direction sharp. Also console.log(good morning) had an
//   UNQUOTED string -> SyntaxError (parser can't build a valid AST from a bare
//   identifier with a space).


/******************************************************************************
 * Q1B — Classify four snippets — (7/10)
 ******************************************************************************/
function calculate_q1(fn, n) { return fn(n); }                          // (1)
function multiplier_q1(factor){ return function(x){ return x*factor; }; } // (2)
const nums_q1 = [1,2,3]; nums_q1.map(x => x*2);                         // (3)
function add_q1(a, b) { return a + b; }                                 // (4)
//
// CORRECT ANSWERS:
//   (1) HOF — takes a function (fn).
//   (2) HOF — returns a function (this is the CLOSURE case).
//   (3) the HOF is `map` (it takes a function). `nums` is an ARRAY, not a
//       function — it CANNOT be a HOF.
//   (4) not a HOF — takes numbers, returns a number.
//
// MECHANISM: in  x.y(z)  ->  x = object/data, y = method (the HOF if it
//   takes/returns a function), z = argument/callback. The HOF is always the
//   FUNCTION, never the data.
//
// WHERE YOU WENT WRONG: called `nums` (the ARRAY) the HOF in (3). The HOF is
//   `map`. Recurring HOF-vs-data confusion — repeated again in Q9.


/******************************************************************************
 * Q2A — DRY violation — (8.5/10)
 ******************************************************************************/
// Two near-identical functions (calculateArea, calculateCircumference) with
// the same loop scaffolding and only the per-element formula differing.
//
// CORRECT ANSWER: principle = DRY (Don't Repeat Yourself). Repeated (the
//   INVARIANT): const output=[], the for loop, the push, the return.
//   Different (the VARIANT): only the per-element formula.
//
// MECHANISM: separating invariant from variant makes the HOF refactor
//   inevitable — the variant becomes a callback you pass in.
//
// WHERE YOU WENT WRONG: "the logic differs" is loose — name the variant
//   concretely as "a per-element transformation that could be passed in".
//   Also the shared parameter isn't the problem; the duplicated BODY is.


/******************************************************************************
 * Q2B — Refactor into one HOF — (7.5/10)
 ******************************************************************************/
// CORRECT ANSWER:
function area_q2(r) { return Math.PI * r * r; }
function circumference_q2(r) { return 2 * Math.PI * r; }
function calculate_q2(logic, radii) {
  const output = [];                       // const — NOT bare `output = []`
  for (let i = 0; i < radii.length; i++) output.push(logic(radii[i]));
  return output;
}
// calculate_q2(area_q2, [3,1,2]);
//
// WHAT THE HOF BOUGHT YOU: separates the REUSABLE STRUCTURE (loop) from the
//   SWAPPABLE BEHAVIOR (formula) -> eliminates duplication. MAINTAINABILITY,
//   not speed.
//
// MECHANISM: `logic` is a callback applied per element; adding a new
//   operation = one tiny function, no loop rewrite.
//
// WHERE YOU WENT WRONG: claimed HOFs "optimize / speed up" the code — FALSE.
//   Readability/reusability != performance (an indirect call is, if anything,
//   slightly MORE work). Also `output = []` had no declaration keyword
//   (creates a global / throws in strict mode); and the logic param named
//   `radii` actually receives a single radius — name it `r`.


/******************************************************************************
 * Q3 — Closure via returned function — (9/10, joint-best mechanism)
 ******************************************************************************/
function multiplier_q3(factor){ return function(x){ return x*factor; }; }
const double_q3 = multiplier_q3(2);
const triple_q3 = multiplier_q3(3);
// double_q3(5)            -> 10
// triple_q3(5)            -> 15
// double_q3(triple_q3(2)) -> 12   (triple(2)=6, then double(6)=12)
//
// CONCEPT: closures.
//
// MECHANISM: a closure = function + its lexical environment. After
//   multiplier(2) returns and its EC pops, the returned function keeps a
//   REFERENCE to `factor`, so by REACHABILITY (Ep-16 GC notes) `factor` stays
//   alive and the GC can't collect it. double and triple are SEPARATE closures
//   over separate `factor` values — hence no interference.
//
// WHERE YOU WENT WRONG: minor wording — the closure is formed AUTOMATICALLY
//   when the inner function is CREATED (function + captured scope as one unit),
//   not a separate object "returned". Outstanding GC connection otherwise.


/******************************************************************************
 * Q4 — The `once` pattern — (9/10)
 ******************************************************************************/
function once_q4(fn) {
  let called = false, result;
  return function (...args) {
    if (!called) { called = true; result = fn(...args); }
    return result;
  };
}
const addOnce_q4 = once_q4((a, b) => a + b);
// addOnce_q4(2, 3)     -> 5
// addOnce_q4(10, 20)   -> 5
// addOnce_q4(100, 200) -> 5
//
// CONCEPT: closures capturing variables BY REFERENCE (persistent, mutable
//   private state).
//
// MECHANISM: called/result live in the closure. The closure holds LIVE
//   REFERENCES (not frozen copies), so the inner function mutates them and the
//   change PERSISTS between calls. Calls 2 & 3 return stale 5 because the only
//   line using the args — `result = fn(...args)` — is inside the if-block,
//   which is SKIPPED once called is true (`!called` evaluates to false).
//
// WHERE YOU WENT WRONG: only wording — said true `called` "contradicts" the if.
//   Say "the condition evaluates to false, so the block is skipped." Control
//   flow vocabulary, not understanding.


/******************************************************************************
 * Q5 — `filter` mechanics — (6.5/10)
 ******************************************************************************/
const nums_q5 = [1,2,3,4,5];
const result_q5 = nums_q5.filter(n => n % 2 === 0);
// result_q5 -> [2, 4]
// nums_q5   -> [1, 2, 3, 4, 5]   (unchanged)
//
// CONCEPT: filter; non-mutating methods.
//
// MECHANISM: the callback returns a BOOLEAN (a test). filter KEEPS the element
//   when true, DISCARDS when false. filter ITSELF builds the new array — the
//   callback does not push, and does not return "the value to keep". filter is
//   NON-MUTATING (returns a new array; originals untouched).
//
// PROOF YOUR MODEL WAS WRONG:
//   [1,2,3,4,5].filter(n => n*10)  ->  [1,2,3,4,5]
//   every n*10 is truthy -> all kept, UNCHANGED. The return value is a TEST,
//   not data.
//
// WHERE YOU WENT WRONG: said the callback "returns the value that satisfies"
//   and "pushes" it. Both false — it returns a boolean; the METHOD does the
//   keeping.


/******************************************************************************
 * Q6 — `map` vs `filter` — (8/10)
 ******************************************************************************/
const nums_q6 = [1,2,3,4];
// nums_q6.map(n => n * 2)     -> [2, 4, 6, 8]
// nums_q6.filter(n => n > 2)  -> [3, 4]
//
// CONCEPT: the map/filter contrast.
//
// MECHANISM: map's callback returns a TRANSFORMED value; output length =
//   input length. filter's callback returns a BOOLEAN; output length <= input.
//   map does NOT mutate — use the word "transformed", not "mutated".
//
// THE (iii) TRAP:
//   [1,2,3,4].map(n => n > 2)  ->  [false, false, true, true]   (NOT "no change")
//   A comparison IS an operation; it evaluates to a boolean, and map stores
//   that boolean as data.
//
// WHERE YOU WENT WRONG: predicted "no change" — assumed a comparison "isn't a
//   real operation". Every expression evaluates to a value; map collects it.


/******************************************************************************
 * Q7 — `reduce` — (9.5/10, highest)
 ******************************************************************************/
const nums_q7 = [1,2,3,4];
const total_q7 = nums_q7.reduce((acc, curr) => acc + curr, 0);
// total_q7 -> 10
//
// CONCEPT: reduce, accumulator, initial value.
//
// MECHANISM (trace):
//   iteration | acc (before) | curr | returns (acc+curr) -> next acc
//       1      |      0       |  1   |        1
//       2      |      1       |  2   |        3
//       3      |      3       |  3   |        6
//       4      |      6       |  4   |       10   <- final result
//   acc = accumulator carried forward (each iteration's return becomes the
//   next acc). The 0 = initial value. NO initial value -> acc starts as the
//   FIRST element, curr as the SECOND.
//
// THE REAL-WORLD RULE (extension to add):
//   [].reduce((a,c) => a+c)     -> TypeError: Reduce of empty array with no
//                                  initial value
//   [].reduce((a,c) => a+c, 0)  -> 0   (safe)
//   ALWAYS pass an initial value unless you have a reason not to.
//
// WHERE YOU WENT WRONG: nothing on mechanism — near-perfect. Just absorb the
//   empty-array guard.


/******************************************************************************
 * Q8 — Chaining + order — (9/10)
 ******************************************************************************/
const users_q8 = [
  {name:"vardhan",age:26},{name:"akshay",age:30},
  {name:"rahul",age:17},{name:"priya",age:22},
];
// users_q8.filter(u => u.age >= 18).map(u => u.name)
//   -> ["vardhan","akshay","priya"]
//
// CONCEPT: chaining; order-dependence; silent logic bugs.
//
// MECHANISM: filter returns a NEW ARRAY, so map is immediately callable on it.
//   Methods run LEFT-TO-RIGHT, each on the previous output, SEQUENTIALLY.
//
// ORDER SWAP (silent bug):
//   users_q8.map(u => u.name).filter(u => u.age >= 18)  ->  []
//   map first -> array of STRINGS -> filter reads u.age on a string ->
//   undefined -> undefined >= 18 -> false -> every element fails -> [].
//   NO error thrown — a SILENT LOGIC BUG (the dangerous kind in AI code).
//
// WHERE YOU WENT WRONG: called filter's result a "copy" — it's a NEW, SHORTER
//   array of passing elements. Excellent undefined-trace in (iii).


/******************************************************************************
 * Q9 — Write your own HOF — (8/10)
 ******************************************************************************/
function repeat_q9(n, action) {
  for (let j = 0; j < n; j++) action(j);
}
// repeat_q9(3, i => console.log("Iteration:", i))  ->  0, 1, 2
//
// CONCEPT: authoring a HOF; HOF vs callback; rebuilding map.
//
// MECHANISM: repeat is the HOF (it RECEIVES a function). action is the
//   CALLBACK (the RECEIVED function). Extension that collects return values:
function repeatCollect_q9(n, action) {
  const results = [];
  for (let j = 0; j < n; j++) results.push(action(j));  // push the RETURN VALUE
  return results;
}
// repeatCollect_q9(3, i => i * 10)  ->  [0, 10, 20]
//   Most resembles MAP — call a function per item, collect what it returns —
//   but iterates over a COUNT (0..n-1) instead of an array's elements.
//
// WHERE YOU WENT WRONG: (1) called the PARAMETER the HOF — repeat is the HOF,
//   action is the callback (same slip as Q1B). (2) said you'd push `j`; the
//   goal is the RETURN VALUE action(j), not the index.


/******************************************************************************
 * TWO RECURRING WEAKNESSES TO DRILL (both precision, not understanding)
 ******************************************************************************/
// 1. HOF vs CALLBACK (Q1B, Q9): the HOF is the RECEIVER/RETURNER; the callback
//    is the PASSED function. Never call the data or the parameter the HOF.
// 2. "EVERY EXPRESSION EVALUATES TO A VALUE" (Q5, Q6): stop classifying
//    operations as "real" vs "not real". A comparison yields a boolean;
//    methods collect whatever the callback returns, blindly.
//
// STRENGTHS PROVEN: mechanism + cross-concept integration (closures <-> GC),
//   clean reduce trace, silent-bug debugging trace, fast self-correction after
//   a named mistake. Keep all four.

/******************************************************************************
 * END — pairs with hof_deep_notes.js (the concept notes).
 ******************************************************************************/