var fs = require('fs');
var express = require("express"), app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mqtt = require('mqtt');
var Lights = JSON.parse(fs.readFileSync(__dirname + "/files/Lights.json", "utf8"));
var options = JSON.parse(fs.readFileSync(__dirname + "/files/Login.json", "utf8"));
var client  = mqtt.connect('mqtt://192.168.1.55', options);
var Modes = {"Bord":{mode:"pulse"},"Seng":{mode:"none"}};


client.on('connect', function () {
    client.subscribe("bord");
    client.subscribe("seng");
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
    socket.emit('LightSetting', Modes);
    socket.emit('LightsToClient', Lights);
    socket.on('LightsToServer', function (data) {
        var json = JSON.stringify(data);
        fs.writeFile(__dirname + '/files/Lights.json', json, 'utf8',function(){
            SendChange(GetChange(data));
            Lights = data;
            socket.broadcast.emit('LightsToClient', Lights);
        });
    });
    socket.on('LightSetting', function (data){
        var json = JSON.stringify(data);
        console.log(json); // skal kunne køre en function der ændre farver udfra hvilken mode
        fademode(data);
    });
});

function SendChange(items){
    item = JSON.parse(JSON.stringify(items));
    if (item[2]["LightisOn"] == true){
        item[2]["LightisOn"] = 1;
    }else if(item[2]["LightisOn"] == false){
        item[2]["LightisOn"] = 0;
    }
    item[2]["RGB"]  =  item[2]["RGB"].match(/\d+/g);
    for (var index = 0; index < item[2]["RGB"].length; index++) {
        item[2]["RGB"][index] =  parseInt(item[2]["RGB"][index]);
    }
    console.log(JSON.stringify(item[2]));
    if(item[0] == "Bord"){
        client.publish('bord', JSON.stringify(item[2]));
    }
    else if( item[0] == "Seng"){
        client.publish('seng', JSON.stringify(item[2]));
    }
}

function GetChange(obj){
    var keys = Object.keys(obj);
    for (var index = 0; index < keys.length; index++) {
        var key = Object.keys(obj[keys[index]]);
        for (var i = 0; i <key.length; i++) {
            if(obj[keys[index]][key[i]]!= Lights[keys[index]][key[i]]) {
                var string = [keys[index] , key[i] , obj[keys[index]]];
                return string;
            }   
        }   
    }
}

//async function pulsemode(data){

//}
async function fademode(data){
    var key = Object.keys(data);
    console.log(key);
    var seprgb = rgbseperator(Lights[key[0]]["RGB"]);
    console.log(seprgb);
}

function rgbseperator(rgb){
    var r = parseInt(rgb.substring(4, rgb.indexOf(",")));
    rgb = rgb.substring(rgb.indexOf(",") + 1, rgb.length);
    var g = parseInt(rgb.substring(0, rgb.indexOf(","))); 
    rgb = rgb.substring(rgb.indexOf(",") + 1, rgb.length);
    var b = parseInt(rgb.substring(0, rgb.indexOf(")")));
    var highestval = [r,g,b];
    var values = [r,g,b,highestval.sort()[2]];
    return values;
}

server.listen(4000, "192.168.1.22", function() {
    console.log("Server has started!");
});

