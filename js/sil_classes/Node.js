var c_i, n_i, s_i, l_i, l_x, l_y;
var radius, stroke;
var oth, lastOth;
var col;

var lastNode;
var n0t1, n0t2, n0t2e, n1t1, n1t2, n1t2e, nt1m, nt2m; //tangent points
var outDrawLimit, inDrawLimit;

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
Node.prototype.findIntercepts = function(p1, p2, c_loc, c_rad, ref_loc) {
	// console.log("p1     "+p1.x+":"+p1.y);
	// console.log("p2     "+p2.x+":"+p2.y);
	// console.log("cl     "+c_loc.x+":"+c_loc.y);
	// console.log("cr     "+c_rad);
	// console.log("rl     "+ref_loc.x+":"+ref_loc.y);
	var denTerm = p2.x - p1.x;
	if (denTerm == 0) { denTerm = 0.1;}
	var slope = (p2.y - p1.y)/denTerm;
	var int_lb = p2.y - slope*p2.x;
	var int_a = slope*slope + 1;
	var int_b = 2*(slope*(int_lb - c_loc.y) - c_loc.x);
	var int_c = c_loc.x*c_loc.x + (int_lb - c_loc.y)*(int_lb - c_loc.y) - c_rad*c_rad;
	var int_sqrt = Math.sqrt(int_b*int_b - 4*int_a*int_c);

	denTerm = 2*int_a;
	if (denTerm == 0) { denTerm = 0.1;}
	var int_x1 = (-int_b + int_sqrt)/denTerm;
	var int_x2 = (-int_b - int_sqrt)/denTerm;
	var int_y1 = Math.sqrt(c_rad*c_rad - (int_x1 - c_loc.x)*(int_x1 - c_loc.x)) + c_loc.y;
	var int_y2 = Math.sqrt(c_rad*c_rad - (int_x2 - c_loc.x)*(int_x2 - c_loc.x)) + c_loc.y;

	if (Math.floor(int_y1) != Math.floor(slope*int_x1 + int_lb)) {
		int_y1 -= 2*(int_y1 - c_loc.y);}
	if (Math.floor(int_y2) != Math.floor(slope*int_x2 + int_lb)) {
		int_y2 -= 2*(int_y2 - c_loc.y);}
	var d1 = Math.sqrt((ref_loc.x - int_x1)*(ref_loc.x - int_x1) + (ref_loc.y - int_y1)*(ref_loc.y - int_y1));
	var d2 = Math.sqrt((ref_loc.x - int_x2)*(ref_loc.x - int_x2) + (ref_loc.y - int_y2)*(ref_loc.y - int_y2));
	if (d2 > d1) {
		// console.log("return "+int_x1+":"+int_y1);
		return new Point(int_x1, int_y1);
	} else {
		// console.log("return "+int_x2+":"+int_y2);
		return new Point(int_x2, int_y2);}
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
	// console.log('---');
	this.lastBridge = bridge[this.c_i].x;
	var n0l = new Point(loc[this.lastNode.l_i].x - loc[this.l_i].x, loc[this.lastNode.l_i].y - loc[this.l_i].y);
	var n0r = this.getLastRadius();
	var n1r = this.getRadius();

	var angle;
	var angle2;
	var offset = new Point(0, 0);

	var canvas = document.getElementById('location');
	var ctx = canvas.getContext('2d');

	if (3 === channel && active) {
		if (n0r == n1r) {
			var xTerm = n0l.x, yTerm = n0l.y;
			if (xTerm == 0) xTerm = 0.1;
			if (yTerm == 0) yTerm = 0.1;

			angle = -Math.atan2(-xTerm, -yTerm);
			offset = offset.polar(n1r, angle);
			this.n0t1 = new Point(n0l.x + offset.x, n0l.y + offset.y);
			this.n1t1 = new Point(offset.x, offset.y);
		} else {
			this.findTangentPoints(n0l, n0r, n1r);}

		xTerm = this.n0t1.x, yTerm = this.n0t1.y;
		if (0 === xTerm) xTerm = 0.1;
		if (0 === yTerm) yTerm = 0.1;
		angle = -Math.atan2(xTerm, yTerm);
		offset = offset.polar(this.lastAnc*radius, angle);
		this.n0t2 = new Point(this.n0t1.x + offset.x, this.n0t1.y + offset.y);
		this.n1t2 = new Point(this.n1t1.x + offset.x, this.n1t1.y + offset.y);
		// console.log(angle, offset)

		this.n0t2e = this.findIntercepts(this.n0t2, this.n1t2, n0l, n0r, new Point(0, 0));
		this.n1t2e = this.findIntercepts(this.n0t2, this.n1t2, new Point(0, 0), n1r, n0l);
		// console.log(this.n0t1, this.n1t1, this.n0t2, this.n1t2, this.n0t2e, this.n1t2e);
	}
	//path break
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
	}
	//fragment guides
	if (3 === channel) {
		if (active) {
			// if (false === active) {
			// 	angle = (-Math.atan2(this.n0t1.x, this.n0t1.y));
			// 	offset = offset.polar(this.lastAnc*this.radius, angle);
			// }
			if (locData[this.lastNode.l_x][0][this.lastNode.l_y][0] < locData[this.lastNode.l_x][1][0]) { this.n0e2 = this.findIntercepts(this.n0t2, this.n1t2, n0l, (locData[this.lastNode.l_x][1][0] + 1)*radius, this.n1t2);}
			else { this.n0e2 = new Point(this.n0t2e.x, this.n0t2e.y);}
			this.n0e1 = new Point(this.n0e2.x - offset.x, this.n0e2.y - offset.y);

			var gradOffset = new Point(0, 0);
			gradOffset = offset.polar(fadeRange*radius, Math.atan2(this.n1t1.y - this.n0t1.y, this.n1t1.x - this.n0t1.x));
			this.n0g1 = new Point(this.n0e2.x - offset.x + gradOffset.x, this.n0e2.y - offset.y + gradOffset.y);
			this.n0g2 = new Point(this.n0e2.x + gradOffset.x, this.n0e2.y + gradOffset.y);

			if (locData[this.l_x][0][this.l_y][0] < locData[this.l_x][1][0]) { this.n1e2 = this.findIntercepts(this.n0t2, this.n1t2, new Point(0,0), (locData[this.l_x][1][0] + 1)*radius, this.n0t2);}
			else { this.n1e2 = new Point(this.n1t2e.x, this.n1t2e.y);}
			this.n1e1 = new Point(this.n1e2.x - offset.x, this.n1e2.y - offset.y);

			this.n1g1 = new Point(this.n1e2.x - offset.x - gradOffset.x, this.n1e2.y - offset.y - gradOffset.y);
			this.n1g2 = new Point(this.n1e2.x - gradOffset.x, this.n1e2.y - gradOffset.y);
		}
		//checking status
		if (this.present) {
			this.outDrawLimit = this.n1t1;
			this.inDrawLimit = this.n1t2;
		} else {
			this.outDrawLimit = new Point(this.n1t1.x - (this.n1t1.x - this.n0t1.x)*(1 - this.lastBridge), this.n1t1.y - (this.n1t1.y - this.n0t1.y)*(1 - this.lastBridge));;
			this.inDrawLimit = new Point(this.n1t2.x - (this.n1t2.x - this.n0t2.x)*(1 - this.lastBridge), this.n1t2.y - (this.n1t2.y - this.n0t2.y)*(1 - this.lastBridge));
		}
		if (false === this.present) {
			var xdif = this.n1t1.x - this.n0t1.x, ydif = this.n1t1.y - this.n0t1.y;
			this.underComp = Math.sqrt(xdif*xdif + ydif*ydif);
			xdif = this.n0g1.x - this.n0t1.x, ydif = this.n0g1.y - this.n0t1.y;
			this.overComp = Math.sqrt(xdif*xdif + ydif*ydif);
			this.compDiff = this.overComp - this.underComp*this.lastBridge;
		}
	}
	//outbound fragment
	if (1 === channel) {
		//outbound fill
		var gp1 = new Point(loc[this.l_i].x + this.n0e2.x,loc[this.l_i].y + this.n0e2.y);
		var gp2 = new Point(loc[this.l_i].x + this.n0g2.x,loc[this.l_i].y + this.n0g2.y);
		if (gp1.x === gp2.x) gp2.x += 0.01;
		var nodeOutGrd = ctx.createLinearGradient(gp1.x, gp1.y, gp2.x, gp2.y);
		nodeOutGrd.addColorStop(0, this.hexToRGB(this.baseCol, 1));
		nodeOutGrd.addColorStop(1, this.hexToRGB(this.baseCol, 0));
		ctx.fillStyle = nodeOutGrd;
		ctx.beginPath();

		// if (this.compDiff > 0)
			ctx.moveTo(loc[this.l_i].x + this.inDrawLimit.x, loc[this.l_i].y + this.inDrawLimit.y);
		// else
			// ctx.moveTo(loc[this.l_i].x + this.n0g2.x, loc[this.l_i].y + this.n0g2.y);
		ctx.lineTo(loc[this.l_i].x + this.n0t2e.x, loc[this.l_i].y + this.n0t2e.y);
		angle = Math.atan2(this.n0t2e.y - n0l.y, this.n0t2e.x - n0l.x);
		offset = new Point(0,0);
		offset = offset.polar(n0r - (this.stroke/2 + 0.35), angle);
		ctx.lineTo(loc[this.lastNode.l_i].x + offset.x, loc[this.lastNode.l_i].y + offset.y);
		angle2 = Math.atan2(this.n0t1.y - n0l.y, this.n0t1.x - n0l.x);
		ctx.arc(loc[this.lastNode.l_i].x, loc[this.lastNode.l_i].y, n0r - (this.stroke/2 + 0.35), angle2, angle);
		ctx.lineTo(loc[this.l_i].x + this.n0t1.x, loc[this.l_i].y + this.n0t1.y);
		// if (this.compDiff > 0)
			ctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y);
		// else
			// ctx.lineTo(loc[this.l_i].x + this.n0g1.x, loc[this.l_i].y + this.n0g1.y);
		ctx.closePath();
		ctx.fill();

		//outbound stroke
		ctx.lineWidth = this.stroke;
		nodeOutGrd = ctx.createLinearGradient(gp1.x, gp1.y, gp2.x, gp2.y);
		nodeOutGrd.addColorStop(0, this.hexToRGB('#000000', 1));
		nodeOutGrd.addColorStop(1, this.hexToRGB('#000000', 0));
		ctx.strokeStyle = nodeOutGrd;
		ctx.fillStyle = null;

		ctx.beginPath();
		// if (this.compDiff > 0)
			ctx.moveTo(loc[this.l_i].x + this.inDrawLimit.x, loc[this.l_i].y + this.inDrawLimit.y);
		// else
			// ctx.moveTo(loc[this.l_i].x + this.n0g2.x, loc[this.l_i].y + this.n0g2.y);
		ctx.lineTo(loc[this.l_i].x + this.n0t2e.x, loc[this.l_i].y + this.n0t2e.y);
		ctx.stroke();
		ctx.moveTo(loc[this.l_i].x + this.n0t1.x, loc[this.l_i].y + this.n0t1.y);
		ctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y);
		// if (this.compDiff > 0)
			ctx.lineTo(loc[this.l_i].x + this.inDrawLimit.x, loc[this.l_i].y + this.inDrawLimit.y);
		// else
			// ctx.lineTo(loc[this.l_i].x + this.n0g1.x, loc[this.l_i].y + this.n0g1.y);
		ctx.stroke();
	}
	//inbound fragment
	if (2 === channel) {
		if (false === this.present) {
			//this stuff doesn't calculate properly
			// if (this.n0t !== this.n1t) {
				var xdif = this.n1t1.x - this.n1g1.x, ydif = this.n1t1.y - this.n1g1.y;
				this.overComp = Math.sqrt(xdif*xdif + ydif*ydif);
			// }
			this.compDiff = this.underComp*(this.lastBridge - 1) + this.overComp;
		}
		if (this.present || 0 < this.compDiff) {
			//inbound fill, stroke
			var gp1 = new Point(loc[this.l_i].x + this.n1e2.x,loc[this.l_i].y + this.n1e2.y);
			var gp2 = new Point(loc[this.l_i].x + this.n1g1.x,loc[this.l_i].y + this.n1g1.y);
			if (gp1.x === gp2.x) gp2.x += 0.01
			var nodeInGrd = ctx.createLinearGradient(gp1.x, gp1.y, gp2.x, gp2.y);
			nodeInGrd.addColorStop(0, this.hexToRGB(this.baseCol, 1));
			nodeInGrd.addColorStop(1, this.hexToRGB(this.baseCol, 0));
			ctx.fillStyle = nodeInGrd;
			ctx.lineWidth = this.stroke;
			nodeInGrd = ctx.createLinearGradient(gp1.x, gp1.y, gp2.x, gp2.y);
			nodeInGrd.addColorStop(0, this.hexToRGB('#000000', 1));
			nodeInGrd.addColorStop(1, this.hexToRGB('#000000', 0));
			ctx.strokeStyle = nodeInGrd;

			ctx.beginPath();
			ctx.moveTo(loc[this.l_i].x + this.n1g2.x, loc[this.l_i].y + this.n1g2.y);
			if (this.present) {
				ctx.lineTo(loc[this.l_i].x + this.n1t2.x, loc[this.l_i].y + this.n1t2.y);
				ctx.lineTo(loc[this.l_i].x + this.n1t1.x, loc[this.l_i].y + this.n1t1.y);
			} else {
				ctx.lineTo(loc[this.l_i].x + this.inDrawLimit.x, loc[this.l_i].y + this.inDrawLimit.y);
				ctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y);
			}
			ctx.lineTo(loc[this.l_i].x + this.n1g1.x, loc[this.l_i].y + this.n1g1.y);
			ctx.fill();
			ctx.stroke();
			// ctx.beginPath();
			// ctx.moveTo(loc[this.l_i].x + this.n1g2.x, loc[this.l_i].y + this.n1g2.y);
			// ctx.lineTo(loc[this.l_i].x + this.inDrawLimit.x, loc[this.l_i].y + this.inDrawLimit.y);
			// ctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y);
			// ctx.lineTo(loc[this.l_i].x + this.n1g1.x, loc[this.l_i].y + this.n1g1.y);
			// ctx.stroke();
		}
	}
	//path and line overlays
	if (3 === channel) {
		var xDiff = this.n1e2.x - this.n0e2.x, yDiff = this.n1e2.y - this.n0e2.y;
		if (Math.sqrt(xDiff*xDiff + yDiff*yDiff) > fadeRange*radius) {

			var paths = document.querySelector('.paths');
			var pathctx = paths.getContext('2d');
			// if (active) { //should be for locActive
				this.nt1m = new Point((this.n1t1.x - this.n0t1.x)/2 + this.n0t1.x, (this.n1t1.y - this.n0t1.y)/2 + this.n0t1.y);
				this.nt2m = new Point((this.n1t2.x - this.n0t2.x)/2 + this.n0t2.x, (this.n1t2.y - this.n0t2.y)/2 + this.n0t2.y);
			// }
			var pastEdge = false, pastHalf = false;
			if (this.present) {
				pastEdge = true, pastHalf = true;
			} else {
				var trueXDiff = this.outDrawLimit.x - this.n0t1.x, trueYDiff = this.outDrawLimit.y - this.n0t1.y;
				var trueDiff = Math.sqrt(trueXDiff*trueXDiff + trueYDiff*trueYDiff);
				var edgeXDiff = this.n0e2.x - this.n0t2.x, edgeYDiff = this.n0e2.y - this.n0t2.y;
				if (trueDiff > Math.sqrt(edgeXDiff*edgeXDiff + edgeYDiff*edgeYDiff)) {
					pastEdge = true;
					var halfXDiff = this.nt1m.x - this.n0t1.x, halfYDiff = this.nt1m.y - this.n0t1.y;
					if (trueDiff > Math.sqrt(halfXDiff*halfXDiff + halfYDiff*halfYDiff)) {
						pastHalf = true;
					}
				}
			}
			if (pastEdge) {
				var gp1 = new Point(loc[this.l_i].x + this.n0e2.x, loc[this.l_i].y + this.n0e2.y);
				var gp2 = new Point(loc[this.l_i].x + this.n0g2.x, loc[this.l_i].y + this.n0g2.y);
				if (gp1.x === gp2.x) gp2.x += 0.01;
				var pathOutGrdStroke = pathctx.createLinearGradient(gp1.x, gp1.y, gp2.x, gp2.y);
				pathOutGrdStroke.addColorStop(0, this.hexToRGB('#000000', 0));
				pathOutGrdStroke.addColorStop(1, this.hexToRGB('#000000', 1));

				gp1 = new Point(loc[this.l_i].x + this.n1e2.x, loc[this.l_i].y + this.n1e2.y);
				gp2 = new Point(loc[this.l_i].x + this.n1g1.x, loc[this.l_i].y + this.n1g1.y);
				if (gp1.x === gp2.x) gp2.x += 0.01;
				var pathInGrdStroke = pathctx.createLinearGradient(gp1.x, gp1.y, gp2.x, gp2.y);
				pathInGrdStroke.addColorStop(0, this.hexToRGB('#000000', 0));
				pathInGrdStroke.addColorStop(1, this.hexToRGB('#000000', 1));

				if ((isNaN(this.n1t2e.y) || isNaN(this.n1t2e.x) || isNaN(this.n0t2e.y) || isNaN(this.n0t2e.x)) === false) {
					//path fill
					var gp1 = new Point(loc[this.l_i].x + this.n0e2.x, loc[this.l_i].y + this.n0e2.y);
					var gp2 = new Point(loc[this.l_i].x + this.n0g2.x, loc[this.l_i].y + this.n0g2.y);
					if (gp1.x === gp2.x) gp2.x += 0.01;
					var pathOutGrd = pathctx.createLinearGradient(gp1.x, gp1.y, gp2.x, gp2.y);
					pathOutGrd.addColorStop(0, this.hexToRGB(this.baseCol, 0));
					pathOutGrd.addColorStop(1, this.hexToRGB(this.baseCol, 1));

					pathctx.fillStyle = pathOutGrd;
					pathctx.beginPath();
					pathctx.moveTo(loc[this.l_i].x + this.n0e1.x, loc[this.l_i].y + this.n0e1.y);
					if (pastHalf) {
						pathctx.lineTo(loc[this.l_i].x + this.nt1m.x, loc[this.l_i].y + this.nt1m.y)
						pathctx.lineTo(loc[this.l_i].x + this.nt2m.x, loc[this.l_i].y + this.nt2m.y);
					} else {
						pathctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y)
						pathctx.lineTo(loc[this.l_i].x + this.inDrawLimit.x, loc[this.l_i].y + this.inDrawLimit.y);
					}
					pathctx.lineTo(loc[this.l_i].x + this.n0e2.x, loc[this.l_i].y + this.n0e2.y);
					pathctx.closePath();
					pathctx.fill();


					if (pastHalf) {
						var gp1 = new Point(loc[this.l_i].x + this.n1e2.x,loc[this.l_i].y + this.n1e2.y);
						var gp2 = new Point(loc[this.l_i].x + this.n1g1.x,loc[this.l_i].y + this.n1g1.y);
						if (gp1.x === gp2.x) gp2.x += 0.01;
						var pathInGrd = pathctx.createLinearGradient(gp1.x, gp1.y, gp2.x, gp2.y);
						pathInGrd.addColorStop(0, this.hexToRGB(this.baseCol, 0));//inverted alphas compared to node[In/Out]Grd
						pathInGrd.addColorStop(1, this.hexToRGB(this.baseCol, 1));

						pathctx.fillStyle = pathInGrd;
						pathctx.beginPath();
						pathctx.moveTo(loc[this.l_i].x + this.nt1m.x, loc[this.l_i].y + this.nt1m.y);
						pathctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y)
						pathctx.lineTo(loc[this.l_i].x + this.inDrawLimit.x, loc[this.l_i].y + this.inDrawLimit.y);
						pathctx.lineTo(loc[this.l_i].x + this.nt2m.x, loc[this.l_i].y + this.nt2m.y);
						pathctx.closePath();
						pathctx.fill();
					}
					//inside line
					pathctx.fillStyle = null;
					pathctx.strokeStyle = pathOutGrdStroke;
					pathctx.lineWidth = stroke;
					pathctx.beginPath();
					pathctx.moveTo(loc[this.l_i].x + this.n0e2.x, loc[this.l_i].y + this.n0e2.y);
					if (pastHalf) {
						pathctx.lineTo(loc[this.l_i].x + this.nt2m.x, loc[this.l_i].y + this.nt2m.y);
						pathctx.stroke();

						pathctx.strokeStyle = pathInGrdStroke;
						pathctx.lineWidth = stroke;
						pathctx.moveTo(loc[this.l_i].x + this.nt2m.x, loc[this.l_i].y + this.nt2m.y);
						pathctx.lineTo(loc[this.l_i].x + this.inDrawLimit.x, loc[this.l_i].y + this.inDrawLimit.y);
						pathctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y);
					} else {
						pathctx.lineTo(loc[this.l_i].x + this.inDrawLimit.x, loc[this.l_i].y + this.inDrawLimit.y);
						pathctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y);
					}
					pathctx.stroke();
				}
				//outside line
				pathctx.strokeStyle = pathOutGrdStroke;
				pathctx.lineWidth = stroke;
				pathctx.beginPath();
				pathctx.moveTo(loc[this.l_i].x + this.n0e1.x, loc[this.l_i].y + this.n0e1.y);
				if (pastHalf) {
					pathctx.lineTo(loc[this.l_i].x + this.nt1m.x, loc[this.l_i].y + this.nt1m.y);
					pathctx.closePath();
					pathctx.stroke();
					pathctx.strokeStyle = pathInGrdStroke;
					pathctx.lineWidth = stroke;
					pathctx.moveTo(loc[this.l_i].x + this.nt1m.x, loc[this.l_i].y + this.nt1m.y);
					pathctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y);
				} else {
					pathctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y);
				}
				pathctx.closePath();
				pathctx.stroke();
			}
		}


		/* line overlay */
		var lines = document.getElementById('lines');
		var linectx = lines.getContext('2d');

		linectx.strokeStyle = '#000000';
		linectx.lineWidth = this.stroke*0.9;
		linectx.beginPath();
		linectx.moveTo(loc[this.l_i].x + this.n0t1.x, loc[this.l_i].y + this.n0t1.y);
		if (this.present)
			linectx.lineTo(loc[this.l_i].x + this.n1t1.x, loc[this.l_i].y + this.n1t1.y);
		else
			linectx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y);
		if ((isNaN(this.n1t2e.y) || isNaN(this.n1t2e.x) || isNaN(this.n0t2e.y) || isNaN(this.n0t2e.x)) === false) {
			if (this.present) {
				linectx.moveTo(loc[this.l_i].x + this.n0t2e.x, loc[this.l_i].y + this.n0t2e.y);
				linectx.lineTo(loc[this.l_i].x + this.n1t2e.x, loc[this.l_i].y + this.n1t2e.y);
			} else {
				linectx.lineTo(loc[this.l_i].x + this.inDrawLimit.x, loc[this.l_i].y + this.inDrawLimit.y);
				linectx.lineTo(loc[this.l_i].x + this.n0t2e.x, loc[this.l_i].y + this.n0t2e.y);
			}
		}
		linectx.stroke();
	}
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
						this.drawPathCap(n0l, n0r - this.lastAnc*radius/2, oth_c, oth_n, breaking, true);
					if (outermost && hold_s_i < charDir[oth_c][oth_n].s_i && (breaking && this.s_i > charDir[oth_c][oth_n].s_i || false === breaking && Detect.isWithin(charDir[oth_c][oth_n].s_i, hold_s_i, 0, 2, false)))
						this.drawPathCap(n0l, n0r, oth_c, oth_n, breaking, true);
				}
				oth_n = locDir[hold_l_x][i][1];
				if (outermost && 0 < oth_n && hold_s_i < charDir[oth_c][oth_n].s_i) {
					this.drawPathCap(n0l, n0r, oth_c, oth_n, breaking, false);}
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
		this.nt1m = new Point(0, 0);
		this.nt2m = new Point(0, 0);
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
	}
}
