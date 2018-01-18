var bulbs = ["rgb_bord", "rgb_seng", "rgb_reol"];
var names = ["Bord", "Reol", "Seng"];
var RGBButtons = $(".btn");
var Lights = {};
var btncreated = false;
var socket = io.connect('http://2.106.165.194');

  socket.on("LightsToClient", function (data) {
    console.log(data);
    Lights = data;
    init();
  });

function init(){
for (let i = 0; i < 3; i++) {
    var bulb =$("#"+bulbs[i] +" .fas");
    checkLights(bulb, i);
    setRGBValue(RGBButtons[i]);
    if(!btncreated){
    createBulbBtn(bulb, i);
    createRGBBtn(i);
    }
}
btncreated = true;
}

$("#flat").on("dragstop.spectrum", function(e, color) {
  for (let item = 0; item < RGBButtons.length; item++) {
    if (RGBButtons[item].classList.contains("btn-info")) {
      Lights[names[item]].RGB = color.toString();
    }
  }
  socket.emit("LightsToServer", Lights);
});
function createRGBBtn(i){
  RGBButtons.on("click", function () {
      if (this.classList.contains("btn-primary")) {
        $(".btn").removeClass("btn-info");
        $(".btn").addClass("btn-primary");
        this.classList.remove("btn-primary");
        this.classList.add("btn-info");
        setRGBValue(this);
      }
  });
}

function createBulbBtn(bulb, i){
  $("#"+bulbs[i]).on("click", function () {
  if (bulb.css("color") == "rgb(255, 255, 0)"){
     bulb.css("color", "white");
     Lights[names[i]].LightisOn = false;
  } 
  else {
    bulb.css("color", "yellow");
    Lights[names[i]].LightisOn = true;
    }
    socket.emit("LightsToServer", Lights);
  });
}

function checkLights(bulb, i){
  if(Lights[names[i]].LightisOn) {
    bulb.css("color", "yellow");
  } else if(!Lights[names[i]].LightisOn) {
    bulb.css("color", "white");
  }
}

function setRGBValue(index){
  if(index.classList.contains("btn-info")){
    $("#flat").spectrum("set", Lights[names[RGBButtons.index(index)]].RGB);
  }
}