var fs = require('fs');
var express = require("express"), app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Lights = JSON.parse(fs.readFileSync(__dirname + "/files/Lights.json", "utf8"));

app.use(express.static(__dirname + "/public"));

//server.listen(80);

app.get("/", function (req, res) {
    res.render("index.html");
  });

 io.on('connection', function (socket) {
    socket.emit('LightsToClient', Lights);
    socket.on('LightsToServer', function (data) {
        var json = JSON.stringify(data);
        fs.writeFile(__dirname + '/files/Lights.json', json, 'utf8',function(){
            Lights = data;
            socket.broadcast.emit('LightsToClient', Lights);
        });
    });
});

server.listen(4000,"192.168.1.55", function() {
    console.log("Server has started!");
});

