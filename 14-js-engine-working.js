/******************************************************************************
 *  NAMASTE JAVASCRIPT — EPISODE 16: JS ENGINE EXPOSED (V8 ARCHITECTURE)
 *  Deep Notes — written as commented code.
 *
 *  HOW TO USE THIS FILE:
 *  Read top to bottom. Every claim has a WHY. Code snippets are tiny,
 *  runnable thought-experiments. When a line confuses you, STOP and
 *  re-derive it — do not scroll past confusion.
 ******************************************************************************/


/******************************************************************************
 * SECTION 0 — THE ONE SENTENCE THAT RULES THIS EPISODE
 ******************************************************************************/

// >>> "Your code never runs. The ENGINE runs, with your code as its INPUT." <<<
//
// The JS engine is NOT a machine. It is a PROGRAM (software).
//   - V8 (Chrome / Node)        -> written in C++
//   - SpiderMonkey (Firefox)    -> the FIRST JS engine ever, by Brendan Eich
//   - JavaScriptCore (Safari)
//
// V8's C++ source was compiled ONCE, long ago, into machine code.
// That machine code ships inside Chrome/Node. THAT is what your CPU executes.
//
// When "your JS runs", the CPU is actually running ENGINE instructions
// that READ your .js file as text (data!) and act on its behalf.
//
// Analogy: a chess program reads the move "e4".
//   The CPU does not understand chess.
//   The CPU runs the chess PROGRAM, which understands chess.
//   Your JS file is the "e4". The engine is the chess program.

let a = 10;
// ^ This line never touches the CPU as-is. The engine's machine code:
//   1. reads these characters,
//   2. builds data structures describing them,
//   3. allocates memory, stores the value 10.
// The ONLY exception: machine code the JIT compiler GENERATES at runtime
// (Section 4) — that does run directly on the CPU.


/******************************************************************************
 * SECTION 1 — THE FULL PIPELINE (memorize this diagram — Question 0 material)
 ******************************************************************************/

/*
        YOUR .js FILE  (raw text — just characters)
              |
              v
   +---------------------+
   |  1. PARSING         |
   |   a) Lexical        |  text  ->  TOKENS
   |      analysis       |  `let a = 10;` -> [let][a][=][10][;]
   |      (tokenizer)    |  (flat list, NO structure, NO meaning yet)
   |                     |
   |   b) Syntax         |  tokens ->  AST (Abstract Syntax Tree)
   |      analysis       |  a TREE describing grammatical meaning:
   |      (parser)       |  VariableDeclaration{kind:'let', id:'a', init:10}
   +---------------------+
              |
              v
   +---------------------+
   |  2. INTERPRETER     |  AST -> BYTECODE, and EXECUTES it line-by-line.
   |     (V8: Ignition)  |  Program starts running IMMEDIATELY.
   +---------------------+
              |
              |   <-- PROFILER watches WHILE bytecode runs:
              |       "which functions run again and again?"  = HOT code
              |
              +---------------------------+
              |                           |
        (cold code:                 (HOT code only!)
         stays as bytecode,               |
         keeps being                      v
         interpreted)        +------------------------+
                             |  3. OPTIMIZING COMPILER|
                             |     (V8: TurboFan)     |
                             |  hot bytecode + profile|
                             |   -> OPTIMIZED         |
                             |      MACHINE CODE      |
                             |  (inlining, inline     |
                             |   caching, etc.)       |
                             +------------------------+
                                          |
                                          v
                                   CPU runs it directly
                                   (fastest possible)

   MEANWHILE, THE WHOLE TIME, IN THE BACKGROUND:
   +---------------------+
   |  GARBAGE COLLECTOR  |  attached to the HEAP.
   |  (V8: Orinoco)      |  Continuously reclaims unreachable objects
   |                     |  (Section 6) without freezing your program
   +---------------------+  (Section 7).
*/

// THE TWO MISTAKES MY TEST EXPOSED IN THIS DIAGRAM — never repeat them:
//   MISTAKE 1: drawing the compiler as if it compiles EVERYTHING.
//              NO. Only HOT code. The profiler decides. That branch
//              IS the definition of JIT.
//   MISTAKE 2: forgetting GC. It is part of the picture, attached to
//              the heap, running concurrently.


/******************************************************************************
 * SECTION 2 — PARSING IN DETAIL (tokens, then AST)
 ******************************************************************************/

// STEP A — TOKENIZATION (lexical analysis)
// The scanner walks character-by-character and chops the text into TOKENS:
// the smallest meaningful units. No grammar yet. Just labeled pieces.

let x = 10;
// becomes, roughly:
//   [ keyword:'let' ] [ identifier:'x' ] [ punct:'=' ] [ number:'10' ] [ punct:';' ]

// STEP B — SYNTAX ANALYSIS (the parser)
// The parser consumes the flat token stream and builds the AST — a tree
// that encodes MEANING and STRUCTURE:
//
//   VariableDeclaration (kind: "let")
//        └── VariableDeclarator
//              ├── Identifier (name: "x")
//              └── NumericLiteral (value: 10)
//
// WHY TWO STEPS? Same reason you read a sentence as words before grammar:
// you cannot build structure directly out of raw characters.
//
// SEE IT YOURSELF (do this once, it cements forever):
//   -> paste any snippet into  https://astexplorer.net
//
// The AST is what the REST of the engine works with. Raw text is never
// seen again after parsing.


/******************************************************************************
 * SECTION 3 — INTERPRETER vs COMPILER (the tradeoff that explains JIT)
 ******************************************************************************/

// THE CORRECT MODEL (one line, memorize):
//   Interpreter = FAST TO START, SLOW TO RUN.
//   Compiler    = SLOW TO START, FAST TO RUN.

// WHY interpreter is fast to start: it translates and executes line-by-line,
//   no upfront work — your program begins immediately.
// WHY interpreter is slow to run:   it RE-translates every time. A loop body
//   running 1,000,000 times gets translated 1,000,000 times.
// WHY compiler is slow to start:    it must translate (and optimize) the
//   whole thing BEFORE anything runs.
// WHY compiler is fast to run:      output is native machine code; the loop
//   body was translated ONCE, executes a million times at CPU speed.

// !!! MISCONCEPTION TO BURN (cost me points on the test) !!!
// "Interpreters are less ACCURATE / make mistakes."  -> FALSE.
// A correct interpreter and a correct compiler both execute your code
// EXACTLY as written. Accuracy is not a dimension here at all.
// The only thing I was half-remembering: WHEN errors surface differs
// (a compiler can reject broken code before running anything; an
// interpreter may discover it mid-run). Timing of errors != accuracy.


/******************************************************************************
 * SECTION 4 — JIT (Just-In-Time) COMPILATION: the best of both
 ******************************************************************************/

// V8's logic, derived from Section 3's tradeoff:
//   1. Interpret EVERYTHING immediately (bytecode) -> instant startup.
//   2. While interpreting, a PROFILER measures: which functions run often?
//      The interpreting phase doubles as a MEASUREMENT phase.
//   3. "HOT" code (runs repeatedly) -> handed to the optimizing compiler
//      -> optimized MACHINE CODE replaces the bytecode for that function.
//   4. Result: fast START (interpreter) + fast STEADY-STATE (compiler).

// WHY NOT COMPILE EVERYTHING UP FRONT? Two reasons:
//   (a) startup would stall (Section 3),
//   (b) MOST CODE RUNS ONLY ONCE. Heavy optimization of run-once code is
//       wasted effort — and optimized machine code costs far more MEMORY.
//   Selective compilation is not just possible; it is the economically
//   rational choice.

function hotFunction(n) { return n * 2; }   // imagine this called 100,000x
function coldFunction() { return "ran once"; }

// hotFunction  -> profiler flags it hot -> compiled to machine code.
// coldFunction -> stays as bytecode forever. Nobody pays to optimize it.


/******************************************************************************
 * SECTION 5 — BYTECODE vs MACHINE CODE (who executes what)
 ******************************************************************************/

// MACHINE CODE: the NATIVE instruction set of a specific CPU (x86, ARM).
//   Executed by: THE CPU ITSELF, directly. Hardware.
//
// BYTECODE: an instruction set the ENGINE INVENTED FOR ITSELF.
//   No CPU on earth can run it. Executed by: THE ENGINE'S INTERPRETER only.
//   It is an intermediate language: lower-level than JS, but still
//   abstract and CPU-independent.
//
// NOT "more detail vs less detail" — they are DIFFERENT LANGUAGES FOR
// DIFFERENT EXECUTORS. (Precision error I made: "difference of detailing".)
//
// WHY bytecode exists at all, if machine code is fastest:
//   AST -> bytecode      = CHEAP, instant  -> program starts NOW.
//   AST -> machine code  = EXPENSIVE       -> reserved for hot code only.
//   Plus the memory argument from Section 4(b).


/******************************************************************************
 * SECTION 6 — OPTIMIZATIONS THE COMPILER PERFORMS
 ******************************************************************************/

/* ---- 6a. INLINING ------------------------------------------------------ */

// MECHANISM: paste the function's BODY directly at the CALL SITE,
// eliminating the call itself.

function use(p, q) { return p * q; }
let product = use(2, 5);
// after inlining, the generated code behaves as:
//     let product = 2 * 5;
// after CONSTANT FOLDING (a second optimization inlining unlocks,
// possible because both values are known at compile time):
//     let product = 10;

// WHY IS A CALL EXPENSIVE? (Connect to Episodes 1-2!)
//   Every call: create a new EXECUTION CONTEXT -> push onto the CALL STACK
//   -> bind arguments to parameters -> execute -> return -> pop.
//   A one-line function inside a 1,000,000-iteration loop =
//   1,000,000 context creations for almost zero real work.
//   Inlining DELETES all of that overhead.
//
// CONDITION: engines inline HOT, SMALL functions only. Inlining a huge
// function at every call site would bloat the machine code (memory!).

/* ---- 6b. INLINE CACHING (and SHAPES / HIDDEN CLASSES) ------------------ */

// THE PROBLEM: every `obj.name` forces the engine to find WHERE inside
// that OBJECT the property `name` lives.
// (NOT "searching the code" — my test error. The search is INSIDE THE
//  OBJECT'S PROPERTY LAYOUT.)

// THE KEY OBSERVATION: objects created with the same property layout
// share a SHAPE (V8 calls it a "hidden class"). For a given shape,
// each property lives at a FIXED OFFSET (a fixed slot).

function getName(obj) { return obj.name; }

const u1 = { name: "vardhan", age: 20 };  // shape S: name@slot0, age@slot1
const u2 = { name: "akshay",  age: 30 };  // SAME shape S
// ... imagine 10,000 calls: getName(u1); getName(u2); ...

// THE MECHANISM:
//   After the first lookup, the engine caches AT THAT CALL SITE:
//       "if incoming object has shape S -> `name` is at slot 0"
//   Call #10,000:
//       one shape comparison  ->  one direct memory read at slot 0.
//   No property search at all. Nearly free.
//
// WHAT IS CACHED: the OFFSET-within-the-SHAPE.
// NOT "the location of the value" — values differ on every call;
// the constant thing is WHERE TO LOOK inside any object of that shape.

// !!! REAL-WORLD DEBUGGING PAYOFF (for "AI writes, I debug") !!!
const bad = { age: 30, name: "broken" };  // DIFFERENT shape (order differs)!
// Feeding mixed shapes into a hot function INVALIDATES the cache and can
// silently DEOPTIMIZE it. Symptom: "this function got mysteriously slow."
// Cause: inconsistent object shapes. Now you know where to look.

/* ---- 6c. COPY ELISION -------------------------------------------------- */

// IDEA: don't materialize a copy of an object you can PROVE is unnecessary.
// The TERM is most famous from C++ (formally specified there), but the
// CONCEPT — eliminating provably-useless copies — is general compiler
// theory, applicable to any optimizing compiler. Episode name-drops it
// as part of V8's bag of tricks. File under "optimization = do less work
// for the same observable result."


/******************************************************************************
 * SECTION 7 — MEMORY: HEAP, CALL STACK, AND GARBAGE COLLECTION
 ******************************************************************************/

// THE TWO MEMORY AREAS DURING EXECUTION:
//   CALL STACK -> tracks EXECUTION CONTEXTS (who is running, who called whom).
//                 It does NOT "hand machine code to the CPU" (my test error);
//                 it is bookkeeping for execution.
//   HEAP       -> where OBJECTS live (unstructured, big memory area).
//                 This is the garbage collector's territory.

/* ---- 7a. THE RULE: REACHABILITY ---------------------------------------- */

// Your code NEVER says "I'm done with this object". So the GC uses a rule:
//
//   >>> Memory is freeable when the object is NO LONGER REACHABLE
//       from the ROOTS by following references. <<<
//
//   ROOTS = global object + currently-executing function scopes (the stack).
//   The GC starts at the roots and WALKS outward, following every
//   reference like links:  root -> object -> nested object -> ...
//   Everything the walk touches is ALIVE. Everything untouched is garbage.

let obj = { name: "vardhan" };  // reachable via `obj`  -> alive
obj = null;                     // no path from any root -> garbage -> collected

// THE CASE THAT TESTS WHETHER YOU REALLY GET IT:
let a1 = { name: "vardhan" };
let b1 = a1;     // second reference to the SAME object
a1 = null;
// Is the object collected? NO. Still reachable: root -> b1 -> object.
// Reachability = "does ANY path from a root lead to it" —
// NOT "is the original variable still usable".
// (GC collects OBJECTS in the heap; variables are just references to them.)

/* ---- 7b. THE ALGORITHM: MARK & SWEEP ----------------------------------- */

// Phase 1 — MARK : walk from the roots, MARK every reachable object.
// Phase 2 — SWEEP: erase everything NOT marked. (Yes — the UNmarked dies.
//                  People reverse this; don't.)

/* ---- 7c. THE DIRTY PROBLEM: GC PAUSES ---------------------------------- */

// Naive design = "STOP-THE-WORLD": freeze ALL your JS, mark+sweep, resume.
// GC pauses YOUR PROGRAM'S EXECUTION (the main thread) —
// it does not "pause the memory" (my test error; memory just sits there).
//
// WHAT THE USER FEELS during a 200ms stop-the-world pause:
//   - Animations: smooth = ~60 fps = a frame every ~16ms.
//     200ms / 16ms = ~12 DROPPED FRAMES -> visible stutter/freeze ("jank").
//   - Typing: keystrokes aren't lost — they QUEUE as events while JS is
//     frozen, then BURST onto the screen all at once when GC finishes.
//     (You've felt this on slow websites. That was someone's GC pause.)

/* ---- 7d. THE MODERN FIX (V8's Orinoco) --------------------------------- */

// Three strategies, all variations of "don't stop the world for long":
//   PARALLEL    : split mark/sweep work across MULTIPLE HELPER THREADS.
//                 Still a pause, but many workers -> much shorter pause.
//   CONCURRENT  : helper threads do GC work WHILE your JS keeps running
//                 on the main thread. The world barely stops.
//   INCREMENTAL : chop GC into MANY TINY SLICES squeezed into the gaps
//                 between frames. Pauses too small to perceive.
//
// Old GC question:    "how do we free memory?"
// Modern GC question: "how do we free memory WITHOUT ANYONE NOTICING?"


/******************************************************************************
 * SECTION 8 — ECMASCRIPT: why one script runs identically everywhere
 ******************************************************************************/

// ECMASCRIPT = a SPECIFICATION. Literally a written DOCUMENT (a rulebook):
//   "here is what `let` must do, here is how `+` must behave, ..."
//
// ENGINES (V8, SpiderMonkey, JavaScriptCore) = PROGRAMS that IMPLEMENT
// that document. Nothing "uses" the spec at runtime; engineers READ it
// and build engines that OBEY it.
//
//   The spec FIXES:      observable BEHAVIOR (what your code must do).
//   Engines COMPETE on:  HOW FAST and WITH WHAT MEMORY it happens —
//     - different garbage collection algorithms        (Section 7)
//     - different JIT strategies / "hot" thresholds    (Section 4)
//     - different bytecode formats                     (Section 5)
//     - different inline-caching designs               (Section 6b)
//
// Analogy (mine, test-approved): different clocks — different internals,
// different durability and energy use — but ALL must show the same time.
// "Same time" = spec-fixed behavior. "Durability/energy" = perf/memory.


/******************************************************************************
 * SECTION 9 — THE SEVEN MODELS (final self-check — say each aloud, closed book)
 ******************************************************************************/

// 1. The engine is a PROGRAM; my code is its INPUT; my code never runs
//    directly on the CPU.
// 2. Code -> TOKENS -> AST (parsing: lexical analysis, then syntax analysis).
// 3. Interpreter = fast to start, slow to run. Compiler = slow to start,
//    fast to run.
// 4. JIT = interpret everything now (bytecode), PROFILE, compile only the
//    HOT parts to machine code.
// 5. Inlining deletes call overhead (execution context + call stack);
//    inline caching exploits stable SHAPES to cache property OFFSETS.
// 6. GC frees whatever is UNREACHABLE FROM THE ROOTS: mark the reachable,
//    sweep the rest.
// 7. Modern GC runs in slices and side-threads (parallel / concurrent /
//    incremental) so nobody notices.

// If any of the seven feels foggy: scroll to its section, re-derive it,
// then try again CLOSED-BOOK. Retrieval is where learning happens.

/******************************************************************************
 * END OF NOTES — pipeline diagram (Section 1) is Question 0 next test.
 ******************************************************************************/


/******************************************************************************
 *  NAMASTE JAVASCRIPT — EPISODE 16: JS ENGINE EXPOSED (V8 ARCHITECTURE)
 *  Deep Notes — written as commented code.
 *
 *  HOW TO USE THIS FILE:
 *  Read top to bottom. Every claim has a WHY. Code snippets are tiny,
 *  runnable thought-experiments. When a line confuses you, STOP and
 *  re-derive it — do not scroll past confusion.
 ******************************************************************************/


/******************************************************************************
 * SECTION 0 — THE ONE SENTENCE THAT RULES THIS EPISODE
 ******************************************************************************/

// >>> "Your code never runs. The ENGINE runs, with your code as its INPUT." <<<
//
// The JS engine is NOT a machine. It is a PROGRAM (software).
//   - V8 (Chrome / Node)        -> written in C++
//   - SpiderMonkey (Firefox)    -> the FIRST JS engine ever, by Brendan Eich
//   - JavaScriptCore (Safari)
//
// V8's C++ source was compiled ONCE, long ago, into machine code.
// That machine code ships inside Chrome/Node. THAT is what your CPU executes.
//
// When "your JS runs", the CPU is actually running ENGINE instructions
// that READ your .js file as text (data!) and act on its behalf.
//
// Analogy: a chess program reads the move "e4".
//   The CPU does not understand chess.
//   The CPU runs the chess PROGRAM, which understands chess.
//   Your JS file is the "e4". The engine is the chess program.

let a = 10;
// ^ This line never touches the CPU as-is. The engine's machine code:
//   1. reads these characters,
//   2. builds data structures describing them,
//   3. allocates memory, stores the value 10.
// The ONLY exception: machine code the JIT compiler GENERATES at runtime
// (Section 4) — that does run directly on the CPU.


/******************************************************************************
 * SECTION 1 — THE FULL PIPELINE (memorize this diagram — Question 0 material)
 ******************************************************************************/

/*
        YOUR .js FILE  (raw text — just characters)
              |
              v
   +---------------------+
   |  1. PARSING         |
   |   a) Lexical        |  text  ->  TOKENS
   |      analysis       |  `let a = 10;` -> [let][a][=][10][;]
   |      (tokenizer)    |  (flat list, NO structure, NO meaning yet)
   |                     |
   |   b) Syntax         |  tokens ->  AST (Abstract Syntax Tree)
   |      analysis       |  a TREE describing grammatical meaning:
   |      (parser)       |  VariableDeclaration{kind:'let', id:'a', init:10}
   +---------------------+
              |
              v
   +---------------------+
   |  2. INTERPRETER     |  AST -> BYTECODE, and EXECUTES it line-by-line.
   |     (V8: Ignition)  |  Program starts running IMMEDIATELY.
   +---------------------+
              |
              |   <-- PROFILER watches WHILE bytecode runs:
              |       "which functions run again and again?"  = HOT code
              |
              +---------------------------+
              |                           |
        (cold code:                 (HOT code only!)
         stays as bytecode,               |
         keeps being                      v
         interpreted)        +------------------------+
                             |  3. OPTIMIZING COMPILER|
                             |     (V8: TurboFan)     |
                             |  hot bytecode + profile|
                             |   -> OPTIMIZED         |
                             |      MACHINE CODE      |
                             |  (inlining, inline     |
                             |   caching, etc.)       |
                             +------------------------+
                                          |
                                          v
                                   CPU runs it directly
                                   (fastest possible)

   MEANWHILE, THE WHOLE TIME, IN THE BACKGROUND:
   +---------------------+
   |  GARBAGE COLLECTOR  |  attached to the HEAP.
   |  (V8: Orinoco)      |  Continuously reclaims unreachable objects
   |                     |  (Section 6) without freezing your program
   +---------------------+  (Section 7).
*/

// THE TWO MISTAKES MY TEST EXPOSED IN THIS DIAGRAM — never repeat them:
//   MISTAKE 1: drawing the compiler as if it compiles EVERYTHING.
//              NO. Only HOT code. The profiler decides. That branch
//              IS the definition of JIT.
//   MISTAKE 2: forgetting GC. It is part of the picture, attached to
//              the heap, running concurrently.


/******************************************************************************
 * SECTION 2 — PARSING IN DETAIL (tokens, then AST)
 ******************************************************************************/

// STEP A — TOKENIZATION (lexical analysis)
// The scanner walks character-by-character and chops the text into TOKENS:
// the smallest meaningful units. No grammar yet. Just labeled pieces.

let x = 10;
// becomes, roughly:
//   [ keyword:'let' ] [ identifier:'x' ] [ punct:'=' ] [ number:'10' ] [ punct:';' ]

// STEP B — SYNTAX ANALYSIS (the parser)
// The parser consumes the flat token stream and builds the AST — a tree
// that encodes MEANING and STRUCTURE:
//
//   VariableDeclaration (kind: "let")
//        └── VariableDeclarator
//              ├── Identifier (name: "x")
//              └── NumericLiteral (value: 10)
//
// WHY TWO STEPS? Same reason you read a sentence as words before grammar:
// you cannot build structure directly out of raw characters.
//
// SEE IT YOURSELF (do this once, it cements forever):
//   -> paste any snippet into  https://astexplorer.net
//
// The AST is what the REST of the engine works with. Raw text is never
// seen again after parsing.


/******************************************************************************
 * SECTION 3 — INTERPRETER vs COMPILER (the tradeoff that explains JIT)
 ******************************************************************************/

// THE CORRECT MODEL (one line, memorize):
//   Interpreter = FAST TO START, SLOW TO RUN.
//   Compiler    = SLOW TO START, FAST TO RUN.

// WHY interpreter is fast to start: it translates and executes line-by-line,
//   no upfront work — your program begins immediately.
// WHY interpreter is slow to run:   it RE-translates every time. A loop body
//   running 1,000,000 times gets translated 1,000,000 times.
// WHY compiler is slow to start:    it must translate (and optimize) the
//   whole thing BEFORE anything runs.
// WHY compiler is fast to run:      output is native machine code; the loop
//   body was translated ONCE, executes a million times at CPU speed.

// !!! MISCONCEPTION TO BURN (cost me points on the test) !!!
// "Interpreters are less ACCURATE / make mistakes."  -> FALSE.
// A correct interpreter and a correct compiler both execute your code
// EXACTLY as written. Accuracy is not a dimension here at all.
// The only thing I was half-remembering: WHEN errors surface differs
// (a compiler can reject broken code before running anything; an
// interpreter may discover it mid-run). Timing of errors != accuracy.


/******************************************************************************
 * SECTION 4 — JIT (Just-In-Time) COMPILATION: the best of both
 ******************************************************************************/

// V8's logic, derived from Section 3's tradeoff:
//   1. Interpret EVERYTHING immediately (bytecode) -> instant startup.
//   2. While interpreting, a PROFILER measures: which functions run often?
//      The interpreting phase doubles as a MEASUREMENT phase.
//   3. "HOT" code (runs repeatedly) -> handed to the optimizing compiler
//      -> optimized MACHINE CODE replaces the bytecode for that function.
//   4. Result: fast START (interpreter) + fast STEADY-STATE (compiler).

// WHY NOT COMPILE EVERYTHING UP FRONT? Two reasons:
//   (a) startup would stall (Section 3),
//   (b) MOST CODE RUNS ONLY ONCE. Heavy optimization of run-once code is
//       wasted effort — and optimized machine code costs far more MEMORY.
//   Selective compilation is not just possible; it is the economically
//   rational choice.

function hotFunction(n) { return n * 2; }   // imagine this called 100,000x
function coldFunction() { return "ran once"; }

// hotFunction  -> profiler flags it hot -> compiled to machine code.
// coldFunction -> stays as bytecode forever. Nobody pays to optimize it.


/******************************************************************************
 * SECTION 5 — BYTECODE vs MACHINE CODE (who executes what)
 ******************************************************************************/

// MACHINE CODE: the NATIVE instruction set of a specific CPU (x86, ARM).
//   Executed by: THE CPU ITSELF, directly. Hardware.
//
// BYTECODE: an instruction set the ENGINE INVENTED FOR ITSELF.
//   No CPU on earth can run it. Executed by: THE ENGINE'S INTERPRETER only.
//   It is an intermediate language: lower-level than JS, but still
//   abstract and CPU-independent.
//
// NOT "more detail vs less detail" — they are DIFFERENT LANGUAGES FOR
// DIFFERENT EXECUTORS. (Precision error I made: "difference of detailing".)
//
// WHY bytecode exists at all, if machine code is fastest:
//   AST -> bytecode      = CHEAP, instant  -> program starts NOW.
//   AST -> machine code  = EXPENSIVE       -> reserved for hot code only.
//   Plus the memory argument from Section 4(b).


/******************************************************************************
 * SECTION 6 — OPTIMIZATIONS THE COMPILER PERFORMS
 ******************************************************************************/

/* ---- 6a. INLINING ------------------------------------------------------ */

// MECHANISM: paste the function's BODY directly at the CALL SITE,
// eliminating the call itself.

function use(p, q) { return p * q; }
let product = use(2, 5);
// after inlining, the generated code behaves as:
//     let product = 2 * 5;
// after CONSTANT FOLDING (a second optimization inlining unlocks,
// possible because both values are known at compile time):
//     let product = 10;

// WHY IS A CALL EXPENSIVE? (Connect to Episodes 1-2!)
//   Every call: create a new EXECUTION CONTEXT -> push onto the CALL STACK
//   -> bind arguments to parameters -> execute -> return -> pop.
//   A one-line function inside a 1,000,000-iteration loop =
//   1,000,000 context creations for almost zero real work.
//   Inlining DELETES all of that overhead.
//
// CONDITION: engines inline HOT, SMALL functions only. Inlining a huge
// function at every call site would bloat the machine code (memory!).

/* ---- 6b. INLINE CACHING (and SHAPES / HIDDEN CLASSES) ------------------ */

// THE PROBLEM: every `obj.name` forces the engine to find WHERE inside
// that OBJECT the property `name` lives.
// (NOT "searching the code" — my test error. The search is INSIDE THE
//  OBJECT'S PROPERTY LAYOUT.)

// THE KEY OBSERVATION: objects created with the same property layout
// share a SHAPE (V8 calls it a "hidden class"). For a given shape,
// each property lives at a FIXED OFFSET (a fixed slot).

function getName(obj) { return obj.name; }

const u1 = { name: "vardhan", age: 20 };  // shape S: name@slot0, age@slot1
const u2 = { name: "akshay",  age: 30 };  // SAME shape S
// ... imagine 10,000 calls: getName(u1); getName(u2); ...

// THE MECHANISM:
//   After the first lookup, the engine caches AT THAT CALL SITE:
//       "if incoming object has shape S -> `name` is at slot 0"
//   Call #10,000:
//       one shape comparison  ->  one direct memory read at slot 0.
//   No property search at all. Nearly free.
//
// WHAT IS CACHED: the OFFSET-within-the-SHAPE.
// NOT "the location of the value" — values differ on every call;
// the constant thing is WHERE TO LOOK inside any object of that shape.

// !!! REAL-WORLD DEBUGGING PAYOFF (for "AI writes, I debug") !!!
const bad = { age: 30, name: "broken" };  // DIFFERENT shape (order differs)!
// Feeding mixed shapes into a hot function INVALIDATES the cache and can
// silently DEOPTIMIZE it. Symptom: "this function got mysteriously slow."
// Cause: inconsistent object shapes. Now you know where to look.

/* ---- 6c. COPY ELISION -------------------------------------------------- */

// IDEA: don't materialize a copy of an object you can PROVE is unnecessary.
// The TERM is most famous from C++ (formally specified there), but the
// CONCEPT — eliminating provably-useless copies — is general compiler
// theory, applicable to any optimizing compiler. Episode name-drops it
// as part of V8's bag of tricks. File under "optimization = do less work
// for the same observable result."


/******************************************************************************
 * SECTION 7 — MEMORY: HEAP, CALL STACK, AND GARBAGE COLLECTION
 ******************************************************************************/

// THE TWO MEMORY AREAS DURING EXECUTION:
//   CALL STACK -> tracks EXECUTION CONTEXTS (who is running, who called whom).
//                 It does NOT "hand machine code to the CPU" (my test error);
//                 it is bookkeeping for execution.
//   HEAP       -> where OBJECTS live (unstructured, big memory area).
//                 This is the garbage collector's territory.

/* ---- 7a. THE RULE: REACHABILITY ---------------------------------------- */

// Your code NEVER says "I'm done with this object". So the GC uses a rule:
//
//   >>> Memory is freeable when the object is NO LONGER REACHABLE
//       from the ROOTS by following references. <<<
//
//   ROOTS = global object + currently-executing function scopes (the stack).
//   The GC starts at the roots and WALKS outward, following every
//   reference like links:  root -> object -> nested object -> ...
//   Everything the walk touches is ALIVE. Everything untouched is garbage.

let obj = { name: "vardhan" };  // reachable via `obj`  -> alive
obj = null;                     // no path from any root -> garbage -> collected

// THE CASE THAT TESTS WHETHER YOU REALLY GET IT:
let a1 = { name: "vardhan" };
let b1 = a1;     // second reference to the SAME object
a1 = null;
// Is the object collected? NO. Still reachable: root -> b1 -> object.
// Reachability = "does ANY path from a root lead to it" —
// NOT "is the original variable still usable".
// (GC collects OBJECTS in the heap; variables are just references to them.)

/* ---- 7b. THE ALGORITHM: MARK & SWEEP ----------------------------------- */

// Phase 1 — MARK : walk from the roots, MARK every reachable object.
// Phase 2 — SWEEP: erase everything NOT marked. (Yes — the UNmarked dies.
//                  People reverse this; don't.)

/* ---- 7c. THE DIRTY PROBLEM: GC PAUSES ---------------------------------- */

// Naive design = "STOP-THE-WORLD": freeze ALL your JS, mark+sweep, resume.
// GC pauses YOUR PROGRAM'S EXECUTION (the main thread) —
// it does not "pause the memory" (my test error; memory just sits there).
//
// WHAT THE USER FEELS during a 200ms stop-the-world pause:
//   - Animations: smooth = ~60 fps = a frame every ~16ms.
//     200ms / 16ms = ~12 DROPPED FRAMES -> visible stutter/freeze ("jank").
//   - Typing: keystrokes aren't lost — they QUEUE as events while JS is
//     frozen, then BURST onto the screen all at once when GC finishes.
//     (You've felt this on slow websites. That was someone's GC pause.)

/* ---- 7d. THE MODERN FIX (V8's Orinoco) --------------------------------- */

// Three strategies, all variations of "don't stop the world for long":
//   PARALLEL    : split mark/sweep work across MULTIPLE HELPER THREADS.
//                 Still a pause, but many workers -> much shorter pause.
//   CONCURRENT  : helper threads do GC work WHILE your JS keeps running
//                 on the main thread. The world barely stops.
//   INCREMENTAL : chop GC into MANY TINY SLICES squeezed into the gaps
//                 between frames. Pauses too small to perceive.
//
// Old GC question:    "how do we free memory?"
// Modern GC question: "how do we free memory WITHOUT ANYONE NOTICING?"


/******************************************************************************
 * SECTION 8 — ECMASCRIPT: why one script runs identically everywhere
 ******************************************************************************/

// ECMASCRIPT = a SPECIFICATION. Literally a written DOCUMENT (a rulebook):
//   "here is what `let` must do, here is how `+` must behave, ..."
//
// ENGINES (V8, SpiderMonkey, JavaScriptCore) = PROGRAMS that IMPLEMENT
// that document. Nothing "uses" the spec at runtime; engineers READ it
// and build engines that OBEY it.
//
//   The spec FIXES:      observable BEHAVIOR (what your code must do).
//   Engines COMPETE on:  HOW FAST and WITH WHAT MEMORY it happens —
//     - different garbage collection algorithms        (Section 7)
//     - different JIT strategies / "hot" thresholds    (Section 4)
//     - different bytecode formats                     (Section 5)
//     - different inline-caching designs               (Section 6b)
//
// Analogy (mine, test-approved): different clocks — different internals,
// different durability and energy use — but ALL must show the same time.
// "Same time" = spec-fixed behavior. "Durability/energy" = perf/memory.


/******************************************************************************
 * SECTION 9 — THE SEVEN MODELS (final self-check — say each aloud, closed book)
 ******************************************************************************/

// 1. The engine is a PROGRAM; my code is its INPUT; my code never runs
//    directly on the CPU.
// 2. Code -> TOKENS -> AST (parsing: lexical analysis, then syntax analysis).
// 3. Interpreter = fast to start, slow to run. Compiler = slow to start,
//    fast to run.
// 4. JIT = interpret everything now (bytecode), PROFILE, compile only the
//    HOT parts to machine code.
// 5. Inlining deletes call overhead (execution context + call stack);
//    inline caching exploits stable SHAPES to cache property OFFSETS.
// 6. GC frees whatever is UNREACHABLE FROM THE ROOTS: mark the reachable,
//    sweep the rest.
// 7. Modern GC runs in slices and side-threads (parallel / concurrent /
//    incremental) so nobody notices.

// If any of the seven feels foggy: scroll to its section, re-derive it,
// then try again CLOSED-BOOK. Retrieval is where learning happens.

/******************************************************************************
 * END OF NOTES — pipeline diagram (Section 1) is Question 0 next test.
 ******************************************************************************/