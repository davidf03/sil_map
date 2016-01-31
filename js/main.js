var mapObj = document.querySelector('.map');
var sbarObj = document.querySelector('.sidebar');

document.querySelector('.toggleSidebar').onclick = function(evt) {
	if (sbarObj.style.visibility === "visible") {
		sbarObj.style.visibility = "hidden";
		bars = document.getElementsByClassName('bar');
		for (var i = 0; i < 3; i++) {
			bars[i].style.backgroundColor = "#DCDCDC";
			bars[i].querySelector('div').style.backgroundColor = "#232323";
		}
	} else {
		sbarObj.style.visibility = "visible";
		bars = document.getElementsByClassName('bar');
		for (var i = 0; i < 3; i++) {
			bars[i].style.backgroundColor = "#232323";
			bars[i].querySelector('div').style.backgroundColor = "#DCDCDC";
		}
	}
};