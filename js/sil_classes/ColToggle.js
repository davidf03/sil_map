package sil_cas
{
	import flash.display.*;
	import flash.events.*;
	import flash.geom.Point;
	
	import gs.com.greensock.TweenLite;
	import gs.com.greensock.plugins.HexColorsPlugin;
	
	import sil_cas.*;
	
	public class ColToggle extends Sprite
	{
		private var main:Sprite;
		private static var wdt:uint = 10;
		private var scheme:uint;
		private var active:Boolean = false;
		private static var opacity:Number = 1;//0.35;
		
		public function ColToggle(index:uint): void {
			scheme = index;
			main = new Sprite();
			addChild(main);
			
			if (scheme == Main.instance.startColour) {
				active = true;
				genToggle(true);
			} else {
				genToggle(false);
			}
			
			buttonMode = true; 
			useHandCursor = true;
			mouseChildren = false;
			//which_mc.addEventListener(MouseEvent.MOUSE_OVER, overFunction);
			//which_mc.addEventListener(MouseEvent.MOUSE_OUT, outFunction);
			addEventListener(MouseEvent.CLICK, toggle);
		}
		private function genToggle(on:Boolean):void {
			main.graphics.clear();
			if (on) { main.graphics.lineStyle(2, 0x000000, opacity);}
			else	{ main.graphics.lineStyle(2, 0xEFEFEF);}
			var i:uint;
			for (i = 0; i < Main.instance.cols[scheme].length; i++) {
				if (on) { main.graphics.beginFill(Main.instance.cols[scheme][i].hex, opacity);}
				else	{ main.graphics.beginFill(Main.instance.cols[scheme][i].hex);}
				main.graphics.drawRect(wdt*i,0,wdt,wdt);
			}
			main.graphics.endFill();
		}
		public function setOff():void {
			active = false;
			genToggle(false);
		}
		private function toggle(evt:MouseEvent): void {
			if (!active) {
				changeCol();
				var i:uint;
				for (i = 0; i < Main.instance.colourCon.length; i++) {
					Main.instance.colourCon[i].setOff();
				}
				active = true;
				genToggle(true);
			}
		}
		private function changeCol(): void {
			var i:uint,
			j:uint;
			for (i = 0; i < Main.instance.char.length; i++) {
				for (j = 0; j < Main.instance.char[i].length; j++) {
					Main.instance.char[i][j].recolour(Main.instance.cols[scheme][i]);
				}
			}
			for (i = 0; i < Main.instance.pathCon.length; i++) {
				Main.instance.pathCon[i].recolour(scheme);
			}
		}
	}
}