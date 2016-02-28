var charConsole;
var targetIndex;

function Main() {
	targetIndex = 0;
	Detect = new Detect();
	moveQueue = new Array();
	this.genLocDir();
	console.log(timeDir);
	console.log(charDir);
	console.log(locDir);
	// console.log(drawSequence);
	console.log(testSequence);
	console.log(anc);
	console.log(bridge);

	// var fs = require('fs');
	// var file = fs.createWriteStream('timeDir.txt');
	// file.on('error', function(err) { /* error handling */ });
	// timeDir.forEach(function(v) { file.write(v.join(', ') + '\n'); });
	// file.end();
}
Main.prototype.genCharObj = function() {
	charConsole = document.querySelector('.charConsole .main');
	var template =
		"<div class='number'></div>" +
		"<div class='colour'></div>" +
		"<div class='name'></div>" +
		"<div class='controls'>" +
			"<button class='i-prev icon-alone'>" +
				"<span class='fa fa-step-backward'></span>" +
				"<span class='screen-reader-text'>RSS</span>" +
			"</button>" +
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
			"<button class='i-next icon-alone'>" +
				"<span class='fa fa-step-forward'></span>" +
				"<span class='screen-reader-text'>RSS</span>" +
			"</button>" +
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
		this.evalState(i);
	}
}

//http://stackoverflow.com/questions/18949122/javascript-canvas-change-the-opacity-of-image
//for focus stuff, see second answer on saving and restoring canvas state

Main.prototype.redraw = function() {
	// console.log('drawing');
	var active = false;
	var iLen = anc.length;
	for (var i = 0; i < iLen; i++) {
		if (0 !== anc[i].i) {
			anc[i].x += anc[i].i;
			// anc[i].i *= anc[i].f;
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
	//len for bridge is same as for anc
	for (var i = 0; i < iLen; i++) {
		if (0 !== bridge[i].i) {
			bridge[i].x += bridge[i].i;
			// bridge[i].i *= bridge[i].f;
			active = true;
			// if (0 === i) console.log(bridge[i].x);
			if (0 < bridge[i].i) {
				if (1 <= bridge[i].x || bridge[i].x >= bridge[i].e) {
					// if (0 === i) console.log(bridge[0].e);
					// if (0 === i) console.log(bridge[0].x);
					bridge[i].x = bridge[i].e;
					bridge[i].i = 0;
					this.evalState(timeDir[i][0][0]);
				}
			} else {
				if (0 >= bridge[i].x && 0 >= bridge[i].e) {
					if (targetIndex !== now) {
						now--;
						bridge[i].x = 1;
					} else
						bridge[i].x = 0;
					bridge[i].i = 0;
				} else if (bridge[i].x <= bridge[i].e) {
					bridge[i].x = bridge[i].e;
					bridge[i].i = 0;
				}
			}
		}
	}
	if (0 !== riftBridge.i) {
		riftBridge.x += riftBridge.i;
		// bridge[i].i *= bridge[i].f;
		active = true;
		if (0 < riftBridge.i) {
			if (1 <= riftBridge.x || riftBridge.x >= riftBridge.e) {
				riftBridge.x = 1;
				riftBridge.i = 0;
				this.evalState(timeDir[now + 1][0][0]);
			}
		} else {
			if (0 >= riftBridge.x || riftBridge.x <= riftBridge.e) {
				riftBridge.x = 0;
				riftBridge.i = 0;
			}
		}
	}
	//rift:Boolean, caller/riftInc:uint/float, trigger:float, called:uint, increment:float, extent:float
	console.log(now);
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
				console.log(moveQueue[0]);
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
				moveQueue.splice(0,1);
				now++;
			} else {
				break;
			}
		} else {
			//backwards movement
			var rift = moveQueue[0][0];
			if (false === rift) {
				var csi = moveQueue[0][1];
				var cci = timeDir[csi][0][0];
				var cni = timeDir[csi][0][1];
			}
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
			// console.log("---");
			if (rift && 0 >= riftBridge.x || false === rift && (now < csi || (now <= csi || charDir[cci].length <= cni + 1 || now < charDir[cci][cni + 1].s_i) && (bridge[cci].x <= moveQueue[0][2] || bridge[cci].x <= bridge[cci].e))) {
				console.log(moveQueue[0]);
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
						riftBridge.x = 1;
						// riftBridge.x = bridge[timeDir[tsi][0][0]].x*timeDir[tsi][1][1]/Detect.findInterval(tsi + 1, false, tsi);
				}
				moveQueue.splice(0,1);
			} else {
				break;
			}
		}
	}

	//here define bridge.i and update 'now'

	var paths = document.getElementById('paths');
	var pathctx = paths.getContext('2d');
	pathctx.clearRect(0,0,paths.width,paths.height);
	var update = document.getElementById('update');
	var upctx = update.getContext('2d');
	upctx.clearRect(0,0,update.width,update.height);
	var lines = document.getElementById('lines');
	var linectx = lines.getContext('2d');
	linectx.clearRect(0,0,lines.width,lines.height);
	var test = document.getElementById('test');
	var testctx = test.getContext('2d');
	testctx.clearRect(0,0,test.width,test.height);

	//testSequence
	iLen = testSequence.length;
	for (var i = 0; i < iLen; i++) {
		charDir[testSequence[i][0]][testSequence[i][1]].generate(testSequence[i][2], 2);
	}
	var can = document.getElementById('canvas');
	var ctx = can.getContext('2d');
	ctx.clearRect(0,0,can.width,can.height);
	this.visLoc();
	ctx.drawImage(paths, 0, 0);
	ctx.drawImage(update, 0, 0);
	ctx.globalAlpha = 0.35;
	ctx.drawImage(lines, 0, 0);
	ctx.globalAlpha = 1;
	ctx.drawImage(test, 0, 0);


	if (active && false === idle)
		requestAnimFrame(this.redraw.bind(this));
	else {
		//replace 'instant next' symbol with 'play next'
		var buttons = document.querySelectorAll('.next .fa-step-forward');
		for (var i = 0; i < buttons.length; i++) {
			// console.log(buttons[b]);
			// b = buttons[b].querySelector('span');
			this.removeClass(buttons[i], "fa-step-forward");
			this.removeClass(buttons[i], "fa-play");
			buttons[i].className += " fa-play";
		}
		idle = true;
	}


	//loop for path underlay; not only does this create the line underlay, it
	//also sequenced in such a way as to
	//the parameter 3 passed to generate is one of four channels, generating not the node, nor one of two sides but the whole path
	// for (var i = 0; i <= now; i++) {
	// 	charDir[timeDir[i][0][0]][timeDir[i][0][1]].generate(3);
	// }
	//loop through drawSequence
	// iLen = drawSequence.length;
	// var jLen;
	// for (var i = 0; i < iLen; i++) {
	// 	jLen = drawSequence[i].length;
	// 	for (var j = 0; j < jLen; j++) {
	// 		if (drawSequence[i][j][2])
	// 			char[drawSequence[i][j][0]][drawSequence[i][j][1]].generate(drawSequence[i][j][2], 0);
	// 		else
	// 			charDir[drawSequence[i][j][0]][drawSequence[i][j][1]].generate(0, 2);
	// 	}
	// }
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
	var inext = document.querySelector('[data-index="'+c_i+'"] .i-next');
	var cnext = document.querySelector('[data-index="'+c_i+'"] .next');
	inext.onclick = null;
	cnext.onclick = null;
	if (charDir[c_i].length > 1 && (now < charDir[c_i][charDir[c_i].length - 1].s_i || bridge[c_i].x < 1) && (0 < anc[c_i].i || 0 === anc[c_i].i && 1 === anc[c_i].x)) {
		inext.onclick = function(e) {
			main.targetNext(inext.parentNode.parentNode.dataset.index, true);
		};
		cnext.onclick = function(e) {
			main.targetNext(cnext.parentNode.parentNode.dataset.index, false);
		};
		inext.style.color = "#232323";
		inext.disabled = false;
		cnext.style.color = "#232323";
		cnext.disabled = false;
	} else {
		inext.style.color = "#787878";
		inext.disabled = true;
		cnext.style.color = "#787878";
		cnext.disabled = true;
	}
	var iprev = document.querySelector('[data-index="'+c_i+'"] .i-prev');
	var cprev = document.querySelector('[data-index="'+c_i+'"] .prev');
	iprev.onclick = null
	cprev.onclick = null
	if (charDir[c_i].length > 1 && now >= charDir[c_i][0].s_i && false == Detect.isWithin(now, 0) && (0 < anc[c_i].i || 0 === anc[c_i].i && 1 === anc[c_i].x)) {
		iprev.onclick = function(e) {
			main.targetPrev(iprev.parentNode.parentNode.dataset.index, true);
		};
		cprev.onclick = function(e) {
			main.targetPrev(cprev.parentNode.parentNode.dataset.index, false);
		};
		iprev.style.color = "#232323";
		iprev.disabled = false;
		cprev.style.color = "#232323";
		cprev.disabled = false;
	} else {
		iprev.style.color = "#787878";
		iprev.disabled = true;
		cprev.style.color = "#787878";
		cprev.disabled = true;
	}
}
Main.prototype.pause = function() {
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
	var end, i;
	for (i = charDir[c_i].length - 1; i >= 0; i--) {
		if (charDir[c_i][i].s_i <= now) {
			target = charDir[c_i][i].s_i;
			if (bridge[c_i].x < 1) {
				end = true;
			} else {
				if (i + 1 < charDir[c_i].length) {
					target = charDir[c_i][i + 1].s_i;
					end = false;}
			}
			break;
		}
	}

	if (direct) {
		this.instant(c_i, target, end);
		if (idle) this.redraw();
		for (i = 0; i < charDir.length; i++)
			this.evalState(i);
	} else {
		this.continuousNext(c_i, target, end);
	}
	// } else {
		// if (0 >= timeDir[now][1][2] && 0 >= timeDir[now][1][1]) {
		// 	/*if (1 <= riftBridge.x) {
		// 		riftBridge.x = 0;}*/
		// 	// TweenLite.to(riftBridge, Detect.findInterval(now + 1, false)*(1 - riftBridge.x), {x:1, ease:Linear.easeNone});
		// 	charDir[timeDir[now + 1][0][0]][timeDir[now + 1][0][1]].movementNext(true, target, end, 0, true);
		// } else {
		// 	continuousNext(target, end);}
	// }
}
Main.prototype.targetPrev = function(c_i, direct) {
	this.pause();
	var end, i;
	var found = false;
	for (i = charDir[c_i].length - 1; i >= 0; i--) {
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
				if (Detect.isWithin(now, target))
					end = false;
				else end = true;
				found = true;
			}
			break;
		}
	}
	if (found) {
		if (direct) {
			this.instant(c_i, target, end)
			if (idle) this.redraw();
			for (i = 0; i < charDir.length; i++)
				this.evalState(i);
		} else {
			this.continuousPrev(c_i, target, end);
		}
	}
}

Main.prototype.instant = function(c_i, target, end) {
	var i,
		within = 0,
		j;
	if (timeDir[target][0][1] < charDir[c_i].length) {
		var hit = new Array();
		for (i = 0; i < charDir.length; i++) {
			bridge[i].x = 1;
			hit.push(0);
		}
		hit[c_i] = 1;
		if (end == false) {
			bridge[c_i].x = 0;
		} else {
			bridge[c_i].x = 1;
		}
		var toPresent = 0;
		for (i = target + 1; i < timeDir.length; i++) {
			toPresent += Detect.findInterval(i);
			if (end && toPresent <= timeDir[target][1][1] || end == false && toPresent == 0) {
				within++;
				hit[timeDir[i][0][0]] = 1;
				if (end) {
					if (toPresent + timeDir[i][1][1] > timeDir[target][1][1]) {
						bridge[timeDir[i][0][0]].x = (timeDir[target][1][1] - toPresent) / timeDir[i][1][1];
					}
				} else {
					bridge[timeDir[i][0][0]].x = 0;
				}
			} else {
				break;
			}
		}
		for (j = 0; j < hit.length; j++) {
			if (hit[j] == 0) { break;}
		}
		if (j < hit.length) {
			if (end) {
				toPresent = timeDir[target][1][1];
			} else {
				toPresent = 0;
			}
			for (i = target - 1; i >= 0; i--) {
				toPresent += Detect.findInterval(i + 1);
				if (hit[timeDir[i][0][0]] == 0) {
					hit[timeDir[i][0][0]] = 1;
					if (toPresent < timeDir[i][1][1]) {
						bridge[timeDir[i][0][0]].x = toPresent / timeDir[i][1][1];
					}
					for (j = 0; j < hit.length; j++) {
						if (hit[j] == 0) { break;}
					}
					if (j >= hit.length) { break;}
				}
			}
		}
		target += within;
	}
	now = target;
}
Main.prototype.continuousNext = function(c_i, target, end) {
	this.pause();
	idle = true; //sufficient?

	//resume active indeces
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

	var button = document.querySelector('[data-index="'+c_i+'"] .next span');
	this.removeClass(button, "fa-play");
	this.removeClass(button, "fa-step-forward");
	button.className += " fa-step-forward";
	// button.onclick = null;
	// button.onclick = this.instant(c_i, target, end);

	idle = false;
	this.redraw();
}
Main.prototype.continuousPrev = function(c_i, target, end) {
	this.pause();
	idle = true;

	//create active
		//any instant durations at present, including 0 bridges, are automatically rolled back
		//order indeces based on latest activity
	//create moveQueue
		//collect every relevant index
			//indeces not suspended from target are not included
		//order indeces based on latest activity
		//define callers
			//rifts are defined similar to forwards, an index pushed as the array is traversed: encountering it prepares a rift
			//this and the other should work the same in that they ought to be made to have characters call themselves when chaining
			//rifts ought to be unified forwards and backwards. not sure how

	// moveQueue = new Array();

	var i, j;
	var active = new Array();
	var rollBack = 0;
	var nowTotal = timeDir[now][1][1]*bridge[timeDir[now][0][0]].x + Detect.findInterval(now, false, 0);
	for (i = 0; i < charDir.length; i++)
		for (j = charDir[i].length - 1; j >= 0; j--)
			if (now >= charDir[i][j].s_i) {
				if (0 >= bridge[i].x || 0 >= timeDir[charDir[i][j].s_i][1][1] && 0 >= Detect.findInterval(now, false, charDir[i][j].s_i)) {
					rollBack++;
					bridge[i].x = 1;
					for (var k = j - 1; k >= 0; k--) {
						if (0 >= Detect.findInterval(now, false, charDir[i][k].s_i))
							rollBack++;
						else {
							if (nowTotal <= timeDir[charDir[i][k].s_i][1][1] + Detect.findInterval(charDir[i][k].s_i, false, 0)) {
								active.push(charDir[i][k].s_i);
								bridge[i].i = -(60/1000)*movSpeed / timeDir[charDir[i][k].s_i][1][1];
								bridge[i].e = this.getExtentPrev(charDir[i][k].s_i, target, end);
							}
							break;
						}
					}
				} else if (1 > bridge[i].x || nowTotal <= timeDir[charDir[i][j].s_i][1][1] + Detect.findInterval(charDir[i][j].s_i, false, 0)) {
					active.push(charDir[i][j].s_i);
					bridge[i].i = -(60/1000)*movSpeed / timeDir[charDir[i][j].s_i][1][1];
					bridge[i].e = this.getExtentPrev(charDir[i][j].s_i, target, end);
				}
				break;
			}
	active.sort(function(a,b){return b - a});
	now -= rollBack;

	//scouting indeces for moveQueue
	moveQueue = new Array();
	for (i = now; i >= target; i--) {
		if (false === end && (0 < timeDir[i][1][1] || 0 < Detect.findInterval(i, false, target)) || end && (Detect.findInterval(i, false, target) > timeDir[target][1][1] || 0 < timeDir[i][1][1])/* || false === Detect.isWithin(i, target, 2, 2, false)*/) {
			if (0 >= timeDir[i][1][1]) var inc = -1;
				else inc = -(60/1000)*movSpeed / timeDir[i][1][1];
			moveQueue.push([ false, 0, 0, i, inc, this.getExtentPrev(i, target, end) ]);
		} else {
			break;
		}
	}
	// for (i = 0; i < moveQueue.length; i++)
	// 	// console.log(moveQueue[i][3]+":"+(timeDir[moveQueue[i][3]][1][1] + Detect.findInterval(moveQueue[i][3], false, 0)));
	// 	console.log(moveQueue[i][5]);
	for (i = 0; i < charDir.length; i++)
		if (i !== c_i && 1 <= bridge[i].x)
			for (j = charDir[i].length - 1; j >= 0; j--)
				if (target > charDir[i][j].s_i && 0 < timeDir[charDir[i][j].s_i][1][1]) {
					//Detect.isWithin might need an update for more precise filtering
					var indexTotal = timeDir[charDir[i][j].s_i][1][1] + Detect.findInterval(charDir[i][j].s_i, false, 0);
					var targetBase = Detect.findInterval(target, false, 0);
					if (end && indexTotal - (targetBase + timeDir[target][1][1]) > 0 || false === end && indexTotal - targetBase > 0) {
						if (0 >= timeDir[charDir[i][j].s_i][1][1]) var inc = -1;
							else inc = -(60/1000)*movSpeed / timeDir[charDir[i][j].s_i][1][1];
						moveQueue.push([ false, 0, 0, charDir[i][j].s_i, inc, this.getExtentPrev(charDir[i][j].s_i, target, end) ]);
					}
					break;
				}
	//sorting into descending order by latest activity
	moveQueue.sort(function(a,b){
		var result = (timeDir[b[3]][1][1] + Detect.findInterval(b[3], false, 0)) - (timeDir[a[3]][1][1] + Detect.findInterval(a[3], false, 0));
		if (0 === result) return b[3] - a[3];//deferring to the later index
			else return result;
	});
	// for (i = 0; i < active.length; i++)
	// 	console.log(active[i]+":"+(timeDir[active[i]][1][1] + Detect.findInterval(active[i], false, 0)));
	// console.log("---");
	// for (i = 0; i < moveQueue.length; i++)
	// 	console.log(moveQueue[i][3]+":"+(timeDir[moveQueue[i][3]][1][1] + Detect.findInterval(moveQueue[i][3], false, 0)));
	moveQueue.splice(0, active.length);//ideally they wouldn't be added in the first place
	// console.log("---");
	// for (i = 0; i < moveQueue.length; i++)
	// 	console.log(moveQueue[i][3]+":"+(timeDir[moveQueue[i][3]][1][1] + Detect.findInterval(moveQueue[i][3], false, 0)));

	//priming moveQueue indeces
	//active stems
	var riftIndex = 0;
	for (i = 0; i < active.length; i++) {
		var callerBase = Detect.findInterval(active[i], false, 0);
		for (j = riftIndex; j < moveQueue.length; j++) {
			var indexTotal = timeDir[moveQueue[j][3]][1][1] + Detect.findInterval(moveQueue[j][3], false, 0);
			if (indexTotal >= callerBase) {
				moveQueue[j][1] = active[i];
				moveQueue[j][2] = (indexTotal - callerBase)/timeDir[active[i]][1][1];
			} else {
				break;
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
				moveQueue[i][1] = (60/1000)*movSpeed / riftDuration;
				// if (0 >= riftBridge)
				riftBridge.x = (riftDuration - timeDir[moveQueue[i][3] + 1][1][1]*(1 - bridge[timeDir[moveQueue[i][3] + 1][0][0]].x)) / riftDuration;
				if (0 === i) {
					// console.log("rift");
					riftBridge.i = -moveQueue[0][1];
					riftBridge.e = 0;
				}
				riftIndex++;
			}
			var callerBase = Detect.findInterval(moveQueue[i][3], false, 0);
			for (j = riftIndex; j < moveQueue.length; j++) {
				var indexTotal = timeDir[moveQueue[j][3]][1][1] + Detect.findInterval(moveQueue[j][3], false, 0);
				var ici = timeDir[moveQueue[j][3]][0][0];
				var ini = timeDir[moveQueue[j][3]][0][1];
				if (charDir[ici].length > ini + 1 && timeDir[moveQueue[j][3]][1][1] >= Detect.findInterval(charDir[ici][ini + 1].s_i, false, charDir[ici][ini].s_i)) {
					moveQueue[j][1] = charDir[ici][ini + 1].s_i;
					moveQueue[j][2] = 0;
				} else {
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

	for (i = 0; i < active.length; i++) {
		console.log(active[i]+":"+(timeDir[active[i]][1][1] + Detect.findInterval(active[i], false, 0)));
	}
	for (i = 0; i < moveQueue.length; i++) {
		console.log(moveQueue[i][3]+":"+(timeDir[moveQueue[i][3]][1][1] + Detect.findInterval(moveQueue[i][3], false, 0)));
	// 	console.log(moveQueue[i]);
	}
	for (i = 0; i < moveQueue.length; i++) {
		console.log(moveQueue[i]);
	}

	targetIndex = target;

	idle = false;
	this.redraw();

	// moveQueue = new Array();
}
Main.prototype.getExtentNext = function(s_i, target, end) {
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
Main.prototype.getExtentPrev = function(s_i, target, end) {
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
//does not yet set riftBridge

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
	now = timeDir.length - 1;
	this.redraw();
	now = charDir.length - 1;
	this.redraw();
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
