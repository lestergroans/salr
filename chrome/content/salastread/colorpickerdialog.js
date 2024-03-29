
var SELWIDTH = 13;
var SELHEIGHT = 13;

var internalHue = 145;
var internalSat = 50;
var internalBri = 50;

function grabArguments() {
   if (window.arguments && window.arguments[0]) {
      var inhex = window.arguments[0].value;
      if (inhex.substring(0,1)=="#") {
         inhex = inhex.substring(1);
      }

      if ( ! window.arguments[0].isGradient ) {
         if ( window.arguments[0].otherColor ) {
            document.getElementById("sampleNail").style.backgroundImage = GradientURLFromColor( window.arguments[0].otherColor, 50 );
            document.getElementById("sampleNail").style.backgroundRepeat = "repeat-x";
         } else {
            document.getElementById("sampleNail").style.backgroundImage = "";
         }
      } else {
         document.getElementById("sampleNail").style.backgroundImage = "";
         if ( window.arguments[0].otherColor ) {
            document.getElementById("sampleNail").style.backgroundColor = window.arguments[0].otherColor;
         }
      }

      hexChanged(inhex);
   }
}

function imageClick(evt) {
   var cliY = evt.clientY;
   var cliX = evt.clientX;
   var hsboxY = document.getElementById("selbox").boxObject.y;
   var hsboxX = document.getElementById("selbox").boxObject.x;
   var selY = (cliY - hsboxY);
   var selX = (cliX - hsboxX);
   saturationChanged( (selX / 255)*100, false );
   brightnessChanged( 100-((selY / 255)*100), false );
   updateSatBri(false);
   //document.getElementById("colorselection").style.top = (selY - Math.floor(SELHEIGHT/2))+"px";
   //document.getElementById("colorselection").style.left = (selX - Math.floor(SELWIDTH/2))+"px";
   //alert("x="+selX+", y="+selY);
}

function hueClick(evt) {
   var cliY = evt.clientY;
   var hsboxY = document.getElementById("hsbox").boxObject.y;
   //alert("hereh\ncliy="+cliY+"\nhsboxy="+hsboxY);
   //document.getElementById("huesel").style.marginTop =
   //   (cliY - hsboxY) + "px";
   var newhue = Math.round(360-(((cliY - hsboxY) / 256)*360));
   if (newhue==360)
      newhue = 0;
   hueChanged(newhue,false);
}

function hueChanged(hue,skipupdate) {
   internalHue = hue;
   document.getElementById("hue").value = Math.round(hue);
   var mtop = (360 - Math.round(hue))/360 * 256;
   document.getElementById("huesel").style.marginTop = mtop+"px";

   var rgb = getBaseRGBForHue(hue);

   document.getElementById("selbox").style.backgroundColor =
       "rgb("+rgb[0]+","+rgb[1]+","+rgb[2]+")";
   if (!skipupdate) {
      updateFromHSB();
   }
}

function getBaseRGBForHue(hue) {
   // Set the big picker's background
   var red = 0;
   var green = 0;
   var blue = 0;
   // Red value...
   if ( hue < 120 && hue > 60 ) {
      red = (120-hue)/60;
   }
   else if ( hue > 240 && hue < 300 ) {
      red = (hue-240)/60;
   }
   else if ( hue <= 60 || hue >= 300 ) {
      red = 1;
   }
   // Green value... 
   if ( hue > 0 && hue < 240 ) {
      if ( hue < 60 ) {
         green = (hue)/60;
      }
      else if ( hue > 180 ) {
         green = (240-hue)/60;
      } 
      else {
         green = 1;
      }
   }
   // Blue value...
   if ( hue > 120 && hue < 360 ) {
      if ( hue < 180 ) {
         blue = (hue-120)/60;
      }
      else if ( hue > 300 ) {
         blue = (360-hue)/60;
      }
      else {
         blue = 1;
      }
   }
   if ( red < 0 ) red = 0;
   if ( green < 0 ) green = 0;
   if ( blue < 0 ) blue = 0;
   if ( red > 1 ) red = 1;
   if ( green > 1 ) green = 1;
   if ( blue > 1 ) blue = 1;
   red = Math.round(red * 255);
   green = Math.round(green * 255);
   blue = Math.round(blue * 255);
   return new Array(red, green, blue);
}

function adjustForSaturation(sat,rgb) {
   var redDiff = 255-rgb[0];
   var greenDiff = 255-rgb[1];
   var blueDiff = 255-rgb[2];
   var sadj = ((100-sat)/100);
   var redAdj = redDiff * sadj;
   var greenAdj = greenDiff * sadj;
   var blueAdj = blueDiff * sadj;
   return new Array(rgb[0]+redAdj, rgb[1]+greenAdj, rgb[2]+blueAdj);
}

function adjustForBrightness(bri,rgb) {
   return new Array(rgb[0]*(bri/100),
                    rgb[1]*(bri/100),
                    rgb[2]*(bri/100));
}

function saturationChanged(sat,update) {
   internalSat = sat;
   document.getElementById("saturation").value = Math.round(sat);
   if (update) {
      updateSatBri(false);
   }
}

function brightnessChanged(bri,update) {
   internalBri = bri;
   document.getElementById("brightness").value = Math.round(bri);
   if (update) {
      updateSatBri(false);
   }
}

function updateSatBri(skipupdate) {
   document.getElementById("colorselection").style.left =
      (Math.round( (internalSat/100)*255 ) - Math.floor(SELWIDTH/2))+ "px";
   document.getElementById("colorselection").style.top =
      (Math.round( 255 - ((internalBri/100)*255) ) - Math.floor(SELHEIGHT/2))+ "px";
   if (!skipupdate) {
      updateFromHSB();
   }
}

function updateFromHSB() {
   var rgb = getBaseRGBForHue(internalHue);
   rgb = adjustForSaturation(internalSat,rgb);
   rgb = adjustForBrightness(internalBri,rgb);
   rgb[0] = Math.round(rgb[0]);
   rgb[1] = Math.round(rgb[1]);
   rgb[2] = Math.round(rgb[2]);
   document.getElementById("red").value = rgb[0];
   document.getElementById("green").value = rgb[1];
   document.getElementById("blue").value = rgb[2];
   document.getElementById("hexrgb").value = rgbToHex(rgb);
   if (window.arguments && window.arguments[0]) {
      window.arguments[0].value = rgbToHex(rgb);
      updateThumbnail( rgbToHex(rgb) );
   }
}

function updateThumbnail(hex) {
   if ( window.arguments[0].isGradient ) {
      document.getElementById("sampleNail").style.backgroundImage = GradientURLFromColor( "#" + hex, 50 );
      document.getElementById("sampleNail").style.backgroundRepeat = "repeat-x";
   } else {
      document.getElementById("sampleNail").style.backgroundColor = "#" + hex;
   }
}

function GradientURLFromColor(hlcolor, height) {
   return "url(x-salr-gradientpng:"+
                     HexToNumber(hlcolor.substring(1,3))+","+
                     HexToNumber(hlcolor.substring(3,5))+","+
                     HexToNumber(hlcolor.substring(5,7))+","+
                     height+")";
}

function HexToNumber(hex) {
   var res = 0;
   for (var i=0; i<hex.length; i++) {
      res = res * 16;
      switch (hex[i]) {
         case "0": res += 0; break;
         case "1": res += 1; break;
         case "2": res += 2; break;
         case "3": res += 3; break;
         case "4": res += 4; break;
         case "5": res += 5; break;
         case "6": res += 6; break;
         case "7": res += 7; break;
         case "8": res += 8; break;
         case "9": res += 9; break;
         case "a": case "A": res += 10; break;
         case "b": case "B": res += 11; break;
         case "c": case "C": res += 12; break;
         case "d": case "D": res += 13; break;
         case "e": case "E": res += 14; break;
         case "f": case "F": res += 15; break;
      }
   }
   return res;
}

function rgbToHex(rgb) {
   var result = "";
   result += getHex(rgb[0]);
   result += getHex(rgb[1]);
   result += getHex(rgb[2]);
   return result;
}

function getHex(val) {
   var hi = Math.floor((val & 240)/16);
   var lo = val & 15;
   return hexNibble(hi)+hexNibble(lo);
}

function hexNibble(val) {
   if (val>=0 && val<=9) {
      return ""+val;
   }
   else if (val==10) { return "A"; }
   else if (val==11) { return "B"; }
   else if (val==12) { return "C"; }
   else if (val==13) { return "D"; }
   else if (val==14) { return "E"; }
   else if (val==15) { return "F"; }
}

function parseNibble(nib) {
        if (nib=="0") { return 0; }
   else if (nib=="1") { return 1; }
   else if (nib=="2") { return 2; }
   else if (nib=="3") { return 3; }
   else if (nib=="4") { return 4; }
   else if (nib=="5") { return 5; }
   else if (nib=="6") { return 6; }
   else if (nib=="7") { return 7; }
   else if (nib=="8") { return 8; }
   else if (nib=="9") { return 9; }
   else if (nib=="a" || nib=="A") { return 10; }
   else if (nib=="b" || nib=="B") { return 11; }
   else if (nib=="c" || nib=="C") { return 12; }
   else if (nib=="d" || nib=="D") { return 13; }
   else if (nib=="e" || nib=="E") { return 14; }
   else if (nib=="f" || nib=="F") { return 15; }
}

function parseHex(hb) {
   //alert("parsing ="+hb);
   return (parseNibble(hb.substring(0,1))*16) +
          parseNibble(hb.substring(1,2));
}

function hexChanged(hex) {
   document.getElementById("hexrgb").value = hex;
   if (window.arguments && window.arguments[0]) {
      window.arguments[0].value = hex;
      updateThumbnail(hex);
   }
   try {
      var hexred = parseHex(hex.substring(0,2));
      var hexgreen = parseHex(hex.substring(2,4));
      var hexblue = parseHex(hex.substring(4,6));
      redChanged(hexred,false);
      greenChanged(hexgreen,false);
      blueChanged(hexblue,false);
      updateRGB();
   }
   catch (er) {
   }
}

function redChanged(val, update) {
   document.getElementById("red").value = Math.round(val);
   if (update) {
      updateRGB();
   }
}

function greenChanged(val, update) {
   document.getElementById("green").value = Math.round(val);
   if (update) {
      updateRGB();
   }
}

function blueChanged(val, update) {
   document.getElementById("blue").value = Math.round(val);
   if (update) {
      updateRGB();
   }
}

function updateRGB() {
   var hsb = RGBtoHSB(
      Number(document.getElementById("red").value),
      Number(document.getElementById("green").value),
      Number(document.getElementById("blue").value)
   );
   hsb[1] = Math.round(hsb[1]*100);
   hsb[2] = Math.round(hsb[2]*100);
   hueChanged(hsb[0], true);
   saturationChanged(hsb[1], false);
   brightnessChanged(hsb[2], false);
   updateSatBri(true);
}

function MIN() {
  var min = 255;
  for(var i = 0; i < arguments.length; i++)
    if(arguments[i] < min)
      min = arguments[i];
  return min;
}

function MAX() {
  var max = 0;
  for(var i = 0; i < arguments.length; i++)
    if(arguments[i] > max)
      max = arguments[i];
  return max;
}

function MIN() {
  var min = 255;
  for(var i = 0; i < arguments.length; i++)
    if(arguments[i] < min)
      min = arguments[i];
  return min;
}
function MAX() {
  var max = 0;
  for(var i = 0; i < arguments.length; i++)
    if(arguments[i] > max)
      max = arguments[i];
  return max;
}
function RGBtoHSB(r,g,b) {
  r /= 255;
  g /= 255;
  b /= 255;
  var min, max, delta;
  var hsv = new Array(3);
  min = MIN(r,g,b);
  max = MAX(r,g,b);
  //hsv.v = max;
  hsv[2] = max;
  delta = max - min;
  //if (max != 0) hsv.s = delta/max;
  if (max != 0) hsv[1] = delta/max;
  else {
    //hsv.s = .005;
    hsv[1] = .005;
    //hsv.h = 0;
    hsv[0] = 0;
    return hsv;
  }
  if(delta == 0) {
    //hsv.s = .005;
    hsv[1] = .005;
    //hsv.h = 0;
    hsv[0] = 0;
    return hsv;
  }
  //if (r == max) hsv.h = (g-b)/delta;
  if (r == max) hsv[0] = (g-b)/delta;
  //else if(g == max) hsv.h = 2+(b-r)/delta;
  else if(g == max) hsv[0] = 2+(b-r)/delta;
  //else hsv.h = 4+(r-g)/delta;
  else hsv[0] = 4+(r-g)/delta;
  //hsv.h *= 60;
  hsv[0] *= 60;
  //if(hsv.h<0) hsv.h += 360;
  if(hsv[0]<0) hsv[0] += 360;
  //if(hsv.h>=360) hsv.h -= 360;
  if(hsv[0]>=360) hsv[0] -= 360;
  return hsv;
}

/*
function RGBtoHSB(r,g,b){
    // see http://babu.jp/~useyan/m/hsb_rgb.html
	var max,min,dif,h,s,v;

	// max
	if(r>=g && r>=b){
		max=r;
	}else if(g>=b){
		max=g;
	}else{
		max=b;
	}

	// min
	if(r<=g && r<=b){
		min=r;
	}else if(g<=b){
		min=g;
	}else{
		min=b;
	}

	// 0,0,0
	if(max<=0){ return(new Array(0,0,0)); }

	// difference
	dif=max-min;

	//Hue:
	if(max>min){
		if(g==max){
			h=(b-r)/dif*60+120;
		}else if(b==max){
			h=(r-g)/dif*60+240;
		}else if(b>g){
			h=(g-b)/dif*60+360;
		}else{
			h=(g-b)/dif*60;
		}
		if(h<0){
			h=h+360;
		}
	}else{ h=0; }
	//h*=255/360;

	//Saturation:
	//s=(dif/max)*255;
	s=(dif/max)*100;

	//Value:
	//v=max;
	v=(max/255)*100;

	return(new Array(h,s,v));
}
*/

function acceptIt() {
   //alert("hereA");
   if (window.arguments && window.arguments[0]) {
      window.arguments[0].accepted = true;
   }
   return true;
}
