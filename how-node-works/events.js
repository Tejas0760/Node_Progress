const event = require('events');
const server = require('http').createServer();

class Events_Scr extends event{
    constructor(){
        super();
    }
}

const myEmitter = new Events_Scr();

myEmitter.on('request', () => {
    console.log('reponse received')
})
myEmitter.on('request', () => {
    console.log('2nd reponse received')
})
myEmitter.on('request', () => {
    console.log('3rd reponse received')
})

myEmitter.emit('request');

///////////////////////
// SERVER SIDE 

server.on('request', (req, res) => {
    console.log("Req received on the server side");
    server.emit('req2', req, res);
    res.end('Req received');
})

//the below line snippet of code will return an error because the response stream has ended by using the res.end already
//to solve this we can simple do another message instead of doing the same operation on the same message
// server.on('request', (req, res) => {
//     console.log("2nd Req received on the server side");
//     res.end('2nd Req received');
// })

// Solution 1


// will use this only as it avoids backbreak (when the server reads the files faster than the server can send those files or something like that)
server.on('req2', (req, res) => {
    console.log("2nd Req received on the server side");
    res.end('2nd Req received');
})
server.on('close', (req, res) => {
    console.log('server closed');
    res.end("Server closed");
})
server.listen(1234, '127.0.0.1', () => {
    console.log("Started listening for requests")
})