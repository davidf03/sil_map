		private var target:uint;

		evalState();
		public function evalState(): void {
			if (Main.instance.char[c_i].length > 1 && (Main.instance.now < Main.instance.char[c_i][Main.instance.char[c_i].length - 1].s_i || Main.instance.bridge[c_i].x < 1) && Main.instance.anc[Main.instance.char[c_i][0].l_x][Main.instance.char[c_i][0].l_y].x >= 1) {
				nextOn.visible = true;
				nextOff.visible = false;
				nextOn.buttonMode = true;
				nextOn.useHandCursor = true;
				nextOn.addEventListener(MouseEvent.CLICK, goNext);
			} else {
				nextOn.visible = false;
				nextOff.visible = true;
				nextOn.buttonMode = false;
				nextOn.useHandCursor = false;
				nextOn.removeEventListener(MouseEvent.CLICK, goNext);
			}
			if (Main.instance.char[c_i].length > 1 && Main.instance.now >= Main.instance.char[c_i][0].s_i && false == Detect.isWithin(Main.instance.now, 0) && Main.instance.anc[Main.instance.char[c_i][0].l_x][Main.instance.char[c_i][0].l_y].x >= 1) {
				prevOn.visible = true;
				prevOff.visible = false;
				prevOn.buttonMode = true;
				prevOn.useHandCursor = true;
				prevOn.addEventListener(MouseEvent.CLICK, goPrev);
			} else {
				prevOn.visible = false;
				prevOff.visible = true;
				prevOn.buttonMode = false;
				prevOn.useHandCursor = false;
				prevOn.removeEventListener(MouseEvent.CLICK, goPrev);
			}
		}

		private function goNext(evt:MouseEvent): void {
			Main.instance.test.graphics.clear();
			Controller.pause();

			//direction = true;
			var end:Boolean;
			var i:int;
			for (i = Main.instance.char[c_i].length - 1; i >= 0; i--) {
				if (Main.instance.char[c_i][i].s_i <= Main.instance.now) {
					target = Main.instance.char[c_i][i].s_i;
					if (Main.instance.bridge[c_i].x < 1) {
						target = Main.instance.char[c_i][i].s_i;
						end = true;
					} else {
						if (i + 1 < Main.instance.char[c_i].length) {
							target = Main.instance.char[c_i][i + 1].s_i;
							end = false;}
					}
					break;
				}
			}

			if (Main.instance.direct) {
				//fix this!
				instant(end);
				Main.instance.now = target;

				for (i = 0; i < Main.instance.time.length; i++) {
					Main.instance.char[Main.instance.time[i][0][0]][Main.instance.time[i][0][1]].genNode();}
				for (i = 0; i < Main.instance.char.length; i++) {
					Main.instance.timeCon[i].evalState();}
			} else {
				if (0 >= Main.instance.time[Main.instance.now][1][2] && 0 >= Main.instance.time[Main.instance.now][1][1]) {
					/*if (1 <= Main.instance.riftBridge.x) {
						Main.instance.riftBridge.x = 0;}*/
					TweenLite.to(Main.instance.riftBridge, Detect.findInterval(Main.instance.now + 1, false)*(1 - Main.instance.riftBridge.x), {x:1, ease:Linear.easeNone});
					Main.instance.char[Main.instance.time[Main.instance.now + 1][0][0]][Main.instance.time[Main.instance.now + 1][0][1]].movementNext(true, target, end, 0, true);
				} else {
					continuous(end);}
			}
		}
		private function goPrev(evt:MouseEvent): void {
			Controller.pause();
			//direction = false;
			var i:int;
			var found:Boolean = false;
			for (i = Main.instance.char[c_i].length - 1; i >= 0; i--) {
				if (Main.instance.char[c_i][i].s_i <= Main.instance.now) {
					if (Main.instance.bridge[c_i].x > 0 && Main.instance.bridge[c_i].x < 1 || Main.instance.bridge[c_i].x >= 1 && Detect.isWithin(Main.instance.now, Main.instance.char[c_i][i].s_i, 0)) {
						target = Main.instance.char[c_i][i].s_i;
						//(extra) logic below provides for last index ending movement before others, going to end rather than beginning
						if (target == Main.instance.char[Main.instance.time[target][0][0]][Main.instance.char[Main.instance.time[target][0][0]].length - 1].s_i) {
							var last:Boolean = true;
							for (var j:uint = 0; j < Main.instance.char.length; j++) {
								if (j != c_i && Main.instance.now >= Main.instance.char[j][Main.instance.char[j].length - 1].s_i && Detect.isWithin(target, Main.instance.char[j][Main.instance.char[j].length - 1].s_i, 2, 1, false)) {
									last = false;
									break;}
							}
							if (last) { instant(false);}
							     else { instant(true);}
						} else {
							instant(false);}
						found = true;
					} else if (Main.instance.bridge[c_i].x >= 1) {
						target = Main.instance.char[c_i][i].s_i;
						instant(true);
						found = true;
					} else if (i > 0) {
						target = Main.instance.char[c_i][i - 1].s_i;
						if (Detect.isWithin(Main.instance.now, target)) {
							instant(false);
						} else {
							instant(true);}
						found = true;}
					break;
				}
			}
			if (found) {
				Main.instance.now = target;
				//severe lack of precision; should regen only those necessary (requires consideration of those nodes responsible only for path caps)
				for (i = 0; i < Main.instance.time.length; i++) {
					Main.instance.char[Main.instance.time[i][0][0]][Main.instance.time[i][0][1]].genNode();
				}
				for (i = 0; i < Main.instance.char.length; i++) {
					Main.instance.timeCon[i].evalState();
				}
			}
		}
		private function continuous(end:Boolean): void {
			//discontinuing any current animation processes
			//Controller.pause();
			//check bridges for ones active
			//could retrieve actives within the section above; see first: next/prev

			var active:Array = new Array();
			var callers:Array = new Array();
			var focused:Boolean = true;
			for (var i:int = 0; i <= Main.instance.char.length; i++) {
				//looking for any animations to be resumed (defaulting current index)
				//if (i < Main.instance.char.length || false == unfocused) {
					//relevant indeces
					if (i < Main.instance.char.length) {
						if (i == Main.instance.time[Main.instance.now][0][0]) {
							if (Main.instance.bridge[i].x < 1) {
								active.push(Main.instance.now);
								focused = false;}
						} else {
							//if (Main.instance.bridge[i].x < 1) {
							for (var j:int = Main.instance.char[i].length - 1; j >= 0; j--) {
								if (Main.instance.char[i][j].s_i <= Main.instance.now) {
									if (Detect.isWithin(Main.instance.now, Main.instance.char[i][j].s_i, 1, 2, false)) {
										active.push(Main.instance.char[i][j].s_i);
										focused = false;}
									break;}
							}
							//}
						}
					} else if (focused) {
						active.push(Main.instance.now);}
					/*//callers, needed to initialise movement
					var noCaller:Boolean = true;
					for (j = 0; noCaller && j < Main.instance.char.length; j++) {
						for (var k:int = Main.instance.char[j].length - 1; k >= 0; k--) {
							if (Main.instance.char[j][k].s_i < active[active.length - 1] && (0 < Detect.findInterval(active[active.length - 1], false, Main.instance.char[j][k].s_i))) {// || 0 == Detect.findInterval(Main.instance.char[j][k].s_i, false, 0))) {
								if (Detect.isWithin(active[active.length - 1], Main.instance.char[j][k].s_i, 0)) {
									callers.push(Main.instance.char[j][k].s_i);
									noCaller = false;}
								break;}
						}
					}
					//to accomodate rift
					if (noCaller) {
						callers.push(-1);}
					if (i >= Main.instance.char.length) {
						break;}*/
				//}
			}

			//sort arrays chronologically
			//not needed

			//assign remaining animations in appropriate direction
			//call wait function on current index (assuming next!)
			//perhaps unnecesary to realign riftBridge:
			if (false == focused) {
				Main.instance.riftBridge.x = 1;}
			for (i = 0; i < active.length; i++) {
				Main.instance.char[Main.instance.time[active[i]][0][0]][Main.instance.time[active[i]][0][1]].waiting = true;}
			for (i = 0; i < active.length; i++) {
				//if (callers[i] < 0) {
				Main.instance.char[Main.instance.time[active[i]][0][0]][Main.instance.time[active[i]][0][1]].movementNext(true, target, end, Main.instance.now, true, false);
				//} else {
				//	Main.instance.char[Main.instance.time[active[i]][0][0]][Main.instance.time[active[i]][0][1]].movementNext(true, target, end, callers[i], false, false);}
			}
		}
		//does not yet set riftBridge
		private function instant(end:Boolean): void {
			var i:int,
				within:uint = 0,
				j:int;
				console.log('hi there');
			if (i < Main.instance.char[c_i].length) {
				var hit:Array = new Array();
				for (i = 0; i < Main.instance.char.length; i++) {
					Main.instance.bridge[i].x = 1;
					hit.push(0);
				}
				hit[c_i] = 1;
				if (end == false) {
					Main.instance.bridge[c_i].x = 0;
				} else {
					Main.instance.bridge[c_i].x = 1;
				}
				var toPresent:uint = 0;
				for (i = target + 1; i < Main.instance.time.length; i++) {
					toPresent += Detect.findInterval(i);
					if (end && toPresent <= Main.instance.time[target][1][1] || end == false && toPresent == 0) {
						within++;
						hit[Main.instance.time[i][0][0]] = 1;
						if (end) {
							if (toPresent + Main.instance.time[i][1][1] > Main.instance.time[target][1][1]) {
								Main.instance.bridge[Main.instance.time[i][0][0]].x = (Main.instance.time[target][1][1] - toPresent) / Main.instance.time[i][1][1];
							}
						} else {
							Main.instance.bridge[Main.instance.time[i][0][0]].x = 0;
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
						toPresent = Main.instance.time[target][1][1];
					} else {
						toPresent = 0;
					}
					for (i = target - 1; i >= 0; i--) {
						toPresent += Detect.findInterval(i + 1);
						if (hit[Main.instance.time[i][0][0]] == 0) {
							hit[Main.instance.time[i][0][0]] = 1;
							if (toPresent < Main.instance.time[i][1][1]) {
								Main.instance.bridge[Main.instance.time[i][0][0]].x = toPresent / Main.instance.time[i][1][1];
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
		}
	}
}
