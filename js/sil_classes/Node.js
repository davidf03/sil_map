var c_i, n_i, s_i, l_i, l_x, l_y;
var radius, stroke;
var oth;
var col;

var lastNode;
var n0t1, n0t2, n0t2e, n1t1, n1t2, n1t2e; //tangent points
var n0e, n1e; //edge points
var n0g1, n0g2, n1g1, n1g2; //gradient points
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
	var gradientDist = 3*this.radius;

	var n0t = 1;
	var n1t = 1;

	var locActive = true;
	for (var i = this.lastNode.l_y + 1; i < locDir[this.lastNode.l_x].length; i++) {
		if (this.isPresent(locDir[this.lastNode.l_x][i][0], locDir[this.lastNode.l_x][i][1]))
			n0t += anc[locDir[this.lastNode.l_x][i][0]].x;
		else break;
	}
	if (1 < n0t) {
		for (var i = this.lastNode.l_y; i >= 0; i--)
			n0t += anc[locDir[this.lastNode.l_x][i][0]].x;
		//detect activity here, maybe, with type casting comparison to look for real-numbered anc's
		n0t *= this.radius;
		// n0t += this.lastNode.getRadius();
	} else locActive = false;
	if (this.present) {
		for (var i = this.l_y + 1; i < locDir[this.l_x].length; i++)
			if (this.isPresent(locDir[this.l_x][i][0], locDir[this.l_x][i][1]))
				n1t += anc[locDir[this.l_x][i][0]].x;
			else break;
		if (1 < n1t) {
			for (var i = this.l_y; i >= 0; i--)
				n1t += anc[locDir[this.l_x][i][0]].x;
			n1t *= this.radius;
			// n1t += this.getRadius();
		} else locActive = false;
	}

	if (active || locActive) {
		if (false === active) {
			angle = (-Math.atan2(this.n0t1.x, this.n0t1.y));
			offset = offset.polar(n0r - (this.lastNode.oth + 1 - this.lastAnc)*this.radius, angle);
		}
		if (1 < n0t) this.n0e = this.findIntercepts(this.n0t2, this.n1t2, n0l, n0t, this.n1t2);
		else this.n0e = new Point(this.n0t2e.x, this.n0t2e.y);
		var gradOffset = new Point(0, 0);
		gradOffset = offset.polar(gradientDist, Math.atan2(this.n1t1.y - this.n0t1.y, this.n1t1.x - this.n0t1.x));
		this.n0g1 = new Point(this.n0e.x - offset.x + gradOffset.x, this.n0e.y - offset.y + gradOffset.y);
		this.n0g2 = new Point(this.n0e.x + gradOffset.x, this.n0e.y + gradOffset.y);;
		if (this.present) {
			if (1 < n1t) this.n1e = this.findIntercepts(this.n0t2, this.n1t2, new Point(0,0), n1t, this.n0t2);
			else this.n1e = new Point(this.n1t2e.x, this.n1t2e.y);
			this.n1g1 = new Point(this.n1e.x - offset.x - gradOffset.x, this.n1e.y - offset.y - gradOffset.y);
			this.n1g2 = new Point(this.n1e.x - gradOffset.x, this.n1e.y - gradOffset.y);
		}
	}

	//checking status
	var outDrawLimit, inDrawLimit;
	var complete = true;
	if (false === this.present) {
		var xdif = this.n1t1.x - this.n0t1.x, ydif = this.n1t1.y - this.n0t1.y;
		var underComp = Math.sqrt(xdif*xdif + ydif*ydif)*this.lastBridge;
		xdif = this.n0g1.x - this.n0t1.x, ydif = this.n0g1.y - this.n0t1.y;
		var overComp = Math.sqrt(xdif*xdif + ydif*ydif);
		var ratio = underComp/overComp; //lol
		if (1 > ratio) {
			complete = false;
			outDrawLimit = new Point((this.n0g1.x - n0l.x)*ratio + n0l.x, (this.n0g1.y - n0l.y)*ratio + n0l.y);;
			inDrawLimit = new Point((this.n0g2.x - n0l.x)*ratio + n0l.x, (this.n0g2.y - n0l.y)*ratio + n0l.y);
		}
	}
	if (complete) {
		outDrawLimit = this.n0g1;
		inDrawLimit = this.n0g2;
	}
	console.log();

	//outbound fill
	var grd = upctx.createLinearGradient(loc[this.l_i].x + this.n0e.x,loc[this.l_i].y + this.n0e.y, loc[this.l_i].x + this.n0g2.x,loc[this.l_i].y + this.n0g2.y);
	grd.addColorStop(0, this.hexToRGB(this.col, 1));
	grd.addColorStop(1, this.hexToRGB(this.col, 0));
	upctx.fillStyle = grd;
	upctx.beginPath();

	upctx.moveTo(loc[this.l_i].x + inDrawLimit.x, loc[this.l_i].y + inDrawLimit.y);
	upctx.lineTo(loc[this.l_i].x + this.n0t2e.x, loc[this.l_i].y + this.n0t2e.y);
	angle = Math.atan2(this.n0t2e.y - n0l.y, this.n0t2e.x - n0l.x);
	offset = new Point(0,0);
	offset = offset.polar(n0r - (this.stroke/2 + 0.35), angle);
	upctx.lineTo(loc[this.lastNode.l_i].x + offset.x, loc[this.lastNode.l_i].y + offset.y);
	angle2 = Math.atan2(this.n0t1.y - n0l.y, this.n0t1.x - n0l.x);
	upctx.arc(loc[this.lastNode.l_i].x, loc[this.lastNode.l_i].y, n0r - (this.stroke/2 + 0.35), angle2, angle);
	upctx.lineTo(loc[this.l_i].x + this.n0t1.x, loc[this.l_i].y + this.n0t1.y);
	upctx.lineTo(loc[this.l_i].x + outDrawLimit.x, loc[this.l_i].y + outDrawLimit.y);
	upctx.closePath();
	upctx.fill();

	//outbound stroke
	upctx.lineWidth = this.stroke;
	var grd = upctx.createLinearGradient(loc[this.l_i].x + this.n0e.x,loc[this.l_i].y + this.n0e.y, loc[this.l_i].x + this.n0g2.x,loc[this.l_i].y + this.n0g2.y);
	grd.addColorStop(0, this.hexToRGB('#000000', 1));
	grd.addColorStop(1, this.hexToRGB('#000000', 0));
	upctx.strokeStyle = grd;

	upctx.beginPath();
	upctx.moveTo(loc[this.l_i].x + inDrawLimit.x, loc[this.l_i].y + inDrawLimit.y);
	upctx.lineTo(loc[this.l_i].x + this.n0t2e.x, loc[this.l_i].y + this.n0t2e.y);
	upctx.stroke();
	upctx.moveTo(loc[this.l_i].x + this.n0t1.x, loc[this.l_i].y + this.n0t1.y);
	upctx.lineTo(loc[this.l_i].x + outDrawLimit.x, loc[this.l_i].y + outDrawLimit.y);
	if (1 > ratio)
		upctx.lineTo(loc[this.l_i].x + inDrawLimit.x, loc[this.l_i].y + inDrawLimit.y);
	upctx.stroke();

	if (this.present) {
		//inbound fill
		var grd = upctx.createLinearGradient(loc[this.l_i].x + this.n1e.x,loc[this.l_i].y + this.n1e.y, loc[this.l_i].x + this.n1g2.x,loc[this.l_i].y + this.n1g2.y);
		grd.addColorStop(0, this.hexToRGB(this.col, 1));
		grd.addColorStop(1, this.hexToRGB(this.col, 0));
		upctx.fillStyle = grd;

		upctx.beginPath();
		upctx.moveTo(loc[this.l_i].x + this.n1g2.x, loc[this.l_i].y + this.n1g2.y);
		upctx.lineTo(loc[this.l_i].x + this.n1t2e.x, loc[this.l_i].y + this.n1t2e.y);
		angle = Math.atan2(this.n1t2e.y, this.n1t2e.x);
		offset = new Point(0,0);
		offset = offset.polar(n1r - (this.stroke/2 + 0.35), angle);
		upctx.lineTo(loc[this.l_i].x + offset.x, loc[this.l_i].y + offset.y);
		angle2 = Math.atan2(this.n1t1.y, this.n1t1.x);
		upctx.arc(loc[this.l_i].x, loc[this.l_i].y, n1r - (this.stroke/2 + 0.35), angle2, angle, true);
		upctx.lineTo(loc[this.l_i].x + this.n1t1.x, loc[this.l_i].y + this.n1t1.y);
		upctx.lineTo(loc[this.l_i].x + this.n1g1.x, loc[this.l_i].y + this.n1g1.y);
		upctx.closePath();
		upctx.fill();

		//inbound stroke
		upctx.lineWidth = this.stroke;
		var grd = upctx.createLinearGradient(loc[this.l_i].x + this.n1e.x,loc[this.l_i].y + this.n1e.y, loc[this.l_i].x + this.n1g2.x,loc[this.l_i].y + this.n1g2.y);
		grd.addColorStop(0, this.hexToRGB('#000000', 1));
		grd.addColorStop(1, this.hexToRGB('#000000', 0));
		upctx.strokeStyle = grd;

		upctx.beginPath();
		upctx.moveTo(loc[this.l_i].x + this.n1g2.x, loc[this.l_i].y + this.n1g2.y);
		upctx.lineTo(loc[this.l_i].x + this.n1t2e.x, loc[this.l_i].y + this.n1t2e.y);
		upctx.stroke();
		upctx.moveTo(loc[this.l_i].x + this.n1t1.x, loc[this.l_i].y + this.n1t1.y);
		upctx.lineTo(loc[this.l_i].x + this.n1g1.x, loc[this.l_i].y + this.n1g1.y);
		upctx.stroke();
	}


	/* the path itself */
	var paths = document.querySelector('.paths');
	var pathctx = paths.getContext('2d');
	if ((isNaN(this.n1t2e.y) || isNaN(this.n1t2e.x) || isNaN(this.n0t2e.y) || isNaN(this.n0t2e.x)) == false) {
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
			pathctx.lineTo(loc[this.l_i].x + this.n1t1.x - (this.n1t1.x - this.n0t1.x)*(1 - this.lastBridge), loc[this.l_i].y + this.n1t1.y - (this.n1t1.y - this.n0t1.y)*(1 - this.lastBridge))
			pathctx.lineTo(loc[this.l_i].x + this.n1t2.x - (this.n1t2.x - this.n0t2.x)*(1 - this.lastBridge), loc[this.l_i].y + this.n1t2.y - (this.n1t2.y - this.n0t2.y)*(1 - this.lastBridge));
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
		pathctx.lineTo(loc[this.l_i].x + this.n1t2e.x, loc[this.l_i].y + this.n1t2e.y);
		pathctx.closePath();
		pathctx.stroke();
	}
	//outside line
	pathctx.beginPath();
	pathctx.moveTo(loc[this.l_i].x + this.n0t1.x, loc[this.l_i].y + this.n0t1.y);
	if (this.present)
		pathctx.lineTo(loc[this.l_i].x + this.n1t1.x, loc[this.l_i].y + this.n1t1.y)
	else
		pathctx.lineTo(loc[this.l_i].x + this.n1t1.x - (this.n1t1.x - this.n0t1.x)*(1 - this.lastBridge), loc[this.l_i].y + this.n1t1.y - (this.n1t1.y - this.n0t1.y)*(1 - this.lastBridge))
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
		linectx.lineTo(loc[this.l_i].x + this.n1t1.x - (this.n1t1.x - this.n0t1.x)*(1 - this.lastBridge), loc[this.l_i].y + this.n1t1.y - (this.n1t1.y - this.n0t1.y)*(1 - this.lastBridge));
	if ((isNaN(this.n1t2e.y) || isNaN(this.n1t2e.x) || isNaN(this.n0t2e.y) || isNaN(this.n0t2e.x)) == false) {
		if (this.present) {
			linectx.moveTo(loc[this.l_i].x + this.n0t2e.x, loc[this.l_i].y + this.n0t2e.y);
			linectx.lineTo(loc[this.l_i].x + this.n1t2e.x, loc[this.l_i].y + this.n1t2e.y);
		} else {
			linectx.lineTo(loc[this.l_i].x + this.n1t2.x - (this.n1t2.x - this.n0t2.x)*(1 - this.lastBridge), loc[this.l_i].y + this.n1t2.y - (this.n1t2.y - this.n0t2.y)*(1 - this.lastBridge));
			linectx.lineTo(loc[this.l_i].x + this.n0t2e.x, loc[this.l_i].y + this.n0t2e.y);
		}
	}
	linectx.closePath();
	linectx.stroke();
}
Node.prototype.hexToRGB = function(h, alpha) {
	if (alpha === 'undefined') alpha = 1;
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
		if (recalculate==='undefined') recalculate = 1;

		this.lastNow = now;
		this.lastAnc = anc[this.c_i].x;
		this.lastBridge = bridge[this.c_i].x;

		if (2 <= recalculate)
			var active = true;
		else if (1 <= recalculate) {
			active = false;
			for (var i = this.l_y; i >= 0; i--) {
				if (0 !== anc[locDir[this.l_x][i][0]].i) {
					active = true;
					break;}
			}
		}

		if (active) {
			//getting oth data
			this.oth = 0;
			for (var i = 0; i <= this.l_y; i++) {
				if (this.isPresent(locDir[this.l_x][i][0], locDir[this.l_x][i][1], true)) {
					this.oth += anc[locDir[this.l_x][i][0]].x;
					// this.arc_ce -= this.arc_ce*anc[locDir[this.l_x][i][0]].x;
				} else {
					break;}
			}
		}

		//this could be refactored with a trinary return from isPresent
		if (this.isPresent(this.c_i, this.n_i, true, 1)) {
			if (this.isPresent(this.c_i, this.n_i, true)) {
				this.present = true;
			} else {
				this.present = false;
			}

			if (channel) {
				if (this.n_i > 0) {
					if (1 === recalculate && false === active && false === channel) {
						for (var i = this.lastNode.l_y - 1; i >= 0; i--) {
							if (0 !== anc[locDir[this.lastNode.l_x][i][0]].i) {
								active = true;
								break;}
						}
					}
					this.genPath(channel, active);
				}
			} else if (this.present) {
				this.genNode(active);
			}
		}
	}
}
Node.prototype.update = function(evt) {
	genNode();
	if (false == this.moving && (anc[this.l_x][this.l_y].x <= 0 || anc[this.l_x][this.l_y].x >= 1)) {
		removeEventListener(Event.ENTER_FRAME, moveNext);
		this.animating = 0;
		for (var i = 0; i <= this.l_y; i++) {
			if (anc[this.l_x][i].x < 1 && anc[this.l_x][i].x > 0) {
				this.animating = 3;
				break;
			}
		}
		if (this.animating == 0 && this.n_i > 0) {
			for (i = 0; i <= this.lastNode.l_y; i++) {
				if (anc[this.lastNode.l_x][i].x < 1 && anc[this.lastNode.l_x][i].x > 0) {
					this.animating = 2;
					break;
				}
			}
		}
		/*if (this.animating == 0) {
		var j;
		for (i = 0; i <= this.lastNode.l_y; i++) {
		if (isPresent(false, locDir[this.lastNode.l_x][i][0], locDir[this.lastNode.l_x][i][1] + 1)) {
		for (j = 0; j <= charDir[locDir[this.lastNode.l_x][i][0]][locDir[this.lastNode.l_x][i][1] + 1].l_y; j++) {
		if (anc[charDir[locDir[this.lastNode.l_x][i][0]][locDir[this.lastNode.l_x][i][1] + 1].l_x][i].x < 1 && anc[charDir[locDir[this.lastNode.l_x][i][0]][locDir[this.lastNode.l_x][i][1] + 1].l_x][i].x > 0) {
		this.animating = 1;
		break;
		}
		}
		}
		}
		}*/
		/*switch (this.animating) {
		case 3:
		genNode();
		break;
		case 2:
		genPath();
		break;
		case 1:
		//if (this.n_i + 1 >= charDir[this.c_i].length || now < charDir[this.c_i][this.n_i + 1].s_i || bridge[this.c_i].x <= 0 && (this.n_i + 2 >= charDir[this.c_i].length || now < charDir[this.c_i][this.n_i + 2].s_i)) {
		if (false == isPresent(false, this.c_i, this.n_i + 1)) {
		genPathCaps(false, new Point(0, 0), this.getRadius());
		} else {
		charDir[this.c_i][this.n_i + 1].genPathCaps(true, new Point(loc[this.l_i].x - charDir[this.c_i][this.n_i + 1].x, loc[this.l_i].y - charDir[this.c_i][this.n_i + 1].y), this.getRadius());
		}
		break;
		case 0:*/
		if (this.animating <= 1) {
			removeEventListener(Event.ENTER_FRAME, update);
			endUpdate();
		}
	}
}
Node.prototype.endUpdate = function() {
	if (anc[this.l_x][this.l_y].x <= 0) {
		main.visible = false;
		if (this.n_i > 0) {
			path.visible = false;}
		line[this.c_i][this.n_i].visible = false;
		for (var i = this.l_y + 1; i < locDir[this.l_x].length; i++) {
			if (anc[this.l_x][i].x > 0) { break;}}
		if (i >= locDir[this.l_x].length) {
			for (i = this.l_y - 1; i >= 0; i--) {
				if (anc[this.l_x][i].x > 0) {
					var oth_c = locDir[this.l_x][i][0];
					var oth_n = locDir[this.l_x][i][1] + 1;
					if (isPresent(oth_c, oth_n, false, 1)) {
						charDir[oth_c][oth_n].pathUnderArc.visible = true;
						charDir[oth_c][oth_n].pathOverArc.visible = false;}
					break;}
			}
		}
	} else if (anc[this.l_x][this.l_y].x >= 1) {
		timeCon[this.c_i].evalState();}
	/* insurance (initially only per l_x, now also for l_x of next nodes in char sequences, due to abnormalities in path caps */ // what 'abnormalities'?
	//this is desperate need of refinement, if only for sake of clarity
	for (i = this.l_y; i < locDir[this.l_x].length; i++) {
		if (anc[this.l_x][i].x > 0) {
			oth_c = locDir[this.l_x][i][0];
			oth_n = locDir[this.l_x][i][1];
			charDir[oth_c][oth_n].genNode();
			if (oth_n + 1 < charDir[oth_c].length) {
				charDir[oth_c][oth_n + 1].genNode();}
		}
	}
	//break;
}

/* these are the continuous movement functions
movementNext is activated by other nodes, and it calls waitNext (waitNextFunction just passes parameters too)
waitNext calls initNext, which further propagates time's progress to other nodes
moveNext is not always called, depending on time's final resting place
*/
Node.prototype.movementNext = function(begin, target, end, caller, rift, inactive) {
	if (typeof(target)==='undefined') target = 0;
	if (typeof(end)==='undefined') end = true;
	if (typeof(caller)==='undefined') caller = 0;
	if (typeof(rift)==='undefined') rift = false;
	if (typeof(inactive)==='undefined') inactive = true;
	removeEventListener(Event.ENTER_FRAME, this.waitNextFunction);
	removeEventListener(Event.ENTER_FRAME, this.moveNextFunction);
	this.moving = false;
	if (begin) {
		this.waiting = true;
		if (inactive) {
			this.waitNextFunction = waitNext(target, end, caller, rift, inactive);
			addEventListener(Event.ENTER_FRAME, this.waitNextFunction);
		} else {
			initNext(target, end, caller, rift, inactive);}
	} else {
		this.waiting = false;}
}
Node.prototype.waitNext = function(target, end, caller, rift, inactive) {
	return function (evt) {
		if (typeof(rift)==='undefined') rift = false;
		if (typeof(inactive)==='undefined') inactive = true;
		if (false == rift && Detect.isWithin(this.s_i, caller, 0, 1, true) || rift && riftBridge.x >= 1 || now > target && (false == end || isPresent(time[target][0][0], time[target][0][1]))) {
			removeEventListener(Event.ENTER_FRAME, this.waitNextFunction);
			now++;
			bridge[this.c_i].x = 0;
			initNext(target, end, caller, rift, inactive);
		}
	}
}
Node.prototype.initNext = function(target, end, caller, rift, inactive) {
	if (time[this.s_i][1][1] > 0) {
		//determining animation interval
		var marker;
		if (end) {
			if (target == this.s_i) {
				marker = 0;
				var extent = time[target][1][1];
			} else if (Detect.isWithin(this.s_i, target, 2)) {
				marker = 1;
				extent = time[this.s_i][1][1];
			} else {
				if (target < this.s_i) { marker = 2; extent = time[target][1][1] - Detect.findInterval(this.s_i, false, target);}
							 else { marker = 3; extent = time[target][1][1] + Detect.findInterval(target, false, this.s_i);}
			}
		} else {
			if (target == this.s_i) {
				marker = 4;
				extent = 0;
			} else if (Detect.isWithin(this.s_i, target, 2, 0, true)) {
				marker = 5;
				extent = time[this.s_i][1][1];
			} else {
				if (target < this.s_i) { marker = 6; extent = 0;}
							 else { marker = 7; extent = Detect.findInterval(target, false, this.s_i);}
			}
		}
		//assigning to bridge
		if (extent == 0) {
			this.waiting = false;
		} else {
			var compExtent = extent/time[this.s_i][1][1];
			if (rift) {
				if (false == inactive && bridge[this.c_i].x > compExtent) {
					bridge[this.c_i].x = compExtent;}
			} else {
				//not insured; added this conditional to allow for more natural transitions into movement (i.e. those from point of initialization, 'unnaturally' halted)
				if (inactive && this.c_i != time[caller][0][0]) {
					bridge[this.c_i].x = (time[caller][1][1]*bridge[time[caller][0][0]].x - Detect.findInterval(this.s_i, false, caller))/time[this.s_i][1][1];}
				if (bridge[this.c_i].x > compExtent) {
					bridge[this.c_i].x = compExtent;}
			}
			var duration = extent - bridge[this.c_i].x*time[this.s_i][1][1];
			if (0 > duration) {
				duration = 0;}
			TweenLite.to(bridge[this.c_i], movSpeed*duration, {x:compExtent, ease:Linear.easeNone});
			//adding events to begin 'actual' animation
			removeEventListener(Event.ENTER_FRAME, this.moveNextFunction);
			this.moveNextFunction = moveNext(target, end);
			this.moving = true;
			this.waiting = false;
			addEventListener(Event.ENTER_FRAME, this.moveNextFunction);
			removeEventListener(Event.ENTER_FRAME, update);
			addEventListener(Event.ENTER_FRAME, update);

			//rift and end == false?

			//creating listeners for any node whose movement begins within the defined extent, regardless of whether it's further nested, and removes any previously assigned
			var beforeRift = true;
			var riftIndex;
			for (var i = this.s_i + 1; i < time.length; i++) {
				var oth_c = time[i][0][0];
				var oth_n = time[i][0][1];
				//this conditional checks if 'i' can be chained by our movement
				if (Detect.isWithin(i, this.s_i, 0) && (i <= target || false == end && Detect.findInterval(i, false, target) <= 0 || end && Detect.isWithin(i, target, 0))) {
					if (beforeRift && time[i][1][1] > 0) {
						beforeRift = false;}
					if (false == (charDir[oth_c][oth_n].waiting || isPresent(oth_c, oth_n, false, 0)) && Detect.findInterval(i, false, this.s_i) > 0) {
						charDir[oth_c][oth_n].movementNext(true, target, end, this.s_i);}
				//and, if not, marks a candidate riftIndex and breaks
				} else {
					riftIndex = i;
					break;}
			}

			// (a rift is discontinous collective movement, i.e. no overlap to successively chain movements - time would cease to exist but for the dedicated 'riftBridge')
			if (beforeRift && riftIndex <= target) {
				//confirming existence of apparent rift
				for (i = 0; beforeRift && i < charDir.length; i++) {
					//determining if any other already active character path spans the rift
					for (var j = charDir[i].length - 1; j >= 0; j--) {
						if (charDir[i][j].s_i < this.s_i) {
							if (Detect.isWithin(riftIndex, charDir[i][j].s_i, 0)) {
								beforeRift = false;}
							break;}
					}
				}
				//true rift
				if (beforeRift) {
					//animating riftBridge
					var interval = Detect.findInterval(riftIndex, false, this.s_i);
					if (0 >= riftBridge.x || 1 <= riftBridge.x) {
						riftBridge.x = time[this.s_i][1][1]*bridge[this.c_i].x/interval;}
					TweenLite.to(riftBridge, movSpeed*interval*(1 - riftBridge.x), {x:1, ease:Linear.easeNone});
					//adding listeners to riftIndex (and any other simultaneous indeces)
					for (i = riftIndex; i < time.length; i++) {
						if (0 >= Detect.findInterval(i, false, riftIndex)) {
							charDir[time[i][0][0]][time[i][0][1]].movementNext(true, target, end, this.s_i, true);
						} else {
							break;}
					}
				}
			}
		}
	} else {
		bridge[this.c_i].x = 1;}
}
Node.prototype.moveNext = function(target, end) {
	return function (evt) {
		if (isPresent(this.c_i, this.n_i) || now >= target && (false == end || bridge[time[target][0][0]].x >= 1)) {
			movementNext(false);
			timeCon[this.c_i].evalState();}
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
	}

	moving = waiting = false;
	this.waitNextFunction = this.waitNext(0, true, 0);
	this.moveNextFunction = this.moveNext(0, true);
}
