// create a async await function that will fetch this image with console log to see the working of async functions

// https://dog.ceo/api/breed/retriever/images/random
// modules needed 
const fs = require('fs');
const axios = require('axios');

// additional functions for clearer code 
const readFilePro = async (file) => {
    try{
        return await fs.promises.readFile(file, 'utf-8');
    }
    catch(err){
        throw new Error("Oops i coudn't find the file 🥲");
    }
}

const writeFilePro = async (file, data) => {
    try{
        const write = await fs.promises.writeFile(file, data, 'utf-8');
        console.log(`Successfully wrote to the file into ${file}`);
    }
    catch(err){
        throw new Error(`Coudn't write to the file for some reason 😅, ${err.message}`);
    }
}

const main = async () => {
    try {
        // This is the newer way of reading the file asynchronously and we dont need to manually wrap it into a promise like we had to in the previous version of node older than version 10
        const reading = await readFilePro(`${__dirname}/dog.txt`);
        // for multiple requests (Not working properly will look into it later)
        // const [reading] = await Promise.all([
        //     readFilePro(`${__dirname}/dog.txt`),
        //     readFilePro(`${__dirname}/dog.txt`),
        //     readFilePro(`${__dirname}/dog.txt`),
        //     readFilePro(`${__dirname}/dog.txt`)
        // ]);
        const {data} = await axios.get(`https://dog.ceo/api/breed/${reading}/images/random`);
        console.log(data.message);
        console.log(reading);
        console.log('*******************************');
        const writing = await writeFilePro(`${__dirname}/outputDog.txt`, data.message);
    }
    catch(err){
        // throw new Error(err);
        console.error(err.message);
    }
}

main();