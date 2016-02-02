package sil_cas
{
	public class Detect
	{
		public static function isWithin(index:uint, lastIndex:uint, indexEnd:uint = 1, lastEnd:uint = 2, incl:Boolean = true): Boolean {
			var span:Number,
			bound:Number;
			switch (indexEnd) {
				case 0: span = 0; break;
				case 1: span = Main.instance.time[index][1][1]*Main.instance.bridge[Main.instance.time[index][0][0]].x; break;
				case 2: span = Main.instance.time[index][1][1]; break;
			}
			switch (lastEnd) {
				case 0: bound = 0; break;
				case 1: bound = Main.instance.time[lastIndex][1][1]*Main.instance.bridge[Main.instance.time[lastIndex][0][0]].x; break;
				case 2: bound = Main.instance.time[lastIndex][1][1]; break;
			}
			if (index > lastIndex) {
				span += findInterval(index, false, lastIndex);
			} else {
				bound += findInterval(lastIndex, false, index);
			}
			if (incl && span > bound || false == incl && span >= bound) {
				return false;}
			return true;
		}
		
		public static function findInterval(index:uint, last:Boolean = true, lastIndex:uint = 0): uint {
			if (last && index <= 0 || false == last && index <= lastIndex) {
				return 0;
			} else if (last) {
				lastIndex = index - 1;
			}
			if (Main.instance.time[index][1].length < 3) {
				logFromBase(index);}/*
			if (Main.instance.time[lastIndex][1].length < 3) {
				logFromBase(lastIndex);
			}*/
			return Main.instance.time[index][1][2] - Main.instance.time[lastIndex][1][2];
		}
		private static function logFromBase(index:uint): void {
			if (index > 0) {
				if (Main.instance.time[index - 1][1].length < 3) {
					logFromBase(index - 1);
				}
				Main.instance.time[index][1].push(genFromLast(index) + Main.instance.time[index - 1][1][2]);
			} else {
				Main.instance.time[index][1].push(Main.instance.time[0][1][0]);
			}
		}
		private static function genFromLast(index:uint): uint {
			if (Main.instance.time[index][0][1] > 0) {
				var fromNow:uint = Main.instance.time[index][1][0];
				var i:int;
				var lastIndex:uint = Main.instance.char[Main.instance.time[index][0][0]][Main.instance.time[index][0][1] - 1].s_i;
				for (i = index - 1; i >= lastIndex; i--) {
					if (fromNow >= Main.instance.time[lastIndex][1][1]) {
						return Main.instance.time[index][1][0];
					} else if (i == lastIndex) {
						return Main.instance.time[lastIndex][1][1] - (fromNow - Main.instance.time[index][1][0]);
					}
					if (Main.instance.time[i][1].length < 3 || Main.instance.time[lastIndex][1].length < 3) {
						fromNow += genFromLast(i);
					} else  {
						fromNow += Main.instance.time[i][1][2] - Main.instance.time[lastIndex][1][2];
						i = lastIndex + 1;
					}
				}
			}
			return Main.instance.time[index][1][0];
		}
	}
}