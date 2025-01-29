const server = require('http').createServer();
const fs = require('fs');

server.on("request", (req, res) => {
    //three soltuions will only use one check the video for them
    // Solution 1 (Not a good solution)
      // fs.readFile("test-file.txt", (err, data) => {
      //   if (err) console.log(err);
      //   res.end(data);
      // });

    // Solution 2: Streams
      // this solution will create a back pressure meaning the stream wont be able to receive the data as fast the the server sending the data  
      // const readable = fs.createReadStream("test-file.txt");
      // readable.on("data", chunk => {
      //   res.write(chunk);
      // });
      // readable.on("end", () => {
      //   res.end();
      // });
      // readable.on("error", err => {
      //   console.log(err);
      //   res.statusCode = 500;
      //   res.end("File not found!");
      // });

    const readable = fs.createReadStream('test-file.txt');
    readable.pipe(res);
    // readableSource.pipe(writeableDest);
})

server.listen(1234, '127.0.0.1', () => {
    console.log('Reading the file');
})