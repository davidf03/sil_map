package sil_cas
{
	import flash.display.*;
	import flash.events.*;
	import flash.geom.Point;
	
	import gs.com.greensock.TweenLite;
	import gs.com.greensock.easing.Linear;
	import gs.com.greensock.plugins.HexColorsPlugin;
	
	import sil_cas.*;
	
	public class PathToggle extends Sprite
	{
		private var onState:Sprite;
		private var offState:Sprite;
		private static var radius:uint = 10;
		private var c_i:uint;
		private var col:Object;
		private var vis:Boolean = true;
		private var animated:Boolean = true;
		
		public function PathToggle(i:uint): void {
			c_i = i;
			col = Main.instance.cols[Main.instance.startColour][c_i];
			
			onState = new Sprite();
			addChild(onState);
			offState = new Sprite();
			addChild(offState);
			offState.visible = false;
			genToggle();
			
			buttonMode = true; 
			useHandCursor = true;
			mouseChildren = false;
			//which_mc.addEventListener(MouseEvent.MOUSE_OVER, overFunction);
			//which_mc.addEventListener(MouseEvent.MOUSE_OUT, outFunction);
			addEventListener(MouseEvent.CLICK, toggleVis);
		}
		private function genToggle():void {
			onState.graphics.lineStyle(2, 0x000000);
			onState.graphics.beginFill(col.hex);
			onState.graphics.drawCircle(0,0,radius);
			onState.graphics.endFill();
			
			offState.graphics.lineStyle(2, 0x000000);
			offState.graphics.beginFill(col.hex);
			offState.graphics.drawCircle(0,0,radius);
			offState.graphics.drawCircle(0,0,radius/1.6);
			offState.graphics.endFill();
			offState.graphics.beginFill(0x000000, 0);
			offState.graphics.drawCircle(0,0,radius);
			offState.graphics.endFill();
		}
		public function recolour(scheme:uint):void {
			col = Main.instance.cols[scheme][c_i];
			genToggle();
		}
		
		private function toggleVis(evt:MouseEvent): void {
			if (vis) {
				hideChar();
				Main.instance.timeCon[c_i].evalState(); //doesn't work?
				vis = false;
				onState.visible = false;
				offState.visible = true;
			} else {
				showChar();
				vis = true;
				onState.visible = true;
				offState.visible = false;
			}
		}
		private function showChar(): void {
			var l_x:uint;
			var l_y:uint;
			
			var updates:Array = new Array();
			var i:uint,
			j:int;
			for (i = 0; i < Main.instance.char[c_i].length; i++) {
				l_x = Main.instance.char[c_i][i].l_x;
				l_y = Main.instance.char[c_i][i].l_y;
				var dup:Boolean = false;
				for (j = 0; j < updates.length; j++) {
					if (updates[j][0] == l_x) {
						dup = true;
						break;
					}
				}
				if (dup) {
					updates[j].push(l_y);
				} else {
					updates.push([ l_x, l_y ]);
				}
			}
			
			for (i = 0; i < updates.length; i++) {
				l_x = updates[i][0];
				l_y = updates[i][1];
				if (animated) {
					for (j = 1; j < updates[i].length; j++) {
						TweenLite.to(Main.instance.anc[l_x][updates[i][j]], Main.instance.visSpeed*(1 - Main.instance.anc[l_x][updates[i][j]].x), {x:1/*, ease:Linear.easeNone*/});
					}
				} else {
					for (j = 1; j < updates[i].length; j++) {
						Main.instance.anc[l_x][updates[i][j]].x = 1;
					}
				}
				/* arc-'s visibility */
				var oth_c_i:uint;
				var oth_n_i:uint;
				/* below */
				for (j = updates[i][updates[i].length - 1] - 1; j >= 0; j--) {
					if (Main.instance.anc[l_x][j].x > 0 && Main.instance.locDir[l_x][j][0] != c_i) { break;}
				}
				if (j >= 0) {
					oth_c_i = Main.instance.locDir[l_x][j][0];
					oth_n_i = Main.instance.locDir[l_x][j][1] + 1;
					if (oth_n_i < Main.instance.char[oth_c_i].length && (Main.instance.now >= Main.instance.locDir[updates[i][0]][updates[i][1]][2] && Main.instance.bridge[Main.instance.locDir[updates[i][0]][updates[i][1]][0]].x >= 1 || Main.instance.locDir[updates[i][0]][updates[i][1]][1] + 1 < Main.instance.char[Main.instance.locDir[updates[i][0]][updates[i][1]][0]].length && Main.instance.now >= Main.instance.locDir[updates[i][0]][updates[i][1]][2])) {
						Main.instance.char[oth_c_i][oth_n_i].pathUnderArc.visible = false;
						Main.instance.char[oth_c_i][oth_n_i].pathOverArc.visible = true;
					}
				}
				/* below, self (not really necessary, that is, until some hypothetical option to hide partial paths) */
				/*for (j = 1; j < updates[i].length; j++) {
					oth_n_i = Main.instance.locDir[l_x][updates[i][j]][1] + 1;
					if (oth_n_i < Main.instance.char[c_i].length) {
						Main.instance.char[c_i][oth_n_i].pathUnderArc.visible = false;
						Main.instance.char[c_i][oth_n_i].pathOverArc.visible = true;
					}
				}*/
				/* above */
				var outermost:Boolean = true;
				for (j = updates[i][updates[i].length - 1] + 1; j < Main.instance.locDir[l_x].length; j++) {
					if (Main.instance.now >= Main.instance.locDir[l_x][j][2] && Main.instance.bridge[Main.instance.locDir[l_x][j][0]].x >= 1 || Main.instance.locDir[l_x][j][1] + 1 < Main.instance.char[Main.instance.locDir[l_x][j][0]].length && Main.instance.now >= Main.instance.char[Main.instance.locDir[l_x][j][0]][Main.instance.locDir[l_x][j][1] + 1].s_i){
						if (Main.instance.anc[l_x][j].x > 0) {
							outermost = false;
							break;
						}
					} else {
						break;
					}
				}
				
				oth_n_i = Main.instance.locDir[l_x][updates[i][updates[i].length - 1]][1] + 1;
				if (oth_n_i < Main.instance.char[c_i].length) {
					if (outermost) {
						Main.instance.char[c_i][oth_n_i].pathUnderArc.visible = true;
						Main.instance.char[c_i][oth_n_i].pathOverArc.visible = false;
					} else {
						Main.instance.char[c_i][oth_n_i].pathUnderArc.visible = false;
						Main.instance.char[c_i][oth_n_i].pathOverArc.visible = true;
					}
				}
				recLoc(l_x, l_y);
			}
		}
		private function hideChar(): void {
			var l_x:uint;
			var l_y:uint;
			
			var updates:Array = new Array();
			var i:uint,
			j:uint;
			for (i = 0; i < Main.instance.char[c_i].length; i++) {
				l_x = Main.instance.char[c_i][i].l_x;
				l_y = Main.instance.char[c_i][i].l_y;
				var dup:Boolean = false;
				for (j = 0; j < updates.length; j++) {
					if (updates[j][0] == Main.instance.char[c_i][i].l_x) {
						dup = true;
						break;
					}
				}
				if (dup) {
					updates[j].push(l_y);
				} else {
					updates.push([ l_x, l_y ]);
				}
			}
			
			for (i = 0; i < updates.length; i++) {
				l_x = updates[i][0];
				l_y = updates[i][1];
				
				if (animated) {
					for (j = 1; j < updates[i].length; j++) {
						TweenLite.to(Main.instance.anc[l_x][updates[i][j]], Main.instance.visSpeed*Main.instance.anc[l_x][updates[i][j]].x, {x:0/*, ease:Linear.easeNone*/});
					}
				} else {
					for (j = 1; j < updates[i].length; j++) {
						Main.instance.anc[l_x][updates[i][j]].x = 0;
					}
				}
				recLoc(l_x, l_y);
			}
		}
		private function recLoc(key:uint, seq:uint):void {
			var i:uint,
			c_i:uint,
			n_i:uint;
			for (i = seq; i < Main.instance.locDir[key].length; i++) {
				c_i = Main.instance.locDir[key][i][0];
				n_i = Main.instance.locDir[key][i][1];
				
				if (animated) {
					Main.instance.char[c_i][n_i].removeEventListener(Event.ENTER_FRAME, Main.instance.char[c_i][n_i].update);
					Main.instance.char[c_i][n_i].addEventListener(Event.ENTER_FRAME, Main.instance.char[c_i][n_i].update);
				} else {
					Main.instance.char[c_i][n_i].genNode();
				}
				if (n_i + 1 < Main.instance.char[c_i].length) {
					if (animated) {
						Main.instance.char[c_i][n_i + 1].removeEventListener(Event.ENTER_FRAME, Main.instance.char[c_i][n_i + 1].update);
						Main.instance.char[c_i][n_i + 1].addEventListener(Event.ENTER_FRAME, Main.instance.char[c_i][n_i + 1].update);
					} else {
						Main.instance.char[c_i][n_i + 1].genNode();
					}
				}
			}
		}
	}
}