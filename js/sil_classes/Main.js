// private var coordVis:Sprite;

// public var anc:Array;
// public var bridge:Array;
// public var riftBridge:Point;

// public var path:Array; //?
// public var line:Array;


function Main() {
	Detect = new Detect();
	this.genLocDir();
	// console.log("time:");
	// console.log(timeDir);
	// console.log("char:");
	// console.log(charDir);
	// console.log("loc:");
	// console.log(locDir);
	// console.log("draw:");
	// console.log(drawSequence);
	// console.log("anc:");
	// console.log(anc);
	// console.log("bridge:");
	// console.log(bridge);
}

Main.prototype.redraw = function() {
	var iLen = anc.length;
	for (var i = 0; i < iLen; i++) {
		if (0 !== anc[i].i) {
			anc[i].x += anc[i].i;
			anc[i].i *= anc[i].f;
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
			bridge[i].i *= bridge[i].f;
		}
		if (1 <= bridge[i].x) {
			bridge[i].x = 1;
			bridge[i].i = 0;
		} else if (0 >= bridge[i].x) {
			bridge[i].x = 0;
			bridge[i].i = 0;
		}
	}
	//loop for path underlay; not only does this create the line underlay, it
	//also sequenced in such a way as to
	//the parameter 3 passed to generate is one of four channels, generating not the node, nor one of two sides but the whole path
	var can = document.getElementById('canvas');
	var ctx = can.getContext('2d');
	ctx.clearRect(0,0,can.width,can.height);
	this.visLoc();
	frozenNow = now;
	// for (var i = 0; i <= frozenNow; i++) {
	// 	charDir[timeDir[i][0][0]][timeDir[i][0][1]].generate(3);
	// }
	//loop through drawSequence
	iLen = drawSequence.length;
	var jLen;
	for (var i = 0; i < iLen; i++) {
		jLen = drawSequence[i].length;
		for (var j = 0; j < jLen; j++) {
			// if (drawSequence[i][j][2])
				// char[drawSequence[i][j][0]][drawSequence[i][j][1]].generate(drawSequence[i][j][2], 0);
				// true;
			// else
			charDir[drawSequence[i][j][0]][drawSequence[i][j][1]].generate(0, 2);
		}
	}
}

Main.prototype.genLocDir = function() {
	this.genSequence(5, Math.floor(Math.random()*5) + 16);
	now = timeDir.length - 1;
	console.log(timeDir.length)

	locDir = new Array();
	var locDirKey = new Array();
	drawSequence = new Array();

	var i, j, k,
		keyed, key;

	var loc;
	var c_i, n_i;

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
			loc = timeDir[term[j][0]][2][0];
			keyed = false;
			for (k = 0; k < locDirKey.length; k++) {
				if (JSON.stringify(loc) === JSON.stringify(locDirKey[k])) {
					key = k;
					keyed = true;
					break;
				}
			}
			if (false === keyed) {
				key = locDirKey.length;
				locDirKey.push(loc);
				locDir.push(new Array());
				drawSequence.push(new Array());
			}

			locDir[key].push([timeDir[term[j][0]][0][0], timeDir[term[j][0]][0][1], term[j][0]]);
			drawSequence[key].push([ timeDir[term[j][0]][0][0], timeDir[term[j][0]][0][1], 0 ]);

			charDir[timeDir[term[j][0]][0][0]][timeDir[term[j][0]][0][1]].l_x = key;
			charDir[timeDir[term[j][0]][0][0]][timeDir[term[j][0]][0][1]].l_y = locDir[key].length - 1;
		}

		//adding path of current index, registering if movement is instantaneous (consolidate with above?)
		// line[c_i].push(new Sprite());
		// lineCont.addChild(line[c_i][n_i]);
		loc = timeDir[i][2][0];
		charDir[c_i].push(new Node(c_i, n_i, cols[startColour][c_i], loc, i));

		//determining key for entry of new Node into drawSequence
		keyed = false;
		for (k = 0; k < locDirKey.length; k++) {
			if (JSON.stringify(loc) === JSON.stringify(locDirKey[k])) {
				key = k;
				keyed = true;
				break;
			}
		}
		if (false === keyed) {
			key = locDirKey.length;
			locDirKey.push(loc);
			locDir.push(new Array());
			drawSequence.push(new Array());
		}
		//adding reference to path both to start and to end (initial nodes have no path)
		if (n_i > 0) {
			drawSequence[charDir[c_i][n_i - 1].l_x].push([c_i, n_i, 1]);
			drawSequence[key].push([c_i, n_i, 2]);}

		if (timeDir[i][1][1] == 0) {
			locDir[key].push([c_i, n_i, i]);
			drawSequence[key].push([c_i, n_i, 0]);

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
		loc = timeDir[term[i][0]][2][0];
		keyed = false;
		for (j = 0; j < locDirKey.length; j++) {
			if (JSON.stringify(loc) === JSON.stringify(locDirKey[j])) {
				key = j;
				keyed = true;
				break;
			}
		}
		if (false === keyed) {
			key = locDirKey.length;
			locDirKey.push(loc);
			locDir.push(new Array());
			drawSequence.push(new Array());
		}

		locDir[key].push([timeDir[term[i][0]][0][0], timeDir[term[i][0]][0][1], term[i][0]]);
		drawSequence[key].push([ timeDir[term[i][0]][0][0], timeDir[term[i][0]][0][1], 0 ]);

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
	riftBridge = {x:1, inc:0};

	for (var i = 0; i < paths; i++) {
		timeDir.push(new Array());
		timeDir[timeDir.length - 1].push([i]);
		timeDir[timeDir.length - 1].push([0, 0]);
		timeDir[timeDir.length - 1].push([points[Math.floor(Math.random()*points.length)]]);
	}

	var c_i;
	for (var i = 0; i < moves; i++) {
		c_i = Math.floor(Math.random()*paths);
		timeDir.push(new Array());
		timeDir[timeDir.length - 1].push([c_i]);
		timeDir[timeDir.length - 1].push([Math.floor(Math.random()*11), Math.floor(Math.random()*11) + Math.floor(Math.random()*6) + 5]);
		timeDir[timeDir.length - 1].push([this.randHex(c_i)]);
	}
}
Main.prototype.randHex = function(charIndex) {
	var i;
	for (i = timeDir.length - 2; i >= 0; i--) {
		if (charIndex == timeDir[i][0][0])
		{ break;}
	}
	var viable = false, ni;
	while (true) {
		ni = points[Math.floor(Math.random()*points.length)];
		if (JSON.stringify(ni) !== JSON.stringify(timeDir[i][2][0])) break;
	}
	return ni;
}
Main.prototype.genHex = function() {
	points = new Array();
	points.push({x: 100, y: 300});
	points.push({x: 200, y: 114});
	points.push({x: 400, y: 114});
	points.push({x: 500, y: 300});
	points.push({x: 400, y: 486});
	points.push({x: 200, y: 486});

	/*var coordVis = ;
	addChild(coordVis);
	coordVis.graphics.beginFill(0xDFDFDF);
	var i:uint;
	for (i = 0; i < points.length; i++) {
		coordVis.graphics.drawCircle(points[i].x, points[i].y, 3);
	}
	coordVis.graphics.endFill();*/
}
Main.prototype.visLoc = function() {
	for (var i = 0; i < points.length; i++) {
		var can = document.getElementById('canvas');
		var ctx = can.getContext('2d');
		ctx.beginPath();
		ctx.fillStyle = '#CDCDCD';
		ctx.arc(points[i].x, points[i].y, 4, 0, Math.PI*2)
		ctx.fill();
		// ctx.stroke;
		ctx.closePath();
	}
}
