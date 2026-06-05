// let x = 1
// setTimeout(() => {
//     console.log(x)
// }, 1000);

// console.log("Time,Tide and JavaScript wait for none")

// Output : 
// Time,Tide and JavaScript wait for none
// 1

// because Js stores the timeOut someWhere else and sets a timer then proceed to run the remaining code

// for (var i = 1; i <= 5; i++) {
//     setTimeout(() => {
//         console.log(i)
//     }, i * 1000);
    
// }


// console.log("Time,Tide and JavaScript wait for none")

// Time,Tide and JavaScript wait for none
// 6
// 6
// 6
// 6
// 6

// problem : because each iteration of loop uses single i variable and the loop was already done before printing anything hence the value of i was already 6 before
// printing anything 

// solution : 

// for (let i = 1; i <= 5; i++) {
//     setTimeout(() => {
//         console.log(i)
//     }, i * 1000);
    
// }

// console.log("Time,Tide and JavaScript wait for none")
// output :
// Time,Tide and JavaScript wait for none
// 1
// 2
// 3
// 4
// 5


// because it is rule of js that for let it created different copy of i for each iteration 



// INTERVIE PURPOSE - can't use let 

for (var i = 1; i <= 5; i++) {
    setTimeout(() => {
        console.log(i)
    }, i * 1000);
    
}

console.log("Time,Tide and JavaScript wait for none")
