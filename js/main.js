function init() {

	var can = document.getElementById("canvas");
	var ctx = can.getContext("2d");
	var fps = 60;

	// var mapObj = document.querySelector('.map');
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
	// document.querySelector('.toggleSidebar').onclick = function(evt) { toggleSidebar();};
	toggleSidebar();

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

	addEvent(window, "resize", fixSidebar);
	fixSidebar();

	var main = new Main();

	document.querySelector('.toggleSidebar').onclick = function(evt) {
		main.prepareAnim();
	};

	window.requestAnimFrame = (function(callback) {
		return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
		function(callback) {
			window.setTimeout(callback, 1000 / fps);
		};
	})();


	// ctx.fillStyle = '#00FF00';
	// ctx.beginPath();
	// ctx.moveTo(100, 100);
	// ctx.lineTo(200, 100);
	// ctx.lineTo(200, 200);
	// ctx.arc(100, 200, 100, 0, -0.5*Math.PI, true);
	// // ctx.arc(loc[this.lastNode.l_i].x + offset.x, loc[this.lastNode.l_i].y + offset.y, 2, 0, Math.PI*2);
	// ctx.closePath();
	// ctx.fill();

	/*var david = new Mon("Defed");
	david.segeHal();*/

	// ctx.strokeStyle = '#000000';
	// ctx.lineWidth = 5;
	// ctx.beginPath();
	// ctx.moveTo(0, 0);
	// ctx.lineTo(100, 10);
	// // ctx.lineWidth = 0;
	// // ctx.lineTo(100, 100);
	// ctx.closePath();
	// ctx.stroke();
	// // ctx.strokeStyle = '#000000';
	// // ctx.lineWidth = 5;
	// ctx.beginPath();
	// ctx.moveTo(100, 100);
	// ctx.lineWidth = 5;
	// ctx.lineTo(50, 100);
	// ctx.closePath();
	// ctx.stroke();
}
