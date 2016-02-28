var c_i, n_i, s_i, l_i, l_x, l_y;
var radius, stroke;
var oth;
var col;

var lastNode;
var n0t1, n0t2, n0t2e, n1t1, n1t2, n1t2e; //tangent points

var gradientDist;
var n0e, n1e; //edge points
var n0g1, n0g2, n1g1, n1g2; //gradient points
var n0t, n1t;
var underComp, overComp, compDiff;
var outDrawLimit, inDrawLimit;

var pathCaps;
var arcSpan;

var animating;
var lastAnc, lastBridge, present, moving, waiting;
var waitNextFunction;
var moveNextFunction;

//var aniNode0,
//	aniNode1;

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

Node.prototype.getRadius = function() { return (this.oth + 1)*this.radius;}
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
	//math I won't even try to explain because I don't even understand it myself, but it determines where lines from circle to circle are to be drawn
	var p;
	var px;
	var py;
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

	var t1,
		t2,
		t3,
		t4;

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

	if (n1r > n0r) {
		this.n0t1 = t2;
		this.n1t1 = t4;
	} else {
		this.n0t1 = t1;
		this.n1t1 = t3;}
}
Node.prototype.genPath = function(channel, active) {
	this.lastBridge = bridge[this.c_i].x;
	var n0l = new Point(loc[this.lastNode.l_i].x - loc[this.l_i].x, loc[this.lastNode.l_i].y - loc[this.l_i].y);
	var n0r = this.lastNode.getRadius();
	var n1r = this.getRadius();

	var angle;
	var angle2;
	var offset = new Point(0, 0);

	if (active) {
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

		angle = (-Math.atan2(this.n0t1.x, this.n0t1.y));
		offset = offset.polar(n0r - (this.lastNode.oth + 1 - this.lastAnc)*this.radius, angle);
		this.n0t2 = new Point(this.n0t1.x + offset.x, this.n0t1.y + offset.y);
		this.n1t2 = new Point(this.n1t1.x + offset.x, this.n1t1.y + offset.y);

		this.n0t2e = this.findIntercepts(this.n0t2, this.n1t2, n0l, n0r, new Point(0, 0));
		this.n1t2e = this.findIntercepts(this.n0t2, this.n1t2, new Point(0, 0), n1r, n0l);
	}

	var update = document.getElementById('update');
	var upctx = update.getContext('2d');

	//drawing [below is as3-relevant, but the principle is the same]
	/* pathBreak	contains the half-radius circle covering paths outbound after the arrival of and set within lastNode
	   pathUnderArc	contains the graphic for circular arcs around pathBreak of outermost nodes; whereas
	   pathOverArc	contains a circle, for those inset (i.e. not outermost), due to graphical 'irregularity' at gaps
	   pathMain		contains the path itself, and all are contained within the object path*/

	/* Anchoring path to previous node */
	upctx.fillStyle = this.col;
	upctx.beginPath();
	upctx.arc(loc[this.lastNode.l_i].x, loc[this.lastNode.l_i].y, n0r - this.lastAnc*this.radius/2, 0, Math.PI*2);
	upctx.arc(loc[this.lastNode.l_i].x, loc[this.lastNode.l_i].y, n0r, 0, Math.PI*2);
	upctx.closePath();
	upctx.fill("evenodd");
	/* Capping to anchor paths of nodes interior */
	//activity could be monitored here to reduce calls to findIntercepts within
	this.genPathCaps(true, loc[this.lastNode.l_i], n0r);


	/* node-fixed focus fragments */
	this.n0t = 1;
	this.n1t = 1;

	var locActive = true;
	for (var i = this.lastNode.l_y + 1; i < locDir[this.lastNode.l_x].length; i++) {
		if (this.isPresent(locDir[this.lastNode.l_x][i][0], locDir[this.lastNode.l_x][i][1]))
			this.n0t += anc[locDir[this.lastNode.l_x][i][0]].x;
		else break;
	}
	if (1 < this.n0t) {
		for (var i = this.lastNode.l_y; i >= 0; i--)
			this.n0t += anc[locDir[this.lastNode.l_x][i][0]].x;
		//detect activity here, maybe, with type casting comparison to look for real-numbered anc's
		this.n0t *= this.radius;
		// this.n0t += this.lastNode.getRadius();
	} else locActive = false;
	for (var i = this.l_y + 1; i < locDir[this.l_x].length; i++)
		if (this.isPresent(locDir[this.l_x][i][0], locDir[this.l_x][i][1]))
			this.n1t += anc[locDir[this.l_x][i][0]].x;
		else break;
	if (1 < this.n1t) {
		for (var i = this.l_y; i >= 0; i--)
			this.n1t += anc[locDir[this.l_x][i][0]].x;
		this.n1t *= this.radius;
		// this.n1t += this.getRadius();
	} else locActive = false;

	if (active || locActive) {
		if (false === active) {
			angle = (-Math.atan2(this.n0t1.x, this.n0t1.y));
			offset = offset.polar(n0r - (this.lastNode.oth + 1 - this.lastAnc)*this.radius, angle);
		}
		if (1 < this.n0t) this.n0e = this.findIntercepts(this.n0t2, this.n1t2, n0l, this.n0t, this.n1t2);
		else this.n0e = new Point(this.n0t2e.x, this.n0t2e.y);
		var gradOffset = new Point(0, 0);
		gradOffset = offset.polar(this.gradientDist, Math.atan2(this.n1t1.y - this.n0t1.y, this.n1t1.x - this.n0t1.x));
		this.n0g1 = new Point(this.n0e.x - offset.x + gradOffset.x, this.n0e.y - offset.y + gradOffset.y);
		this.n0g2 = new Point(this.n0e.x + gradOffset.x, this.n0e.y + gradOffset.y);

		if (1 < this.n1t) this.n1e = this.findIntercepts(this.n0t2, this.n1t2, new Point(0,0), this.n1t, this.n0t2);
		else this.n1e = new Point(this.n1t2e.x, this.n1t2e.y);
		this.n1g1 = new Point(this.n1e.x - offset.x - gradOffset.x, this.n1e.y - offset.y - gradOffset.y);
		this.n1g2 = new Point(this.n1e.x - gradOffset.x, this.n1e.y - gradOffset.y);
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

	//outbound fill
	var gp1 = new Point(loc[this.l_i].x + this.n0e.x,loc[this.l_i].y + this.n0e.y);
	var gp2 = new Point(loc[this.l_i].x + this.n0g2.x,loc[this.l_i].y + this.n0g2.y);
	if (gp1.x === gp2.x) gp2.x += 0.01
	// console.log("char: "+this.c_i+" | node: "+this.n_i+" | time: "+this.s_i);
	// console.log("loc : "+loc[this.l_i].x+" , "+loc[this.l_i].y);
	// console.log("n0t1: "+this.n0t1.x+" , "+this.n0t1.y);
	// console.log("n1t1: "+this.n1t1.x+" , "+this.n1t1.y);
	// console.log("n0e : "+this.n0e.x+" , "+this.n0e.y);
	// console.log("n0g2: "+this.n0g2.x+" , "+this.n0g2.y);
	// console.log("gp1 : "+gp1.x+" , "+gp1.y);
	// console.log("gp2 : "+gp2.x+" , "+gp2.y);
	var grd = upctx.createLinearGradient(gp1.x, gp1.y, gp2.x, gp2.y);
	grd.addColorStop(0, this.hexToRGB(this.col, 1));
	grd.addColorStop(1, this.hexToRGB(this.col, 0));
	upctx.fillStyle = grd;
	upctx.beginPath();

	if (this.compDiff > 0)
		upctx.moveTo(loc[this.l_i].x + this.inDrawLimit.x, loc[this.l_i].y + this.inDrawLimit.y);
	else
		upctx.moveTo(loc[this.l_i].x + this.n0g2.x, loc[this.l_i].y + this.n0g2.y);
	upctx.lineTo(loc[this.l_i].x + this.n0t2e.x, loc[this.l_i].y + this.n0t2e.y);
	angle = Math.atan2(this.n0t2e.y - n0l.y, this.n0t2e.x - n0l.x);
	offset = new Point(0,0);
	offset = offset.polar(n0r - (this.stroke/2 + 0.35), angle);
	upctx.lineTo(loc[this.lastNode.l_i].x + offset.x, loc[this.lastNode.l_i].y + offset.y);
	angle2 = Math.atan2(this.n0t1.y - n0l.y, this.n0t1.x - n0l.x);
	upctx.arc(loc[this.lastNode.l_i].x, loc[this.lastNode.l_i].y, n0r - (this.stroke/2 + 0.35), angle2, angle);
	upctx.lineTo(loc[this.l_i].x + this.n0t1.x, loc[this.l_i].y + this.n0t1.y);
	if (this.compDiff > 0)
		upctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y);
	else
		upctx.lineTo(loc[this.l_i].x + this.n0g1.x, loc[this.l_i].y + this.n0g1.y);
	upctx.closePath();
	upctx.fill();

	//outbound stroke
	upctx.lineWidth = this.stroke;
	grd = upctx.createLinearGradient(gp1.x, gp1.y, gp2.x, gp2.y);
	grd.addColorStop(0, this.hexToRGB('#000000', 1));
	grd.addColorStop(1, this.hexToRGB('#000000', 0));
	upctx.strokeStyle = grd;

	upctx.beginPath();
	upctx.moveTo(loc[this.l_i].x + this.inDrawLimit.x, loc[this.l_i].y + this.inDrawLimit.y);
	upctx.lineTo(loc[this.l_i].x + this.n0t2e.x, loc[this.l_i].y + this.n0t2e.y);
	upctx.stroke();
	upctx.moveTo(loc[this.l_i].x + this.n0t1.x, loc[this.l_i].y + this.n0t1.y);
	upctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y);
	if (this.compDiff > 0)
		upctx.lineTo(loc[this.l_i].x + this.inDrawLimit.x, loc[this.l_i].y + this.inDrawLimit.y);
	else
		upctx.lineTo(loc[this.l_i].x + this.n0g2.x, loc[this.l_i].y + this.n0g2.y);
	upctx.stroke();

	if (false === this.present) {
		//this stuff doesn't calculate properly
		if (this.n0t !== this.n1t) {
			var xdif = this.n1t1.x - this.n1g1.x, ydif = this.n1t1.y - this.n1g1.y;
			this.overComp = Math.sqrt(xdif*xdif + ydif*ydif);
		}
		this.compDiff = this.underComp*(this.lastBridge - 1) + this.overComp;
	}
	if (this.present || 0 < this.compDiff) {
		//inbound fill, stroke
		gp1 = new Point(loc[this.l_i].x + this.n1e.x,loc[this.l_i].y + this.n1e.y);
		gp2 = new Point(loc[this.l_i].x + this.n1g2.x,loc[this.l_i].y + this.n1g2.y);
		if (gp1.x === gp2.x) gp2.x += 0.01
		grd = upctx.createLinearGradient(gp1.x, gp1.y, gp2.x, gp2.y);
		grd.addColorStop(0, this.hexToRGB(this.col, 1));
		grd.addColorStop(1, this.hexToRGB(this.col, 0));
		upctx.fillStyle = grd;
		upctx.lineWidth = this.stroke;
		grd = upctx.createLinearGradient(gp1.x, gp1.y, gp2.x, gp2.y);
		grd.addColorStop(0, this.hexToRGB('#000000', 1));
		grd.addColorStop(1, this.hexToRGB('#000000', 0));
		upctx.strokeStyle = grd;

		upctx.beginPath();
		upctx.moveTo(loc[this.l_i].x + this.n1g2.x, loc[this.l_i].y + this.n1g2.y);
		if (this.present) {
			upctx.lineTo(loc[this.l_i].x + this.n1t2.x, loc[this.l_i].y + this.n1t2.y);
			upctx.lineTo(loc[this.l_i].x + this.n1t1.x, loc[this.l_i].y + this.n1t1.y);
		} else {
			upctx.lineTo(loc[this.l_i].x + this.inDrawLimit.x, loc[this.l_i].y + this.inDrawLimit.y);
			upctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y);
		}
		upctx.lineTo(loc[this.l_i].x + this.n1g1.x, loc[this.l_i].y + this.n1g1.y);
		upctx.fill();
		upctx.stroke();
		// upctx.beginPath();
		// upctx.moveTo(loc[this.l_i].x + this.n1g2.x, loc[this.l_i].y + this.n1g2.y);
		// upctx.lineTo(loc[this.l_i].x + this.inDrawLimit.x, loc[this.l_i].y + this.inDrawLimit.y);
		// upctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y);
		// upctx.lineTo(loc[this.l_i].x + this.n1g1.x, loc[this.l_i].y + this.n1g1.y);
		// upctx.stroke();
	}


	/* the path itself */
	// var test = document.getElementById('test');
	// var testctx = test.getContext('2d');
	// testctx.fillStyle = "#FF0000";
	// testctx.beginPath();
	// testctx.arc(loc[this.l_i].x + this.n0t1.x, loc[this.l_i].y + this.n0t1.y, 2, 0, Math.PI);
	// testctx.closePath();
	// testctx.fill();
	// testctx.beginPath();
	// testctx.arc(loc[this.l_i].x + this.n0t2.x, loc[this.l_i].y + this.n0t2.y, 2, 0, Math.PI);
	// testctx.closePath();
	// testctx.fill();
	// testctx.beginPath();
	// testctx.arc(loc[this.l_i].x + this.n0t2e.x, loc[this.l_i].y + this.n0t2e.y, 2, 0, Math.PI);
	// testctx.closePath();
	// testctx.fill();
	// testctx.beginPath();
	// testctx.arc(loc[this.l_i].x + this.n1t1.x, loc[this.l_i].y + this.n1t1.y, 2, 0, Math.PI);
	// testctx.closePath();
	// testctx.fill();
	// testctx.beginPath();
	// testctx.arc(loc[this.l_i].x + this.n1t2.x, loc[this.l_i].y + this.n1t2.y, 2, 0, Math.PI);
	// testctx.closePath();
	// testctx.fill();
	// testctx.beginPath();
	// testctx.arc(loc[this.l_i].x + this.n1t2e.x, loc[this.l_i].y + this.n1t2e.y, 2, 0, Math.PI);
	// testctx.closePath();
	// testctx.fill();
	var paths = document.querySelector('.paths');
	var pathctx = paths.getContext('2d');
	if ((isNaN(this.n1t2e.y) || isNaN(this.n1t2e.x) || isNaN(this.n0t2e.y) || isNaN(this.n0t2e.x)) === false) {
		//path fill
		pathctx.fillStyle = this.col;
		pathctx.beginPath();

		pathctx.moveTo(loc[this.l_i].x + this.n0t1.x, loc[this.l_i].y + this.n0t1.y);
		if (this.present) {
			pathctx.lineTo(loc[this.l_i].x + this.n1t1.x, loc[this.l_i].y + this.n1t1.y)
			angle = Math.atan2(this.n1t2e.y, this.n1t2e.x);
			offset = new Point(0,0);
			offset = offset.polar(n1r - (this.stroke/2 + 0.35), angle);
			pathctx.lineTo(loc[this.l_i].x + offset.x, loc[this.l_i].y + offset.y);
			pathctx.lineTo(loc[this.l_i].x + this.n1t2e.x, loc[this.l_i].y + this.n1t2e.y);
		} else {
			pathctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y)
			pathctx.lineTo(loc[this.l_i].x + this.inDrawLimit.x, loc[this.l_i].y + this.inDrawLimit.y);
		}

		upctx.lineTo(loc[this.l_i].x + this.n0t2e.x, loc[this.l_i].y + this.n0t2e.y);
		angle = Math.atan2(this.n0t2e.y - n0l.y, this.n0t2e.x - n0l.x);
		offset = new Point(0,0);
		offset = offset.polar(n0r - (this.stroke/2 + 0.35), angle);
		pathctx.lineTo(loc[this.lastNode.l_i].x + offset.x, loc[this.lastNode.l_i].y + offset.y);
		angle2 = Math.atan2(this.n0t1.y - n0l.y, this.n0t1.x - n0l.x);
		pathctx.arc(loc[this.lastNode.l_i].x, loc[this.lastNode.l_i].y, n0r - (this.stroke/2 + 0.35), angle2, angle);

		pathctx.closePath();
		pathctx.fill();

		//inside line
		pathctx.strokeStyle = '#000000';
		pathctx.lineWidth = this.stroke;
		pathctx.beginPath();
		pathctx.moveTo(loc[this.l_i].x + this.n0t2e.x, loc[this.l_i].y + this.n0t2e.y);
		if (this.present)
			pathctx.lineTo(loc[this.l_i].x + this.n1t2e.x, loc[this.l_i].y + this.n1t2e.y);
		else {
			pathctx.lineTo(loc[this.l_i].x + this.inDrawLimit.x, loc[this.l_i].y + this.inDrawLimit.y)
			pathctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y)
		}
		pathctx.stroke();
	}
	//outside line
	pathctx.beginPath();
	pathctx.moveTo(loc[this.l_i].x + this.n0t1.x, loc[this.l_i].y + this.n0t1.y);
	if (this.present)
		pathctx.lineTo(loc[this.l_i].x + this.n1t1.x, loc[this.l_i].y + this.n1t1.y)
	else
		pathctx.lineTo(loc[this.l_i].x + this.outDrawLimit.x, loc[this.l_i].y + this.outDrawLimit.y)
	pathctx.closePath();
	pathctx.stroke();


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

	var outermost = true;
	if (0 === this.n_i || 1 === this.n_i && breaking) {
		outermost = false;
	} else {
		for (i = hold_l_y + 1; i < locDir[hold_l_x].length; i++) {
			if (this.isPresent(locDir[hold_l_x][i][0], locDir[hold_l_x][i][1], true))
				if (anc[locDir[hold_l_x][i][0]].x > 0)
					outermost = false;
			else break;
		}
	}

	if (breaking || outermost) {
		//somewhat out of place here, but both run on every regen and have significant overlap in requirements
		var update = document.getElementById('update');
		var upctx = update.getContext('2d');
		upctx.beginPath();
		upctx.strokeStyle = '#000000'
		upctx.lineWidth = this.stroke;

		if (outermost && (1 <= this.n_i || breaking && 2 <= this.n_i)) {
			//broken ring draws here
			if (breaking) var hold_n_i = this.n_i - 1;
			else hold_n_i = this.n_i;

			angle = Math.atan2(charDir[this.c_i][hold_n_i].n1t1.y,charDir[this.c_i][hold_n_i].n1t1.x);
			angle2 = Math.atan2(charDir[this.c_i][hold_n_i].n1t2e.y,charDir[this.c_i][hold_n_i].n1t2e.x);
			upctx.arc(n0l.x, n0l.y, n0r, angle2, angle, true);

			offset = new Point(0, 0);
			offset = offset.polar(n0r*this.arcSpan, angle - Math.PI/2);
			upctx.moveTo(charDir[this.c_i][hold_n_i].n1t1.x + n0l.x, charDir[this.c_i][hold_n_i].n1t1.y + n0l.y);
			upctx.lineTo(charDir[this.c_i][hold_n_i].n1t1.x + n0l.x + offset.x, charDir[this.c_i][hold_n_i].n1t1.y + n0l.y + offset.y);
		} else {
			//full ring draws here
			upctx.arc(n0l.x, n0l.y, n0r, 0, Math.PI*2);
		}
		upctx.stroke();
		upctx.closePath();

		for (var i = 0; i < hold_l_y; i++) {
			if (0 < anc[locDir[hold_l_x][i][0]].x) {
				var oth_c = locDir[hold_l_x][i][0];
				var oth_n = locDir[hold_l_x][i][1] + 1;
				//outbound breaks; outbound paths; inbound paths
				if (charDir[oth_c].length > oth_n) {
					if (breaking && this.s_i > charDir[oth_c][oth_n].s_i && false === Detect.isWithin(charDir[oth_c][oth_n].s_i, hold_s_i, 0, 2, false))
						this.drawPathCap(n0l, n0r - this.lastAnc*this.radius/2, oth_c, oth_n, breaking, true);
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

	var update = document.getElementById('update');
	var upctx = update.getContext('2d');
	upctx.strokeStyle = '#000000';
	upctx.lineWidth = this.stroke;
	upctx.beginPath();
	if (outbound)
		upctx.arc(cen.x, cen.y, rad, angle, angle2);
	else
		upctx.arc(cen.x, cen.y, rad, angle, angle2, true);
	upctx.closePath();
	upctx.stroke();
}

Node.prototype.isPresent = function(hold_c, hold_n, held, indexEnd) {
	if (typeof(held)==='undefined') held = false;
	if (typeof(indexEnd)==='undefined') indexEnd = 2;
	if (held) {
		var hold_now = this.lastNow;
		if (hold_c == this.c_i) { var hold_bridge = this.lastBridge;}
					  else { hold_bridge = bridge[hold_c].x;}
	} else {
		hold_now = now;
		hold_bridge = bridge[hold_c].x;
	}
	if (hold_n < charDir[hold_c].length && hold_now >= charDir[hold_c][hold_n].s_i && (1 <= hold_bridge || 2 > indexEnd && (0 < hold_bridge || 1 > indexEnd && 0 >= hold_bridge)) || hold_n + 1 < charDir[hold_c].length && hold_now >= charDir[hold_c][hold_n + 1].s_i) {
		return true;
	}
	return false;
}
Node.prototype.genNode = function(active) {
	var update = document.getElementById('update');
	var upctx = update.getContext('2d');

	upctx.fillStyle = this.col;
	upctx.lineWidth = this.stroke;
	upctx.beginPath();
	upctx.arc(loc[this.l_i].x, loc[this.l_i].y, (this.oth + 1 - this.lastAnc)*this.radius, 0, Math.PI*2);
	upctx.arc(loc[this.l_i].x, loc[this.l_i].y, (this.oth + 1)*this.radius, 0, Math.PI*2)
	upctx.closePath();
	upctx.fill("evenodd");
	upctx.strokeStyle = '#000000'
	upctx.beginPath();
	upctx.arc(loc[this.l_i].x, loc[this.l_i].y, (this.oth + 1 - this.lastAnc)*this.radius, 0, Math.PI*2);
	upctx.closePath();
	upctx.stroke();

	//drawing arc
	if (this.n_i > 0) {
		if (false == this.isPresent(this.c_i, this.n_i + 1, true, 1)) {
			var n1t1Rel = new Point(0, 0);
			this.n1t1Rel = this.n1t1.translate(-loc[this.l_i].x, -loc[this.l_i].y);
			var n1t2eRel = new Point(0, 0);
			this.n1t2eRel = this.n1t2e.translate(-loc[this.l_i].x, -loc[this.l_i].y);
			var angle = Math.atan2(this.n1t1Rel.y, this.n1t1Rel.x);
			var angle2 = Math.atan2(this.n1t2eRel.y, this.n1t2eRel.x);

			upctx.beginPath();
			upctx.strokeStyle = '#000000';
			upctx.lineWidth = this.stroke;
			upctx.arc(loc[this.l_i].x, loc[this.l_i].y, this.getRadius(), angle, angle2);

			var offset = new Point(0, 0);
			offset = offset.polar(this.getRadius()*this.arcSpan, angle - Math.PI/2);
			upctx.moveTo(this.n1t1.x, this.n1t1.y);
			upctx.lineTo(this.n1t1.x + offset.x, this.n1t1.y + offset.y);
			//generating outer path caps (those coincidental with outer arc) here while no pathBreak of next exists to do so
			this.genPathCaps(false, loc[this.l_i], this.getRadius());
		}
	} else {
		upctx.beginPath();
		upctx.strokeStyle = "#000000"
		upctx.arc(loc[this.l_i].x, loc[this.l_i].y, this.getRadius(), 0, Math.PI*2);
		upctx.stroke();
		upctx.closePath();
	}
}
Node.prototype.generate = function(channel, recalculate) {
	if (0 < anc[this.c_i].x && now >= this.s_i) {
		if (typeof(recalculate)==='undefined') recalculate = 1;

		this.lastNow = now;
		this.lastAnc = anc[this.c_i].x;
		this.lastBridge = bridge[this.c_i].x;

		if (2 <= recalculate)
			var active = true;
		else if (1 <= recalculate) {
			active = false;
			for (var i = this.l_y; i >= 0; i--)
				if (0 !== anc[locDir[this.l_x][i][0]].i) {
					active = true;
					break;
				}
		}

		if (active) {
			//getting oth data
			this.oth = 0;
			for (var i = 0; i < this.l_y; i++) {
				if (this.isPresent(locDir[this.l_x][i][0], locDir[this.l_x][i][1], true))
					this.oth += anc[locDir[this.l_x][i][0]].x;
					// this.arc_ce -= this.arc_ce*anc[locDir[this.l_x][i][0]].x;
				else break;
			}
			this.oth += anc[this.c_i].x;
		}

		//this could be refactored with a trinary return from isPresent
		if (this.isPresent(this.c_i, this.n_i, true, 1)) {
			if (this.isPresent(this.c_i, this.n_i, true))
				this.present = true;
			else
				this.present = false;

			if (channel) {
				if (this.n_i > 0) {
					if (1 === recalculate && false === active && false === channel)
						for (var i = this.lastNode.l_y - 1; i >= 0; i--)
							if (0 !== anc[locDir[this.lastNode.l_x][i][0]].i) {
								active = true;
								break;
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
	this.col = colour;
	this.l_i = location;

	this.radius = 6;
	this.stroke = 0.3*this.radius;

	if (1 <= this.n_i) {
		this.n0t1 = new Point(0, 0);
		this.n0t2 = new Point(0, 0);
		this.n0t2e = new Point(0, 0);
		this.n1t1 = new Point(0, 0);
		this.n1t2 = new Point(0, 0);
		this.n1t2e = new Point(0, 0);
		// this.pathCaps = new Array();
		this.n0e = new Point(0, 0);
		this.n1e = new Point(0, 0);
		this.n0g1 = new Point(0, 0);
		this.n0g2 = new Point(0, 0);
		this.n1g1 = new Point(0, 0);
		this.n1g2 = new Point(0, 0);

		this.lastNode = charDir[this.c_i][this.n_i - 1];
		if (2 <= this.n_i)
			this.arcSpan = 3/8;

		this.gradientDist = 3*this.radius;
		this.outDrawLimit = new Point(0,0);
		this.inDrawLimit = new Point(0,0);
	}
}
