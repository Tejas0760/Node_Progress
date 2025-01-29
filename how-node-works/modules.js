// console.log(arguments);
// console.log(require('module').wrapper);

const c = require(`${__dirname}/module-1.js`);
const calc = new c();
console.log(calc.add(4,5));
console.log(calc.mul(4,5));
console.log(calc.divide(4,5));

console.log('-------------------');

const c2 = require(`${__dirname}/module-2`);
console.log(c2.add(1,2));
console.log(c2.mul(1,2));
console.log(c2.div(1,2));

console.log('-------------------');

// or 

//the name has to be same as that of the module export properties
const { add, mul} = require(`${__dirname}/module-2`);
console.log(add(8,9));

console.log('-------------------');


// caching
require("./module-3")();
require("./module-3")();
require("./module-3")();

