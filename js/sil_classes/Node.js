var c_i, n_i, s_i, l_i, l_x, l_y;
var radius, stroke;
var oth, lastOth;
var col;

var lastNode;
var n0t1, n0t2, n0t2e, n1t1, n1t2, n1t2e, nt1m, nt2m; //tangent points
var outDrawLimit, inDrawLimit;
var pastRadius, pastEdge, pastFirstStop, pastSecondStop;

var n0e1, n0e2, n1e1, n1e2; //edge points
var n0g1, n0g2, n1g1, n1g2; //gradient points
var underComp, overComp, compDiff;

var pathCaps;
var arcSpan;

var animating;
var lastAnc, lastBridge, present, moving, waiting;
var waitNextFunction;
var moveNextFunction;

/*public static function get c_i() { return this.c_i;}
public static function get n_i() { return this.n_i;}
public static function get s_i() { return this.s_i;}
public static function get l_x() { return this.l_x;}
public static function get l_y() { return this.l_y;}*/

/*function n0t1() { return this.n0t1;}
function n1t1() { return this.n1t1;}
function n0t2() { return this.n0t2;}
function n0t2e() { return this.n0t2e;}
function n1t2() { return this.n1t2;}
function n1t2e() { return this.n1t2e;}*/

Node.prototype.getRadius = function() { return (this.oth + 1)*radius;}
Node.prototype.getLastRadius = function() { return (this.lastOth + 1)*radius;}
Node.prototype.getloc = function() { return loc[this.l_i];}
Node.prototype.recolour = function(newCol) { this.col = newCol; this.genNode();}

// 0.1 works for denominators as far as tests conduncted were concerned; however 0.0001 does not, 0.01 did not work once
Node.prototype.findIntercepts = function(height, exRad, wayRad, loc, wayLoc, inbound) {
	var xDiff = wayLoc.x - loc.x, yDiff = wayLoc.y - loc.y;
	var dist = Math.sqrt(xDiff*xDiff + yDiff*yDiff);
	var compound = Math.atan2(wayRad - height, dist) + Math.asin(height/exRad);
	if (inbound) compound = -compound;
	var angle = -(compound - Math.atan2(yDiff, xDiff))%(Math.PI*2);
	if (0 > angle) angle += Math.PI*2;

	var intercept = new Point(0,0);
	intercept = intercept.polar(exRad, angle);

	intercept.x += loc.x, intercept.y += loc.y;
	return intercept;
}
Node.prototype.findTangentPoints = function(n0l, n0r, n1r) {
	var p, px, py;
	if (n1r > n0r) {
		px = n0l.x * n1r;
		px /= n1r - n0r;
		py = n0l.y * n1r;
		py /= n1r - n0r;
		p = new Point(px, py);
	} else if (n0r > n1r) {
		px = -(n0l.x * n1r);
		px /= n0r - n1r;
		py = -(n0l.y * n1r);
		py /= n0r - n1r;
		p = new Point(px, py);
	}
	// console.log(p, px, py);

	var t1, t2, t3, t4;

	var denTerm = (p.x - n0l.x) * (p.x - n0l.x);
	denTerm += (p.y - n0l.y) * (p.y - n0l.y);
	if (denTerm == 0) { denTerm = 0.1;}
	var numRight = (p.x - n0l.x) * (p.x - n0l.x);
	numRight = numRight + (p.y - n0l.y) * (p.y - n0l.y);
	numRight = numRight - n0r * n0r;
	numRight = Math.sqrt(numRight);

	var xNumRight = n0r * (p.y - n0l.y);
	xNumRight = xNumRight * numRight;
	var x0 = n0r * n0r * (p.x - n0l.x);
	var x1 = x0 + xNumRight;
	x1 = x1 / denTerm;
	x1 = x1 + n0l.x;
	var x2 = x0 - xNumRight;
	x2 = x2 / denTerm;
	x2 = x2 + n0l.x;

	var yNumRight = n0r * (p.x - n0l.x);
	yNumRight = yNumRight * numRight;
	var y0 = n0r * n0r * (p.y - n0l.y);
	var y1 = y0 + yNumRight;
	y1 = y1 / denTerm;
	y1 = y1 + n0l.y;
	var y2 = y0 - yNumRight;
	y2 = y2 / denTerm;
	y2 = y2 + n0l.y;

	t1 = new Point(x1, y2);
	t2 = new Point(x2, y1);

	denTerm = p.x * p.x;
	denTerm += p.y * p.y;
	if (denTerm == 0) { denTerm = 0.1;}
	numRight = p.x * p.x;
	numRight = numRight + p.y * p.y;
	numRight = numRight - n1r * n1r;
	numRight = Math.sqrt(numRight);

	xNumRight = n1r * p.y;
	xNumRight = xNumRight * numRight;
	x0 = n1r * n1r * p.x;
	x1 = x0 + xNumRight;
	x1 = x1 / denTerm;
	x2 = x0 - xNumRight;
	x2 = x2 / denTerm;

	yNumRight = n1r * p.x;
	yNumRight = yNumRight * numRight;
	y0 = n1r * n1r * p.y;
	y1 = y0 + yNumRight;
	y1 = y1 / denTerm;
	y2 = y0 - yNumRight;
	y2 = y2 / denTerm;

	t3 = new Point(x1, y2);
	t4 = new Point(x2, y1);

	// console.log(t1, t2, t3, t4);

	if (n1r > n0r) {
		// console.log('n1r > n0r');
		this.n0t1 = t2;
		this.n1t1 = t4;
	} else {
		// console.log('n1r <= n0r');
		this.n0t1 = t1;
		this.n1t1 = t3;}
}
Node.prototype.genPath = function(channel, active) {
	this.lastBridge = bridge[this.c_i].x;
	var n0l = new Point(loc[this.lastNode.l_i].x - loc[this.l_i].x, loc[this.lastNode.l_i].y - loc[this.l_i].y);
	var n0r = this.getLastRadius();
	var n1r = this.getRadius();

	var angle;
	var angle2;
	var offset = new Point(0, 0);

	var canvas = document.getElementById('location');
	var ctx = canvas.getContext('2d');

	//working variables and main path
	if (3 === channel) {
	 	if (active) {
			//path guides activity
			if (n0r == n1r) {
				var xTerm = n0l.x, yTerm = n0l.y;
				if (xTerm == 0) xTerm = 0.1;
				if (yTerm == 0) yTerm = 0.1;

				angle = -Math.atan2(-xTerm, -yTerm);
				offset = offset.polar(n1r, angle);
				this.n0t1 = new Point(n0l.x + offset.x, n0l.y + offset.y);
				this.n1t1 = new Point(offset.x, offset.y);
			} else {
				this.findTangentPoints(n0l, n0r, n1r);
			}

			xTerm = this.n1t1.x, yTerm = this.n1t1.y;
			if (0 === xTerm) xTerm = 0.1;
			if (0 === yTerm) yTerm = 0.1;
			angle = Math.atan2(yTerm, xTerm);
			var lastRadius = this.lastAnc*radius;
			offset = offset.polar(-lastRadius, angle);
			this.n0t2 = new Point(this.n0t1.x + offset.x, this.n0t1.y + offset.y);
			this.n1t2 = new Point(this.n1t1.x + offset.x, this.n1t1.y + offset.y);

			this.n0t2e = this.findIntercepts(n0r - lastRadius, n0r, n1r - lastRadius, n0l, new Point(0,0), false);
			this.n1t2e = this.findIntercepts(n1r - lastRadius, n1r, n0r - lastRadius, new Point(0,0), n0l, true);

			//fragment guides activity
			if (locData[this.lastNode.l_x][0][this.lastNode.l_y][0] < locData[this.lastNode.l_x][1][0]) {
				this.n0e2 = this.findIntercepts(n0r - lastRadius, (locData[this.lastNode.l_x][1][0] + 1)*radius, n1r - lastRadius, n0l, new Point(0, 0), false);
			} else {
				this.n0e2 = new Point(this.n0t2e.x, this.n0t2e.y);
			}
			this.n0e1 = new Point(this.n0e2.x - offset.x, this.n0e2.y - offset.y);

			var gradOffset = new Point(0, 0);
			gradOffset = offset.polar(fadeRange*radius, Math.atan2(this.n1t1.y - this.n0t1.y, this.n1t1.x - this.n0t1.x));
			this.n0g1 = new Point(this.n0e2.x - offset.x + gradOffset.x, this.n0e2.y - offset.y + gradOffset.y);
			this.n0g2 = new Point(this.n0e2.x + gradOffset.x, this.n0e2.y + gradOffset.y);

			if (locData[this.l_x][0][this.l_y][0] < locData[this.l_x][1][0]) {
				this.n1e2 = this.findIntercepts(n1r - lastRadius, (locData[this.l_x][1][0] + 1)*radius, n0r - lastRadius, new Point(0, 0), n0l, true);
			} else {
				this.n1e2 = new Point(this.n1t2e.x, this.n1t2e.y);
			}
			this.n1e1 = new Point(this.n1e2.x - offset.x, this.n1e2.y - offset.y);

			this.n1g1 = new Point(this.n1e2.x - offset.x - gradOffset.x, this.n1e2.y - offset.y - gradOffset.y);
			this.n1g2 = new Point(this.n1e2.x - gradOffset.x, this.n1e2.y - gradOffset.y);
		}
		//determining path draw limit
		if (this.present) {
			this.outDrawLimit = this.n1t1;
			this.inDrawLimit = this.n1t2;
		} else {
			this.outDrawLimit = new Point(this.n1t1.x - (this.n1t1.x - this.n0t1.x)*(1 - this.lastBridge), this.n1t1.y - (this.n1t1.y - this.n0t1.y)*(1 - this.lastBridge));;
			this.inDrawLimit = new Point(this.n1t2.x - (this.n1t2.x - this.n0t2.x)*(1 - this.lastBridge), this.n1t2.y - (this.n1t2.y - this.n0t2.y)*(1 - this.lastBridge));
		}

		//fragment-connecting main path
		var xDiff = this.n1e2.x - this.n0e2.x, yDiff = this.n1e2.y - this.n0e2.y;
		if (Math.sqrt(xDiff*xDiff + yDiff*yDiff) > fadeRange*radius) {

			var paths = document.querySelector('.paths');
			var pathctx = paths.getContext('2d');

			//marking path extent
			this.pastRadius = false, this.pastEdge = false, this.pastFirstStop = false, this.pastSecondStop = false;
			if (this.present) {
				this.pastRadius = true, this.pastEdge = true, this.pastFirstStop = true, this.pastSecondStop = true;
			} else {
				var trueXDiff = this.inDrawLimit.x - this.n0t2.x, trueYDiff = this.inDrawLimit.y - this.n0t2.y;
				var trueDiff = Math.sqrt(trueXDiff*trueXDiff + trueYDiff*trueYDiff);
				var testXDiff = this.n0g2.x - this.n0t2.x, testYDiff = this.n0g2.y - this.n0t2.y;
				if (trueDiff > Math.sqrt(testXDiff*testXDiff + testYDiff*testYDiff)) {
					this.pastFirstStop = true;
					this.pastEdge = true;
					this.pastRadius = true;
					testXDiff = this.n1g2.x - this.n0t2.x, testYDiff = this.n1g2.y - this.n0t2.y;
					if (trueDiff > Math.sqrt(testXDiff*testXDiff + testYDiff*testYDiff)) {
						this.pastSecondStop = true;
					}
				} else {
					testXDiff = this.n0e2.x - this.n0t2.x, testYDiff = this.n0e2.y - this.n0t2.y;
					if (trueDiff > Math.sqrt(testXDiff*testXDiff + testYDiff*testYDiff)) {
						this.pastEdge = true;
						this.pastRadius = true;
					} else {
						testXDiff = this.n0t2e.x - this.n0t2.x, testYDiff = this.n0t2e.y - this.n0t2.y;
						if (trueDiff > Math.sqrt(testXDiff*testXDiff + testYDiff*testYDiff)) {
							this.pastRadius = true;
						}
					}
				}
			}
			//path
			if (this.pastEdge) {
				var pathXLen = this.n1e2.x - this.n0e2.x, pathYLen = this.n1e2.y - this.n0e2.y;
				var stopProportion = fadeRange*radius/Math.sqrt(pathXLen*pathXLen + pathYLen*pathYLen);

				var pathGrdStroke = pathctx.createLinearGradient(loc[this.l_i].x + this.n0e2.x, loc[this.l_i].y + this.n0e2.y, loc[this.l_i].x + this.n1e2.x, loc[this.l_i].y + this.n1e2.y);
				pathGrdStroke.addColorStop(0, this.hexToRGB('#000000', 0));//inverted alphas compared to node[In/Out]Grd
				pathGrdStroke.addColorStop(stopProportion, this.hexToRGB('#000000', 1));
				pathGrdStroke.addColorStop(1 - stopProportion, this.hexToRGB('#000000', 1));
				pathGrdStroke.addColorStop(1, this.hexToRGB('#000000', 0));

				if ((isNaN(this.n1t2e.y) || isNaN(this.n1t2e.x) || isNaN(this.n0t2e.y) || isNaN(this.n0t2e.x)) === false) {
					//path fill
					var pathGrdFill = pathctx.createLinearGradient(loc[this.l_i].x + this.n0e2.x, loc[this.l_i].y + this.n0e2.y, loc[this.l_i].x + this.n1e2.x, loc[this.l_i].y + this.n1e2.y);
					pathGrdFill.addColorStop(0, this.hexToRGB(this.baseCol, 0));
					pathGrdFill.addColorStop(stopProportion, this.hexToRGB(this.baseCol, 1));
					pathGrdFill.addColorStop(1 - stopProportion, this.hexToRGB(this.baseCol, 1));
					pathGrdFill.addColorStop(1, this.hexToRGB(this.baseCol, 0));

					//fill gradient reinforcement
					pathctx.fillStyle = pathGrdFill;
					pathctx.beginPath();
					pathctx.moveTo(loc[this.l_i].x + this.n0e1.x, loc[this.l_i].y + this.n0e1.y);
					if (this.pastFirstStop) {
						pathctx.lineTo(loc[this.l_i].x + this.n0g1.x, loc[this.l_i].y + this.n0g1.y);
						pathctx.lineTo(loc[this.l_i].x + this.n0g2.x, loc[this.l_i].y + this.n0g2.y);
					} else {
						pathctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y);
						pathctx.lineTo(loc[this.l_i].x + this.inDrawLimit.x, loc[this.l_i].y + this.inDrawLimit.y);
					}
					pathctx.lineTo(loc[this.l_i].x + this.n0e2.x, loc[this.l_i].y + this.n0e2.y);
					pathctx.fill();
					pathctx.closePath();
					if (this.pastSecondStop) {
						pathctx.beginPath();
						pathctx.moveTo(loc[this.l_i].x + this.n1g1.x, loc[this.l_i].y + this.n1g1.y);
						pathctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y);
						pathctx.lineTo(loc[this.l_i].x + this.inDrawLimit.x, loc[this.l_i].y + this.inDrawLimit.y);
						pathctx.lineTo(loc[this.l_i].x + this.n1g2.x, loc[this.l_i].y + this.n1g2.y);
						pathctx.fill();
						pathctx.closePath();
					}

					//main path
					pathctx.strokeStyle = pathGrdStroke;
					pathctx.lineWidth = stroke;
					pathctx.beginPath();
					pathctx.moveTo(loc[this.l_i].x + this.n0e1.x, loc[this.l_i].y + this.n0e1.y);
					pathctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y)
					pathctx.lineTo(loc[this.l_i].x + this.inDrawLimit.x, loc[this.l_i].y + this.inDrawLimit.y);
					pathctx.lineTo(loc[this.l_i].x + this.n0e2.x, loc[this.l_i].y + this.n0e2.y);
					pathctx.fill();
					pathctx.stroke();
					pathctx.closePath();

					//stroke gradient reinforcement
					pathctx.fillStyle = null;
					pathctx.lineWidth = stroke*0.8;
					pathctx.beginPath();
					pathctx.moveTo(loc[this.l_i].x + this.n0e1.x, loc[this.l_i].y + this.n0e1.y);
					if (this.pastFirstStop) {
						pathctx.lineTo(loc[this.l_i].x + this.n0g1.x, loc[this.l_i].y + this.n0g1.y);
						pathctx.stroke();
						pathctx.closePath();
						pathctx.beginPath();
						pathctx.moveTo(loc[this.l_i].x + this.n0g2.x, loc[this.l_i].y + this.n0g2.y);
					} else {
						pathctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y);
						pathctx.lineTo(loc[this.l_i].x + this.inDrawLimit.x, loc[this.l_i].y + this.inDrawLimit.y);
					}
					pathctx.lineTo(loc[this.l_i].x + this.n0e2.x, loc[this.l_i].y + this.n0e2.y);
					pathctx.stroke();
					pathctx.closePath();
					if (this.pastSecondStop) {
						pathctx.beginPath();
						pathctx.moveTo(loc[this.l_i].x + this.n1g1.x, loc[this.l_i].y + this.n1g1.y);
						pathctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y);
						pathctx.lineTo(loc[this.l_i].x + this.inDrawLimit.x, loc[this.l_i].y + this.inDrawLimit.y);
						pathctx.lineTo(loc[this.l_i].x + this.n1g2.x, loc[this.l_i].y + this.n1g2.y);
						pathctx.stroke();
						pathctx.closePath();
					}
				} else {
					//outside line
					pathctx.strokeStyle = pathGrdStroke;
					pathctx.lineWidth = stroke;
					pathctx.beginPath();
					pathctx.moveTo(loc[this.l_i].x + this.n0e1.x, loc[this.l_i].y + this.n0e1.y);
					pathctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y);
					pathctx.stroke();
					pathctx.closePath();

					//stroke gradient reinforcement
					pathctx.fillStyle = null;
					pathctx.lineWidth = stroke*0.8;
					pathctx.beginPath();
					pathctx.moveTo(loc[this.l_i].x + this.n0e1.x, loc[this.l_i].y + this.n0e1.y);
					if (this.pastFirstStop) {
						pathctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y);
					} else {
						pathctx.lineTo(loc[this.l_i].x + this.n0g1.x, loc[this.l_i].y + this.n0g1.y);
					}
					pathctx.stroke();
					pathctx.closePath();
					if (this.pastSecondStop) {
						pathctx.beginPath();
						pathctx.moveTo(loc[this.l_i].x + this.n1g1.x, loc[this.l_i].y + this.n1g1.y);
						pathctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y);
						pathctx.stroke();
						pathctx.closePath();
					}
				}
			}
		}
	}

	// path break and outbound fragment
	if (1 === channel) {
		/* Anchoring path to previous node */
		ctx.fillStyle = this.baseCol;
		ctx.beginPath();
		ctx.arc(loc[this.lastNode.l_i].x, loc[this.lastNode.l_i].y, n0r - this.lastAnc*radius/2, 0, Math.PI*2);
		ctx.arc(loc[this.lastNode.l_i].x, loc[this.lastNode.l_i].y, n0r, 0, Math.PI*2);
		ctx.closePath();
		ctx.fill("evenodd");
		/* Capping to anchor paths of nodes interior */
		//activity could be monitored here to reduce calls to findIntercepts within
		this.genPathCaps(true, loc[this.lastNode.l_i], n0r);

		var gp1 = new Point(loc[this.l_i].x + this.n0e2.x, loc[this.l_i].y + this.n0e2.y);
		var gp2 = new Point(loc[this.l_i].x + this.n0g2.x, loc[this.l_i].y + this.n0g2.y);
		if (gp1.x === gp2.x) gp2.x += 0.01;
		var nodeGrdStroke = ctx.createLinearGradient(gp1.x, gp1.y, gp2.x, gp2.y);
		nodeGrdStroke.addColorStop(0, this.hexToRGB('#000000', 1));
		nodeGrdStroke.addColorStop(1, this.hexToRGB('#000000', 0));

		if ((isNaN(this.n1t2e.y) || isNaN(this.n1t2e.x) || isNaN(this.n0t2e.y) || isNaN(this.n0t2e.x)) === false) {
			var nodeGrdFill = ctx.createLinearGradient(gp1.x, gp1.y, gp2.x, gp2.y);
			nodeGrdFill.addColorStop(0, this.hexToRGB(this.baseCol, 1));
			nodeGrdFill.addColorStop(1, this.hexToRGB(this.baseCol, 0));
			//fill gradient reinforcement
			ctx.fillStyle = nodeGrdFill;
			if (this.pastEdge) {
				ctx.beginPath();
				ctx.moveTo(loc[this.l_i].x + this.n0e1.x, loc[this.l_i].y + this.n0e1.y);
				if (pastFirstStop) {
					ctx.lineTo(loc[this.l_i].x + this.n0g1.x, loc[this.l_i].y + this.n0g1.y);
					ctx.lineTo(loc[this.l_i].x + this.n0g2.x, loc[this.l_i].y + this.n0g2.y);
				} else {
					ctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y);
					ctx.lineTo(loc[this.l_i].x + this.inDrawLimit.x, loc[this.l_i].y + this.inDrawLimit.y);
				}
				ctx.lineTo(loc[this.l_i].x + this.n0e2.x, loc[this.l_i].y + this.n0e2.y);
				ctx.fill();
				ctx.closePath();
			}
			//main fragment
			ctx.beginPath();
			ctx.moveTo(loc[this.l_i].x + this.inDrawLimit.x, loc[this.l_i].y + this.inDrawLimit.y);
			ctx.lineTo(loc[this.l_i].x + this.n0t2e.x, loc[this.l_i].y + this.n0t2e.y);
			angle = Math.atan2(this.n0t2e.y - n0l.y, this.n0t2e.x - n0l.x);
			offset = new Point(0,0);
			offset = offset.polar(n0r - (stroke/2 + 0.35), angle);
			ctx.lineTo(loc[this.lastNode.l_i].x + offset.x, loc[this.lastNode.l_i].y + offset.y);
			angle2 = Math.atan2(this.n0t1.y - n0l.y, this.n0t1.x - n0l.x);
			ctx.arc(loc[this.lastNode.l_i].x, loc[this.lastNode.l_i].y, n0r - (stroke/2 + 0.35), angle2, angle);
			ctx.lineTo(loc[this.l_i].x + this.n0t1.x, loc[this.l_i].y + this.n0t1.y);
			ctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y);
			ctx.fill();
			ctx.closePath();

			//main stroke
			ctx.lineWidth = stroke;
			ctx.strokeStyle = nodeGrdStroke;
			ctx.fillStyle = null;
			ctx.beginPath();
			ctx.moveTo(loc[this.l_i].x + this.n0t1.x, loc[this.l_i].y + this.n0t1.y);
			if (this.pastFirstStop) {
				ctx.lineTo(loc[this.l_i].x + this.n0g1.x, loc[this.l_i].y + this.n0g1.y);
				ctx.stroke();
				ctx.closePath();
				ctx.beginPath();
				ctx.moveTo(loc[this.l_i].x + this.n0g2.x, loc[this.l_i].y + this.n0g2.y);
				ctx.lineTo(loc[this.l_i].x + this.n0t2e.x, loc[this.l_i].y + this.n0t2e.y);
			} else {
				ctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y);
				ctx.lineTo(loc[this.l_i].x + this.inDrawLimit.x, loc[this.l_i].y + this.inDrawLimit.y);
				if (this.pastRadius) {
					ctx.lineTo(loc[this.l_i].x + this.n0t2e.x, loc[this.l_i].y + this.n0t2e.y);
				}
			}
			ctx.stroke();
			ctx.closePath();

			//stroke gradient reinforcement
			if (this.pastEdge) {
				ctx.lineWidth = stroke*0.8;
				ctx.beginPath();
				ctx.moveTo(loc[this.l_i].x + this.n0e1.x, loc[this.l_i].y + this.n0e1.y);
				if (this.pastFirstStop) {
					ctx.lineTo(loc[this.l_i].x + this.n0g1.x, loc[this.l_i].y + this.n0g1.y);
					ctx.stroke();
					ctx.closePath();
					ctx.beginPath();
					ctx.moveTo(loc[this.l_i].x + this.n0g2.x, loc[this.l_i].y + this.n0g2.y);
				} else {
					ctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y);
					ctx.lineTo(loc[this.l_i].x + this.inDrawLimit.x, loc[this.l_i].y + this.inDrawLimit.y);
				}
				ctx.lineTo(loc[this.l_i].x + this.n0e2.x, loc[this.l_i].y + this.n0e2.y);
				ctx.stroke();
				ctx.closePath();
			}
		} else {
			//main stroke
			ctx.lineWidth = stroke;
			ctx.strokeStyle = nodeGrdStroke;
			ctx.fillStyle = null;
			ctx.beginPath();
			ctx.moveTo(loc[this.l_i].x + this.n0t1.x, loc[this.l_i].y + this.n0t1.y);
			if (this.pastFirstStop) {
				ctx.lineTo(loc[this.l_i].x + this.n0g1.x, loc[this.l_i].y + this.n0g1.y);
			} else {
				ctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y);
			}
			ctx.stroke();
			ctx.closePath();

			//stroke gradient reinforcement
			ctx.lineWidth = stroke*0.8;
			ctx.beginPath();
			ctx.moveTo(loc[this.l_i].x + this.n0t1.x, loc[this.l_i].y + this.n0t1.y);
			if (this.pastFirstStop) {
				ctx.lineTo(loc[this.l_i].x + this.n0g1.x, loc[this.l_i].y + this.n0g1.y);
			} else {
				ctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y);
			}
			ctx.stroke();
			ctx.closePath();
		}
	}

	//inbound fragment
	if (2 === channel) {
		if (this.pastSecondStop) {
			var gp1 = new Point(loc[this.l_i].x + this.n1e2.x,loc[this.l_i].y + this.n1e2.y);
			var gp2 = new Point(loc[this.l_i].x + this.n1g2.x,loc[this.l_i].y + this.n1g2.y);
			if (gp1.x === gp2.x) gp2.x += 0.01;
			var nodeGrdStroke = ctx.createLinearGradient(gp1.x, gp1.y, gp2.x, gp2.y);
			nodeGrdStroke.addColorStop(0, this.hexToRGB('#000000', 1));
			nodeGrdStroke.addColorStop(1, this.hexToRGB('#000000', 0));

			if ((isNaN(this.n1t2e.y) || isNaN(this.n1t2e.x) || isNaN(this.n0t2e.y) || isNaN(this.n0t2e.x)) === false) {
				var nodeGrdFill = ctx.createLinearGradient(gp1.x, gp1.y, gp2.x, gp2.y);
				nodeGrdFill.addColorStop(0, this.hexToRGB(this.baseCol, 1));
				nodeGrdFill.addColorStop(1, this.hexToRGB(this.baseCol, 0));
				//fill gradient reinforcement
				ctx.fillStyle = nodeGrdFill;
				ctx.beginPath();
				ctx.moveTo(loc[this.l_i].x + this.n1g1.x, loc[this.l_i].y + this.n1g1.y);
				ctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y);
				ctx.lineTo(loc[this.l_i].x + this.inDrawLimit.x, loc[this.l_i].y + this.inDrawLimit.y);
				ctx.lineTo(loc[this.l_i].x + this.n1g2.x, loc[this.l_i].y + this.n1g2.y);
				ctx.fill();
				ctx.closePath();
				//main fragment
				ctx.strokeStyle = nodeGrdStroke;
				ctx.lineWidth = stroke;
				ctx.beginPath();
				ctx.moveTo(loc[this.l_i].x + this.n1g1.x, loc[this.l_i].y + this.n1g1.y);
				ctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y);
				ctx.lineTo(loc[this.l_i].x + this.inDrawLimit.x, loc[this.l_i].y + this.inDrawLimit.y);
				ctx.lineTo(loc[this.l_i].x + this.n1g2.x, loc[this.l_i].y + this.n1g2.y);
				ctx.fill();
				ctx.stroke();
				ctx.closePath();

				//main stroke
				ctx.fillStyle = null;
				ctx.beginPath();
				ctx.moveTo(loc[this.l_i].x + this.n1g1.x, loc[this.l_i].y + this.n1g1.y);
				ctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y);
				ctx.lineTo(loc[this.l_i].x + this.inDrawLimit.x, loc[this.l_i].y + this.inDrawLimit.y);
				ctx.lineTo(loc[this.l_i].x + this.n1g2.x, loc[this.l_i].y + this.n1g2.y);
				ctx.stroke();
				ctx.closePath();
				//stroke gradient reinforcement
				ctx.lineWidth = stroke*0.8;
				ctx.beginPath();
				ctx.moveTo(loc[this.l_i].x + this.n1g1.x, loc[this.l_i].y + this.n1g1.y);
				ctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y);
				ctx.lineTo(loc[this.l_i].x + this.inDrawLimit.x, loc[this.l_i].y + this.inDrawLimit.y);
				ctx.lineTo(loc[this.l_i].x + this.n1g2.x, loc[this.l_i].y + this.n1g2.y);
				ctx.stroke();
				ctx.closePath();
			} else {
				//main stroke
				ctx.lineWidth = stroke;
				ctx.strokeStyle = nodeGrdStroke;
				ctx.fillStyle = null;
				ctx.beginPath();
				ctx.moveTo(loc[this.l_i].x + this.n1g1.x, loc[this.l_i].y + this.n1g1.y);
				ctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y);
				ctx.stroke();
				ctx.closePath();
				//stroke gradient reinforcement
				ctx.lineWidth = stroke*0.8;
				ctx.beginPath();
				ctx.moveTo(loc[this.l_i].x + this.n1g1.x, loc[this.l_i].y + this.n1g1.y);
				ctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y);
				ctx.stroke();
				ctx.closePath();
			}
		}
	}

	//line overlays
	// if (3 === channel) {
	// 	/* line overlay */
	// 	var lines = document.getElementById('lines');
	// 	var linectx = lines.getContext('2d');
	//
	// 	linectx.strokeStyle = '#000000';
	// 	linectx.lineWidth = stroke*0.9;
	// 	linectx.beginPath();
	// 	linectx.moveTo(loc[this.l_i].x + this.n0t1.x, loc[this.l_i].y + this.n0t1.y);
	// 	if (this.present)
	// 		linectx.lineTo(loc[this.l_i].x + this.n1t1.x, loc[this.l_i].y + this.n1t1.y);
	// 	else
	// 		linectx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y);
	// 	if ((isNaN(this.n1t2e.y) || isNaN(this.n1t2e.x) || isNaN(this.n0t2e.y) || isNaN(this.n0t2e.x)) === false) {
	// 		if (this.present) {
	// 			linectx.moveTo(loc[this.l_i].x + this.n0t2e.x, loc[this.l_i].y + this.n0t2e.y);
	// 			linectx.lineTo(loc[this.l_i].x + this.n1t2e.x, loc[this.l_i].y + this.n1t2e.y);
	// 		} else {
	// 			linectx.lineTo(loc[this.l_i].x + this.inDrawLimit.x, loc[this.l_i].y + this.inDrawLimit.y);
	// 			linectx.lineTo(loc[this.l_i].x + this.n0t2e.x, loc[this.l_i].y + this.n0t2e.y);
	// 		}
	// 	}
	// 	linectx.stroke();
	// }
}
Node.prototype.hexToRGB = function(h, alpha) {
	if (typeof(alpha) === 'undefined') alpha = 1;
	h = (h.charAt(0)=="#") ? h.substring(1,7):h;
	var r = parseInt(h.substring(0,2),16);
	var g = parseInt(h.substring(2,4),16);
	var b = parseInt(h.substring(4,6),16);
	return "rgba("+r+","+g+","+b+","+alpha+")";
}
// Node.prototype.hexToR = function(h) {return parseInt((cutHex(h)).substring(0,2),16)}
// Node.prototype.hexToG = function(h) {return parseInt((cutHex(h)).substring(2,4),16)}
// Node.prototype.hexToB = function(h) {return parseInt((cutHex(h)).substring(4,6),16)}
// Node.prototype.cutHex = function(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}
Node.prototype.genPathCaps = function(breaking, n0l, n0r) {
	if (breaking) {
		var hold_l_x = this.lastNode.l_x;
		var hold_l_y = this.lastNode.l_y;
		var hold_s_i = this.lastNode.s_i;
	} else {
		hold_l_x = this.l_x;
		hold_l_y = this.l_y;
		hold_s_i = this.s_i;
	}

	var outermost = false;
	if (0 < this.n_i && (1 < this.n_i || false === breaking) && locData[hold_l_x][0][hold_l_y][0] >= locData[hold_l_x][1][0]) {
		outermost = true;
	}

	if (breaking || outermost) {
		var canvas = document.getElementById('location');
		var ctx = canvas.getContext('2d');
		ctx.beginPath();
		ctx.strokeStyle = '#000000'
		ctx.lineWidth = stroke;

		if (outermost) {
			//broken ring draws here
			if (breaking) var hold_n_i = this.n_i - 1;
			else hold_n_i = this.n_i;

			angle = Math.atan2(charDir[this.c_i][hold_n_i].n1t1.y,charDir[this.c_i][hold_n_i].n1t1.x);
			angle2 = Math.atan2(charDir[this.c_i][hold_n_i].n1t2e.y,charDir[this.c_i][hold_n_i].n1t2e.x);
			ctx.arc(n0l.x, n0l.y, n0r, angle2, angle, true);

			offset = new Point(0, 0);
			offset = offset.polar(n0r*this.arcSpan, angle - Math.PI/2);
			// if (false === breaking) {
			// 	ctx.stroke();
			// 	ctx.closePath();
			//
			// 	ctx.strokeStyle = null;
			// 	ctx.fillStyle = '#FF0000';
			// 	ctx.beginPath();
			// 	ctx.arc(charDir[this.c_i][hold_n_i].n1t1.x + n0l.x,charDir[this.c_i][hold_n_i].n1t1.y + n0l.y,1,0,Math.PI*2);
			// 	ctx.closePath();
			// 	ctx.fill();
			//
			// 	ctx.strokeStyle = '#000000'
			// 	ctx.lineWidth = stroke;
			// 	ctx.beginPath();
			// }
			ctx.moveTo(charDir[this.c_i][hold_n_i].n1t1.x + n0l.x, charDir[this.c_i][hold_n_i].n1t1.y + n0l.y);
			ctx.lineTo(charDir[this.c_i][hold_n_i].n1t1.x + n0l.x + offset.x, charDir[this.c_i][hold_n_i].n1t1.y + n0l.y + offset.y);
		} else {
			//full ring draws here
			ctx.arc(n0l.x, n0l.y, n0r, 0, Math.PI*2);
		}
		ctx.stroke();
		ctx.closePath();

		for (var i = 0; i < hold_l_y; i++) {
			if (0 < anc[locDir[hold_l_x][i][0]].x) {
				var oth_c = locDir[hold_l_x][i][0];
				var oth_n = locDir[hold_l_x][i][1] + 1;
				//outbound breaks; outbound paths; inbound paths
				if (charDir[oth_c].length > oth_n) {
					if (breaking && this.s_i > charDir[oth_c][oth_n].s_i && false === Detect.isWithin(charDir[oth_c][oth_n].s_i, hold_s_i, 0, 2, false))
						true;
						// this.drawPathCap(n0l, n0r - this.lastAnc*radius/2, oth_c, oth_n, breaking, true);
					if (outermost && hold_s_i < charDir[oth_c][oth_n].s_i && (breaking && this.s_i > charDir[oth_c][oth_n].s_i || false === breaking && Detect.isWithin(charDir[oth_c][oth_n].s_i, hold_s_i, 0, 2, false)))
						true;
						// this.drawPathCap(n0l, n0r, oth_c, oth_n, breaking, true);
				}
				oth_n = locDir[hold_l_x][i][1];
				if (outermost && 0 < oth_n && hold_s_i < charDir[oth_c][oth_n].s_i) {
					true;
					// this.drawPathCap(n0l, n0r, oth_c, oth_n, breaking, false);
				}
			}
		}
	}
}
Node.prototype.drawPathCap = function(cen, rad, oth_c, oth_n, breaking, outbound) {
	var xPos, yPos, xOffset, yOffset;
	if (outbound) {
		xPos = cen.x + (loc[charDir[oth_c][oth_n].l_i].x - loc[charDir[oth_c][oth_n - 1].l_i].x);
		yPos = cen.y + (loc[charDir[oth_c][oth_n].l_i].y - loc[charDir[oth_c][oth_n - 1].l_i].y);
		xOffset = xPos;
		yOffset = yPos;
	} else {
		xPos = cen.x + (loc[charDir[oth_c][oth_n - 1].l_i].x - loc[charDir[oth_c][oth_n].l_i].x);
		yPos = cen.y + (loc[charDir[oth_c][oth_n - 1].l_i].y - loc[charDir[oth_c][oth_n].l_i].y);
		xOffset = cen.x;
		yOffset = cen.y;
	}

	var p1 = new Point(charDir[oth_c][oth_n].n1t1.x + xOffset, charDir[oth_c][oth_n].n1t1.y + yOffset),
		p2 = new Point(charDir[oth_c][oth_n].n0t1.x + xOffset, charDir[oth_c][oth_n].n0t1.y + yOffset);
	var t_int = this.findIntercepts(p1, p2, cen, rad, new Point(xPos, yPos));

	var xTerm = t_int.x - cen.x,
		yTerm = t_int.y - cen.y;
	if (0 === xTerm) { xTerm = 0.1;}
	if (0 === yTerm) { yTerm = 0.1;}
	var angle = Math.atan2(yTerm, xTerm);

	p1 = new Point(charDir[oth_c][oth_n].n1t2.x + xOffset, charDir[oth_c][oth_n].n1t2.y + yOffset);
	p2 = new Point(charDir[oth_c][oth_n].n0t2.x + xOffset, charDir[oth_c][oth_n].n0t2.y + yOffset);
	t_int = this.findIntercepts(p1, p2, cen, rad, new Point(xPos, yPos));

	xTerm = t_int.x - cen.x;
	yTerm = t_int.y - cen.y;
	if (0 === xTerm) { xTerm = 0.1;}
	if (0 === yTerm) { yTerm = 0.1;}
	var angle2 = Math.atan2(yTerm, xTerm);

	var canvas = document.getElementById('location');
	var ctx = canvas.getContext('2d');
	ctx.strokeStyle = '#000000';
	ctx.lineWidth = stroke;
	ctx.beginPath();
	if (outbound)
		ctx.arc(cen.x, cen.y, rad, angle, angle2);
	else
		ctx.arc(cen.x, cen.y, rad, angle, angle2, true);
	ctx.closePath();
	ctx.stroke();
}

Node.prototype.genNode = function(active) {
	var canvas = document.getElementById('location');
	var ctx = canvas.getContext('2d');

	ctx.fillStyle = this.baseCol;
	ctx.lineWidth = stroke;
	ctx.beginPath();
	ctx.arc(loc[this.l_i].x, loc[this.l_i].y, (this.oth + 1 - this.lastAnc)*radius, 0, Math.PI*2);
	ctx.arc(loc[this.l_i].x, loc[this.l_i].y, (this.oth + 1)*radius, 0, Math.PI*2)
	ctx.closePath();
	ctx.fill("evenodd");
	ctx.strokeStyle = '#000000'
	ctx.beginPath();
	ctx.arc(loc[this.l_i].x, loc[this.l_i].y, (this.oth + 1 - this.lastAnc)*radius, 0, Math.PI*2);
	ctx.closePath();
	ctx.stroke();

	//drawing arc
	if (0 < this.n_i) {
		if (false === Detect.isPresent(this.c_i, this.n_i + 1, 1)) {
			var n1t1Rel = new Point(0, 0);
			this.n1t1Rel = this.n1t1.translate(-loc[this.l_i].x, -loc[this.l_i].y);
			var n1t2eRel = new Point(0, 0);
			this.n1t2eRel = this.n1t2e.translate(-loc[this.l_i].x, -loc[this.l_i].y);
			var angle = Math.atan2(this.n1t1Rel.y, this.n1t1Rel.x);
			var angle2 = Math.atan2(this.n1t2eRel.y, this.n1t2eRel.x);

			ctx.beginPath();
			ctx.strokeStyle = '#000000';
			ctx.lineWidth = stroke;
			ctx.arc(loc[this.l_i].x, loc[this.l_i].y, this.getRadius(), angle, angle2);

			var offset = new Point(0, 0);
			offset = offset.polar(this.getRadius()*this.arcSpan, angle - Math.PI/2);
			ctx.moveTo(this.n1t1.x, this.n1t1.y);
			ctx.lineTo(this.n1t1.x + offset.x, this.n1t1.y + offset.y);
			//generating outer path caps (those coincidental with outer arc) here while no pathBreak of next exists to do so
			this.genPathCaps(false, loc[this.l_i], this.getRadius());
		}
	} else {
		ctx.beginPath();
		ctx.strokeStyle = "#000000"
		ctx.arc(loc[this.l_i].x, loc[this.l_i].y, this.getRadius(), 0, Math.PI*2);
		ctx.stroke();
		ctx.closePath();
	}
}
Node.prototype.generate = function(channel, recalculate) {
	if (0 < anc[this.c_i].x && now >= this.s_i) {
		// if (-1 === testArray[this.c_i][this.n_i][0]) { testArray[this.c_i][this.n_i][0] = channel; testArray[this.c_i][this.n_i][1] = recalculate;}

		if (typeof(recalculate)==='undefined') recalculate = 1;

		this.lastNow = now;
		this.lastAnc = anc[this.c_i].x;
		this.lastBridge = bridge[this.c_i].x;

		var active;
		if (2 <= recalculate) active = true;
		else if (1 <= recalculate && locData[this.l_x][0][this.l_y][1]) active = true;
		else active = false;

		if (locData[this.l_x][0][this.l_y][0] > locData[this.l_x][1][0]) {
			this.oth = locData[this.l_x][1][0] + anc[this.c_i].x;
		} else {
			this.oth = locData[this.l_x][0][this.l_y][0];
		}
		if (0 < this.n_i) {
			if (locData[this.lastNode.l_x][0][this.lastNode.l_y][0] > locData[this.lastNode.l_x][1][0]) {
				this.lastOth = locData[this.lastNode.l_x][1][0] + anc[this.c_i].x;
			} else {
				this.lastOth = locData[this.lastNode.l_x][0][this.lastNode.l_y][0];
			}
		}

		//this could be refactored with a trinary return from isPresent
		if (Detect.isPresent(this.c_i, this.n_i, 1)) {
			if (Detect.isPresent(this.c_i, this.n_i)) this.present = true;
			else this.present = false;

			if (channel) {
				if (0 < this.n_i) {
					if (1 <= recalculate && false === active && locData[this.lastNode.l_x][0][this.lastNode.l_y][1]) {
						active = true; //worthwhile conditional?
					}
					this.genPath(channel, active);
				}
			} else if (this.present) {
				this.genNode(active);
			}
		}
	}
}

function Node(charIndex, nodeIndex, colour, location, timeIndex) {
	this.c_i = charIndex;
	this.n_i = nodeIndex;
	this.s_i = timeIndex;
	this.baseCol = colour;
	this.col = this.hexToRGB(colour, alpha.x);
	this.l_i = location;

	if (1 <= this.n_i) {
		this.n0t1 = new Point(0, 0);
		this.n0t2 = new Point(0, 0);
		this.n0t2e = new Point(0, 0);
		this.n1t1 = new Point(0, 0);
		this.n1t2 = new Point(0, 0);
		this.n1t2e = new Point(0, 0);
		// this.pathCaps = new Array();
		this.n0e1 = new Point(0, 0);
		this.n0e2 = new Point(0, 0);
		this.n0g1 = new Point(0, 0);
		this.n0g2 = new Point(0, 0);

		this.n1e1 = new Point(0, 0);
		this.n1e2 = new Point(0, 0);
		this.n1g1 = new Point(0, 0);
		this.n1g2 = new Point(0, 0);

		this.lastNode = charDir[this.c_i][this.n_i - 1];
		if (2 <= this.n_i)
			this.arcSpan = 3/8;

		this.outDrawLimit = new Point(0,0);
		this.inDrawLimit = new Point(0,0);

		this.pastRadius = false;
		this.pastEdge = false;
		this.pastFirstStop = false;
		this.pastSecondStop = false;
	}
}
