function init() {

	var mapObj = document.querySelector('.map');
	var sbarObj = document.querySelector('.sidebar');

	// toggle sidebar visibility on/off
	document.querySelector('.toggleSidebar').onclick = function(evt) {
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
	};

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

	addEvent(window, "resize", fixSidebar);

	function fixSidebar() {
		sbarObj.style.right = window.innerWidth - 280 + "px";
	}

	fixSidebar();


	var can = document.getElementById("canvas");
	var ctx = can.getContext("2d");

	ctx.strokeStyle = "#000000";
	ctx.lineWidth = "3";

	ctx.fillStyle = "rgba(255,0,0,1)";
	ctx.beginPath();
	ctx.drawEllipse(400, 250, 50, 0, Math.PI*2);
	ctx.moveTo(440, 250);
	ctx.drawEllipse(400, 250, 40, 0, Math.PI*2);
	ctx.fill("evenodd");
	ctx.closePath();
	ctx.stroke();
}















