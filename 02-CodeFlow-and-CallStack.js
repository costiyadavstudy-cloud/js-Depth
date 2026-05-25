// console.log("A");
// function test() {
//     console.log("B");
// }
// test();
// console.log("C");

// <---------------------------diff question-------------------------->

// function outer() {
//     console.log("Inside outer");
//     inner();
//     console.log("Back in outer");
// }

// function inner() {
//     console.log("Inside inner");
// }

// outer();
// <---------------------------diff question-------------------------->

// function a() {
//     var x = 10;
//     console.log(x);
// }

// function b() {
//     var x = 20;
//     console.log(x);
// }

// a();
// b();
// console.log(x);
// <---------------------------diff question-------------------------->

// function a() {
//     var x = 10
//     console.log(x)
// }
// function b() {
//     var x = 20
//     console.log(x)
// }
// console.log(a)
// console.log(b)
// console.log(x)
// <---------------------------diff question-------------------------->
// function first() {
    //     second();
//     console.log("First done");
// }

// function second() {
//     third();
//     console.log("Second done");
// }

// function third() {
    //     console.log("Third done");
    // }
    
    // first();
    // <---------------------------diff question-------------------------->
    //     function a() {
        //     console.log("a start");
        //     b();
//     console.log("a end");
// }

// function b() {
//     console.log("b start");
//     c();
//     d();
//     console.log("b end");
// }

// function c() {
//     console.log("c");
// }

// function d() {
//     console.log("d");
// }

// a();
// <---------------------------diff question-------------------------->

// function foo() {
//     var a = 10;
//     var b = 20;
//     var c = 30;
//     return a + b;  // ONLY the value 50 is returned
// }

// var result = foo();
// console.log(result);  // 50
// console.log(a);       // ReferenceError — a doesn't exist outside foo
// console.log(b);       // ReferenceError — b doesn't exist outside foo
// console.log(c);       // ReferenceError — c doesn't exist outside foo