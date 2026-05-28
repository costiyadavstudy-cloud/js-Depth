/* ============================================================================
 * FILE 3 / 4 — GLOBAL EXECUTION CONTEXT, WINDOW, AND THIS
 *
 * The Ep 5 content. This is the foundation for understanding scope,
 * `this`, and how JS works at the highest level — before any of YOUR
 * code runs.
 *
 * Most beginners think a JS file starts empty and fills as you write.
 * That's wrong. Even an empty file starts with a fully-populated
 * environment. This file shows you exactly what.
 * ============================================================================
 */


/* ============================================================================
 * SECTION 1 — THE SHORTEST JAVASCRIPT PROGRAM
 *
 * What happens when you run an empty .js file?
 * ============================================================================
 */


// You write a JavaScript file with zero characters. Save it. Run it
// in a browser. Is the JS engine idle?
//
// NO.
//
// Even with zero user code, the engine does the following:
//
//   1. Creates the GLOBAL EXECUTION CONTEXT (GEC).
//   2. Pushes the GEC onto the CALL STACK as the bottom-most context.
//   3. Allocates the GLOBAL OBJECT in memory.
//   4. Creates the `this` BINDING and points it at the global object.
//
// These four things exist before any line of your code runs. They are
// the starting environment for every JS program.


/* ============================================================================
 * SECTION 2 — THE GLOBAL OBJECT
 * ============================================================================
 */


// The global object is the TOP-LEVEL OBJECT that exists in every JS
// environment. Its name depends on WHERE the JS is running:
//
//     window     — in browsers (Chrome, Firefox, Safari, Edge, ...)
//     global     — in Node.js
//     self       — in Web Workers
//     globalThis — universal — works in ALL environments


// What does the global object contain?
//
// In a BROWSER (window):
//   - DOM-related: document, location, history, navigator
//   - Timers: setTimeout, setInterval, clearTimeout, clearInterval
//   - Networking: fetch, XMLHttpRequest, WebSocket
//   - Storage: localStorage, sessionStorage
//   - UI: alert, confirm, prompt, console
//   - Encoding: btoa, atob, encodeURIComponent
//   - and hundreds more
//
// In NODE.js (global):
//   - process, Buffer, setImmediate, clearImmediate
//   - require, module, exports (module-scoped, not strictly global)
//   - console (also available)
//   - and others


// You can use any of these without "importing" them because they live
// on the global object, and the global object is accessible from every
// scope via the scope chain.


/* ============================================================================
 * SECTION 3 — THE `this` BINDING AT GLOBAL LEVEL
 * ============================================================================
 */


// At the top level of a script in a browser, `this` is a binding that
// holds a REFERENCE to the global object (window).

console.log(this);              // window object (in browser)
console.log(this === window);   // true

// Why true?
//   Both `this` and `window` are bindings. Both hold REFERENCES to the
//   same object in memory (the global object). When you compare them
//   with `===`, JS compares the references. Same reference → true.


// Note about `this` elsewhere:
//   `this` is NOT always the global object. Its value depends on HOW a
//   function is called:
//     - Top-level code: global object
//     - Method call (obj.fn()): the object (obj)
//     - Arrow functions: inherited from enclosing scope
//     - Event handlers: the element
//     - Constructor (new): the new instance
//
//   These cases come later. For now: at the TOP LEVEL in a browser,
//   `this === window`.


/* ============================================================================
 * SECTION 4 — var AT THE TOP LEVEL ATTACHES TO THE GLOBAL OBJECT
 * ============================================================================
 */


// One of the most important Ep 5 facts:
//   When you declare a `var` at the top level of a script (in a browser),
//   the identifier is added as a PROPERTY of the window object.

var x = 5;

console.log(x);          // 5
console.log(window.x);   // 5     ← same value, accessed via window
console.log(this.x);     // 5     ← same value, this === window

// All three are accessing the same property on the same object.
// `x` is shorthand for `window.x` in this context.


// You can also do the reverse — set properties on window directly,
// and access them via the identifier:

window.greeting = "namaste";
console.log(greeting);   // "namaste"   ← no `var` was used, but it works


// PREVIEW for Ep 8 (let and const):
//
//   let y = 10;
//   console.log(window.y);   // undefined
//
//   let and const DO NOT attach to the global object. They live in a
//   separate scope (called the Script scope). This is one of the main
//   reasons let and const exist — to give you global-level bindings
//   that don't pollute the global object.


/* ============================================================================
 * SECTION 5 — globalThis: THE UNIVERSAL REFERENCE
 * ============================================================================
 */


// Before globalThis existed, you had to write environment-specific code:
//
//   - In browser: window.someThing
//   - In Node:    global.someThing
//   - In Worker:  self.someThing
//
// This made writing portable JS code annoying. globalThis solves it —
// it's a universal name that ALWAYS refers to the global object,
// regardless of environment.

console.log(globalThis);             // the global object, whatever env
console.log(globalThis === window);  // true in browser
console.log(globalThis === this);    // true at top level in browser

// Why it exists:
//   To write libraries that work in ANY JS environment without
//   environment-detection code. If you publish a JS package, using
//   `globalThis` means your code runs unchanged in browsers, Node,
//   Workers, and any future JS environment.


/* ============================================================================
 * SECTION 6 — VERIFYING ALL OF THIS IN A BROWSER CONSOLE
 *
 * Don't take any of this on faith. Run it yourself.
 * ============================================================================
 */


// Open any browser (Chrome works fine).
// Open DevTools → Console tab.
// Paste these one by one and observe:

//   1. Confirm window exists
//        window
//        → Window {...}
//
//   2. Confirm this === window at top level
//        this === window
//        → true
//
//   3. Confirm globalThis === window
//        globalThis === window
//        → true
//
//   4. Declare a var and find it on window
//        var foo = 42;
//        window.foo
//        → 42
//
//   5. Confirm let does NOT attach
//        let bar = 99;
//        window.bar
//        → undefined
//
//   6. See what's on window — be ready to scroll
//        Object.keys(window).length
//        → (a large number — hundreds of built-ins)


// Running these exercises once is worth more than reading these notes
// ten times. Verification builds the model in your hands, not just
// your head.


/* ============================================================================
 * SECTION 7 — COMMON MISTAKES
 * ============================================================================
 */


// MISTAKE 1 — Thinking "the engine creates window."
//   Subtle but worth knowing: in a browser, the `window` object is
//   created by the BROWSER (the host environment), not by the JS engine
//   itself. The JS engine receives a reference to it and exposes it
//   under the name `window`. Same for `global` in Node — Node creates
//   it, the JS engine references it.
//
//   For your level of understanding right now, "the engine sets up
//   access to the global object" is close enough. But internalize that
//   the global object lives in the host, not the engine.


// MISTAKE 2 — Confusing `this` with `window` in non-global contexts.
//   At the top level in a browser, they're the same object. INSIDE a
//   function called as `obj.method()`, `this` is no longer window —
//   it's `obj`. Don't generalize "this === window" beyond the top level.


// MISTAKE 3 — Assuming `var` always attaches to the global object.
//   It only does so at the TOP LEVEL. A var inside a function attaches
//   to that function's EC, not to window.

function inner() {
  var localOnly = "hidden";
}
inner();
// console.log(window.localOnly);   // undefined — not on window


// MISTAKE 4 — "Empty parenthesis" vs "empty object."
//   This is a vocabulary error, not a conceptual one, but it traces
//   to Ep 5 territory. If a tutorial says `this` evaluates to `{}` in
//   some context, that's an EMPTY OBJECT, not an "empty parenthesis."
//   `( )` and `{ }` are different characters and different JS constructs.


/* ============================================================================
 * SECTION 8 — TIPS FOR INTERNALIZING THIS MATERIAL
 * ============================================================================
 */


// TIP 1 — Verify in the browser console, every time.
//   The browser is the ground truth. Whenever you read an Ep 5 claim
//   ("var attaches to window", "this === window"), open the console
//   and TEST it. Reading without testing is just storage. Testing
//   builds your reflex to debug claims rather than trust them.


// TIP 2 — Treat the Ep 5 insight as ASYMMETRIC.
//   Most beginners think "the engine runs my code." The Ep 5 insight
//   flips it: "the engine runs in an environment it already created,
//   and my code is a guest in that environment." That reframing
//   changes how you debug, how you read library code, and how you
//   reason about global pollution.


// TIP 3 — Build a one-line summary you can recite.
//   For example:
//     "Before any code runs, the engine creates the Global Execution
//     Context, the global object, and the `this` binding."
//   If you can't recite this without looking, you don't know it yet.


// TIP 4 — Learn the global object's contents by exploring, not memorizing.
//   You don't need to memorize every property of window. You need to
//   know HOW to find what's there:
//
//     console.log(Object.keys(window).sort());
//
//   When you wonder "is this a built-in?", check window. That habit
//   matters more than memorization.


// TIP 5 — Connect Ep 5 back to the call stack from Ep 1–2.
//   The GEC is what sits at the BOTTOM of the call stack. Every function
//   you call later gets pushed ON TOP of it. When the program ends,
//   the GEC is the last thing to pop. This is the link between Ep 1–2
//   (call stack) and Ep 5 (what's in the GEC).


// TIP 6 — Distinguish "browser" examples from "Node" examples.
//   When you read code online or in a tutorial, identify which
//   environment it assumes. If you see `window` — browser. If you
//   see `global` or `require(...)` — Node. Don't transfer assumptions
//   across environments.


// ============================================================================
// END OF FILE 3 / 4
// Next: 04_study_protocols_and_meta.js
// ============================================================================

/* ============================================================================
 * DAY 3 — ALL QUESTIONS AND OUTPUTS
 *
 * Complete record of every question asked, every code snippet, and the
 * correct outputs. Use this as a self-test resource: cover the OUTPUT
 * section with your hand, predict, then verify.
 *
 * Sessions covered today:
 *   A. Hoisting Quiz — re-answers (Q5, Q6)
 *   B. Ep 5 Warmup — retrieval round (4 conceptual + 4 short-form)
 *   C. Ep 5 Formal Quiz (Q1–Q7)
 * ============================================================================
 */


/* ============================================================================
 * SESSION A — HOISTING QUIZ (re-answers)
 * ============================================================================
 */


// ─── Q5 — function declaration vs var collision ────────────────────────────

console.log(typeof foo);
var foo = "hello";
function foo() {}
console.log(typeof foo);

// OUTPUT:
//   "function"
//   "string"
//
// KEY RULE:
//   Function declarations take PRECEDENCE over var declarations on
//   identifier collision in the creation phase.
//
// MECHANISM:
//   Creation phase: var foo → undefined, then function foo() {} overwrites
//                   the binding with reference to the function object.
//   Execution phase: typeof foo → "function". Then `foo = "hello"`
//                   reassigns it to a string. Final: typeof → "string".


// ─── Q6 — function declaration + function expression, same name ─────────────

greet();
var greet = function () { console.log("first"); };
function greet() { console.log("second"); }
greet();

// OUTPUT:
//   "second"
//   "first"
//
// MECHANISM:
//   Creation phase: var greet → undefined, then function greet() {}
//                   overwrites binding with reference to function object
//                   logging "second" (function decl precedence).
//   Execution phase:
//     line 1: greet() → invokes current binding → "second"
//     line 2: new function object logging "first" created, greet is
//             REASSIGNED to point to it
//     line 3: function declaration — no-op at runtime
//     line 4: greet() → invokes current binding → "first"
//
// LESSON:
//   The two calls differ because `greet` was REASSIGNED between them.


/* ============================================================================
 * SESSION B — EP 5 WARMUP (single-question format after restart)
 * ============================================================================
 */


// ─── Q4 — this === window in browser top-level ──────────────────────────────

// What does this evaluate to in a browser at the top level?

this === window

// OUTPUT:
//   true
//
// WHY:
//   Both `this` and `window` are bindings that hold references to the
//   same object (the global object). === compares references. Same
//   reference → true.


// ─── Q5 — globalThis ────────────────────────────────────────────────────────

// What is globalThis?
//
// ANSWER:
//   A universal reference to the global object that works in any
//   JS environment (browser, Node, Web Workers).


// ─── Q6 — why does globalThis exist? ────────────────────────────────────────

// Different environments use different names for the global object:
//   - browser: window
//   - Node:    global
//   - Workers: self
//
// globalThis was introduced so the same code could reference the global
// object in ANY environment without conditional checks for the name.


/* ============================================================================
 * SESSION C — EP 5 FORMAL QUIZ (Q1–Q7)
 * ============================================================================
 */


// ─── Q1 — var vs let at global level + this ─────────────────────────────────

var a = 10;
let b = 20;

console.log(window.a);
console.log(window.b);
console.log(this.a === a);

// OUTPUT:
//   10
//   undefined
//   true
//
// MECHANISM:
//   - var a at global → becomes a PROPERTY of window. window.a → 10.
//   - let b at global → does NOT attach to window; lives in Script scope.
//     window.b → undefined.
//   - this === window at top level, so this.a and a both read window.a → true.


// ─── Q2 — `this` inside a regular function call ─────────────────────────────

function test() {
  console.log(this);
}
test();

// OUTPUT:
//   Non-strict mode: Window {...}    (the global object)
//   Strict mode:     undefined
//
// MECHANISM:
//   When a function is called as a plain `fn()` (no obj.fn, no new,
//   no .call/.apply), JS uses the "default this" rule:
//     - non-strict: this = global object
//     - strict:     this = undefined
//
// ONE-LINE RULE:
//   `this` inside a function depends on HOW the function is called,
//   not where it is written.


// ─── Q3 — accessing outer var from inside a function ───────────────────────

var x = 5;
function showX() {
  console.log(x);
}
showX();

// OUTPUT:
//   5
//
// MECHANISM (scope chain):
//   showX has no local x. It walks UP the scope chain to the parent
//   (global) EC and finds x = 5 there.


// ─── Q4 — direct assignment to window.greeting ─────────────────────────────

window.greeting = "namaste";
console.log(greeting);

function show() {
  console.log(greeting);
}
show();

// OUTPUT:
//   "namaste"
//   "namaste"
//
// MECHANISM:
//   Assigning window.greeting adds `greeting` as a PROPERTY of the
//   global object — same effect as `var greeting = "namaste"` at the
//   top level.
//   Both bare `greeting` (outside) and `greeting` inside show() are
//   resolved via the scope chain → find it on the global object.


// ─── Q5 — this.x vs bare x in a function, with shadowing ───────────────────

var lang = "Hindi";

function show() {
  console.log(this.lang);
  console.log(lang);
}
show();

// OUTPUT:
//   "Hindi"
//   "Hindi"
//
// MECHANISM:
//   this.lang   → this is window → reads window.lang property → "Hindi"
//   lang        → scope chain lookup → finds global lang → "Hindi"
//   Same destination, different mechanisms.


// Variation — add `var lang = "English"` inside show():

var lang = "Hindi";

function show() {
  var lang = "English";       // local lang SHADOWS global lang
  console.log(this.lang);
  console.log(lang);
}
show();

// OUTPUT:
//   "Hindi"     ← this.lang still reads window.lang (unchanged)
//   "English"   ← bare lang resolves to local first
//
// LESSON:
//   `this.x` is a property lookup on a specific object (window).
//   Bare `x` is a scope chain lookup, which finds the closest match.
//   These can return DIFFERENT values when shadowing exists.


// ─── Q6 — nested functions and scope chain walk ─────────────────────────────

var a = "global";

function outer() {
  var a = "outer";
  
  function inner() {
    console.log(a);
  }
  inner();
}
outer();

// OUTPUT:
//   "outer"
//
// MECHANISM:
//   inner has no local a → walks up → finds a in outer's EC → "outer".
//
// VARIATION — remove `var a = "outer";` from inside outer():
//   OUTPUT: "global"
//   inner walks up → not in outer either → walks further to global EC
//   → finds a = "global".


// ─── Q7 — assignment without var: reassigns parent's binding ────────────────

function outer() {
  var x = 10;
  
  function inner() {
    console.log(x);
    x = 20;            // NO `var` — assignment, not declaration
  }
  
  inner();
  console.log(x);
}
outer();

// OUTPUT:
//   10
//   20
//
// MECHANISM:
//   inner's first log:  scope chain → finds x in outer → reads 10.
//   `x = 20;` (no var): scope chain → finds x in outer → REASSIGNS to 20.
//                       Outer's x is now 20.
//   outer's log:        reads its own x → 20.
//
// CRITICAL RULE:
//   No keyword (var/let/const) → assignment, not declaration.
//   Walks up scope chain. Modifies the existing binding.
//   If nothing is found in non-strict mode, JS creates the variable
//   as a property of window — this is an "accidental global", a
//   very common bug.
//   In strict mode: throws ReferenceError instead.
//
// COMPARE — same code WITH `var` inside inner:
//
//   function outer() {
//     var x = 10;
//     function inner() {
//       console.log(x);    // undefined — hoisting in inner makes local x
//                          // exist as undefined before the assignment line
//       var x = 20;        // local x — does NOT affect outer's x
//     }
//     inner();
//     console.log(x);      // 10 — outer's x untouched
//   }
//
//   OUTPUT: undefined, 10


/* ============================================================================
 * KEY CONCEPTS CRYSTALLIZED TODAY
 * ============================================================================
 */

// 1. Function declarations beat var declarations on identifier collision
//    (creation phase precedence).
//
// 2. var at top level → property of global object (window in browser).
//    let / const at top level → live in Script scope, NOT on window.
//
// 3. `this` at the top level (browser) holds a reference to window.
//    Inside a regular function call: this = window (non-strict), or
//    undefined (strict).
//
// 4. Bare identifier lookup uses the SCOPE CHAIN — not `this`.
//    Walks from local EC → parent → grandparent → global.
//
// 5. `this.x` (property lookup) and bare `x` (scope chain lookup) are
//    two DIFFERENT mechanisms that often give the same result but
//    NOT always — shadowing breaks the equivalence.
//
// 6. Assignment without var/let/const → walks scope chain and reassigns
//    parent binding (or creates accidental global in non-strict mode).
//
// 7. globalThis = universal name for the global object across all
//    JS environments.


// ============================================================================
// END OF DAY 3
// Day 4 opens with: revisit of scope chain mechanics, Ep 5 close-out,
// then Ep 6 (undefined vs not defined) starts on Day 5.
// ============================================================================