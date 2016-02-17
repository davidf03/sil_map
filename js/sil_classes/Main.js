var charConsole;
function Main() {
	Detect = new Detect();
	this.genLocDir();
	console.log(timeDir);
	console.log(charDir);
	console.log(locDir);
	// console.log(drawSequence);
	console.log(testSequence);
	console.log(anc);
	console.log(bridge);
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
			"<button class='c-prev icon-alone'>" +
				"<span class='fa fa-play fa-rotate-180'></span>" +
				"<span class='screen-reader-text'>RSS</span>" +
			"</button>" +
			"<button class='toggle icon-alone'>" +
				"<span class='fa fa-circle'></span>" +
				"<span class='screen-reader-text'>RSS</span>" +
			"</button>" +
			"<button class='c-next icon-alone'>" +
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

Main.prototype.toggleChar = function(charIndex) {
	if (1 === anc[charIndex].x || 0 < anc[charIndex].i)
		anc[charIndex].i = -fps/1000*anc[charIndex].x*visSpeed;
	else
		anc[charIndex].i = fps/1000*(1 - anc[charIndex].x)*visSpeed;
	// anc[0].f = 1/visEase;
	if (idle) {
		requestAnimFrame(this.redraw.bind(this));
		idle = false;
	}
}
Main.prototype.redraw = function() {
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
		}
		if (1 <= bridge[i].x) {
			bridge[i].x = 1;
			bridge[i].i = 0;
		} else if (0 >= bridge[i].x) {
			bridge[i].x = 0;
			bridge[i].i = 0;
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
	if (active) requestAnimFrame(this.redraw.bind(this));
	else idle = true;

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

/* time stuff */
Main.prototype.evalState = function(c_i) {
	if (charDir[c_i].length > 1 && (now < charDir[c_i][charDir[c_i].length - 1].s_i || bridge[c_i].x < 1) && anc[c_i].x >= 1) {
		this.changeState(c_i, true, true);
	} else {
		this.changeState(c_i, true, false);
	}
	if (charDir[c_i].length > 1 && now >= charDir[c_i][0].s_i && false == Detect.isWithin(now, 0) && anc[c_i].x >= 1) {
		this.changeState(c_i, false, true);
	} else {
		this.changeState(c_i, false, false);
	}
}
Main.prototype.changeState = function(c_i, next, on) {
	if (next === 'undefined') next = true;
	if (on === 'undefined') on = true;

	if (next) {
		var inext = document.querySelector('[data-index="'+c_i+'"] .i-next');
		var cnext = document.querySelector('[data-index="'+c_i+'"] .c-next');
		inext.onclick = null;
		cnext.onclick = null;
		if (on) {
			inext.onclick = function(e) {
				main.goNext(inext.parentNode.parentNode.dataset.index, true);
			};
			cnext.onclick = function(e) {
				main.goNex(cnext.parentNode.parentNode.dataset.index, false);
			};
		}
	} else {
		var iprev = document.querySelector('[data-index="'+c_i+'"] .i-prev');
		var cprev = document.querySelector('[data-index="'+c_i+'"] .c-prev');
		iprev.onclick = null
		cprev.onclick = null
		if (on) {
			iprev.onclick = function(e) {
				main.goPrev(iprev.parentNode.parentNode.dataset.index);
			};
			cprev.onclick = function(e) {
				main.goPrev(cprev.parentNode.parentNode.dataset.index);
			};
		}
	}
}
Main.prototype.pause = function() {
	for (var i = 0; i < bridge.length; i++)
		bridge[i].i = 0;
	riftBridge.i = 0;

	if (now + 1 < timeDir.length) {
		charDir[timeDir[now + 1][0][0]][timeDir[now + 1][0][1]].movementNext(false);}
	var held = 2;
	for (var i = 0; i < charDir.length; i++) {
		for (var j = charDir[i].length - 1; j >= 0; j--) {
			if (charDir[i][j].s_i <= now) {
				charDir[i][j].movementNext(false);

				for (var k = now + held; k < timeDir.length; k++, held++) {
					if (Detect.isWithin(k, charDir[i][j].s_i, 0)) {
						charDir[timeDir[k][0][0]][timeDir[k][0][1]].movementNext(false);
					} else {
						break;}
				}
				break;
			}
		}
	}
}
Main.prototype.goNext = function(c_i, direct) {
	// this.pause();
	var end;
	var i;
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
		//fix this!
		this.instant(c_i, target, end);

		if (idle) this.redraw();
		for (i = 0; i < charDir.length; i++)
			this.evalState(i);
	} else {
		if (0 >= timeDir[now][1][2] && 0 >= timeDir[now][1][1]) {
			/*if (1 <= riftBridge.x) {
				riftBridge.x = 0;}*/
			// TweenLite.to(riftBridge, Detect.findInterval(now + 1, false)*(1 - riftBridge.x), {x:1, ease:Linear.easeNone});
			charDir[timeDir[now + 1][0][0]][timeDir[now + 1][0][1]].movementNext(true, target, end, 0, true);
		} else {
			continuous(target, end);}
	}
}
Main.prototype.goPrev = function(c_i) {
	// this.pause();
	var i;
	var found = false;
	for (i = charDir[c_i].length - 1; i >= 0; i--) {
		if (charDir[c_i][i].s_i <= now) {
			if (bridge[c_i].x > 0 && bridge[c_i].x < 1 || bridge[c_i].x >= 1 && Detect.isWithin(now, charDir[c_i][i].s_i, 0)) {
				target = charDir[c_i][i].s_i;
				//(extra) logic below provides for last index ending movement before others, going to end rather than beginning
				if (target == charDir[timeDir[target][0][0]][charDir[timeDir[target][0][0]].length - 1].s_i) {
					var last = true;
					for (var j = 0; j < charDir.length; j++) {
						if (j != c_i && now >= charDir[j][charDir[j].length - 1].s_i && Detect.isWithin(target, charDir[j][charDir[j].length - 1].s_i, 2, 1, false)) {
							last = false;
							break;}
					}
					if (last) { this.instant(c_i, target, false);}
							 else { this.instant(c_i, target, true);}
				} else {
					this.instant(c_i, target, false);}
				found = true;
			} else if (bridge[c_i].x >= 1) {
				target = charDir[c_i][i].s_i;
				this.instant(c_i, target, true);
				found = true;
			} else if (i > 0) {
				target = charDir[c_i][i - 1].s_i;
				if (Detect.isWithin(now, target)) {
					this.instant(c_i, target, false);
				} else {
					this.instant(c_i, target, true);}
				found = true;}
			break;
		}
	}
	if (found) {
		//severe lack of precision; should regen only those necessary (requires consideration of those nodes responsible only for path caps)
		if (idle) this.redraw();
		for (i = 0; i < charDir.length; i++) {
			this.evalState(i);
		}
	}
}
Main.prototype.continuous = function(c_i, target, end) {
	//discontinuing any current animation processes
	//Controller.pause();
	//check bridges for ones active
	//could retrieve actives within the section above; see first: next/prev

	var active = new Array();
	var callers = new Array();
	var focused = true;
	for (var i = 0; i <= charDir.length; i++) {
		//looking for any animations to be resumed (defaulting current index)
		//if (i < charDir.length || false == unfocused) {
			//relevant indeces
			if (i < charDir.length) {
				if (i == timeDir[now][0][0]) {
					if (bridge[i].x < 1) {
						active.push(now);
						focused = false;}
				} else {
					//if (bridge[i].x < 1) {
					for (var j = charDir[i].length - 1; j >= 0; j--) {
						if (charDir[i][j].s_i <= now) {
							if (Detect.isWithin(now, charDir[i][j].s_i, 1, 2, false)) {
								active.push(charDir[i][j].s_i);
								focused = false;}
							break;}
					}
					//}
				}
			} else if (focused) {
				active.push(now);}
			/*//callers, needed to initialise movement
			var noCaller = true;
			for (j = 0; noCaller && j < charDir.length; j++) {
				for (var k = charDir[j].length - 1; k >= 0; k--) {
					if (charDir[j][k].s_i < active[active.length - 1] && (0 < Detect.findInterval(active[active.length - 1], false, charDir[j][k].s_i))) {// || 0 == Detect.findInterval(charDir[j][k].s_i, false, 0))) {
						if (Detect.isWithin(active[active.length - 1], charDir[j][k].s_i, 0)) {
							callers.push(charDir[j][k].s_i);
							noCaller = false;}
						break;}
				}
			}
			//to accomodate rift
			if (noCaller) {
				callers.push(-1);}
			if (i >= charDir.length) {
				break;}*/
		//}
	}

	//sort arrays chronologically
	//not needed

	//assign remaining animations in appropriate direction
	//call wait function on current index (assuming next!)
	//perhaps unnecesary to realign riftBridge:
	if (false == focused) {
		riftBridge.x = 1;}
	for (i = 0; i < active.length; i++) {
		charDir[timeDir[active[i]][0][0]][timeDir[active[i]][0][1]].waiting = true;}
	for (i = 0; i < active.length; i++) {
		//if (callers[i] < 0) {
		charDir[timeDir[active[i]][0][0]][timeDir[active[i]][0][1]].movementNext(true, target, end, now, true, false);
		//} else {
		//	charDir[timeDir[active[i]][0][0]][timeDir[active[i]][0][1]].movementNext(true, target, end, callers[i], false, false);}
	}
}
//does not yet set riftBridge
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
	for (var i = 0; i < bridge.length; i++)
		console.log(bridge[i].x);
	console.log(now);
}

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
		// line[c_i].push(new Sprite());
		// lineCont.addChild(line[c_i][n_i]);
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

		if (timeDir[i][1][1] == 0) {
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
	now = charDir.length - 1;
	this.redraw();
}
Main.prototype.genSequence = function(paths, moves) {
	/*path = new Array();
	line = new Array();*/
	bridge = new Array();
	anc = new Array();
	timeDir = new Array();
	charDir = new Array();
	this.genHex();

	for (var i = 0; i < paths; i++) {
		charDir.push(new Array());
		/*path.push(new Array());
		path[path.length - 1].push(new Sprite());
		line.push(new Array());*/
		bridge.push({x:1, i:0, f:1});
		anc.push({x:1, i:0, f:1});
	}
	riftBridge = {x:1, i:0, f:1};

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
