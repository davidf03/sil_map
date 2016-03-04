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
}
