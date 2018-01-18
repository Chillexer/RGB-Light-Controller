var fs = require('fs');
var express = require("express"), app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mqtt = require('mqtt');
var Lights = JSON.parse(fs.readFileSync(__dirname + "/files/Lights.json", "utf8"));
var options = JSON.parse(fs.readFileSync(__dirname + "/files/Login.json", "utf8"));
var client  = mqtt.connect('mqtt://192.168.1.55', options);

client.on('connect', function () {
    client.subscribe('topic/test');
  });
   
  client.on('message', function (topic, message) {
    // message is Buffer
    console.log(JSON.parse(message));
  });

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
            SendChange(GetChange(data));
            Lights = data;
            socket.broadcast.emit('LightsToClient', Lights);
        });
    });
});
function SendChange(item){
    client.publish('topic/test', JSON.stringify(item));
}

function GetChange(obj){
var keys = Object.keys(obj);
var counter = 0;
for (var index = 0; index < keys.length; index++) {
    var key = Object.keys(obj[keys[index]]);
    for (var i = 0; i <key.length; i++) {
        if(obj[keys[index]][key[i]]!== Lights[keys[index]][key[i]]) {
            var string = [keys[index] , key[i] , obj[keys[index]][key[i]]];
            return string;
        }   
    }   
}
}

server.listen(process.env.PORT,"192.168.1.55", function() {
    console.log("Server has started!");
});

