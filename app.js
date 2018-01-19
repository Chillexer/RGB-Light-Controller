var fs = require('fs');
var express = require("express"), app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mqtt = require('mqtt');
var Lights = JSON.parse(fs.readFileSync(__dirname + "/files/Lights.json", "utf8"));
var options = JSON.parse(fs.readFileSync(__dirname + "/files/Login.json", "utf8"));
var client  = mqtt.connect('mqtt://192.168.1.55', options);

client.on('connect', function () {
    client.subscribe("bord");
    client.subscribe("seng");
    client.subscribe("reol");
  });
   
  client.on('message', function (topic, message) {
    console.log(message.toString());
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
    if (item[2] == true){
        item[2] = 1;
    }else if(item[2] == false){
        item[2] = 0;
    }
    else{
        item[2] = item[2].replace("rgb(", "");
        item[2] = item[2].replace(")", "");
        item[2] = item[2].replace(" ", "");
        item[2] = item[2].replace(" ", "");
    }
    if(item[0] == "Bord"){
        client.publish('bord', JSON.stringify(item[2]));
    }
    else if( item[0] == "Seng"){
        client.publish('seng', JSON.stringify(item[2]));
    }
    else{
        client.publish('reol', JSON.stringify(item[2]));
    }
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

server.listen(4000, "192.168.1.55", function() {
    console.log("Server has started!");
});

