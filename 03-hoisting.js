console.log(a);
var a = 10;
console.log(a);

// output:
// undefined
// 10

function outer() {
  console.log(b);
  var b = 20;
  console.log(b);
}
outer();

// output: 
// undefined
// 20

sayHi();
greet();

function sayHi() {
  console.log("Hi");
}

var greet = function() {
  console.log("Hello");
};

// output:
// Hi
// Type error greet is not a function

var x = 10;

function foo() {
  console.log(x);
  var x = 20;
  console.log(x);
}

foo();
console.log(x);

// output:
// undefined
// 20
// 10

console.log(typeof foo);
var foo = "hello";
function foo() {}
console.log(typeof foo);

// output: 
// function
// string

console.log("--- proof that declarations don't act at runtime ---");

console.log("--- proof that declarations don't act at runtime ---");

console.log(typeof baz);   // Predict: ?
function baz() {}
console.log(typeof baz);   // Predict: ?
baz = 42;                   // Pure assignment, no var/let
console.log(typeof baz);   // Predict: ?
function baz() {}           // ← does THIS line do anything?
console.log(typeof baz);   // Predict: ?

//output: 
// function
// function 
// number
// number