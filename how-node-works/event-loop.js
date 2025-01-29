const fs = require('fs');
const crypto = require("crypto");

const start = Date.now();
//this will define the number of threads that will be used during the execution of the program 
process.env.UV_THREADPOOL_SIZE = 4;

setTimeout(() => console.log('0 Sec timeout'), 0);
setImmediate(() => console.log('Set Immediate'));

fs.readFile(`test-file.txt`, () => {
    console.log("--------------------------");
    console.log("Read the file \nWill always be last because the file is very long");
    
    //this timeout will only be called after the file has been read and the above function has been done 
    setTimeout(() => console.log('***** 0 Sec timer inside the call back function *****'), 0);
    setImmediate(() => console.log('***** Immediate inside the call back function *****'), 0);
    process.nextTick(() => console.log("process.nextTick called"));


    crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", () => {
    console.log(Date.now() - start, "Password encrypted");
    });

    crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", () => {
    console.log(Date.now() - start, "Password encrypted");
    });

    crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", () => {
    console.log(Date.now() - start, "Password encrypted");
    });

    crypto.pbkdf2("password", "salt", 100000, 1024, "sha512", () => {
    console.log(Date.now() - start, "Password encrypted");
    });
});

//the timer will only come after the readfile when the timer is taking longer than the file to load 
setTimeout(() => console.log('1 Sec timer'), 1);

console.log("Top level code of the program");