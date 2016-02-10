		var radius = 6, stroke = 0.3*this.radius;
		var oth;
		var loc;
		var col;
		
		var lastNode;
		var n0t1, n0t2, n0t2e,
			n1t1, n1t2, n1t2e;

		var arc_ce;
					
		var c_i, n_i, s_i, l_x, l_y;
					
		var animating;
		var anc_x0, anc_x1,
			lastBridge, lastNow,
			present,
			moving = false, waiting = false;
		var waitNextFunction;
		var moveNextFunction;
		
		// var testUint = 0;
					
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
		Node.prototype.getloc = function() { return this.loc;}
		Node.prototype.recolour = function(newCol) { this.col = newCol; this.genNode();}

		// 0.1 works for denominators as far as tests conduncted were concerned; however 0.0001 does not, 0.01 did not work once
		Node.prototype.findIntercepts = function(p1, p2, c_loc, c_rad, ref_loc) {
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
				return {x:int_x1, y:int_y1};
			} else {
				return {x:int_x2, y:int_y2};}
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
				p = {x:px, y:py};
			} else if (n0r > n1r) {
				px = -(n0l.x * n1r);
				px /= n0r - n1r;
				py = -(n0l.y * n1r);
				py /= n0r - n1r;
				p = {x:px, y:py};
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
			
			t1 = {x:x1, y:y2};
			t2 = {x:x2, y:y1};
			
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
			
			t3 = {x:x1, y:y2};
			t4 = {x:x2, y:y1};
			
			if (n1r > n0r) {
				this.n0t1 = t2;
				this.n1t1 = t4;
			} else {
				this.n0t1 = t1;
				this.n1t1 = t3;}
		}
		Node.prototype.genPath = function() {
			var n0l = {x:this.lastNode.x - this.loc.x, y:this.lastNode.y - this.loc.y};
			var n0r = this.lastNode.getRadius();
			var n1r = this.getRadius();
			
			var angle;
			var angle2;
			var offset;
			
			if (n0r == n1r) {
				var xTerm = n0l.x,
					yTerm = n0l.y;
				if (xTerm == 0) { xTerm = 0.1;}
				if (yTerm == 0) { yTerm = 0.1;}

				angle = -Math.atan2(-xTerm, -yTerm);
				offset = Point.polar(n1r, angle);
				this.n0t1 = {x:n0l.x + offset.x, y:n0l.y + offset.y};
				this.n1t1 = offset;
			} else {
				findTangentPoints(n0l, n0r, n1r);}
			
			angle = (-Math.atan2(this.n0t1.x, this.n0t1.y));
			offset = Point.polar(n0r - (this.lastNode.oth + 1 - this.anc_x0)*this.radius, angle);
			this.n0t2 = {x:this.n0t1.x + offset.x, y:this.n0t1.y + offset.y};
			this.n1t2 = {x:this.n1t1.x + offset.x, y:this.n1t1.y + offset.y};
			
			this.n0t2e = findIntercepts(this.n0t2, this.n1t2, n0l, n0r, {x:0, y:0});
			this.n1t2e = findIntercepts(this.n0t2, this.n1t2, {x:0, y:0}, n1r, n0l);


			//drawing
			/* pathBreak	contains the half-radius circle covering paths outbound after the arrival of and set within lastNode
			   pathUnderArc	contains the graphic for circular arcs around pathBreak of outermost nodes; whereas
			   pathOverArc	contains a circle, for those inset (i.e. not outermost), due to graphical 'irregularity' at gaps
			   pathMain		contains the path itself, and all are contained within the object path*/
			
			/* Anchoring path to previous node */
			pathBreak.graphics.clear();
			pathBreak.graphics.beginFill(this.col);
			pathBreak.graphics.drawCircle(n0l.x, n0l.y, n0r - this.anc_x0*this.radius/2);
			pathBreak.graphics.drawCircle(n0l.x, n0l.y, n0r);
			pathBreak.graphics.endFill();
			
			pathUnderArc.graphics.clear();
			pathUnderArc.graphics.lineStyle(stroke, 0x000000);
			if (this.n_i > 1) {
				angle = Math.atan2(this.lastNode.n1t1.y,this.lastNode.n1t1.x);
				angle2 = Math.atan2(this.lastNode.n1t2e.y,this.lastNode.n1t2e.x);
				Arc.draw(pathUnderArc, n0l.x, n0l.y, n0r, Math.PI + Math.abs(Math.abs(angle - angle2) - Math.PI), angle);
				
				offset = Point.polar(n0r/4*this.lastNode.arc_ce, angle - Math.PI/2);
				pathUnderArc.graphics.moveTo(this.lastNode.n1t1.x + n0l.x, this.lastNode.n1t1.y + n0l.y);
				pathUnderArc.graphics.lineTo(this.lastNode.n1t1.x + n0l.x + offset.x, this.lastNode.n1t1.y + n0l.y + offset.y);
			} else {
				pathUnderArc.graphics.drawCircle(n0l.x, n0l.y, n0r);}
			
			pathOverArc.graphics.clear();
			pathOverArc.graphics.lineStyle(stroke, 0x000000);
			pathOverArc.graphics.drawCircle(n0l.x, n0l.y, n0r);
			
			/* Capping to anchor paths of nodes interior */
			pathBreak.graphics.lineStyle(stroke, 0x000000);
			genPathCaps(true, n0l, n0r);
			
			
			/* the path itself */
			pathMain.graphics.clear();
			pathMain.graphics.beginFill(this.col);
			pathMain.graphics.lineStyle(stroke, 0x000000);
			pathMain.graphics.moveTo(this.n0t1.x, this.n0t1.y);
			if (this.present) {
				pathMain.graphics.lineTo(this.n1t1.x, this.n1t1.y);
			} else {
				pathMain.graphics.lineTo(this.n1t1.x - (this.n1t1.x - this.n0t1.x)*(1 - this.lastBridge), this.n1t1.y - (this.n1t1.y - this.n0t1.y)*(1 - this.lastBridge));
			}
			if ((isNaN(this.n1t2e.y) || isNaN(this.n1t2e.x) || isNaN(this.n0t2e.y) || isNaN(this.n0t2e.x)) == false) {
				if (this.present) {
					pathMain.graphics.lineStyle(0,0,0);
					angle = Math.atan2(this.n1t2e.y, this.n1t2e.x);
					offset = Point.polar(n1r - (stroke/2 + 0.35), angle);
					pathMain.graphics.lineTo(offset.x, offset.y);
					pathMain.graphics.lineTo(this.n1t2e.x, this.n1t2e.y);
					pathMain.graphics.lineStyle(stroke, 0x000000, 1);
				} else {
					pathMain.graphics.lineTo(this.n1t2.x - (this.n1t2.x - this.n0t2.x)*(1 - this.lastBridge), this.n1t2.y - (this.n1t2.y - this.n0t2.y)*(1 - this.lastBridge));}
				pathMain.graphics.lineTo(this.n0t2e.x, this.n0t2e.y);

				pathMain.graphics.lineStyle(0,0,0);
				angle = Math.atan2(this.n0t2e.y - n0l.y, this.n0t2e.x - n0l.x)
				offset = Point.polar(n0r - (stroke/2 + 0.35), angle);
				pathMain.graphics.lineTo(offset.x + n0l.x, offset.y + n0l.y);
				path.graphics.lineTo(this.n0t2.x, this.n0t2.y);
				angle2 = Math.atan2(this.n0t1.y - n0l.y, this.n0t1.x - n0l.x);
				Arc.draw(pathMain, n0l.x, n0l.y, n0r - (stroke/2 + 0.35), -(Math.PI - Math.abs(Math.abs(angle2 - angle) - Math.PI)), angle);
			}
			pathMain.graphics.endFill();

			
			/* line overlays */
			line[this.c_i][this.n_i].graphics.clear();
			line[this.c_i][this.n_i].graphics.lineStyle(stroke, 0x000000, 0.2);
			line[this.c_i][this.n_i].graphics.moveTo(this.n0t1.x + this.loc.x, this.n0t1.y + this.loc.y);
			if (this.present) {
				line[this.c_i][this.n_i].graphics.lineTo(this.n1t1.x + this.loc.x, this.n1t1.y + this.loc.y);
			} else {
				line[this.c_i][this.n_i].graphics.lineTo(this.n1t1.x - (this.n1t1.x - this.n0t1.x)*(1 - this.lastBridge) + this.loc.x, this.n1t1.y - (this.n1t1.y - this.n0t1.y)*(1 - this.lastBridge) + this.loc.y);}
			if ((isNaN(this.n1t2e.y) || isNaN(this.n1t2e.x) || isNaN(this.n0t2e.y) || isNaN(this.n0t2e.x)) == false) {
				if (this.present) {
					line[this.c_i][this.n_i].graphics.moveTo(this.n0t2e.x + this.loc.x, this.n0t2e.y + this.loc.y);
					line[this.c_i][this.n_i].graphics.lineTo(this.n1t2e.x + this.loc.x, this.n1t2e.y + this.loc.y);
				} else {
					line[this.c_i][this.n_i].graphics.lineTo(this.n1t2.x - (this.n1t2.x - this.n0t2.x)*(1 - this.lastBridge) + this.loc.x, this.n1t2.y - (this.n1t2.y - this.n0t2.y)*(1 - this.lastBridge) + this.loc.y);
					line[this.c_i][this.n_i].graphics.lineTo(this.n0t2e.x + this.loc.x, this.n0t2e.y + this.loc.y);}
			}
		}

		Node.prototype.genPathCaps = function(breaking, n0l, n0r) {
			if (breaking) {
				var hold_l_x = this.lastNode.l_x;
				var hold_l_y = this.lastNode.l_y;
				var hold_s_i = this.lastNode.s_i;
				var hold_anc = this.anc_x0;
			} else {
				hold_l_x = this.l_x;
				hold_l_y = this.l_y;
				hold_s_i = this.s_i;
				hold_anc = this.anc_x1;
			}
			
			var outermost = true;
			if (this.n_i == 0 || this.n_i == 1 && breaking) {
				outermost = false;
			} else {
				for (i = hold_l_y + 1; i < locDir[hold_l_x].length; i++) {
					if (isPresent(locDir[hold_l_x][i][0], locDir[hold_l_x][i][1], true)) {
						if (anc[hold_l_x][i].x > 0) {
							outermost = false;}
					} else {
						break;}
				}
			}
			
			if (breaking || outermost) {
				//somewhat out of place here, but both run on every regen and have significant overlap in requirements
				if (breaking && this.n_i >= 2) {
					if (outermost) {
						charDir[this.c_i][this.n_i].pathUnderArc.visible = true;
						charDir[this.c_i][this.n_i].pathOverArc.visible = false;
					} else {
						charDir[this.c_i][this.n_i].pathUnderArc.visible = false;
						charDir[this.c_i][this.n_i].pathOverArc.visible = true;}
				}
				for (var i = 0; i < hold_l_y; i++) {
					if (anc[hold_l_x][i].x > 0) {
						var oth_c = locDir[hold_l_x][i][0];
						var oth_n = locDir[hold_l_x][i][1] + 1;
						//outbound breaks; outbound paths; inbound paths
						if (oth_n < charDir[oth_c].length) {
							if (breaking && charDir[oth_c][oth_n].s_i < this.s_i && false == Detect.isWithin(charDir[oth_c][oth_n].s_i, hold_s_i, 0, 2, false)) {
								drawPathCap(n0l, n0r - hold_anc*this.radius/2, oth_c, oth_n, breaking, true);}
							if (outermost && charDir[oth_c][oth_n].s_i > hold_s_i && (breaking && charDir[oth_c][oth_n].s_i < this.s_i || breaking == false && Detect.isWithin(charDir[oth_c][oth_n].s_i, hold_s_i, 0, 2, false))) {
								drawPathCap(n0l, n0r, oth_c, oth_n, breaking, true);}
						}
						oth_n = locDir[hold_l_x][i][1];
						if (outermost && oth_n > 0 && charDir[oth_c][oth_n].s_i > hold_s_i) {
							drawPathCap(n0l, n0r, oth_c, oth_n, breaking, false);}
					}
				}
			}
		}
		Node.prototype.drawPathCap = function(cen, rad, oth_c, oth_n, breaking, outbound) {
			if (outbound) {
				var xPos = cen.x + (charDir[oth_c][oth_n].x - charDir[oth_c][oth_n - 1].x),
					yPos = cen.y + (charDir[oth_c][oth_n].y - charDir[oth_c][oth_n - 1].y),
					xOffset = xPos,
					yOffset = yPos;
			} else {
				xPos = cen.x + (charDir[oth_c][oth_n - 1].x - charDir[oth_c][oth_n].x);
				yPos = cen.y + (charDir[oth_c][oth_n - 1].y - charDir[oth_c][oth_n].y);
				xOffset = cen.x;
				yOffset = cen.y;
			}
			
			var p1 = {x:charDir[oth_c][oth_n].n1t1.x + xOffset, y:charDir[oth_c][oth_n].n1t1.y + yOffset},
				p2 = {x:charDir[oth_c][oth_n].n0t1.x + xOffset, y:charDir[oth_c][oth_n].n0t1.y + yOffset};
			var t_int = findIntercepts(p1, p2, cen, rad, {x:xPos, y:yPos});
			
			var xTerm = t_int.x - cen.x,
				yTerm = t_int.y - cen.y;
			if (xTerm == 0) { xTerm = 0.1;}
			if (yTerm == 0) { yTerm = 0.1;}
			var angle = Math.atan2(yTerm, xTerm);
			
			p1 = {x:charDir[oth_c][oth_n].n1t2.x + xOffset, y:charDir[oth_c][oth_n].n1t2.y + yOffset};
			p2 = {x:charDir[oth_c][oth_n].n0t2.x + xOffset, y:charDir[oth_c][oth_n].n0t2.y + yOffset};
			t_int = findIntercepts(p1, p2, cen, rad, {x:xPos, y:yPos});
			
			xTerm = t_int.x - cen.x;
			yTerm = t_int.y - cen.y;
			if (xTerm == 0) { xTerm = 0.1;}
			if (yTerm == 0) { yTerm = 0.1;}
			var angle2 = Math.atan2(yTerm, xTerm);
			
			if (breaking) {
				if (outbound) { Arc.draw(pathBreak, cen.x, cen.y, rad, Math.PI - Math.abs(Math.abs(angle - angle2) - Math.PI), angle);}
						 else { Arc.draw(pathBreak, cen.x, cen.y, rad, Math.PI - Math.abs(Math.abs(angle - angle2) - Math.PI), angle2);}
			} else {
				if (outbound) { Arc.draw(main, cen.x, cen.y, rad, Math.PI - Math.abs(Math.abs(angle - angle2) - Math.PI), angle);}
						 else { Arc.draw(main, cen.x, cen.y, rad, Math.PI - Math.abs(Math.abs(angle - angle2) - Math.PI), angle2);}
			}
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
				return true;}
			return false;
		}
		Node.prototype.genNode = function() {
			this.lastBridge = bridge[this.c_i].x;
			this.lastNow = now;
			//getting oth data
			var i;
			this.oth = 0;
			this.arc_ce = 1;
			for (i = 0; i < this.l_y; i++) {
				if (isPresent(locDir[this.l_x][i][0], locDir[this.l_x][i][1], true)) {
					this.oth += anc[this.l_x][i].x;
					this.arc_ce -= this.arc_ce*0.35*anc[this.l_x][i].x;
				}
			}
			this.arc_ce += (1 - this.arc_ce)*0.75;
			this.anc_x1 = anc[this.l_x][this.l_y].x;
			this.oth += this.anc_x1;
			if (this.n_i > 0) {
				this.anc_x0 = anc[this.lastNode.l_x][this.lastNode.l_y].x;//charDir[this.c_i][this.n_i - 1].anc_x1;
			}
			
			if (this.anc_x1 > 0 && isPresent(this.c_i, this.n_i, true, 1)) {
				if (isPresent(this.c_i, this.n_i, true)) { this.present = true;}
										  else { this.present = false;}
				//generating path
				if (this.n_i > 0) {
					genPath();
					path.visible = true;
				}
				line[this.c_i][this.n_i].visible = true;
				
				//generating node
				if (this.present) {
					main.graphics.clear();
					main.graphics.beginFill(this.col);
					main.graphics.drawCircle(0,0,(this.oth + 1)*this.radius);
					main.graphics.lineStyle(stroke, 0x000000);
					main.graphics.drawCircle(0,0,(this.oth + 1 - this.anc_x1)*this.radius);
					main.graphics.endFill();
					
					//drawing arc
					main.graphics.lineStyle(stroke, 0x000000);
					if (this.n_i > 0) {
						if (false == isPresent(this.c_i, this.n_i + 1, true, 1)) {
							var angle = Math.atan2(this.n1t1.y, this.n1t1.x);
							var angle2 = Math.atan2(this.n1t2e.y, this.n1t2e.x);
							Arc.draw(main, 0, 0, (this.oth + 1)*this.radius, Math.PI + Math.abs(Math.abs(angle - angle2) - Math.PI), angle);
							
							var offset = Point.polar(this.getRadius()/4*this.arc_ce, angle - Math.PI/2);
							main.graphics.moveTo(this.n1t1.x, this.n1t1.y);
							main.graphics.lineTo(this.n1t1.x + offset.x, this.n1t1.y + offset.y);
							//generating outer path caps (those coincidental with outer arc) here while no pathBreak of next exists to do so
							genPathCaps(false, {x:0, y:0}, this.getRadius());
						}
					} else {
						main.graphics.lineStyle(stroke, 0x000000);
						main.graphics.drawCircle(0, 0, (this.oth + 1)*this.radius);
					}
					main.visible = true;
				} else {
					main.visible  = false;
				}
			} else {
				main.visible  = false;
				if (this.n_i > 0) { path.visible = false;}
				line[this.c_i][this.n_i].visible = false;
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
				genPathCaps(false, {x:0, y:0}, this.getRadius());
				} else {
				charDir[this.c_i][this.n_i + 1].genPathCaps(true, {x:this.loc.x - charDir[this.c_i][this.n_i + 1].x, y:this.loc.y - charDir[this.c_i][this.n_i + 1].y}, this.getRadius());
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
			this.loc = location;
						
			if (this.n_i > 0) {
				this.n0t1 = {x:0, y:0};
				this.n0t2 = {x:0, y:0};
				this.n0t2e = {x:0, y:0};
				this.n1t1 = {x:0, y:0};
				this.n1t2 = {x:0, y:0};
				this.n1t2e = {x:0, y:0};

				this.lastNode = charDir[this.c_i][this.n_i - 1];

				/*var i;
				for (i = this.lastNode.l_y + 1; i < locDir[this.lastNode.l_x].length; i++) {
					if (anc[this.lastNode.l_x][i].x > 0) { break;}
				}
				if (i == locDir[this.lastNode.l_x].length) {
					pathOverArc.visible = false;
					pathUnderArc.visible = true;
				} else {
					pathOverArc.visible = true;
					pathUnderArc.visible = false;
				}*/
			}
			
			this.waitNextFunction = this.waitNext(0, true, 0);
			this.moveNextFunction = this.moveNext(0, true);
		}



