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
         // skal kunne køre en function der ændre farver udfra hvilken mode
         var key = Object.keys(data);
         Modes[key[0]] = data[key[0]];
         socket.broadcast.emit('LightSetting', Modes);
         socket.broadcast.emit('LightsToClient', Lights);
         if(data[key[0]]["mode"] == "fade"){
            fademode(data,key);
         }
         else if (data[key[0]]["mode"] == "pulse"){
             pulsemode(data, key);
         }
         else{
            var rgbarr = [key[0], "RGB", Lights[key[0]]];
            SendChange(rgbarr);
         }
        console.log(json);
    });
});

function SendChange(items){
    console.log(items);
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
    if(item[0] == "Bord"){
        console.log(JSON.stringify(item[2]));
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

async function pulsemode(data, key){

}
async function fademode(data, key){
    var seprgb = rgbseperator(Lights[key[0]]["RGB"]);
    var mappingvalue = seprgb[3];
    var schema = [[1,0],[2,1],[0,2]]
    var loc = false;
    while(Modes[key[0]]["mode"] == "fade" && Lights[key[0]]["LightisOn"]){
        for (let i = 0;i < 3;i++) {
            for (let it = 0; it < 255; it++) {
                if(Modes[key[0]]["mode"] != "fade" || !Lights[key[0]]["LightisOn"])
                return;
                if((seprgb[schema[i][0]] == it && seprgb[schema[i][1]] == 255) || loc){
                    if(!loc) console.log("found");
                    loc = true;
                    if(seprgb[schema[i][0]] == 255) continue;
                    seprgb[schema[i][0]] ++;
                    var send = "{\"LightisOn\":1,\"RGB\":[" + Math.round(seprgb[0] * sepgrp[3] / 255) +"," + Math.round(seprgb[1] * sepgrp[3] / 255) + "," + Math.round(seprgb[2] * sepgrp[3] / 255) + "]}"
                    client.publish(key[0].toLowerCase(),send);
                await sleep(50);
                }
            } 
            for (let it = 0; it < 255; it++) {
                if(Modes[key[0]]["mode"] != "fade" || !Lights[key[0]]["LightisOn"])
                return;
                if((seprgb[schema[i][1]] == it && seprgb[schema[i][0]] == 255) || loc){
                    if(!loc) console.log("found");
                    loc = true;
                    if(seprgb[schema[i][1]] == 0) continue;
                    seprgb[schema[i][1]] --;
                    var send = "{\"LightisOn\":1,\"RGB\":[" + Math.round(seprgb[0]  * sepgrp[3] / 255) +"," + Math.round(seprgb[1]  * sepgrp[3] / 255) + "," + Math.round(seprgb[2]  * sepgrp[3] / 255) + "]}"
                    client.publish(key[0].toLowerCase(),send);
                await sleep(50);
                }
            }      
                
        }
        console.log("test");
    }
    console.log("worked");
    return;
}

function rgbseperator(rgb){
    var r = parseInt(rgb.substring(4, rgb.indexOf(",")));
    rgb = rgb.substring(rgb.indexOf(",") + 1, rgb.length);
    var g = parseInt(rgb.substring(0, rgb.indexOf(","))); 
    rgb = rgb.substring(rgb.indexOf(",") + 1, rgb.length);
    var b = parseInt(rgb.substring(0, rgb.indexOf(")")));
    var highestval = [r,g,b];
    var values = [r,g,b,highestval.sort(sortNumber)[2]];
    values[0] = Math.round(map_range(r,0,values[3],0,255));
    values[1] = Math.round(map_range(g,0,values[3],0,255));
    values[2] = Math.round(map_range(b,0,values[3],0,255));
    return values;
}

function sortNumber(a,b) {
    return a - b;
}

function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

server.listen(4000, "192.168.1.55", function() {
    console.log("Server has started!");
});

