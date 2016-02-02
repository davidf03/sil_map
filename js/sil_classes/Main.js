package
{
	import flash.display.*;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.geom.Point;
	
	import gs.com.greensock.plugins.HexColorsPlugin;
	
	import sil_cas.*;
	
	[SWF(width="600", height="700", backgroundColor="#EFEFEF", frameRate="60")]
	
	public final class Main extends MovieClip
	{
		private static var _instance:Main;
		
		private static var numRows:uint = 11;
		private static var numCols:uint = 11;
		
		private var newStage:Sprite;
		public var points:Array;
		private var coordVis:Sprite;
		private static var hex:Boolean = true;
		
		public var time:Array;
		public var locDir:Array;
		public var anc:Array;
		public var bridge:Array;
		public var riftBridge:Point;
		
		public var char:Array;
		public var path:Array;
		public var line:Array;
		public var cols:Array = [[{hex:0x6C6E58},{hex:0x3E423A},{hex:0x417378},{hex:0xA4CFBE},{hex:0xF4F7D9}]
			/*[{hex:0x726F2D},{hex:0xBBBBBB},{hex:0x16bbe6},{hex:0x0B3D4C},{hex:0xd3ffce}],*/
			,[{hex:0x212226},{hex:0x45433F},{hex:0x687067},{hex:0xBDBB99},{hex:0xF0EAC3}]
			/*[{hex:0x49404F},{hex:0x596166},{hex:0xD1FFCD},{hex:0xA9BD8B},{hex:0x948A54}],*/
			/*[{hex:0x302D26},{hex:0x849396},{hex:0xD9D7C2},{hex:0x4E433D},{hex:0x979595}],*/
			,[{hex:0x615E56},{hex:0x5E3341},{hex:0x2F6D7B},{hex:0xAFAAAD},{hex:0xD5CAA2}]
			,[{hex:0x3F4B59},{hex:0x42594C},{hex:0x708C74},{hex:0xF2EAD0},{hex:0xBDBB99/*hex:0xD9C5A0*/}]
			/*[{hex:0x2E242F},{hex:0xDBC49E},{hex:0x75705A},{hex:0x353B37},{hex:0x2A2735}],*/
			/*[{hex:0x00FF7F},{hex:0x007FFF},{hex:0x7F00FF},{hex:0xFF0000},{hex:0xFF7F00},{hex:0xFFFF00}];*/
			,[{hex:0x703030},{hex:0x2F343B},{hex:0x7E827A},{hex:0xE3CDA4},{hex:0xC77966}]
			,[{hex:0xF0C27B},{hex:0xD38157},{hex:0x7F2B51},{hex:0x4B1248},{hex:0x1D0B38}]
			,[{hex:0x17263B},{hex:0xF9D2BD},{hex:0x8D2A14},{hex:0xC45234},{hex:0x35332F}]
		/*,[{hex:0x14DB14},{hex:0xF71B14},{hex:0xB61BE0},{hex:0x1DEEF5},{hex:0xDED014}]*/];
		/*[{hex:0x00FF7F},{hex:0x007FFF},{hex:0x7F00FF},{hex:0xFF0000},{hex:0xFF7F00},{hex:0xFFFF00}];*/
		
		public var charCont:Sprite;
		public var lineCont:Sprite;
		
		public var pathCon:Array;
		public var colourCon:Array;
		public var startColour:uint = 3;//Math.floor(Math.random()*cols.length);
		public var timeCon:Array;
		public var now:uint = 0;
		public var visSpeed:Number = 0.12
		public var movSpeed:Number = 0.1;
		
		public var direct:Boolean = true;
		public var dirButton:Sprite;
		
		public var test:Sprite;
		
		
		public function Main(): void {
			if(_instance){
				throw new Error("Singleton... use getInstance()");
			}
			_instance = this;
			
			if (hex) {
				genHex();
			} else {
				genGrid();
			}
			
			charCont = new Sprite();
			lineCont = new Sprite();
			addChild(charCont);
			addChild(lineCont);
			
			test = new Sprite();
			addChild(test);
			
			genLocDir();
			genPathCon();
			genColourCon();
			genTimeCon();
			
			dirButton = new Sprite();
			addChild(dirButton);
			dirButton.x = 550;
			dirButton.y = 50;
			dirButton.buttonMode = true; 
			dirButton.useHandCursor = true;
			dirButton.addEventListener(MouseEvent.CLICK, toggleAnim);
			toggleAnim(null);
		}
		public function toggleAnim(evt:MouseEvent): void {
			Controller.pause();
			if (direct) {
				direct = false;
				dirButton.graphics.clear();
				dirButton.graphics.beginFill(0x00FF00);
				dirButton.graphics.drawCircle(0, 0, 8);
				dirButton.graphics.endFill();
			} else {
				direct = true;
				dirButton.graphics.clear();
				dirButton.graphics.beginFill(0x454545);
				dirButton.graphics.drawCircle(0, 0, 8);
				dirButton.graphics.endFill();
			}
		}
		public static function get instance():Main{
			if(!_instance){
				new Main();
			} 
			return _instance;
		}
		private function genPathCon(): void {
			pathCon = new Array();
			var i:uint;
			for (i = 0; i < char.length; i++) {
				pathCon.push(new PathToggle(i));
				pathCon[i].x = stage.stageWidth/(char.length + 1) * (i + 1);
				pathCon[i].y = 600;
				addChild(pathCon[i]);
			}
		}
		private function genColourCon(): void {
			colourCon = new Array();
			var i:uint;
			for (i = 0; i < cols.length; i++) {
				colourCon.push(new ColToggle(i));
				colourCon[i].x = 12;
				colourCon[i].y = 12*(i*1.5 + 1);
				addChild(colourCon[i]);
			}
		}
		private function genTimeCon(): void {
			timeCon = new Array();
			var i:uint;
			for (i = 0; i < char.length; i++) {
				timeCon.push(new SeqToggle(i));
				timeCon[i].x = pathCon[i].x;
				timeCon[i].y = pathCon[i].y;
				addChild(timeCon[i]);
			}
		}
		
		private function genLocDir(): void {
			var paths:uint = 5,
				moves:uint = Math.floor(Math.random()*5) + 16;
			genSequence(paths, moves);
			
			locDir = new Array();
			anc = new Array();
			var locDirKey:Array = new Array();
			
			var i:int,
			j:int,
			k:uint,
			keyed:Boolean,
			key:uint;
			
			var loc:Point;
			var c_i:uint,
			n_i:uint;
			
			var toPresent:uint;
			var hit:Array = new Array();
			for (i = 0; i < Main.instance.char.length; i++) {
				hit.push(0);
			}
			var term:Array,
			store:Array,
			hold:uint;
			
			for (i = 0; i < time.length; i++) {
				c_i = time[i][0][0];
				n_i = char[c_i].length;
				time[i][0].push(n_i);
				
				toPresent = 0;
				for (j = 0; j < hit.length; j++) {
					hit[j] = 0;
				}
				//finding paths since terminated
				term = new Array();
				for (j = i - 1; j >= 0; j--) {
					toPresent += Detect.findInterval(j + 1);
					if (hit[time[j][0][0]] == 0 && toPresent >= time[j][1][1] && toPresent - Detect.findInterval(i) < time[j][1][1]) {
						hit[time[j][0][0]] = 1;
						term.push([ j, toPresent - time[j][1][1] ]);
					}
				}
				//ordering array chronologically
				for (j = 0; j < term.length; j++) {
					hold = j;
					for (k = j + 1; k < term.length; k++) {
						if (term[hold][1] < term[k][1] || term[hold][1] == term[k][1] && term[hold][0] > term[k][0]) {
							hold = k;
						}
					}
					store = term[j];
					term[j] = term[hold];
					term[hold] = store;
				}
				//registering
				for (j = 0; j < term.length; j++) {
					charCont.addChild(char[time[term[j][0]][0][0]][time[term[j][0]][0][1]].main);
					if (hex) {
						loc = points[time[term[j][0]][2][0]];
					} else {
						loc = points[time[term[j][0]][2][0]][time[term[j][0]][2][1]];
					}
					keyed = false;
					for (k = 0; k < locDirKey.length; k++) {
						if (locDirKey[k].equals(loc)) {
							key = k;
							keyed = true;
							break;
						}
					}
					if (!keyed) {
						key = locDirKey.length;
						locDirKey.push(loc);
						locDir.push(new Array());
						anc.push(new Array());
					}
					
					anc[key].push(new Point(1,0));
					locDir[key].push(new Array());
					locDir[key][locDir[key].length - 1].push(time[term[j][0]][0][0]);
					locDir[key][locDir[key].length - 1].push(time[term[j][0]][0][1]);
					locDir[key][locDir[key].length - 1].push(term[j][0]);
					
					char[time[term[j][0]][0][0]][time[term[j][0]][0][1]].l_x = key;
					char[time[term[j][0]][0][0]][time[term[j][0]][0][1]].l_y = locDir[key].length - 1;
				}
				
				//adding path of current index, registering if movement is instantaneous (consolidate with above?)
				line[c_i].push(new Sprite());
				lineCont.addChild(line[c_i][n_i]);
				if (hex) {
					loc = points[time[i][2][0]];
				} else {
					loc = points[time[i][2][0]][time[i][2][1]];
				}
				char[c_i].push(new Node(c_i, n_i, cols[startColour][c_i], loc, i));
				if (time[i][1][1] == 0) {
					charCont.addChild(char[c_i][n_i].main);
					keyed = false;
					for (k = 0; k < locDirKey.length; k++) {
						if (locDirKey[k].equals(loc)) {
							key = k;
							keyed = true;
							break;
						}
					}
					if (!keyed) {
						key = locDirKey.length;
						locDirKey.push(loc);
						locDir.push(new Array());
						anc.push(new Array());
					}
					
					anc[key].push(new Point(1,0));
					locDir[key].push(new Array());
					locDir[key][locDir[key].length - 1].push(c_i);
					locDir[key][locDir[key].length - 1].push(n_i);
					locDir[key][locDir[key].length - 1].push(i);
					
					char[c_i][n_i].l_x = key;
					char[c_i][n_i].l_y = locDir[key].length - 1;
				}
			}
			for (i = 0; i < hit.length; i++) {
				hit[i] = 0;
			}
			//registering hanging paths
			toPresent = 0;
			term = new Array();
			for (i = time.length - 1; i >= 0; i--) {
				if (hit[time[i][0][0]] == 0 && toPresent < time[i][1][1]) {
					hit[time[i][0][0]] = 1;
					term.push([ i, time[i][1][1] - toPresent ])
					for (j = 0; j < hit.length; j++) {
						if (hit[j] == 0) { break;}
					}
					if (j >= hit.length) { break;}
				}
				toPresent += Detect.findInterval(i);
			}
			for (i = 0; i < term.length; i++) {
				hold = i;
				for (j = i + 1; j < term.length; j++) {
					if (term[hold][1] > term[j][1] || term[hold][1] == term[j][1] && term[hold][0] < term[j][0]) {
						hold = j;
					}
				}
				store = term[i];
				term[i] = term[hold];
				term[hold] = store;
			}
			for (i = 0; i < term.length; i++) {
				charCont.addChild(char[time[term[i][0]][0][0]][time[term[i][0]][0][1]].main);
				if (hex) {
					loc = points[time[term[i][0]][2][0]];
				} else {
					loc = points[time[term[i][0]][2][0]][time[term[i][0]][2][1]];
				}
				keyed = false;
				for (j = 0; j < locDirKey.length; j++) {
					if (locDirKey[j].equals(loc)) {
						key = j;
						keyed = true;
						break;
					}
				}
				if (!keyed) {
					key = locDirKey.length;
					locDirKey.push(loc);
					locDir.push(new Array());
					anc.push(new Array());
				}
				
				anc[key].push(new Point(1,0));
				locDir[key].push(new Array());
				locDir[key][locDir[key].length - 1].push(time[term[i][0]][0][0]);
				locDir[key][locDir[key].length - 1].push(time[term[i][0]][0][1]);
				locDir[key][locDir[key].length - 1].push(term[i][0]);
				
				char[time[term[i][0]][0][0]][time[term[i][0]][0][1]].l_x = key;
				char[time[term[i][0]][0][0]][time[term[i][0]][0][1]].l_y = locDir[key].length - 1;
			}
			for (i = 0; i + 1 < time.length; i++) {
				if (time[i][1][1] > 0) {
					bridge[time[i][0][0]].x = 0;}
				if (Detect.findInterval(i + 1, false, i) > 0) {
					now = i; break;}
			}
			for (i = 0; i < time.length; i++) {
				char[time[i][0][0]][time[i][0][1]].genNode();}
		}
		private function genSequence(paths:uint, moves:uint): void {
			time = new Array();
			char = new Array();
			path = new Array();
			line = new Array();
			bridge = new Array();
			
			var i:uint;
			for (i = 0; i < paths; i++) {
				char.push(new Array());
				path.push(new Array());
				path[path.length - 1].push(new Sprite());
				line.push(new Array());
				bridge.push(new Point(1,0));
			}
			riftBridge = new Point(1,0);
			
			//randomized
			for (i = 0; i < paths; i++) {
				time.push(new Array());
				time[time.length - 1].push(new Array());
				time[time.length - 1].push(new Array());
				time[time.length - 1].push(new Array());
				time[time.length - 1][0].push(i);
				time[time.length - 1][1].push(0, 0);
				time[time.length - 1][2].push(Math.floor(Math.random()*points.length));
			}
			
				var c_i:uint,
				loc:Point;
				for (i = 0; i < moves; i++) {
					c_i = Math.floor(Math.random()*paths);
					time.push(new Array());
					time[time.length - 1].push(new Array());
					time[time.length - 1].push(new Array());
					time[time.length - 1].push(new Array());
					time[time.length - 1][0].push(c_i);
					time[time.length - 1][1].push(Math.floor(Math.random()*11), Math.floor(Math.random()*11) + Math.floor(Math.random()*6) + 5);
				if (hex) {
					time[time.length - 1][2].push(randHex(c_i));
				} else {
					loc = randGrid(c_i);
					time[time.length - 1][2].push(loc.x, loc.y);
				}
			}
			
			/*time.push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1][0].push(0);
			time[time.length - 1][1].push(0, 0);
			time[time.length - 1][2].push(1);
			time.push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1][0].push(1);
			time[time.length - 1][1].push(0, 0);
			time[time.length - 1][2].push(2);
			time.push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1][0].push(2);
			time[time.length - 1][1].push(0, 0);
			time[time.length - 1][2].push(3);
			
			time.push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1][0].push(0);
			time[time.length - 1][1].push(0, 1);
			time[time.length - 1][2].push(0);
			time.push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1][0].push(1);
			time[time.length - 1][1].push(0, 2);
			time[time.length - 1][2].push(0);
			time.push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1][0].push(2);
			time[time.length - 1][1].push(0, 3);
			time[time.length - 1][2].push(0);
			
			time.push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1][0].push(0);
			time[time.length - 1][1].push(0, 3);
			time[time.length - 1][2].push(5);
			time.push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1][0].push(2);
			time[time.length - 1][1].push(0, 2);
			time[time.length - 1][2].push(3);
			time.push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1][0].push(1);
			time[time.length - 1][1].push(1, 1);
			time[time.length - 1][2].push(4);

			time.push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1][0].push(1);
			time[time.length - 1][1].push(3, 3);
			time[time.length - 1][2].push(3);
			time.push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1][0].push(2);
			time[time.length - 1][1].push(2, 2);
			time[time.length - 1][2].push(2);
			time.push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1].push(new Array());
			time[time.length - 1][0].push(0);
			time[time.length - 1][1].push(1, 1);
			time[time.length - 1][2].push(3);*/
		}
		private function randGrid(charIndex:uint): Point {
			var viable:Boolean,
			ni1:uint,
			ni2:uint,
			i:uint;
			for (i = time.length - 2; i >= 0; i--) {
				if (charIndex == time[i][0][0])
				{ break;}
			}
			do {
				viable = true;
				ni1 = Math.floor(Math.log(Math.floor(Math.random()*10) + 1));
				ni2 = Math.floor(Math.log(Math.floor(Math.random()*10) + 1));
				if (ni1 == 0 && ni2 == 0) {
					viable = false;
				} else {
					if (Math.random() < 0.5) { ni1 = -ni1; }
					ni1 += time[i][2][0];
					if (Math.random() < 0.5) { ni2 = -ni2; }
					ni2 += time[i][2][1];
					
					if (ni1 < 0 || ni2 < 0 || ni1 >= numCols || ni2 >= numRows)
					{ viable = false; }
				}
			} while (!viable);
			return new Point(ni1,ni2);
		}
		private function genGrid(): void {
			//genBase();
			
			var coordVis:Sprite = new Sprite();
			addChild(coordVis);
			coordVis.graphics.beginFill(0xDFDFDF);
			
			var i:uint,
			j:uint;
			points = new Array();
			for (i = 0; i < numRows; i++) {
				points.push(new Array());
				for (j = 0; j < numCols; j++) {
					var p:Point = new Point((stage.stageWidth/(numCols + 1)*(i + 1)), (stage.stageHeight/(numRows + 1)*(j + 1)));
					points[i].push(p);
					coordVis.graphics.drawCircle(p.x, p.y, 2);
				}
			}
			coordVis.graphics.endFill();
		}
		private function randHex(charIndex:uint): uint {
			var viable:Boolean,
			ni:uint,
			i:uint;
			for (i = time.length - 2; i >= 0; i--) {
				if (charIndex == time[i][0][0])
				{ break;}
			}
			do {
				viable = true;
				ni = Math.floor(Math.random()*points.length);
				if (ni == time[i][2][0]) {
					viable = false;
				}
			} while (!viable);
			return ni;
		}
		private function genHex(): void {
			//genBase();
			
			points = new Array();
			points.push(new Point(100, 300));
			points.push(new Point(200, 114));
			points.push(new Point(400, 114));
			points.push(new Point(500, 300));
			points.push(new Point(400, 486));
			points.push(new Point(200, 486));
			
			var coordVis:Sprite = new Sprite();
			addChild(coordVis);
			coordVis.graphics.beginFill(0xDFDFDF);
			var i:uint;
			for (i = 0; i < points.length; i++) {
				coordVis.graphics.drawCircle(points[i].x, points[i].y, 3);
			}
			coordVis.graphics.endFill();
		}
		private function genBase(): void {
			var newStage:Sprite = new Sprite;
			newStage.graphics.beginFill(0xFFFFFF);
			newStage.graphics.drawRect(0, 0, stage.stageWidth, stage.stageHeight);
			newStage.graphics.endFill();
			addChild(newStage);
		}
	}
}