var charConsole;
var target, end;

function Main() {
	targetIndex = 0;
	Detect = new Detect();
	moveQueue = new Array();
	alpha = {x:1, i:0};

	this.genLocDir();

	var i, j;
	locData = new Array();
	for (i = 0; i < locDir.length; i++) {
		locData.push([new Array(), new Array()]);
		for (j = 0; j < locDir[i].length; j++)
			locData[i][0].push([j + 1, false]);
		locData[i][1].push([j + 1, false]);
	}

	console.log(locData);
	console.log(timeDir);
	console.log(charDir);
	console.log(locDir);
	console.log(drawSequence);
	// console.log(testSequence);
	console.log(anc);
	console.log(bridge);

	// testArray = new Array();
	// for (i = 0; i < charDir.length; i++) {
	// 	testArray.push(new Array());
	// 	for (j = 0; j < charDir[i].length; j++) {
	// 		testArray[i].push([-1, -1]);
	// 	}
	// }

	now = timeDir.length - 1;
	for (i = 0; i < charDir.length; i++) {
		// charDir[i][0].generate(0, 2);
		for (j = 1; j < charDir[i].length; j++)
			charDir[i][j].generate(3, 2);
	}

	// var canvas = document.getElementById('canvas');
	// var ctx = canvas.getContext('2d');
	// ctx.drawImage(document.getElementById('location'),0,0);

	// for (i = 0; i < charDir.length; i++) {
	// 	for (j = 1; j < charDir[i].length; j++) {
	// 		console.log(
	// 			charDir[i][j].n0t1, charDir[i][j].n1t1,
	// 			charDir[i][j].n0t2, charDir[i][j].n1t2,
	// 			charDir[i][j].n0t2e, charDir[i][j].n1t2e
	// 		);
	// 		console.log(
	// 			charDir[i][j].n0g1, charDir[i][j].n1g1,
	// 			charDir[i][j].n0g2, charDir[i][j].n1g2,
	// 			charDir[i][j].n0e1, charDir[i][j].n1e1,
	// 			charDir[i][j].n0e2, charDir[i][j].n1e2
	// 		);
	// 	}
	// }
	// now = charDir.length - 1;
}
Main.prototype.genCharObj = function() {
	charConsole = document.querySelector('.charConsole .main');
	var template =
		"<div class='number'></div>" +
		"<div class='colour'></div>" +
		"<div class='name'></div>" +
		"<div class='controls'>" +
			// "<button class='i-prev icon-alone'>" +
			// 	"<span class='fa fa-step-backward'></span>" +
			// 	"<span class='screen-reader-text'>RSS</span>" +
			// "</button>" +
			"<button class='prev icon-alone'>" +
				"<span class='fa fa-play fa-rotate-180'></span>" +
				"<span class='screen-reader-text'>RSS</span>" +
			"</button>" +
			"<button class='toggle icon-alone'>" +
				"<span class='fa fa-circle'></span>" +
				"<span class='screen-reader-text'>RSS</span>" +
			"</button>" +
			"<button class='next icon-alone'>" +
				"<span class='fa fa-play'></span>" +
				"<span class='screen-reader-text'>RSS</span>" +
			"</button>" +
			// "<button class='i-next icon-alone'>" +
			// 	"<span class='fa fa-step-forward'></span>" +
			// 	"<span class='screen-reader-text'>RSS</span>" +
			// "</button>" +
		"</div>";

	var charConsole = document.querySelector('.charConsole .main');
	for (var i = 0; i < charDir.length; i++) {
		var char = document.createElement('div');
		char.className = 'char';
		char.dataset.index = i;
		char.innerHTML = template;
		charConsole.appendChild(char);

		char.querySelector('.toggle').onclick = function(e) {
			main.toggleChar(this.parentNode.parentNode.dataset.index);
		};
		char.querySelector('.prev').onclick = function(e) {
			main.targetPrev(this.parentNode.parentNode.dataset.index, false);
		};
		char.querySelector('.next').onclick = function(e) {
			main.targetNext(this.parentNode.parentNode.dataset.index, false);
		};
		this.evalState(i);
	}

	this.redraw();
}

//http://stackoverflow.com/questions/18949122/javascript-canvas-change-the-opacity-of-image
//for focus stuff, see second answer on saving and restoring canvas state

Main.prototype.redraw = function() {
	var i, j;
	var active = false;
	var iLen = anc.length;
	//anchors
	for (i = 0; i < iLen; i++) {
		if (0 !== anc[i].i) {
			anc[i].x += anc[i].i;
			active = true;
		}
		if (1 <= anc[i].x) {
			anc[i].x = 1;
			anc[i].i = 0;
		} else if (0 >= anc[i].x) {
			anc[i].x = 0;
			anc[i].i = 0;
		}
	}
	//bridges
	for (i = 0; i < iLen; i++) {
		if (0 !== bridge[i].i) {
			bridge[i].x += bridge[i].i;
			active = true;
			if (0 < bridge[i].i) {
				if (1 <= bridge[i].x || bridge[i].x >= bridge[i].e) {
					bridge[i].x = bridge[i].e;
					bridge[i].i = 0;
				}
			} else {
				if (0 >= bridge[i].x && 0 >= bridge[i].e) {
					if (target < now && (end && timeDir[target][1][1] < Detect.findInterval(now, false, target) || false === end && 0 < Detect.findInterval(now, false, target))) {
						now--;
						bridge[i].x = 1;
					} else {
						bridge[i].x = 0;
					}
					bridge[i].i = 0;
				} else if (bridge[i].x <= bridge[i].e) {
					bridge[i].x = bridge[i].e;
					bridge[i].i = 0;
				}
			}
		}
	}
	//riftBridge
	if (0 !== riftBridge.i) {
		riftBridge.x += riftBridge.i;
		active = true;
		if (0 < riftBridge.i) {
			if (1 <= riftBridge.x || riftBridge.x >= riftBridge.e) {
				riftBridge.x = 1;
				riftBridge.i = 0;
			}
		} else {
			if (0 >= riftBridge.x || riftBridge.x <= riftBridge.e) {
				riftBridge.x = 0;
				riftBridge.i = 0;
			}
		}
	}
	//location data
	for (i = 0; i < locData.length; i++) {
		if (Detect.isPresent(locDir[i][0][0], locDir[i][0][1])) {
			locData[i][0][0][0] = anc[locDir[i][0][0]].x;
			if (0 !== anc[locDir[i][0][0]].i)
				locData[i][0][0][1] = true;
				else locData[i][0][0][1] = false;
			for (j = 1; j < locData[i][0].length; j++) {
				if (Detect.isPresent(locDir[i][j][0], locDir[i][j][1])) {
					locData[i][0][j][0] = locData[i][0][j - 1][0] + anc[locDir[i][j][0]].x;
					if (locData[i][0][j - 1][1] || 0 !== anc[locDir[i][j][0]].i)
						locData[i][0][j][1] = true;
						else locData[i][0][j][1] = false;
				} else {
					break;
				}
			}
			locData[i][1][0] = locData[i][0][j - 1][0];
			locData[i][1][1] = locData[i][0][j - 1][1];
		} else {
			locData[i][1][0] = 0;
			locData[i][1][1] = false;
		}
	}
	//activating movement
	//rift:Boolean, caller/riftInc:uint/float, trigger:float, called:uint, increment:float, extent:float
	while (0 < moveQueue.length) {
		if (now < moveQueue[0][3]) {
			//forward movement
			var rift = moveQueue[0][0];
			if (false === rift) {
				var csi = moveQueue[0][1];
				var cci = timeDir[csi][0][0];
				var cni = timeDir[csi][0][1];
			}
			if (rift && 1 <= riftBridge.x || false === rift && now >= csi && ((bridge[cci].x >= moveQueue[0][2] || bridge[cci].x >= bridge[cci].e) || cni + 1 < charDir[cci].length && now >= charDir[cci][cni + 1].s_i)) {
				// console.log(moveQueue[0]);
				var tsi = moveQueue[0][3];
				bridge[timeDir[tsi][0][0]].i = moveQueue[0][4];
				bridge[timeDir[tsi][0][0]].e = moveQueue[0][5];
				// if (moveQueue[0][0])
					bridge[timeDir[tsi][0][0]].x = 0;
				// else
				// 	bridge[timeDir[tsi][0][0]].x = (bridge[timeDir[csi][0][0]].x - moveQueue[0][2])*timeDir[csi][1][1]/timeDir[tsi][1][1];
				if (1 < moveQueue.length && moveQueue[1][0] /*&& 0 < timeDir[moveQueue[1][3]][1][0]*/ && tsi + 1 < timeDir.length) {
					active = true;
					riftBridge.i = moveQueue[1][1];
					riftBridge.e = 1;
					// if (0 >= riftBridge.x || 1 <= riftBridge.x)
						riftBridge.x = 0;
						// riftBridge.x = bridge[timeDir[tsi][0][0]].x*timeDir[tsi][1][1]/Detect.findInterval(tsi + 1, false, tsi);
				}
				now++;
				moveQueue.splice(0,1);
			} else {
				break;
			}
		}
		else {
			//backwards movement
			var rift = moveQueue[0][0];
			if (false === rift) {
				var csi = moveQueue[0][1];
				var cci = timeDir[csi][0][0];
				var cni = timeDir[csi][0][1];
			}
			if (rift && 0 >= riftBridge.x || false === rift && (now < csi || (now <= csi || charDir[cci].length <= cni + 1 || now < charDir[cci][cni + 1].s_i) && (bridge[cci].x <= moveQueue[0][2] || bridge[cci].x <= bridge[cci].e))) {
				// if (rift) {
				// 	console.log(rift);
				// 	console.log(riftBridge.x);
				// } else {
				// 	console.log(rift);
				// 	console.log(now+" <= "+csi);
				// 	console.log(bridge[cci].x+" <= "+moveQueue[0][2]);
				// 	console.log(bridge[cci].x+" <= "+bridge[cci].e);
				// 	console.log("0 < "+cni);
				// 	if (0 < cni) {
				// 		console.log(now+" <= "+charDir[cci][cni - 1].s_i);
				// 	}
				// }
				// console.log(moveQueue[0]);
				var tsi = moveQueue[0][3];
				bridge[timeDir[tsi][0][0]].i = moveQueue[0][4];
				bridge[timeDir[tsi][0][0]].e = moveQueue[0][5];
				// if (moveQueue[0][0])
					bridge[timeDir[tsi][0][0]].x = 1;
				// else
				// 	bridge[timeDir[tsi][0][0]].x = (bridge[timeDir[csi][0][0]].x - moveQueue[0][2])*timeDir[csi][1][1]/timeDir[tsi][1][1];
				if (1 < moveQueue.length && moveQueue[1][0] /*&& 0 < timeDir[moveQueue[1][3]][1][0]*/) {
					active = true;
					riftBridge.i = moveQueue[1][1];
					riftBridge.e = 0;
					// if (0 >= riftBridge.x || 1 <= riftBridge.x)
					var riftDuration = Detect.findInterval(moveQueue[1][3] + 1, false, moveQueue[1][3]) - timeDir[moveQueue[1][3]][1][1] + timeDir[moveQueue[1][3] + 1][1][1];
						riftBridge.x = (riftDuration - timeDir[moveQueue[1][3] + 1][1][1]*(1 - bridge[timeDir[moveQueue[1][3] + 1][0][0]].x)) / riftDuration;
						// riftBridge.x = bridge[timeDir[tsi][0][0]].x*timeDir[tsi][1][1]/Detect.findInterval(tsi + 1, false, tsi);
				}
				moveQueue.splice(0,1);
			} else {
				break;
			}
		}
	}

	//clearing intermediate canvases
	var test = document.getElementById('test');
	var testctx = test.getContext('2d');
	testctx.clearRect(0,0,test.width,test.height);
	var update = document.getElementById('update');
	var upctx = update.getContext('2d');
	upctx.clearRect(0,0,update.width,update.height);
	var lines = document.getElementById('lines');
	var linectx = lines.getContext('2d');
	linectx.clearRect(0,0,lines.width,lines.height);
	var paths = document.getElementById('paths');
	var pathctx = paths.getContext('2d');
	pathctx.clearRect(0,0,paths.width,paths.height);
	var location = document.getElementById('location');
	var locctx = location.getContext('2d');
	locctx.clearRect(0,0,location.width,location.height);

	//updating
	// if (active) {
	// 	for (i = 0; i <= now; i++) {
	// 		if (0 < timeDir[i][0][1]) {
	// 			charDir[timeDir[i][0][0]][timeDir[i][0][1]].generate(3, 2);
	// 		}
	// 		// else charDir[timeDir[i][0][0]][timeDir[i][0][1]].generate(0, 2);
	// 	}
	// } else { //forces recalculation in the last frame for lack of subtlty
		upctx.globalAlpha = alpha.x;
		for (i = 0; i <= now; i++) {
			if (0 < timeDir[i][0][1]) {
				charDir[timeDir[i][0][0]][timeDir[i][0][1]].generate(3, 2);
				upctx.drawImage(paths,0,0);
				pathctx.clearRect(0,0,paths.width,paths.height);
			}
			// else { charDir[timeDir[i][0][0]][timeDir[i][0][1]].generate(0, 2);}
		}
		upctx.globalAlpha = 1;
	// }
	iLen = drawSequence.length;
	var jLen;
	for (i = 0; i < iLen; i++) {
		jLen = drawSequence[i].length;
		for (j = 0; j < jLen; j++) {
			if (now >= charDir[drawSequence[i][j][0]][drawSequence[i][j][1]].s_i) {
				charDir[drawSequence[i][j][0]][drawSequence[i][j][1]].generate(drawSequence[i][j][2], 0);
			} else { break;}
		}
		upctx.globalAlpha = alpha.x;
		upctx.drawImage(location,0,0);
		upctx.globalAlpha = 1;
		locctx.clearRect(0,0,location.width,location.height);
	}

	//drawing
	var can = document.getElementById('canvas');
	var ctx = can.getContext('2d');
	ctx.clearRect(0,0,can.width,can.height);
	// this.visLoc();
	// ctx.drawImage(paths, 0, 0);
	ctx.drawImage(update, 0, 0);
	ctx.drawImage(test, 0, 0);
	// ctx.globalAlpha = 0.35;
	// ctx.drawImage(lines, 0, 0);
	// ctx.globalAlpha = 1;

	//updating movement buttons (indelicate, but inexpensive)
	for (i = 0; i < charDir.length; i++)
		this.evalState(i);

	if (active && false === idle)
		requestAnimFrame(this.redraw.bind(this));
	else {
		this.revertMoveButtons();
		idle = true;
	}
}
Main.prototype.removeClass = function(e,c) {e.className = e.className.replace( new RegExp('(?:^|\\s)'+c+'(?!\\S)') ,'');}
Main.prototype.toggleChar = function(c_i) {
	var toggle = document.querySelector('[data-index="'+c_i+'"] .toggle span');
	if (1 <= anc[c_i].x || 0 < anc[c_i].i) {
		this.removeClass(toggle, "fa-circle");
		toggle.className += " fa-circle-o";
		anc[c_i].i = -60/1000*anc[c_i].x*visSpeed;
	} else {
		this.removeClass(toggle, "fa-circle-o");
		toggle.className += " fa-circle";
		anc[c_i].i = 60/1000*(1 - anc[c_i].x)*visSpeed;
	}
	// anc[0].f = 1/visEase;
	if (idle) {
		requestAnimFrame(this.redraw.bind(this));
		idle = false;
	}
	this.evalState(c_i);
}

/* time stuff */
Main.prototype.evalState = function(c_i) {
	var next = document.querySelector('[data-index="'+c_i+'"] .next');
	if (charDir[c_i].length > 1 && (1 > bridge[c_i].x || now < charDir[c_i][charDir[c_i].length - 1].s_i) && (0 < anc[c_i].i || 0 === anc[c_i].i && 1 === anc[c_i].x)) {
		next.style.color = null;
		next.disabled = false;
	} else {
		next.style.color = "#787878";
		next.disabled = true;
	}
	var prev = document.querySelector('[data-index="'+c_i+'"] .prev');
	if (charDir[c_i].length > 1 && now >= charDir[c_i][0].s_i && (0 < Detect.findInterval(now, false, charDir[c_i][0].s_i) || 0 < bridge[timeDir[now][0][0]].x && 0 < timeDir[now][1][1]) && (0 < anc[c_i].i || 0 === anc[c_i].i && 1 === anc[c_i].x)) {
		prev.style.color = null;
		prev.disabled = false;
	} else {
		prev.style.color = "#787878";
		prev.disabled = true;
	}
}
Main.prototype.revertMoveButtons = function() {
	var buttons = document.querySelectorAll('.next .fa-step-forward');
	for (var i = 0; i < buttons.length; i++) {
		this.removeClass(buttons[i], "fa-step-forward");
		this.removeClass(buttons[i], "fa-play");
		buttons[i].className += " fa-play";
		buttons[i].parentNode.onclick = null;
		buttons[i].parentNode.onclick = function(e) {
			main.targetNext(this.parentNode.parentNode.dataset.index, false);
		}
	}
	buttons = document.querySelectorAll('.prev .fa-step-forward');
	for (var i = 0; i < buttons.length; i++) {
		this.removeClass(buttons[i], "fa-step-forward");
		this.removeClass(buttons[i], "fa-play");
		buttons[i].className += " fa-play";
		buttons[i].parentNode.onclick = null;
		buttons[i].parentNode.onclick = function(e) {
			main.targetPrev(this.parentNode.parentNode.dataset.index, false);
		}
	}
}

Main.prototype.pause = function() {
	moveQueue = new Array();
	for (var i = 0; i < bridge.length; i++)
		bridge[i].i = 0;
	riftBridge.i = 0;

	// if (now + 1 < timeDir.length) {
	// 	charDir[timeDir[now + 1][0][0]][timeDir[now + 1][0][1]].movementNext(false);}
	// var held = 2;
	// for (var i = 0; i < charDir.length; i++) {
	// 	for (var j = charDir[i].length - 1; j >= 0; j--) {
	// 		if (charDir[i][j].s_i <= now) {
	// 			charDir[i][j].movementNext(false);
	//
	// 			for (var k = now + held; k < timeDir.length; k++, held++) {
	// 				if (Detect.isWithin(k, charDir[i][j].s_i, 0)) {
	// 					charDir[timeDir[k][0][0]][timeDir[k][0][1]].movementNext(false);
	// 				} else {
	// 					break;}
	// 			}
	// 			break;
	// 		}
	// 	}
	// }
}
Main.prototype.targetNext = function(c_i, direct) {
	this.pause();
	this.revertMoveButtons();
	var i;
	for (i = charDir[c_i].length - 1; i >= 0; i--)
		if (charDir[c_i][i].s_i <= now) {
			target = charDir[c_i][i].s_i;
			if (bridge[c_i].x < 1)
				end = true;
			else
				if (i + 1 < charDir[c_i].length) {
					target = charDir[c_i][i + 1].s_i;
					end = false;
				}
			break;
		}

	var button = document.querySelector('[data-index="'+c_i+'"] .next');
	button.onclick = null;
	button.onclick = function(e) {
		main.targetNext(this.parentNode.parentNode.dataset.index, true);
	}
	button = button.querySelector('span');
	this.removeClass(button, "fa-play");
	this.removeClass(button, "fa-step-forward");
	button.className += " fa-step-forward";

	if (direct) {
		this.instant(c_i);
		if (idle) this.redraw();
	} else {
		this.continuousNext(c_i);
	}
}
Main.prototype.targetPrev = function(c_i, direct) {
	this.pause();
	this.revertMoveButtons();

	var i;
	var found = false;
	for (i = charDir[c_i].length - 1; i >= 0; i--)
		if (charDir[c_i][i].s_i <= now) {
			if (bridge[c_i].x > 0 && bridge[c_i].x < 1 || bridge[c_i].x >= 1 && Detect.isWithin(now, charDir[c_i][i].s_i, 0)) {
				target = charDir[c_i][i].s_i;
				//(extra) logic below provides for last index ending movement before others, going to end rather than beginning
				var last = true;
				for (var j = 0; j < charDir.length; j++)
					if (j != c_i && now >= charDir[j][charDir[j].length - 1].s_i && Detect.isWithin(target, charDir[j][charDir[j].length - 1].s_i, 2, 1, false)) {
						last = false;
						break;
					}
				if (last) end = false;
					else end = true;
				found = true;
			} else if (bridge[c_i].x >= 1) {
				target = charDir[c_i][i].s_i;
				end = true;
				found = true;
			} else if (i > 0) {
				target = charDir[c_i][i - 1].s_i;
				if (Detect.isWithin(now, target)) end = false;
					else end = true;
				found = true;
			}
			break;
		}

	var button = document.querySelector('[data-index="'+c_i+'"] .prev');
	button.onclick = null;
	button.onclick = function(e) {
		main.targetPrev(this.parentNode.parentNode.dataset.index, true);
	}
	button = button.querySelector('span');
	this.removeClass(button, "fa-play");
	this.removeClass(button, "fa-step-forward");
	button.className += " fa-step-forward";

	if (found) {
		if (direct) {
			this.instant(c_i)
			if (idle) this.redraw();
		} else {
			this.continuousPrev(c_i);
		}
	}
}
Main.prototype.instant = function(c_i) {
	this.pause();
	this.revertMoveButtons();

	var i, j, within = 0;
	if (timeDir[target][0][1] < charDir[c_i].length) {
		var hit = new Array();
		for (i = 0; i < charDir.length; i++) {
			bridge[i].x = 1;
			hit.push(0);
		}
		hit[c_i] = 1;
		if (false === end) bridge[c_i].x = 0;
			else bridge[c_i].x = 1;
		for (i = target + 1; i < timeDir.length; i++) {
			var interval = Detect.findInterval(i, false, target);
			if (end && interval <= timeDir[target][1][1] || false === end && 0 === interval) {
				within++;
				hit[timeDir[i][0][0]] = 1;
				if (end) {
					if (interval + timeDir[i][1][1] > timeDir[target][1][1]) {
						bridge[timeDir[i][0][0]].x = (timeDir[target][1][1] - interval) / timeDir[i][1][1];
					}
				} else {
					bridge[timeDir[i][0][0]].x = 0;
				}
			} else {
				break;
			}
		}
		for (j = 0; j < hit.length; j++)
			if (0 === hit[j]) {
				if (end) intEnd = timeDir[target][1][1];
					else intEnd = 0;
				for (i = target - 1; i >= 0; i--) {
					interval = Detect.findInterval(target, false, i) + intEnd;
					if (0 === hit[timeDir[i][0][0]]) {
						hit[timeDir[i][0][0]] = 1;
						if (interval < timeDir[i][1][1])
							bridge[timeDir[i][0][0]].x = interval / timeDir[i][1][1];
						for (j = 0; j < hit.length; j++)
							if (0 === hit[j]) break;
						if (hit.length <= j) break;
					}
				}
				break;
			}
		target += within;
	}
	now = target;
}
Main.prototype.continuousNext = function(c_i) {
	this.pause();
	idle = true; //sufficient?

	//resume active indices
	//start building moveQueue from actives in ascending order
	//every time an item is added to moveQueue, the earliest potential next index is bumped to one past it > riftIndex
	//moveQueue index contains rift Boolean, caller index, trigger, called index, increment, extent
	//if candidate reaches the riftIndex
	//
	moveQueue = new Array();

	var i, j;
	var active = new Array();
	for (i = 0; i < charDir.length; i++)
		if (1 > bridge[i].x)
			for (j = charDir[i].length - 1; j >= 0; j--)
				if (now >= charDir[i][j].s_i) {
					active.push(charDir[i][j].s_i);
					bridge[i].i = (60/1000)*movSpeed / timeDir[charDir[i][j].s_i][1][1];
					bridge[i].e = this.getExtentNext(charDir[i][j].s_i, target, end);
					break;
				}
	active.sort(function(a,b){return a - b}); //sorts in ascending order

	var riftIndex = now + 1
	var pastLimit = false;
	for (i = 0; i < active.length; i++) {
		for (j = riftIndex; j < timeDir.length; j++) {
			if (j <= target || false == end && Detect.findInterval(j, false, target) <= 0 || end && Detect.isWithin(j, target, 0)) {
				if (Detect.isWithin(j, active[i], 0)) {
					if (0 >= timeDir[j][1][1]) var inc = 1;
						else inc = (60/1000)*movSpeed / timeDir[j][1][1];
					moveQueue.push([ false, active[i], Detect.findInterval(j, false, active[i])/timeDir[active[i]][1][1], j, inc, this.getExtentNext(j, target, end) ]);
					// console.log(j+":"+timeDir[j][0][0]+":"+timeDir[j][0][1]);
				} else {
					break;
				}
			} else {
				pastLimit = true;
				break;
			}
		}
		riftIndex = j;
		if (pastLimit) break;
	}

	//rift:Boolean, caller/riftInc:uint/float, trigger:float, called:uint, increment:float, extent:float
	pastLimit = false;
	for (i = now + 1; i < timeDir.length; i++) {
		if (i <= target || false === end && Detect.findInterval(i, false, target) <= 0 || end && Detect.isWithin(i, target, 0)) {
			if (i === riftIndex) {
				if (0 >= timeDir[i][1][1])
					var  inc = 1;
					else inc = (60/1000)*movSpeed / timeDir[i][1][1];
				moveQueue.push([ true, (60/1000)*movSpeed / Detect.findInterval(i, false, i - 1), 1, i, inc, this.getExtentNext(i, target, end) ]);
				// if (1 <= riftBridge)
				riftBridge.x = 0;
				if (1 >= moveQueue.length) {
					// console.log("riftIndex: "+riftIndex);
					// console.log('initial rift');
					riftBridge.i = moveQueue[0][1];
					riftBridge.e = 1;
				}
				riftIndex++;
			}
			for (j = riftIndex; j < timeDir.length; j++) {
				if (j <= target || false === end && Detect.findInterval(j, false, target) <= 0 || end && Detect.isWithin(j, target, 0)) {
					if (Detect.isWithin(j, i, 0)) {
						// if (0 >= timeDir[j][1][0]) { //this probably doesn't matter while riftIndex mediates loop incrementing
							if (0 >= timeDir[j][1][1])
								var  inc = 1;
								else inc = (60/1000)*movSpeed / timeDir[j][1][1];
							moveQueue.push([ false, i, Detect.findInterval(j, false, i)/timeDir[i][1][1], j, inc, this.getExtentNext(j, target, end) ]);
						// }
					} else {
						break;
					}
				} else {
					pastLimit = true;
					break;
				}
			}
			riftIndex = j;
			if (pastLimit) break;
		} else {
			break;
		}
	}

	// for (i = 0; i < moveQueue.length; i++)
	// 	console.log(moveQueue[i]);

	idle = false;
	this.redraw();
}
Main.prototype.getExtentNext = function(s_i) {
	//this won't work for backwards movement
	if (0 < timeDir[s_i][1][1]) {
		if (end) {
			if (target === s_i) {
				var extent = timeDir[target][1][1];
			} else if (Detect.isWithin(s_i, target, 2)) {
				extent = timeDir[s_i][1][1];
			} else {
				if (target < s_i) extent = timeDir[target][1][1] - Detect.findInterval(s_i, false, target);
				else extent = timeDir[target][1][1] + Detect.findInterval(target, false, s_i);
			}
		} else {
			if (target === s_i) {
				extent = 0;
			} else if (Detect.isWithin(s_i, target, 2, 0)) {
				extent = timeDir[s_i][1][1];
			} else {
				if (target < s_i) extent = 0;
				else extent = Detect.findInterval(target, false, s_i);
			}
		}
		return extent/timeDir[s_i][1][1];
	} else {
		return 1;
	}
}
Main.prototype.continuousPrev = function(c_i) {
	this.pause();
	idle = true;
	//create active
		//any instant durations at present, including 0 bridges, are automatically rolled back
		//order indices based on latest activity
	//create moveQueue
		//collect every relevant index
			//indices not suspended from target are not included
		//order indices based on latest activity
		//define callers
			//rifts are defined similar to forwards, an index pushed as the array is traversed: encountering it prepares a rift
			//this and the other should work the same in that they ought to be made to have characters call themselves when chaining
			//rifts ought to be unified forwards and backwards. not sure how

	var i, j;
	var active = new Array();
	var rollBack = 0;
	if (timeDir.length > now + 1 || 1 > now*bridge[timeDir[now][0][0]].x) {
	//rifts are unaccounted for, and will be probably until rift conversion is implemented (an else if would likely suffice)
		var nowTotal = timeDir[now][1][1]*bridge[timeDir[now][0][0]].x + Detect.findInterval(now, false, 0);
	} else { //provisional stuff for when now*bridge is not actually 'now'
		nowTotal = timeDir[now][1][1] + Detect.findInterval(now, false, 0);
		var last = now;
		for (i = 0; i < charDir.length; i++) {
			var index = charDir[i][charDir[i].length - 1].s_i;
			var indexEnd = timeDir[index][1][1] + Detect.findInterval(index, false, 0);;
			if (nowTotal < indexEnd)
				nowTotal = indexEnd, last = index;
		}
		nowTotal = timeDir[last][1][1]*bridge[timeDir[last][0][0]].x + Detect.findInterval(last, false, 0);
	}
	//collecting active indices
	for (i = 0; i < charDir.length; i++)
		for (j = charDir[i].length - 1; j >= 0; j--)
			if (now >= charDir[i][j].s_i) {
				if (0 >= bridge[i].x || 0 >= timeDir[charDir[i][j].s_i][1][1] && 0 >= Detect.findInterval(now, false, charDir[i][j].s_i)) {
					rollBack++;
					bridge[i].x = 1;
					for (j -= 1; j >= 0; j--) {
						if (0 >= Detect.findInterval(now, false, charDir[i][j].s_i)) rollBack++;
							else break;
					}
				}
				if (1 > bridge[i].x || 0 <= j && nowTotal <= timeDir[charDir[i][j].s_i][1][1] + Detect.findInterval(charDir[i][j].s_i, false, 0)) {
					active.push(charDir[i][j].s_i);
					bridge[i].i = -(60/1000)*movSpeed / timeDir[charDir[i][j].s_i][1][1];
					bridge[i].e = this.getExtentPrev(charDir[i][j].s_i, target, end);
				}
				break;
			}
	active.sort(function(a,b){return b - a});
	now -= rollBack;

	//collecting indices for moveQueue
	moveQueue = new Array();
	for (i = now; i >= target; i--) {
		var indexTotal = timeDir[i][1][1] + Detect.findInterval(i, false, target);
		if (false === end && 0 < indexTotal || end && indexTotal > timeDir[target][1][1]) {
			if (0 >= timeDir[i][1][1]) var inc = -1;
				else inc = -(60/1000)*movSpeed / timeDir[i][1][1];
			moveQueue.push([ false, 0, 0, i, inc, this.getExtentPrev(i, target, end) ]);
		} else {
			break;
		}
	}
	var targetBase = Detect.findInterval(target, false, 0);
	for (i = 0; i < charDir.length; i++)
		if (i !== c_i/* && 1 <= bridge[i].x*/)
			for (j = charDir[i].length - 1; j >= 0; j--)
				if (target > charDir[i][j].s_i) {
					if (0 < timeDir[charDir[i][j].s_i][1][1]) {
						var indexTotal = timeDir[charDir[i][j].s_i][1][1] + Detect.findInterval(charDir[i][j].s_i, false, 0);
						if (end && indexTotal - (targetBase + timeDir[target][1][1]) > 0 || false === end && indexTotal - targetBase > 0) {
							var inc = -(60/1000)*movSpeed / timeDir[charDir[i][j].s_i][1][1];
							moveQueue.push([ false, 0, 0, charDir[i][j].s_i, inc, this.getExtentPrev(charDir[i][j].s_i, target, end) ]);
						}
					}
					break;
				}
	//sorting into descending order by latest activity
	moveQueue.sort(function(a,b){
		var result = (timeDir[b[3]][1][1] + Detect.findInterval(b[3], false, 0)) - (timeDir[a[3]][1][1] + Detect.findInterval(a[3], false, 0));
		if (0 === result) return b[3] - a[3];//deferring to the later index
			else return result;
	});
	moveQueue.splice(0, active.length);//ideally they wouldn't be added in the first place

	//priming moveQueue indices
	//active stems
	var riftIndex = 0;
	for (i = 0; i < active.length; i++) {
		var callerBase = Detect.findInterval(active[i], false, 0);
		for (j = riftIndex; j < moveQueue.length; j++) {
			var ici = timeDir[moveQueue[j][3]][0][0];
			var ini = timeDir[moveQueue[j][3]][0][1];
			if (charDir[ici].length > ini + 1 && timeDir[moveQueue[j][3]][1][1] >= Detect.findInterval(charDir[ici][ini + 1].s_i, false, charDir[ici][ini].s_i)) {
				moveQueue[j][1] = charDir[ici][ini + 1].s_i;
				moveQueue[j][2] = 0;
			} else {
				var indexTotal = timeDir[moveQueue[j][3]][1][1] + Detect.findInterval(moveQueue[j][3], false, 0);
				if (indexTotal >= callerBase) {
					moveQueue[j][1] = active[i];
					moveQueue[j][2] = (indexTotal - callerBase)/timeDir[active[i]][1][1];
				} else {
					break;
				}
			}
		}
		riftIndex = j;
	}
	//moveQueue stems
	for (i = 0; i < moveQueue.length; i++) {
		if (moveQueue.length > riftIndex) {
			if (i === riftIndex) {
				moveQueue[i][0] = true;
				moveQueue[i][2] = 0;
				var riftDuration = (Detect.findInterval(moveQueue[i][3] + 1, false, moveQueue[i][3]) - timeDir[moveQueue[i][3]][1][1] + timeDir[moveQueue[i][3] + 1][1][1]);
				moveQueue[i][1] = -(60/1000)*movSpeed / riftDuration;
				// if (0 >= riftBridge)
				if (0 === i) {
					// console.log("rift");
					riftBridge.x = (riftDuration - timeDir[moveQueue[i][3] + 1][1][1]*(1 - bridge[timeDir[moveQueue[i][3] + 1][0][0]].x)) / riftDuration;
					riftBridge.i = moveQueue[0][1];
					riftBridge.e = 0;
				}
				riftIndex++;
			}
			var callerBase = Detect.findInterval(moveQueue[i][3], false, 0);
			for (j = riftIndex; j < moveQueue.length; j++) {
				var ici = timeDir[moveQueue[j][3]][0][0];
				var ini = timeDir[moveQueue[j][3]][0][1];
				if (charDir[ici].length > ini + 1 && timeDir[moveQueue[j][3]][1][1] >= Detect.findInterval(charDir[ici][ini + 1].s_i, false, charDir[ici][ini].s_i)) {
					moveQueue[j][1] = charDir[ici][ini + 1].s_i;
					moveQueue[j][2] = 0;
				} else {
					var indexTotal = timeDir[moveQueue[j][3]][1][1] + Detect.findInterval(moveQueue[j][3], false, 0);
					if (indexTotal >= callerBase) {
						moveQueue[j][1] = moveQueue[i][3];
						moveQueue[j][2] = (indexTotal - callerBase)/timeDir[moveQueue[i][3]][1][1];
					} else {
						break;
					}
				}
			}
			riftIndex = j;
		} else {
			break;
		}
	}

	// for (i = 0; i < active.length; i++)
	// 	console.log(active[i]+":"+(timeDir[active[i]][1][1] + Detect.findInterval(active[i], false, 0)));
	// for (i = 0; i < moveQueue.length; i++)
	// 	console.log(moveQueue[i][3]+":"+(timeDir[moveQueue[i][3]][1][1] + Detect.findInterval(moveQueue[i][3], false, 0)));
	// for (i = 0; i < moveQueue.length; i++)
	// 	console.log(moveQueue[i]);

	idle = false;
	this.redraw();
}
Main.prototype.getExtentPrev = function(s_i) {
	//this won't work for backwards movement
	if (0 < timeDir[s_i][1][1]) {
		if (end) {
			if (target === s_i) {
				extent = timeDir[s_i][1][1];
			} else if (target < s_i && false === Detect.isWithin(s_i, target, 0, 2, false)) {
				extent = 0;
			//isWithin really needs an update!
		} else if (timeDir[target][1][1] + Detect.findInterval(target, false, 0) < timeDir[s_i][1][1] + Detect.findInterval(s_i, false, 0)) {
				if (target < s_i) extent = timeDir[target][1][1] - Detect.findInterval(s_i, false, target);
					else extent = timeDir[target][1][1] + Detect.findInterval(target, false, s_i);
			} else {
				extent = timeDir[s_i][1][1]; //this shouldn't technically ever trigger, if moveQueue is well discerning
			}
		} else {
			if (target === s_i || target < s_i) {
				extent = 0;
			} else if (Detect.findInterval(target, false, s_i) < timeDir[s_i][1][1]) {
				extent = Detect.findInterval(target, false, s_i);
			} else {
				extent = timeDir[s_i][1][1];
			}
		}
		return extent/timeDir[s_i][1][1];
	} else {
		return 0;
	}
}

/* setup */
Main.prototype.genLocDir = function() {
	this.genSequence(5, Math.floor(Math.random()*5) + 16);

	locDir = new Array();
	var locDirKey = new Array();
	drawSequence = new Array();
	testSequence = new Array();

	var i, j, k,
		keyed, key;

	var c_i, n_i, l_i;

	var toPresent;
	var hit = new Array();
	for (i = 0; i < charDir.length; i++)
		hit.push(0);
	var term, store, hold;

	for (i = 0; i < timeDir.length; i++) {
		c_i = timeDir[i][0][0];
		n_i = charDir[c_i].length;
		timeDir[i][0].push(n_i);

		toPresent = 0;
		for (j = 0; j < hit.length; j++)
			hit[j] = 0;
		//finding paths since terminated
		term = new Array();
		for (j = i - 1; j >= 0; j--) {
			toPresent += Detect.findInterval(j + 1);
			if (hit[timeDir[j][0][0]] == 0 && toPresent >= timeDir[j][1][1] && toPresent - Detect.findInterval(i) < timeDir[j][1][1]) {
				hit[timeDir[j][0][0]] = 1;
				term.push([ j, toPresent - timeDir[j][1][1] ]);
			}
		}
		//ordering array chronologically
		for (j = 0; j < term.length; j++) {
			hold = j;
			for (k = j + 1; k < term.length; k++) {
				if (term[hold][1] < term[k][1] || term[hold][1] == term[k][1] && term[hold][0] > term[k][0])
					hold = k;
			}
			store = term[j];
			term[j] = term[hold];
			term[hold] = store;
		}
		//registering
		for (j = 0; j < term.length; j++) {
			l_i = timeDir[term[j][0]][2][0];
			keyed = false;
			for (k = 0; k < locDirKey.length; k++) {
				if (l_i === locDirKey[k]) {
					key = k;
					keyed = true;
					break;
				}
			}
			if (false === keyed) {
				key = locDirKey.length;
				locDirKey.push(l_i);
				locDir.push(new Array());
				drawSequence.push(new Array());
			}

			locDir[key].push([timeDir[term[j][0]][0][0], timeDir[term[j][0]][0][1], term[j][0]]);
			drawSequence[key].push([ timeDir[term[j][0]][0][0], timeDir[term[j][0]][0][1], 0 ]);
			testSequence.push([ timeDir[term[j][0]][0][0], timeDir[term[j][0]][0][1], 0 ]);

			charDir[timeDir[term[j][0]][0][0]][timeDir[term[j][0]][0][1]].l_x = key;
			charDir[timeDir[term[j][0]][0][0]][timeDir[term[j][0]][0][1]].l_y = locDir[key].length - 1;
		}

		//adding path of current index, registering if movement is instantaneous (consolidate with above?)
		l_i = timeDir[i][2][0];
		charDir[c_i].push(new Node(c_i, n_i, cols[startColour][c_i], l_i, i));

		//determining key for entry of new Node into drawSequence
		keyed = false;
		for (k = 0; k < locDirKey.length; k++) {
			if (l_i === locDirKey[k]) {
				key = k;
				keyed = true;
				break;
			}
		}
		if (false === keyed) {
			key = locDirKey.length;
			locDirKey.push(l_i);
			locDir.push(new Array());
			drawSequence.push(new Array());
		}
		//adding reference to path both to start and to end (initial nodes have no path)
		if (n_i > 0) {
			drawSequence[charDir[c_i][n_i - 1].l_x].push([c_i, n_i, 1]);
			drawSequence[key].push([c_i, n_i, 2]);
			testSequence.push([c_i, n_i, 3]);
		}

		if (0 === timeDir[i][1][1]) {
			locDir[key].push([c_i, n_i, i]);
			drawSequence[key].push([c_i, n_i, 0]);
			testSequence.push([c_i, n_i, 0]);

			charDir[c_i][n_i].l_x = key;
			charDir[c_i][n_i].l_y = locDir[key].length - 1;
		}
	}
	for (i = 0; i < hit.length; i++)
		hit[i] = 0;
	//registering hanging paths
	toPresent = 0;
	term = new Array();
	for (i = timeDir.length - 1; i >= 0; i--) {
		if (hit[timeDir[i][0][0]] == 0 && toPresent < timeDir[i][1][1]) {
			hit[timeDir[i][0][0]] = 1;
			term.push([ i, timeDir[i][1][1] - toPresent ])
			for (j = 0; j < hit.length; j++) {
				if (hit[j] == 0)
					break;
			}
			if (j >= hit.length)
				break;
		}
		toPresent += Detect.findInterval(i);
	}
	for (i = 0; i < term.length; i++) {
		hold = i;
		for (j = i + 1; j < term.length; j++) {
			if (term[hold][1] > term[j][1] || term[hold][1] == term[j][1] && term[hold][0] < term[j][0])
				hold = j;
		}
		store = term[i];
		term[i] = term[hold];
		term[hold] = store;
	}
	for (i = 0; i < term.length; i++) {
		l_i = timeDir[term[i][0]][2][0];
		keyed = false;
		for (j = 0; j < locDirKey.length; j++) {
			if (l_i === locDirKey[j]) {
				key = j;
				keyed = true;
				break;
			}
		}
		if (false === keyed) {
			key = locDirKey.length;
			locDirKey.push(l_i);
			locDir.push(new Array());
			drawSequence.push(new Array());
		}

		locDir[key].push([timeDir[term[i][0]][0][0], timeDir[term[i][0]][0][1], term[i][0]]);
		drawSequence[key].push([ timeDir[term[i][0]][0][0], timeDir[term[i][0]][0][1], 0 ]);
		testSequence.push([ timeDir[term[i][0]][0][0], timeDir[term[i][0]][0][1], 0 ]);

		charDir[timeDir[term[i][0]][0][0]][timeDir[term[i][0]][0][1]].l_x = key;
		charDir[timeDir[term[i][0]][0][0]][timeDir[term[i][0]][0][1]].l_y = locDir[key].length - 1;
	}
	for (i = 0; i + 1 < timeDir.length; i++) {
		if (timeDir[i][1][1] > 0)
			bridge[timeDir[i][0][0]].x = 0;
		if (Detect.findInterval(i + 1, false, i) > 0) {
			now = i;
			break;
		}
	}
}
Main.prototype.genSequence = function(paths, moves) {
	bridge = new Array();
	anc = new Array();
	timeDir = new Array();
	charDir = new Array();
	this.genHex();

	for (var i = 0; i < paths; i++) {
		charDir.push(new Array());
		bridge.push({x:1, i:0, f:1, e:1});
		anc.push({x:1, i:0, f:1, e:1});
	}
	riftBridge = {x:1, i:0, f:1, e:1};

	for (var i = 0; i < paths; i++) {
		timeDir.push(new Array());
		timeDir[timeDir.length - 1].push([i]);
		timeDir[timeDir.length - 1].push([0, 0]);
		timeDir[timeDir.length - 1].push([Math.floor(Math.random()*loc.length)]);
	}

	var c_i;
	for (var i = 0; i < moves; i++) {
		c_i = Math.floor(Math.random()*paths);
		timeDir.push(new Array());
		timeDir[timeDir.length - 1].push([c_i]);
		timeDir[timeDir.length - 1].push([Math.floor(Math.random()*11), Math.floor(Math.random()*11) + Math.floor(Math.random()*6) + 5]);
		timeDir[timeDir.length - 1].push([this.randHex(c_i)]);
	}

	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([0]);
	// timeDir[timeDir.length - 1].push([0, 0]);
	// timeDir[timeDir.length - 1].push([5]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([1]);
	// timeDir[timeDir.length - 1].push([0, 0]);
	// timeDir[timeDir.length - 1].push([5]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([2]);
	// timeDir[timeDir.length - 1].push([0, 0]);
	// timeDir[timeDir.length - 1].push([3]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([3]);
	// timeDir[timeDir.length - 1].push([0, 0]);
	// timeDir[timeDir.length - 1].push([1]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([4]);
	// timeDir[timeDir.length - 1].push([0, 0]);
	// timeDir[timeDir.length - 1].push([4]);
	//
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([2]);
	// timeDir[timeDir.length - 1].push([10, 11]);
	// timeDir[timeDir.length - 1].push([2]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([4]);
	// timeDir[timeDir.length - 1].push([10, 10]);
	// timeDir[timeDir.length - 1].push([0]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([3]);
	// timeDir[timeDir.length - 1].push([3, 10]);
	// timeDir[timeDir.length - 1].push([5]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([0]);
	// timeDir[timeDir.length - 1].push([1, 6]);
	// timeDir[timeDir.length - 1].push([0]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([1]);
	// timeDir[timeDir.length - 1].push([6, 16]);
	// timeDir[timeDir.length - 1].push([4]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([4]);
	// timeDir[timeDir.length - 1].push([1, 18]);
	// timeDir[timeDir.length - 1].push([4]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([1]);
	// timeDir[timeDir.length - 1].push([0, 13]);
	// timeDir[timeDir.length - 1].push([2]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([0]);
	// timeDir[timeDir.length - 1].push([8, 6]);
	// timeDir[timeDir.length - 1].push([3]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([1]);
	// timeDir[timeDir.length - 1].push([5, 6]);
	// timeDir[timeDir.length - 1].push([1]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([1]);
	// timeDir[timeDir.length - 1].push([4, 7]);
	// timeDir[timeDir.length - 1].push([5]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([2]);
	// timeDir[timeDir.length - 1].push([2, 17]);
	// timeDir[timeDir.length - 1].push([3]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([4]);
	// timeDir[timeDir.length - 1].push([5, 8]);
	// timeDir[timeDir.length - 1].push([3]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([1]);
	// timeDir[timeDir.length - 1].push([3, 10]);
	// timeDir[timeDir.length - 1].push([3]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([4]);
	// timeDir[timeDir.length - 1].push([7, 18]);
	// timeDir[timeDir.length - 1].push([1]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([2]);
	// timeDir[timeDir.length - 1].push([0, 14]);
	// timeDir[timeDir.length - 1].push([1]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([2]);
	// timeDir[timeDir.length - 1].push([6, 15]);
	// timeDir[timeDir.length - 1].push([5]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([4]);
	// timeDir[timeDir.length - 1].push([3, 19]);
	// timeDir[timeDir.length - 1].push([5]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([0]);
	// timeDir[timeDir.length - 1].push([4, 9]);
	// timeDir[timeDir.length - 1].push([5]);

	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([0]);
	// timeDir[timeDir.length - 1].push([0, 0]);
	// timeDir[timeDir.length - 1].push([5]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([1]);
	// timeDir[timeDir.length - 1].push([0, 0]);
	// timeDir[timeDir.length - 1].push([5]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([2]);
	// timeDir[timeDir.length - 1].push([0, 0]);
	// timeDir[timeDir.length - 1].push([0]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([3]);
	// timeDir[timeDir.length - 1].push([0, 0]);
	// timeDir[timeDir.length - 1].push([4]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([4]);
	// timeDir[timeDir.length - 1].push([0, 0]);
	// timeDir[timeDir.length - 1].push([3]);
	//
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([3]);
	// timeDir[timeDir.length - 1].push([1, 10]);
	// timeDir[timeDir.length - 1].push([5]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([2]);
	// timeDir[timeDir.length - 1].push([4, 15]);
	// timeDir[timeDir.length - 1].push([5]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([0]);
	// timeDir[timeDir.length - 1].push([8, 18]);
	// timeDir[timeDir.length - 1].push([2]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([2]);
	// timeDir[timeDir.length - 1].push([2, 16]);
	// timeDir[timeDir.length - 1].push([0]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([1]);
	// timeDir[timeDir.length - 1].push([7, 14]);
	// timeDir[timeDir.length - 1].push([4]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([2]);
	// timeDir[timeDir.length - 1].push([2, 17]);
	// timeDir[timeDir.length - 1].push([3]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([1]);
	// timeDir[timeDir.length - 1].push([10, 8]);
	// timeDir[timeDir.length - 1].push([0]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([1]);
	// timeDir[timeDir.length - 1].push([1, 13]);
	// timeDir[timeDir.length - 1].push([1]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([1]);
	// timeDir[timeDir.length - 1].push([2, 13]);
	// timeDir[timeDir.length - 1].push([2]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([3]);
	// timeDir[timeDir.length - 1].push([2, 12]);
	// timeDir[timeDir.length - 1].push([3]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([0]);
	// timeDir[timeDir.length - 1].push([1, 13]);
	// timeDir[timeDir.length - 1].push([5]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([4]);
	// timeDir[timeDir.length - 1].push([7, 11]);
	// timeDir[timeDir.length - 1].push([2]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([2]);
	// timeDir[timeDir.length - 1].push([10, 15]);
	// timeDir[timeDir.length - 1].push([4]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([4]);
	// timeDir[timeDir.length - 1].push([2, 15]);
	// timeDir[timeDir.length - 1].push([4]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([1]);
	// timeDir[timeDir.length - 1].push([3, 10]);
	// timeDir[timeDir.length - 1].push([0]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([3]);
	// timeDir[timeDir.length - 1].push([9, 17]);
	// timeDir[timeDir.length - 1].push([1]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([1]);
	// timeDir[timeDir.length - 1].push([5, 8]);
	// timeDir[timeDir.length - 1].push([4]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([2]);
	// timeDir[timeDir.length - 1].push([5, 15]);
	// timeDir[timeDir.length - 1].push([5]);

	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([0]);
	// timeDir[timeDir.length - 1].push([0, 0]);
	// timeDir[timeDir.length - 1].push([5]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([1]);
	// timeDir[timeDir.length - 1].push([0, 0]);
	// timeDir[timeDir.length - 1].push([5]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([2]);
	// timeDir[timeDir.length - 1].push([0, 0]);
	// timeDir[timeDir.length - 1].push([5]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([3]);
	// timeDir[timeDir.length - 1].push([0, 0]);
	// timeDir[timeDir.length - 1].push([5]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([4]);
	// timeDir[timeDir.length - 1].push([0, 0]);
	// timeDir[timeDir.length - 1].push([5]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([0]);
	// timeDir[timeDir.length - 1].push([0, 10]);
	// timeDir[timeDir.length - 1].push([3]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([1]);
	// timeDir[timeDir.length - 1].push([2, 6]);
	// timeDir[timeDir.length - 1].push([3]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([1]);
	// timeDir[timeDir.length - 1].push([10, 6]);
	// timeDir[timeDir.length - 1].push([2]);

	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([0]);
	// timeDir[timeDir.length - 1].push([0, 0]);
	// timeDir[timeDir.length - 1].push([4]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([1]);
	// timeDir[timeDir.length - 1].push([0, 0]);
	// timeDir[timeDir.length - 1].push([0]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([2]);
	// timeDir[timeDir.length - 1].push([0, 0]);
	// timeDir[timeDir.length - 1].push([2]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([3]);
	// timeDir[timeDir.length - 1].push([0, 0]);
	// timeDir[timeDir.length - 1].push([5]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([4]);
	// timeDir[timeDir.length - 1].push([0, 0]);
	// timeDir[timeDir.length - 1].push([3]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([0]);
	// timeDir[timeDir.length - 1].push([10, 9]);
	// timeDir[timeDir.length - 1].push([3]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([3]);
	// timeDir[timeDir.length - 1].push([10, 7]);
	// timeDir[timeDir.length - 1].push([3]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([0]);
	// timeDir[timeDir.length - 1].push([4, 9]);
	// timeDir[timeDir.length - 1].push([5]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([0]);
	// timeDir[timeDir.length - 1].push([10, 7]);
	// timeDir[timeDir.length - 1].push([1]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([2]);
	// timeDir[timeDir.length - 1].push([4, 18]);
	// timeDir[timeDir.length - 1].push([4]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([0]);
	// timeDir[timeDir.length - 1].push([1, 11]);
	// timeDir[timeDir.length - 1].push([5]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([2]);
	// timeDir[timeDir.length - 1].push([1, 15]);
	// timeDir[timeDir.length - 1].push([0]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([3]);
	// timeDir[timeDir.length - 1].push([2, 10]);
	// timeDir[timeDir.length - 1].push([0]);

	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([0]);
	// timeDir[timeDir.length - 1].push([0, 0]);
	// timeDir[timeDir.length - 1].push([0]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([1]);
	// timeDir[timeDir.length - 1].push([0, 0]);
	// timeDir[timeDir.length - 1].push([1]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([2]);
	// timeDir[timeDir.length - 1].push([0, 0]);
	// timeDir[timeDir.length - 1].push([1]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([3]);
	// timeDir[timeDir.length - 1].push([0, 0]);
	// timeDir[timeDir.length - 1].push([1]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([4]);
	// timeDir[timeDir.length - 1].push([0, 0]);
	// timeDir[timeDir.length - 1].push([3]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([3]);
	// timeDir[timeDir.length - 1].push([7, 17]);
	// timeDir[timeDir.length - 1].push([3]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([3]);
	// timeDir[timeDir.length - 1].push([7, 11]);
	// timeDir[timeDir.length - 1].push([4]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([1]);
	// timeDir[timeDir.length - 1].push([0, 6]);
	// timeDir[timeDir.length - 1].push([2]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([0]);
	// timeDir[timeDir.length - 1].push([6, 8]);
	// timeDir[timeDir.length - 1].push([4]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([1]);
	// timeDir[timeDir.length - 1].push([3, 10]);
	// timeDir[timeDir.length - 1].push([3]);

	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([0]);
	// timeDir[timeDir.length - 1].push([1, 12]);
	// timeDir[timeDir.length - 1].push([3]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([0]);
	// timeDir[timeDir.length - 1].push([8, 13]);
	// timeDir[timeDir.length - 1].push([this.randHex(0)]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([1]);
	// timeDir[timeDir.length - 1].push([10, 9]);
	// timeDir[timeDir.length - 1].push([this.randHex(1)]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([0]);
	// timeDir[timeDir.length - 1].push([3, 9]);
	// timeDir[timeDir.length - 1].push([this.randHex(0)]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([0]);
	// timeDir[timeDir.length - 1].push([5, 14]);
	// timeDir[timeDir.length - 1].push([this.randHex(0)]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([1]);
	// timeDir[timeDir.length - 1].push([2, 11]);
	// timeDir[timeDir.length - 1].push([this.randHex(1)]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([2]);
	// timeDir[timeDir.length - 1].push([9, 14]);
	// timeDir[timeDir.length - 1].push([this.randHex(2)]);
	// timeDir.push(new Array());
	// timeDir[timeDir.length - 1].push([0]);
	// timeDir[timeDir.length - 1].push([6, 6]);
	// timeDir[timeDir.length - 1].push([this.randHex(0)]);
}
Main.prototype.randHex = function(charIndex) {
	var i;
	for (i = timeDir.length - 2; i >= 0; i--) {
		if (charIndex == timeDir[i][0][0])
		{ break;}
	}
	var viable = false, ni;
	while (true) {
		ni = Math.floor(Math.random()*loc.length);
		if (ni !== timeDir[i][2][0]) break;
	}
	return ni;
}
Main.prototype.genHex = function() {
	loc = new Array();
// 	loc.push(new Point(100, 300));
// 	loc.push(new Point(125, 250));
// 	loc.push(new Point(75, 250));
// 	loc.push(new Point(500, 300));
// 	loc.push(new Point(400, 300));
// 	loc.push(new Point(200, 486));
	loc.push(new Point(100, 300));
	loc.push(new Point(200, 114));
	loc.push(new Point(400, 114));
	loc.push(new Point(500, 300));
	loc.push(new Point(400, 486));
	loc.push(new Point(200, 486));
}
Main.prototype.visLoc = function() {
	for (var i = 0; i < loc.length; i++) {
		var can = document.getElementById('canvas');
		var ctx = can.getContext('2d');
		ctx.beginPath();
		ctx.fillStyle = '#CDCDCD';
		ctx.arc(loc[i].x, loc[i].y, 4, 0, Math.PI*2)
		ctx.fill();
		ctx.closePath();
	}
}
