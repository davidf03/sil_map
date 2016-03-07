var main = new Main();

function init() {
	main.genCharObj();

	var mapObj = document.querySelector('.map');
	var sbarObj = document.querySelector('.sidebar');

	// toggle sidebar visibility
	var toggleSidebar = function() {
		if (sbarObj.style.visibility === "visible") {
			sbarObj.style.visibility = "hidden";
			var bars = document.getElementsByClassName('bar');
			for (var i = 0; i < 3; i++) {
				bars[i].style.backgroundColor = "#DCDCDC";
				bars[i].querySelector('div').style.backgroundColor = "#232323";
			}
		} else {
			sbarObj.style.visibility = "visible";
			var bars = document.getElementsByClassName('bar');
			for (var i = 0; i < 3; i++) {
				bars[i].style.backgroundColor = "#232323";
				bars[i].querySelector('div').style.backgroundColor = "#DCDCDC";
			}
		}
	}
	document.querySelector('.toggleSidebar').onclick = function(evt) { toggleSidebar();};
	// toggleSidebar();

	//http://stackoverflow.com/a/3150139
	var addEvent = function(object, type, callback) {
	    if (object == null || typeof(object) == 'undefined') return;
	    if (object.addEventListener) {
	        object.addEventListener(type, callback, false);
	    } else if (object.attachEvent) {
	        object.attachEvent("on" + type, callback);
	    } else {
	        object["on"+type] = callback;
	    }
	};
	var fixSidebar = function() {
		sbarObj.style.right = window.innerWidth/window.getComputedStyle(document.querySelector('html'), null).getPropertyValue('font-size').match(/^[^A-Za-z]*/) - 20 +"em";
	};
	fixSidebar();
	addEvent(window, "resize", fixSidebar);

	var removeClass = function(e,c) {e.className = e.className.replace( new RegExp('(?:^|\\s)'+c+'(?!\\S)') ,'');};

	window.requestAnimFrame = (function(callback) {
		return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
		function(callback) {
			window.setTimeout(callback, 1000 / fps);
		};
	})();

	// toggleSidebar();
	// //
	// // console.log('hi');
	// var hexToRGB = function(h, alpha) {
	// 	if (typeof(alpha) === 'undefined') alpha = 1;
	// 	h = (h.charAt(0)=="#") ? h.substring(1,7):h;
	// 	var r = parseInt(h.substring(0,2),16);
	// 	var g = parseInt(h.substring(2,4),16);
	// 	var b = parseInt(h.substring(4,6),16);
	// 	return "rgba("+r+","+g+","+b+","+alpha+")";
	// }
	//
	// var canvas = document.getElementById('canvas');
	// var ctx = canvas.getContext('2d');
	//
	// // ctx.fillStyle = '#000000';
	// // ctx.beginPath();
	// // ctx.arc(0,0,200,0,Math.PI*2);
	// // ctx.closePath();
	// // ctx.fill();
	//
	// var p1 = new Point(50, 80);
	// var p2 = new Point(150, 80);
	//
	// var grd1 = ctx.createLinearGradient(p1.x,p1.y, p2.x,p2.y);
	// grd1.addColorStop(0, hexToRGB('#000000', 1));
	// // grd1.addColorStop(0.5, hexToRGB('#000000', 0.5));
	// grd1.addColorStop(1, hexToRGB('#000000', 0));
	//
	// var grd2 = ctx.createLinearGradient(p1.x,p1.y,p2.x,p2.y);
	// grd2.addColorStop(0, hexToRGB('#000000', 0));
	// // grd2.addColorStop(0.5, hexToRGB('#000000', 0.5));
	// grd2.addColorStop(1, hexToRGB('#000000', 1));
	//
	// ctx.fillStyle = grd1;
	// ctx.fillRect(p1.x, p1.y,100,50);
	// ctx.fillRect(p1.x, p1.y,100,50);
	// ctx.fillStyle = grd2;
	// ctx.fillRect(p1.x,p1.y+55, 100,50);
	//
	// ctx.fillStyle = grd1;
	// ctx.fillRect(p1.x,p1.y+120,100,50);
	// ctx.fillStyle = grd1;
	// ctx.fillRect(p1.x,p1.y+120,100,50);
	// ctx.fillStyle = grd2;
	// ctx.fillRect(p1.x,p1.y+120,100,50);
	// ctx.fillStyle = grd2;
	// ctx.fillRect(p1.x,p1.y+120,100,50);
	//
	// ctx.fillStyle = hexToRGB('#000000', 0.5);
	// ctx.fillRect(p1.x,p1.y+120,100,50);
	// ctx.fillRect(p1.x,p1.y+120,100,50);
}
