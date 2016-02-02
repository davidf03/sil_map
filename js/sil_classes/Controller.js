package sil_cas
{
	public class Controller
	{
		import flash.geom.Point;

		public static function pause(): void {
			for each (var b:Point in Main.instance.bridge) {
				b.x = b.x;}
			Main.instance.riftBridge.x = Main.instance.riftBridge.x;
			for each (b in Main.instance.bridge) {
				b.x = b.x;}
			Main.instance.riftBridge.x = Main.instance.riftBridge.x;
			
			if (Main.instance.now + 1 < Main.instance.time.length) {
				Main.instance.char[Main.instance.time[Main.instance.now + 1][0][0]][Main.instance.time[Main.instance.now + 1][0][1]].movementNext(false);}
			var held:uint = 2;
			for (var i:int = 0; i < Main.instance.char.length; i++) {
				for (var j:int = Main.instance.char[i].length - 1; j >= 0; j--) {
					if (Main.instance.char[i][j].s_i <= Main.instance.now) {
						Main.instance.char[i][j].movementNext(false);
						
						for (var k:uint = Main.instance.now + held; k < Main.instance.time.length; k++, held++) {
							if (Detect.isWithin(k, Main.instance.char[i][j].s_i, 0)) {
								Main.instance.char[Main.instance.time[k][0][0]][Main.instance.time[k][0][1]].movementNext(false);
							} else {
								break;}
						}
						break;
					}
				}
			}
		}
	}
}