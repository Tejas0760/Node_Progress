//importing some of the module needed for starting and learning purposes

// fs stands for file system module 
const fs = require('fs');
// http to create server for your code to run on 
const http = require('http'); 
// url to handel the url requests of the application
const url = require('url');


// const helloWorld = "Hello World via node js.";
// console.log(helloWorld);

//the below code will be executed in synchronous way so this will know as blocking code as it will take up the time until its finished executing 
/*
//to read a ceratin file
const textIn = fs.readFileSync('./txt/read-this.txt', 'utf-8');
console.log(textIn);

//to write to a certain file
const textOut = fs.writeFileSync('./txt/output.txt', `This is what we know about it so far: ${textIn}\nCreated on: ${Date.now()}`);
// if we use it again with the same file path it will simply override the previous text or anything inside that file in it.(***to avoid this you can simple use the appendFile instead of the writeFile)
console.log('Written to the file in txt');
*/

// To solve this problem of synchronos execution(blocking code) will we do it asynchronously(******* readfile instead of readfilesync *********)
// call back hell as seen eariler can be identified via this triangle shape its forming 
/*
fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
    fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
        fs.readFile(`./txt/append.txt`, 'utf-8', (err, data3) => {
            fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', (err) => {
                console.log('Done Writing the code into the required file!');
            })
        })
    })
});
// const read = fs.readFileSync('./txt/start.txt', 'utf-8');
// console.log(read);
console.log("Will read the files");
*/

/////////////////////////////////////////////
////// SERVER SIDE

/*
const serverPlay = http.createServer((req, res) => {
    res.end("Helllloooo There you sneaky head");
});
//listen specifies the port and ip on which it has to run on!
serverPlay.listen(6969, '127.0.0.1', () => {
    console.log("Listening to requests on the local server!");
});
*/




// now we'll create a simple api that will return the data that i have in this folder into the browser

const cards = fs.readFileSync(`${__dirname}/templates/product-card.html`, 'utf-8');
const overview = fs.readFileSync(`${__dirname}/templates/overview.html`, 'utf-8');
const productDeatils = fs.readFileSync(`${__dirname}/templates/product.html`, 'utf-8');

// async read file will not work? WHY?? (this is because while the data is being fetched it tried to parse it before that the dataObj thus parses null and returns an error)
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);
// console.log(dataObj);

const replaceTemplate = (el, product) => {
    let output =  el.replace(/{%PRODUCT_NAME%}/g, product.productName);
    output = output.replace(/{%Image%}/g,product.image);
    output = output.replace(/{%QUANTITY%}/g,product.quantity);
    output = output.replace(/{%PRICE%}/g,product.price);
    output = output.replace(/{%NUTRIENTS%}/g,product.nutrients);
    output = output.replace(/{%FROM%}/g,product.from);
    output = output.replace(/{%ID%}/g,product.id);
    if(!product.organic) output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic');
    return output;
}

const server = http.createServer((req, res) => {
    // res.end('Hello there');
    // const pathUrl = req.url;
    // console.log(url.parse(req.url, true));
    const {query, pathname} = url.parse(req.url, true);
    

    if(pathname === '/overview' || pathname === '/'){
        res.writeHead(200, {
            'Content-type': 'text/html'
        })

        const cardHtml = dataObj.map(el => replaceTemplate(cards, el));
        const output = overview.replace('{%PRODUCT_CARD%}', cardHtml);
        // console.log(cardHtml);
        res.end(output);
    }else if(pathname === '/product'){
        res.writeHead(200, {'Content-type': 'text/html'});
        const actualProduct = dataObj[query.id];
        const output = replaceTemplate(productDeatils, actualProduct);
        // console.log(output);
        res.end(output);
    }else if(pathname === '/about'){
        res.end('you can Not contace me heheheheeh!');
    }else{
        res.writeHead(404, {
            'Content-head': 'teri-ma-ki-chut'
        });
        res.end('<h1>Makelawde meri website break karekga<h1>');
    }
})

server.listen(6699, '127.0.0.1', () => {
    console.log('Listening to the server on port 6699');
})


