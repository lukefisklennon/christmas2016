var c = document.getElementById("canvas");
var g = c.getContext("2d");
var w;
var h;

var resize = function() {
	c.width = window.innerWidth;
	c.height = window.innerHeight;
	w = c.width;
	h = c.height;
};
window.onresize = resize;
resize();

var update = function() {
	
	requestAnimationFrame(update);
};
requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.mozRequestAnimationFrame;
update();