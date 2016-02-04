		public var main: Sprite;
		public var test:Sprite;
		private static var radius: uint = 6;
		private static var stroke: Number = 0.3*radius;
		private var oth: Number;
		private var col: Object;
		private var loc: Point;
		
		private var lastNode: Node;
		private var n0t1: Point,
					n0t2: Point,
					n0t2e:Point,
					n1t1: Point,
					n1t2: Point,
					n1t2e:Point;
		public var path: Sprite,
				   pathMain:Sprite,
				   pathUnderArc:Sprite,
				   pathOverArc:Sprite,
				   pathBreak:Sprite,
				   arc_ce:Number;
					
		public var c_i: uint,
					n_i: uint,
					s_i: uint,
					l_x: uint,
					l_y: uint;
					
		public var animating:uint;
		public var anc_x0:Number,
					anc_x1:Number,
					lastBridge:Number,
					lastNow:uint,
					present:Boolean,
					moving:Boolean = false,
					waiting:Boolean = false;
		public var moveNextFunction:Function;
		public var waitNextFunction:Function;
		
		public var testUint:uint = 0;
					
		//private var aniNode0:Point,
		//			aniNode1:Point;
	
		
		/*public static function get c_i(): uint { return c_i;}
		public static function get n_i(): uint { return n_i;}
		public static function get s_i(): uint { return s_i;}
		public static function get l_x(): uint { return l_x;}
		public static function get l_y(): uint { return l_y;}*/
		
		public static function get n0t1(): Point { return n0t1;}
		public static function get n1t1(): Point { return n1t1;}
		public static function get n0t2(): Point { return n0t2;}
		public static function get n0t2e(): Point { return n0t2e;}
		public static function get n1t2(): Point { return n1t2;}
		public static function get n1t2e(): Point { return n1t2e;}
		
		public function getRadius(): Number { return (oth + 1)*radius;}
		public function getloc(): Point { return loc;}
		public function recolour(newCol:Object): void { col = newCol; genNode();}

		// 0.1 works for denominators as far as tests conduncted were concerned; however 0.0001 does not, 0.01 did not work once
		private function findIntercepts(p1:Point, p2:Point, c_loc:Point, c_rad:Number, ref_loc:Point):Point {
			var denTerm:Number = p2.x - p1.x;
			if (denTerm == 0) { denTerm = 0.1;}
			var slope:Number = (p2.y - p1.y)/denTerm;
			var int_lb:Number = p2.y - slope*p2.x;
			var int_a:Number = slope*slope + 1;
			var int_b:Number = 2*(slope*(int_lb - c_loc.y) - c_loc.x);
			var int_c:Number = c_loc.x*c_loc.x + (int_lb - c_loc.y)*(int_lb - c_loc.y) - c_rad*c_rad;
			var int_sqrt:Number = Math.sqrt(int_b*int_b - 4*int_a*int_c);
			
			denTerm = 2*int_a;
			if (denTerm == 0) { denTerm = 0.1;}
			var int_x1:Number = (-int_b + int_sqrt)/denTerm;
			var int_x2:Number = (-int_b - int_sqrt)/denTerm;
			var int_y1:Number = Math.sqrt(c_rad*c_rad - (int_x1 - c_loc.x)*(int_x1 - c_loc.x)) + c_loc.y;
			var int_y2:Number = Math.sqrt(c_rad*c_rad - (int_x2 - c_loc.x)*(int_x2 - c_loc.x)) + c_loc.y;
			
			if (Math.floor(int_y1) != Math.floor(slope*int_x1 + int_lb)) {
				int_y1 -= 2*(int_y1 - c_loc.y);}
			if (Math.floor(int_y2) != Math.floor(slope*int_x2 + int_lb)) {
				int_y2 -= 2*(int_y2 - c_loc.y);}
			var d1:Number = Math.sqrt((ref_loc.x - int_x1)*(ref_loc.x - int_x1) + (ref_loc.y - int_y1)*(ref_loc.y - int_y1));
			var d2:Number = Math.sqrt((ref_loc.x - int_x2)*(ref_loc.x - int_x2) + (ref_loc.y - int_y2)*(ref_loc.y - int_y2));
			if (d2 > d1) {
				return new Point(int_x1, int_y1);
			} else {
				return new Point(int_x2, int_y2);}
		}
		private function findTangentPoints(n0l:Point,n0r:Number,n1r:Number): void {
			var p:Point;
			var px:Number;
			var py:Number;
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
			
			var t1:Point,
				t2:Point,
				t3:Point,
				t4:Point;
			
			var denTerm:Number = (p.x - n0l.x) * (p.x - n0l.x);
			denTerm += (p.y - n0l.y) * (p.y - n0l.y);
			if (denTerm == 0) { denTerm = 0.1;}
			var numRight:Number = (p.x - n0l.x) * (p.x - n0l.x);
			numRight = numRight + (p.y - n0l.y) * (p.y - n0l.y);
			numRight = numRight - n0r * n0r;
			numRight = Math.sqrt(numRight);
			
			var xNumRight:Number = n0r * (p.y - n0l.y);
			xNumRight = xNumRight * numRight;
			var x0:Number = n0r * n0r * (p.x - n0l.x);
			var x1:Number = x0 + xNumRight;
			x1 = x1 / denTerm;
			x1 = x1 + n0l.x;
			var x2:Number = x0 - xNumRight;
			x2 = x2 / denTerm;
			x2 = x2 + n0l.x;
			
			var yNumRight:Number = n0r * (p.x - n0l.x);
			yNumRight = yNumRight * numRight;
			var y0:Number = n0r * n0r * (p.y - n0l.y);
			var y1:Number = y0 + yNumRight;
			y1 = y1 / denTerm;
			y1 = y1 + n0l.y;
			var y2:Number = y0 - yNumRight;
			y2 = y2 / denTerm;
			y2 = y2 + n0l.y;
			
			t1 = new Point(x1,y2);
			t2 = new Point(x2,y1);
			
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
			
			t3 = new Point(x1,y2);
			t4 = new Point(x2,y1);
			
			if (n1r > n0r) {
				n0t1 = t2;
				n1t1 = t4;
			} else {
				n0t1 = t1;
				n1t1 = t3;}
		}
		public function genPath(): void {
			var n0l: Point = new Point(lastNode.x - this.x, lastNode.y - this.y);
			var n0r: Number = lastNode.getRadius();
			var n1r: Number = this.getRadius();
			
			var angle:Number;
			var angle2:Number;
			var offset:Point;
			
			if (n0r == n1r) {
				var xTerm:Number = n0l.x,
					yTerm:Number = n0l.y;
				if (xTerm == 0) { xTerm = 0.1;}
				if (yTerm == 0) { yTerm = 0.1;}

				angle = -Math.atan2(-xTerm, -yTerm);
				offset = Point.polar(n1r, angle);
				n0t1 = new Point(n0l.x + offset.x, n0l.y + offset.y);
				n1t1 = offset;
			} else {
				findTangentPoints(n0l, n0r, n1r);}
			
			angle = (-Math.atan2(n0t1.x, n0t1.y));
			offset = Point.polar(n0r - (lastNode.oth + 1 - anc_x0)*radius, angle);
			n0t2 = new Point(n0t1.x + offset.x, n0t1.y + offset.y);
			n1t2 = new Point(n1t1.x + offset.x, n1t1.y + offset.y);
			
			n0t2e = findIntercepts(n0t2, n1t2, n0l, n0r, new Point(0,0));
			n1t2e = findIntercepts(n0t2, n1t2, new Point(0,0), n1r, n0l);


			//drawing
			/* pathBreak	contains the half-radius circle covering paths outbound after the arrival of and set within lastNode
			   pathUnderArc	contains the graphic for circular arcs around pathBreak of outermost nodes; whereas
			   pathOverArc	contains a circle, for those inset (i.e. not outermost), due to graphical 'irregularity' at gaps
			   pathMain		contains the path itself, and all are contained within the object path*/
			
			/* Anchoring path to previous node */
			pathBreak.graphics.clear();
			pathBreak.graphics.beginFill(col.hex);
			pathBreak.graphics.drawCircle(n0l.x, n0l.y, n0r - anc_x0*radius/2);
			pathBreak.graphics.drawCircle(n0l.x, n0l.y, n0r);
			pathBreak.graphics.endFill();
			
			pathUnderArc.graphics.clear();
			pathUnderArc.graphics.lineStyle(stroke, 0x000000);
			if (n_i > 1) {
				angle = Math.atan2(lastNode.n1t1.y,lastNode.n1t1.x);
				angle2 = Math.atan2(lastNode.n1t2e.y,lastNode.n1t2e.x);
				Arc.draw(pathUnderArc, n0l.x, n0l.y, n0r, Math.PI + Math.abs(Math.abs(angle - angle2) - Math.PI), angle);
				
				offset = Point.polar(n0r/4*lastNode.arc_ce, angle - Math.PI/2);
				pathUnderArc.graphics.moveTo(lastNode.n1t1.x + n0l.x, lastNode.n1t1.y + n0l.y);
				pathUnderArc.graphics.lineTo(lastNode.n1t1.x + n0l.x + offset.x, lastNode.n1t1.y + n0l.y + offset.y);
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
			pathMain.graphics.beginFill(col.hex);
			pathMain.graphics.lineStyle(stroke, 0x000000);
			pathMain.graphics.moveTo(n0t1.x, n0t1.y);
			if (present) {
				pathMain.graphics.lineTo(n1t1.x, n1t1.y);
			} else {
				pathMain.graphics.lineTo(n1t1.x - (n1t1.x - n0t1.x)*(1 - lastBridge), n1t1.y - (n1t1.y - n0t1.y)*(1 - lastBridge));
			}
			if ((isNaN(n1t2e.y) || isNaN(n1t2e.x) || isNaN(n0t2e.y) || isNaN(n0t2e.x)) == false) {
				if (present) {
					pathMain.graphics.lineStyle(0,0,0);
					angle = Math.atan2(n1t2e.y, n1t2e.x);
					offset = Point.polar(n1r - (stroke/2 + 0.35), angle);
					pathMain.graphics.lineTo(offset.x, offset.y);
					pathMain.graphics.lineTo(n1t2e.x, n1t2e.y);
					pathMain.graphics.lineStyle(stroke, 0x000000, 1);
				} else {
					pathMain.graphics.lineTo(n1t2.x - (n1t2.x - n0t2.x)*(1 - lastBridge), n1t2.y - (n1t2.y - n0t2.y)*(1 - lastBridge));}
				pathMain.graphics.lineTo(n0t2e.x, n0t2e.y);

				pathMain.graphics.lineStyle(0,0,0);
				angle = Math.atan2(n0t2e.y - n0l.y, n0t2e.x - n0l.x)
				offset = Point.polar(n0r - (stroke/2 + 0.35), angle);
				pathMain.graphics.lineTo(offset.x + n0l.x, offset.y + n0l.y);
				path.graphics.lineTo(n0t2.x, n0t2.y);
				angle2 = Math.atan2(n0t1.y - n0l.y, n0t1.x - n0l.x);
				Arc.draw(pathMain, n0l.x, n0l.y, n0r - (stroke/2 + 0.35), -(Math.PI - Math.abs(Math.abs(angle2 - angle) - Math.PI)), angle);
			}
			pathMain.graphics.endFill();

			
			/* line overlays */
			line[c_i][n_i].graphics.clear();
			line[c_i][n_i].graphics.lineStyle(stroke, 0x000000, 0.2);
			line[c_i][n_i].graphics.moveTo(n0t1.x + this.x, n0t1.y + this.y);
			if (present) {
				line[c_i][n_i].graphics.lineTo(n1t1.x + this.x, n1t1.y + this.y);
			} else {
				line[c_i][n_i].graphics.lineTo(n1t1.x - (n1t1.x - n0t1.x)*(1 - lastBridge) + this.x, n1t1.y - (n1t1.y - n0t1.y)*(1 - lastBridge) + this.y);}
			if ((isNaN(n1t2e.y) || isNaN(n1t2e.x) || isNaN(n0t2e.y) || isNaN(n0t2e.x)) == false) {
				if (present) {
					line[c_i][n_i].graphics.moveTo(n0t2e.x + this.x, n0t2e.y + this.y);
					line[c_i][n_i].graphics.lineTo(n1t2e.x + this.x, n1t2e.y + this.y);
				} else {
					line[c_i][n_i].graphics.lineTo(n1t2.x - (n1t2.x - n0t2.x)*(1 - lastBridge) + this.x, n1t2.y - (n1t2.y - n0t2.y)*(1 - lastBridge) + this.y);
					line[c_i][n_i].graphics.lineTo(n0t2e.x + this.x, n0t2e.y + this.y);}
			}
		}

		public function genPathCaps(breaking:Boolean, n0l:Point, n0r:Number): void {
			if (breaking) {
				var hold_l_x:uint = lastNode.l_x;
				var hold_l_y:uint = lastNode.l_y;
				var hold_s_i:uint = lastNode.s_i;
				var hold_anc:Number = anc_x0;
			} else {
				hold_l_x = l_x;
				hold_l_y = l_y;
				hold_s_i = s_i;
				hold_anc = anc_x1;
			}
			
			var outermost:Boolean = true;
			if (n_i == 0 || n_i == 1 && breaking) {
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
				if (breaking && n_i >= 2) {
					if (outermost) {
						charDir[c_i][n_i].pathUnderArc.visible = true;
						charDir[c_i][n_i].pathOverArc.visible = false;
					} else {
						charDir[c_i][n_i].pathUnderArc.visible = false;
						charDir[c_i][n_i].pathOverArc.visible = true;}
				}
				for (var i:uint = 0; i < hold_l_y; i++) {
					if (anc[hold_l_x][i].x > 0) {
						var oth_c:uint = locDir[hold_l_x][i][0];
						var oth_n:uint = locDir[hold_l_x][i][1] + 1;
						//outbound breaks; outbound paths; inbound paths
						if (oth_n < charDir[oth_c].length) {
							if (breaking && charDir[oth_c][oth_n].s_i < s_i && false == Detect.isWithin(charDir[oth_c][oth_n].s_i, hold_s_i, 0, 2, false)) {
								drawPathCap(n0l, n0r - hold_anc*radius/2, oth_c, oth_n, breaking, true);}
							if (outermost && charDir[oth_c][oth_n].s_i > hold_s_i && (breaking && charDir[oth_c][oth_n].s_i < s_i || breaking == false && Detect.isWithin(charDir[oth_c][oth_n].s_i, hold_s_i, 0, 2, false))) {
								drawPathCap(n0l, n0r, oth_c, oth_n, breaking, true);}
						}
						oth_n = locDir[hold_l_x][i][1];
						if (outermost && oth_n > 0 && charDir[oth_c][oth_n].s_i > hold_s_i) {
							drawPathCap(n0l, n0r, oth_c, oth_n, breaking, false);}
					}
				}
			}
		}
		private function drawPathCap(cen:Point, rad:Number, oth_c:uint, oth_n:uint, breaking:Boolean, outbound:Boolean): void {
			if (outbound) {
				var xPos:Number = cen.x + (charDir[oth_c][oth_n].x - charDir[oth_c][oth_n - 1].x),
					yPos:Number = cen.y + (charDir[oth_c][oth_n].y - charDir[oth_c][oth_n - 1].y),
					xOffset:Number = xPos,
					yOffset:Number = yPos;
			} else {
				xPos = cen.x + (charDir[oth_c][oth_n - 1].x - charDir[oth_c][oth_n].x);
				yPos = cen.y + (charDir[oth_c][oth_n - 1].y - charDir[oth_c][oth_n].y);
				xOffset = cen.x;
				yOffset = cen.y;
			}
			
			var p1:Point = new Point(charDir[oth_c][oth_n].n1t1.x + xOffset, charDir[oth_c][oth_n].n1t1.y + yOffset),
				p2:Point = new Point(charDir[oth_c][oth_n].n0t1.x + xOffset, charDir[oth_c][oth_n].n0t1.y + yOffset);
			var t_int:Point = findIntercepts(p1, p2, cen, rad, new Point(xPos, yPos));
			
			var xTerm:Number = t_int.x - cen.x,
				yTerm:Number = t_int.y - cen.y;
			if (xTerm == 0) { xTerm = 0.1;}
			if (yTerm == 0) { yTerm = 0.1;}
			var angle:Number = Math.atan2(yTerm, xTerm);
			
			p1 = new Point(charDir[oth_c][oth_n].n1t2.x + xOffset, charDir[oth_c][oth_n].n1t2.y + yOffset);
			p2 = new Point(charDir[oth_c][oth_n].n0t2.x + xOffset, charDir[oth_c][oth_n].n0t2.y + yOffset);
			t_int = findIntercepts(p1, p2, cen, rad, new Point(xPos, yPos));
			
			xTerm = t_int.x - cen.x;
			yTerm = t_int.y - cen.y;
			if (xTerm == 0) { xTerm = 0.1;}
			if (yTerm == 0) { yTerm = 0.1;}
			var angle2:Number = Math.atan2(yTerm, xTerm);
			
			if (breaking) {
				if (outbound) { Arc.draw(pathBreak, cen.x, cen.y, rad, Math.PI - Math.abs(Math.abs(angle - angle2) - Math.PI), angle);}
						 else { Arc.draw(pathBreak, cen.x, cen.y, rad, Math.PI - Math.abs(Math.abs(angle - angle2) - Math.PI), angle2);}
			} else {
				if (outbound) { Arc.draw(main, cen.x, cen.y, rad, Math.PI - Math.abs(Math.abs(angle - angle2) - Math.PI), angle);}
						 else { Arc.draw(main, cen.x, cen.y, rad, Math.PI - Math.abs(Math.abs(angle - angle2) - Math.PI), angle2);}
			}
		}

		private function isPresent(hold_c:uint, hold_n:uint, held:Boolean = false, path:uint = 2):Boolean {
			if (held) {
				var now:uint = lastNow;
				if (hold_c == c_i) { var bridge:Number = lastBridge;}
							  else { bridge = bridge[hold_c].x;}
			} else {
				now = now;
				bridge = bridge[hold_c].x;
			}
			if (hold_n < charDir[hold_c].length && now >= charDir[hold_c][hold_n].s_i && (1 <= bridge || 2 > path && (0 < bridge || 1 > path && 0 >= bridge)) || hold_n + 1 < charDir[hold_c].length && now >= charDir[hold_c][hold_n + 1].s_i) {
				return true;}
			return false;
		}
		public function genNode(): void {
			test.graphics.clear();
			lastBridge = bridge[c_i].x;
			lastNow = now;
			//getting oth data
			var i:uint;
			oth = 0;
			arc_ce = 1;
			for (i = 0; i < l_y; i++) {
				if (isPresent(locDir[l_x][i][0], locDir[l_x][i][1], true)) {
					oth += anc[l_x][i].x;
					arc_ce -= arc_ce*0.35*anc[l_x][i].x;
				}
			}
			arc_ce += (1 - arc_ce)*0.75;
			anc_x1 = anc[l_x][l_y].x;
			oth += anc_x1;
			if (n_i > 0) {
				anc_x0 = anc[lastNode.l_x][lastNode.l_y].x;//charDir[c_i][n_i - 1].anc_x1;
			}
			
			if (anc_x1 > 0 && isPresent(c_i, n_i, true, 1)) {
				if (isPresent(c_i, n_i, true)) { present = true;}
										  else { present = false;}
				//generating path
				if (n_i > 0) {
					genPath();
					path.visible = true;
				}
				line[c_i][n_i].visible = true;
				
				//generating node
				if (present) {
					main.graphics.clear();
					main.graphics.beginFill(col.hex);
					main.graphics.drawCircle(0,0,(oth + 1)*radius);
					main.graphics.lineStyle(stroke, 0x000000);
					main.graphics.drawCircle(0,0,(oth + 1 - anc_x1)*radius);
					main.graphics.endFill();
					
					//drawing arc
					main.graphics.lineStyle(stroke, 0x000000);
					if (n_i > 0) {
						if (false == isPresent(c_i, n_i + 1, true, 1)) {
							var angle:Number = Math.atan2(n1t1.y, n1t1.x);
							var angle2:Number = Math.atan2(n1t2e.y, n1t2e.x);
							Arc.draw(main, 0, 0, (oth + 1)*radius, Math.PI + Math.abs(Math.abs(angle - angle2) - Math.PI), angle);
							
							var offset:Point = Point.polar(this.getRadius()/4*arc_ce, angle - Math.PI/2);
							main.graphics.moveTo(n1t1.x, n1t1.y);
							main.graphics.lineTo(n1t1.x + offset.x, n1t1.y + offset.y);
							//generating outer path caps (those coincidental with outer arc) here while no pathBreak of next exists to do so
							genPathCaps(false, new Point(0,0), this.getRadius());
						}
					} else {
						main.graphics.lineStyle(stroke, 0x000000);
						main.graphics.drawCircle(0, 0, (oth + 1)*radius);
					}
					main.visible = true;
				} else {
					main.visible  = false;
				}
			} else {
				main.visible  = false;
				if (n_i > 0) { path.visible = false;}
				line[c_i][n_i].visible = false;
			}
		}
		public function update(evt:Event): void {
			genNode();
			if (false == moving && (anc[l_x][l_y].x <= 0 || anc[l_x][l_y].x >= 1)) {
				removeEventListener(Event.ENTER_FRAME, moveNext);
				animating = 0;
				for (var i:int = 0; i <= l_y; i++) {
					if (anc[l_x][i].x < 1 && anc[l_x][i].x > 0) {
						animating = 3;
						break;
					}
				}
				if (animating == 0 && n_i > 0) {
					for (i = 0; i <= lastNode.l_y; i++) {
						if (anc[lastNode.l_x][i].x < 1 && anc[lastNode.l_x][i].x > 0) {
							animating = 2;
							break;
						}
					}
				}
				/*if (animating == 0) {
				var j:uint;
				for (i = 0; i <= lastNode.l_y; i++) {
				if (isPresent(false, locDir[lastNode.l_x][i][0], locDir[lastNode.l_x][i][1] + 1)) {
				for (j = 0; j <= charDir[locDir[lastNode.l_x][i][0]][locDir[lastNode.l_x][i][1] + 1].l_y; j++) {
				if (anc[charDir[locDir[lastNode.l_x][i][0]][locDir[lastNode.l_x][i][1] + 1].l_x][i].x < 1 && anc[charDir[locDir[lastNode.l_x][i][0]][locDir[lastNode.l_x][i][1] + 1].l_x][i].x > 0) {
				animating = 1;
				break;
				}
				}
				}
				}
				}*/
				/*switch (animating) {
				case 3:
				genNode();
				break;
				case 2:
				genPath();
				break;
				case 1:
				//if (n_i + 1 >= charDir[c_i].length || now < charDir[c_i][n_i + 1].s_i || bridge[c_i].x <= 0 && (n_i + 2 >= charDir[c_i].length || now < charDir[c_i][n_i + 2].s_i)) {
				if (false == isPresent(false, c_i, n_i + 1)) {
				genPathCaps(false, new Point(0,0), this.getRadius());
				} else {
				charDir[c_i][n_i + 1].genPathCaps(true, new Point(this.x - charDir[c_i][n_i + 1].x, this.y - charDir[c_i][n_i + 1].y), this.getRadius());
				}
				break;
				case 0:*/
				if (animating <= 1) {
					removeEventListener(Event.ENTER_FRAME, update);
					endUpdate();
				}
			}
		}
		private function endUpdate(): void {
			if (anc[l_x][l_y].x <= 0) {
				main.visible = false;
				if (n_i > 0) {
					path.visible = false;}
				line[c_i][n_i].visible = false;
				for (var i:int = l_y + 1; i < locDir[l_x].length; i++) {
					if (anc[l_x][i].x > 0) { break;}}
				if (i >= locDir[l_x].length) {
					for (i = l_y - 1; i >= 0; i--) {
						if (anc[l_x][i].x > 0) {
							var oth_c:uint = locDir[l_x][i][0];
							var oth_n:uint = locDir[l_x][i][1] + 1;
							if (isPresent(oth_c, oth_n, false, 1)) {
								charDir[oth_c][oth_n].pathUnderArc.visible = true;
								charDir[oth_c][oth_n].pathOverArc.visible = false;}
							break;}
					}
				}
			} else if (anc[l_x][l_y].x >= 1) {
				timeCon[c_i].evalState();}
			/* insurance (initially only per l_x, now also for l_x of next nodes in char sequences, due to abnormalities in path caps */ // what 'abnormalities'?
			//this is desperate need of refinement, if only for sake of clarity
			for (i = l_y; i < locDir[l_x].length; i++) {
				if (anc[l_x][i].x > 0) {
					oth_c = locDir[l_x][i][0];
					oth_n = locDir[l_x][i][1];
					charDir[oth_c][oth_n].genNode();
					if (oth_n + 1 < charDir[oth_c].length) {
						charDir[oth_c][oth_n + 1].genNode();}
				}
			}
			//break;
		}

		public function movementNext(begin:Boolean, target:uint = 0, end:Boolean = true, caller:uint = 0, rift:Boolean = false, inactive:Boolean = true): void {
			removeEventListener(Event.ENTER_FRAME, waitNextFunction);
			removeEventListener(Event.ENTER_FRAME, moveNextFunction);
			moving = false;
			if (begin) {
				waiting = true;
				if (inactive) {
					waitNextFunction = waitNext(target, end, caller, rift, inactive);
					addEventListener(Event.ENTER_FRAME, waitNextFunction);
				} else {
					initNext(target, end, caller, rift, inactive);}
			} else {
				waiting = false;}
		}
		private function waitNext(target:uint, end:Boolean, caller:uint, rift:Boolean = false, inactive:Boolean = true): Function {
			return function (evt:Event): void {
				if (false == rift && Detect.isWithin(s_i, caller, 0, 1, true) || rift && riftBridge.x >= 1 || now > target && (false == end || isPresent(time[target][0][0], time[target][0][1]))) {
					removeEventListener(Event.ENTER_FRAME, waitNextFunction);
					now++;
					bridge[c_i].x = 0;
					initNext(target, end, caller, rift, inactive);
				}
			}
		}
		private function initNext(target:uint, end:Boolean, caller:uint, rift:Boolean, inactive:Boolean): void {
			if (time[s_i][1][1] > 0) {
				//determining animation interval
				var marker:uint;
				if (end) {
					if (target == s_i) {
						marker = 0;
						var extent:uint = time[target][1][1];
					} else if (Detect.isWithin(s_i, target, 2)) {
						marker = 1;
						extent = time[s_i][1][1];
					} else {
						if (target < s_i) { marker = 2; extent = time[target][1][1] - Detect.findInterval(s_i, false, target);}
									 else { marker = 3; extent = time[target][1][1] + Detect.findInterval(target, false, s_i);}
					}
				} else {
					if (target == s_i) {
						marker = 4;
						extent = 0;
					} else if (Detect.isWithin(s_i, target, 2, 0, true)) {
						marker = 5;
						extent = time[s_i][1][1];
					} else {
						if (target < s_i) { marker = 6; extent = 0;}
									 else { marker = 7; extent = Detect.findInterval(target, false, s_i);}
					}
				}
				//assigning to bridge
				if (extent == 0) {
					waiting = false;
				} else {
					var compExtent:Number = extent/time[s_i][1][1];
					if (rift) {
						if (false == inactive && bridge[c_i].x > compExtent) {
							bridge[c_i].x = compExtent;}
					} else {
						//not insured; added this conditional to allow for more natural transitions into movement (i.e. those from point of initialization, 'unnaturally' halted)
						if (inactive && c_i != time[caller][0][0]) {
							bridge[c_i].x = (time[caller][1][1]*bridge[time[caller][0][0]].x - Detect.findInterval(s_i, false, caller))/time[s_i][1][1];}
						if (bridge[c_i].x > compExtent) {
							bridge[c_i].x = compExtent;}
					}
					var duration:Number = extent - bridge[c_i].x*time[s_i][1][1];
					if (0 > duration) {
						duration = 0;}
					TweenLite.to(bridge[c_i], movSpeed*duration, {x:compExtent, ease:Linear.easeNone});
					//adding events to begin 'actual' animation
					removeEventListener(Event.ENTER_FRAME, moveNextFunction);
					moveNextFunction = moveNext(target, end);
					moving = true;
					waiting = false;
					addEventListener(Event.ENTER_FRAME, moveNextFunction);
					removeEventListener(Event.ENTER_FRAME, update);
					addEventListener(Event.ENTER_FRAME, update);
				
					//rift and end == false?

					//creating listeners for any node whose movement begins within this duration, regardless whether it is further nested; removes any previously assigned
					var beforeRift:Boolean = true;
					for (var i:uint = s_i + 1; i < time.length; i++) {
						var oth_c:uint = time[i][0][0];
						var oth_n:uint = time[i][0][1];
						if (Detect.isWithin(i, s_i, 0) && (i <= target || false == end && Detect.findInterval(i, false, target) <= 0 || end && Detect.isWithin(i, target, 0))) {
							if (time[i][1][1] > 0) {
								beforeRift = false;}
							if (false == (charDir[oth_c][oth_n].waiting || isPresent(oth_c, oth_n, false, 0)) && Detect.findInterval(i, false, s_i) > 0) {
								charDir[oth_c][oth_n].movementNext(true, target, end, s_i);}
						} else {
							var riftIndex:uint = i;
							break;}
					}
	
					if (beforeRift && riftIndex <= target) {
						//determining if rift exists
						for (i = 0; beforeRift && i < charDir.length; i++) {
							for (var j:int = charDir[i].length - 1; j >= 0; j--) {
								if (charDir[i][j].s_i < s_i) {
									if (Detect.isWithin(riftIndex, charDir[i][j].s_i, 0)) {
										beforeRift = false;}
									break;}
							}
						}
						if (beforeRift) {
							//animating riftBridge
							var interval:uint = Detect.findInterval(riftIndex, false, s_i);
							if (0 >= riftBridge.x || 1 <= riftBridge.x) {
								riftBridge.x = time[s_i][1][1]*bridge[c_i].x/interval;}
							TweenLite.to(riftBridge, movSpeed*interval*(1 - riftBridge.x), {x:1, ease:Linear.easeNone});
							//adding listeners to riftIndex
							for (i = riftIndex; i < time.length; i++) {
								if (0 >= Detect.findInterval(i, false, riftIndex)) {
									charDir[time[i][0][0]][time[i][0][1]].movementNext(true, target, end, s_i, true);
								} else {
									break;}
							}
						}
					}
				}
			} else {
				bridge[c_i].x = 1;}
		}
		private function moveNext(target:uint, end:Boolean): Function {
			return function (evt:Event): void {
				if (isPresent(c_i, n_i) || now >= target && (false == end || bridge[time[target][0][0]].x >= 1)) {
					movementNext(false);
					timeCon[c_i].evalState();}
			}
		}

		public function Node(charIndex:uint, nodeIndex:uint, colour:Object, location: Point, seqIndex:uint): void {
			c_i = charIndex;
			n_i = nodeIndex;
			s_i = seqIndex;
			
			col = colour;
			loc = location;
			this.x = loc.x;
			this.y = loc.y;
						

			main = new Sprite();
			main.x = this.x;
			main.y = this.y;
			
			if (n_i > 0) {
				path = new Sprite();
				charDirCont.addChild(path);
				path.x = this.x;
				path.y = this.y;
				
				n0t1 = new Point(0,0);
				n0t2 = new Point(0,0);
				n0t2e = new Point(0,0);
				n1t1 = new Point(0,0);
				n1t2 = new Point(0,0);
				n1t2e = new Point(0,0);
				
				pathMain = new Sprite();
				pathUnderArc = new Sprite();
				pathOverArc = new Sprite();
				pathBreak = new Sprite();
				
				path.addChild(pathBreak);
				path.addChild(pathOverArc);
				path.addChild(pathUnderArc);
				path.addChild(pathMain);
				
				lastNode = charDir[c_i][n_i - 1];
				var i:uint;
				for (i = lastNode.l_y + 1; i < locDir[lastNode.l_x].length; i++) {
					if (anc[lastNode.l_x][i].x > 0) { break;}
				}
				if (i == locDir[lastNode.l_x].length) {
					pathOverArc.visible = false;
					pathUnderArc.visible = true;
				} else {
					pathOverArc.visible = true;
					pathUnderArc.visible = false;
				}
			}
			
			waitNextFunction = waitNext(0, true, 0);
			moveNextFunction = moveNext(0, true);
			
			test = new Sprite();
			test.addChild(test);
		}