var bulbs = ["rgb_bord", "rgb_seng", "rgb_reol"];
var Colors = ["rgb(255, 255, 255)", "rgb(255, 0, 0)", "rgb(0, 255, 0)"];
var RGBButtons = $(".btn");


bulbs.forEach(element => {
  document.getElementById(element).addEventListener("click", function () {
    var bulb = this.getElementsByClassName("fas")[0];
    if (bulb.style.color == "yellow") bulb.style.color = "white";
    else bulb.style.color = "yellow";
  });
});


for (let i = 0; i < RGBButtons.length; i++) {
  RGBButtons[i].addEventListener("click", function () {
    for (let item = 0; item < RGBButtons.length; item++) {
      if (RGBButtons[item] == this) {
        $("#flat").spectrum("set", Colors[item]);
        this.classList.remove("btn-primary");
        this.classList.add("btn-info");
      } else {
        RGBButtons[item].classList.remove("btn-info");
        RGBButtons[item].classList.add("btn-primary");
      }
    }
  });
}

$("#flat").on("dragstop.spectrum", function () {
  for (let item = 0; item < RGBButtons.length; item++) {
    if (RGBButtons[item].classList.contains("btn-info")) {
      console.log($("#flat").spectrum("get").toString());
      Colors[item] = $("#flat").spectrum("get");
    }
  }
});