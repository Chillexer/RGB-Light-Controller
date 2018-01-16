$("#flat").spectrum({
  preferredFormat: "rgb",
  flat: true,
  showInput: true,
});
$(".sp-button-container")[0].remove();
$(".sp-input")[0].style.padding = "0";
$(".sp-input")[0].style.border = "0";
$(".sp-input")[0].style.color = "white";
$(".sp-input")[0].style.textAlign = "center";
$("#flat").spectrum("set", Colors[0]);