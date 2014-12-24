// DEFS
var sin60 = 0.866025403784439;
var twoPi = 6.28318530717959;
function Point(){
	var x;
	var y;
}

var baseCanvas = document.getElementById("simpleBases");
var baseContext = baseCanvas.getContext("2d");
var canvas = document.getElementById("simpleDraw");
var context = canvas.getContext("2d");
var hexCanvas = document.getElementById("hexagonResult");
var hexContext = hexCanvas.getContext("2d");

var mouse = new Point();  // in the computational space.  origin is the origin of the triangle

// triangle points:
// p1 origin
// p2 arm edge
// p3 top (hexagon side mid-point)
var p1 = new Point();
var p2 = new Point();
var p3 = new Point();
var radius = 300;

var o = new Point();
o.x = 100;
o.y = 250;

p1.x = 0;
p1.y = 0;
p2.x = p1.x+radius
p2.y = p1.y;
p3.x = p1.x+radius*.75;
p3.y = p1.y-radius*.5*sin60;

// triangle sides:
// b bottom (large radius)
// s outside side
// t top, (small radius)
var dB = new Point();  // begin from origin
var dS = new Point();  // from small radius to large
var dT = new Point();  // begin from origin

var bLength = Math.sqrt( (p2.x-p1.x)*(p2.x-p1.x) + (p2.y-p1.y)*(p2.y-p1.y) );
var sLength = Math.sqrt( (p2.x-p3.x)*(p2.x-p3.x) + (p2.y-p3.y)*(p2.y-p3.y) );
var tLength = Math.sqrt( (p3.x-p1.x)*(p3.x-p1.x) + (p3.y-p1.y)*(p3.y-p1.y) );
dB.x = (p2.x - p1.x) / bLength;
dB.y = (p2.y - p1.y) / bLength;
dS.x = (p3.x - p2.x) / sLength;
dS.y = (p3.y - p2.y) / sLength;
dT.x = (p3.x - p1.x) / tLength;
dT.y = (p3.y - p1.y) / tLength;

// RAYS from the mouse
var d1 = new Point();
var d2 = new Point();
d1.x = 1;
d1.y = 0;
d2.x = -.5;
d2.y = -sin60;

// 1/12 TRIANGLE SEGMENT
baseContext.lineWidth = 4;
baseContext.lineCap = "round";
baseContext.beginPath();
baseContext.moveTo(o.x + p1.x, o.y + p1.y);
baseContext.lineTo(o.x + p2.x, o.y + p2.y);
baseContext.lineTo(o.x + p3.x, o.y + p3.y);
baseContext.lineTo(o.x + p1.x, o.y + p1.y);
baseContext.stroke();

$("#simpleBases").mousemove(function(event){
// $(document).mousemove(function(event){
	// mouse.x = event.clientX - o.x;
	// mouse.y = event.clientY - o.y;
	// mouse.x = event.layerX;
	// mouse.y = event.layerY;
	// mouse.x = event.pageX - o.x ;
	// mouse.y = event.pageY - o.y ;
   	// if(event.offsetX){//} && $(event.target).attr('id') != "hexagonResult") {

    // get the scale based on actual width;
	var sx = canvas.width / canvas.offsetWidth;
    var sy = canvas.height / canvas.offsetHeight;
	mouse.x = event.offsetX * sx;
	mouse.y = event.offsetY * sy;
	mouse.x -= o.x ;
	mouse.y -= o.y ;


  	canvas.width = canvas.width;
	context.lineWidth = 4;
	context.lineCap = "round";

	// POINT inside TRIANGLE test
	// http://stackoverflow.com/questions/13300904/determine-whether-point-lies-inside-triangle
	// var alpha = ((p2.y - p3.y)*(mouse.x - p3.x) + (p3.x - p2.x)*(mouse.y - p3.y)) / ((p2.y - p3.y)*(p1.x - p3.x) + (p3.x - p2.x)*(p1.y - p3.y));
	// var beta = ((p3.y - p1.y)*(mouse.x - p3.x) + (p1.x - p3.x)*(mouse.y - p3.y)) / ((p2.y - p3.y)*(p1.x - p3.x) + (p3.x - p2.x)*(p1.y - p3.y));
	// var gamma = 1.0 - alpha - beta;
	// var inside = false;
	// if(alpha > 0.0 && beta > 0.0 && gamma > 0.0){
	// 	inside = true;
	// }

	// RAY and LINE intersection test
	// http://rootllama.wordpress.com/2014/06/20/ray-line-segment-intersection-test-in-2d/
	var i1 = RayLineIntersectQuick(mouse, d1, p2, p3, sLength, dS);
	var i2 = RayLineIntersectQuick(mouse, d1, p1, p3, tLength, dT);
	var i3 = RayLineIntersectQuick(mouse, d2, p1, p3, tLength, dT);
	var i4 = RayLineIntersectQuick(mouse, d2, p1, p2, bLength, dB);

	var points = [];
	if(i4.x != undefined){ // cuts through the bottom: small hexagon
		points.push(i3);
		points.push(i4);
	}
	else if(i3.x != undefined){ // 60deg cut into top, there are 2 cuts
		points.push(i3);
		points.push(mouse);
		points.push(i1);
		points.push(p2);
	}
	else if(i2.x != undefined){ // horizontal cut across top
		points.push(i2);
		points.push(i1);
		points.push(p2);
	}
	else{ 						// no cuts
		points.push(p3);
		points.push(p2);
	}

	if(points.length > 0){
		baseCanvas.width = baseCanvas.width;

		baseContext.strokeStyle = "#E0E0E0";
		baseContext.lineWidth = 4;
		baseContext.lineCap = "round";
		baseContext.beginPath();
		baseContext.moveTo(o.x + p1.x, o.y + p1.y);
		baseContext.lineTo(o.x + p2.x, o.y + p2.y);
		baseContext.lineTo(o.x + p3.x, o.y + p3.y);
		baseContext.lineTo(o.x + p1.x, o.y + p1.y);
		baseContext.stroke();
		baseContext.strokeStyle = "#000000";
		baseContext.beginPath();
		baseContext.moveTo(o.x + p1.x, o.y + p1.y);
		for(var i = 0; i < points.length; i++){
			baseContext.lineTo(o.x + points[i].x, o.y + points[i].y);
		}
		baseContext.lineTo(o.x + p1.x, o.y + p1.y);
		baseContext.stroke();
	}


	context.fillStyle = "#E0E0E0";
	context.beginPath();
	context.moveTo(o.x + p1.x, o.y + p1.y);
	for(var i = 0; i < points.length; i++){
		context.lineTo(o.x + points[i].x, o.y + points[i].y);
	}
	context.lineTo(o.x + p1.x, o.y + p1.y);
	context.fill();

	context.strokeStyle = "#E0E0E0";
	context.beginPath();
	context.moveTo(o.x + mouse.x, o.y + mouse.y);
	context.lineTo(o.x + mouse.x+radius*2*d1.x, o.y + mouse.y+radius*2*d1.y);
	context.moveTo(o.x + mouse.x, o.y + mouse.y);
	context.lineTo(o.x + mouse.x+radius*2*d2.x, o.y + mouse.y+radius*2*d2.y);
	context.stroke();


	// HEXAGON SNOWFLAKE RESULT
  	hexCanvas.width = hexCanvas.width;
	hexContext.lineWidth = 4;
	hexContext.lineCap = "round";

	var hexCenter = new Point();
	hexCenter.x = hexCanvas.width * .5;
	hexCenter.y = hexCanvas.width * .5;
	var hexPoints = hexagonFromTwelfthHexagon(points);
	hexContext.moveTo(hexCenter.x + hexPoints[0].x, hexCenter.y + hexPoints[0].y);
	for(var i = 1; i < hexPoints.length; i++){
		hexContext.lineTo(hexCenter.x + hexPoints[i].x, hexCenter.y + hexPoints[i].y);
	}
	hexContext.stroke();
});


// function edgePointsForSimpleSnowflakeSlice(){

// }

function hexagonFromTwelfthHexagon(points){
	var revolutions = 6;
	var hexPoints = [];
	if(points.length <= 0) return hexPoints;

	var scale = .5;
	// build SIXTH segment from TWELFTH segment by reflecting Y values across X axis
	var sixth = [];
	for(var i = 0; i < points.length; i++) sixth.push(points[i]);
	for(var i = points.length-1; i >= 0; i--){
		var point = new Point();
		point.x = points[i].x;
		point.y = -points[i].y; // reflection across y axis is most accessible given current orientation
		sixth.push(point);
	}
	for(var a = 0; a < revolutions; a++){
		var angle = Math.atan2(sixth[0].y, sixth[0].x);
		var distance = Math.sqrt(sixth[0].y*sixth[0].y + sixth[0].x*sixth[0].x);
		var first = new Point();
		first.x = distance*Math.cos(angle+a*twoPi/6) * scale;
		first.y = distance*Math.sin(angle+a*twoPi/6) * scale;
		hexPoints.push(first);
		for(var i = 1; i < sixth.length-1; i++){
			var angle = Math.atan2(sixth[i].y, sixth[i].x);
			var distance = Math.sqrt(sixth[i].y*sixth[i].y + sixth[i].x*sixth[i].x);
			var point = new Point();
			point.x = distance*Math.cos(angle+a*twoPi/6) * scale;
			point.y = distance*Math.sin(angle+a*twoPi/6) * scale;
			hexPoints.push(point);
		}
	}
	var i = sixth.length-1;
	var angle = Math.atan2(sixth[i].y, sixth[i].x);
	var distance = Math.sqrt(sixth[i].y*sixth[i].y + sixth[i].x*sixth[i].x);
	var point = new Point();
	point.x = distance*Math.cos(angle+(revolutions-1)*twoPi/6) * scale;
	point.y = distance*Math.sin(angle+(revolutions-1)*twoPi/6) * scale;
	hexPoints.push(point);

	return hexPoints;
}

// origin and dX,dY of RAY -- pointA pointB of line
// pre-calculated length of AB, and dX dY of A->B
function RayLineIntersectQuick(origin, dV, pA, pB, lengthAB, dAB){
	var v1 = new Point();
	var v2 = new Point();
	var v3 = new Point();
	v1.x = origin.x - pA.x;
	v1.y = origin.y - pA.y;
	v2.x = pB.x - pA.x;
	v2.y = pB.y - pA.y;
	v3.x = -dV.y;
	v3.y = dV.x;
	var t1 = (v2.x*v1.y - v2.y*v1.x) / (v2.x*v3.x + v2.y*v3.y);
	var t2 = (v1.x*v3.x + v1.y*v3.y) / (v2.x*v3.x + v2.y*v3.y);
	var p = new Point();
	if(t2 > 0.0 && t2 < 1.0 && t1 > 0.0){
		p.x = pA.x + lengthAB * t2 * dAB.x;
		p.y = pA.y + lengthAB * t2 * dAB.y;
	}
	return p;
}

// full robust like gma's homemade chicken
// function RayLineIntersect(origin, dV, pA, pB){
// 	var v1 = new Point();
// 	var v2 = new Point();
// 	var v3 = new Point();
// 	v1.x = origin.x - pA.x;
// 	v1.y = origin.y - pA.y;
// 	v2.x = pB.x - pA.x;
// 	v2.y = pB.y - pA.y;
// 	v3.x = -dV.y;
// 	v3.y = dV.x;
// 	var t1 = (v2.x*v1.y - v2.y*v1.x) / (v2.x*v3.x + v2.y*v3.y);
// 	var t2 = (v1.x*v3.x + v1.y*v3.y) / (v2.x*v3.x + v2.y*v3.y);
// 	var p = new Point();
// 	if(t2 > 0.0 && t2 < 1.0 && t1 > 0.0){
// 		var dAB = new Point();
// 		var lengthAB = Math.sqrt( (pB.x-pA.x)*(pB.x-pA.x) + (pB.y-pA.y)*(pB.y-pA.y) );
// 		dAB.x = (pB.x - pA.x) / lengthAB;
// 		dAB.y = (pB.y - pA.y) / lengthAB;
// 		p.x = pA.x + lengthAB * t2 * dAB.x;
// 		p.y = pA.y + lengthAB * t2 * dAB.y;
// 	}
// 	return p;
// }
// canvas.onmousemove = mousePos;

// context.fillRect(10,10,100,100);