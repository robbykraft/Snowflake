var RIGHT = 1;
var LEFT = 0;
//sine and cosine 60deg increments, clockwise starting from 3:00
var DIRECTION = [
	{x:1, y:0},
	{x:.5,y:-0.86602540378444},
	{x:-.5,y:-0.86602540378444},
	{x:-1, y:0},
	{x:-.5,y:0.86602540378444},
	{x:.5,y:0.86602540378444}
];
// snowflake growth animations
var ANIMATIONS = 1;  // 0 or 1
var ANIMATION_STEP = 1;

// drawing locations, based on screen resolution
var originSnowflake;
var originTree;

var canvas;  // HTML canvas, for saving image

var tree;  // the snowflake


function setup() {
	canvas = createCanvas(windowWidth, windowHeight);
	// noLoop();
	resizeOrigins();
	tree = new btree(undefined, 20);
}

function mousePressed() {
	makeSnowflake();
	draw();
}
var DEPTH = 7;
function draw() {
	background(255);
	stroke(0);
	var animationsDidHappen = animateGrowth(tree);
	drawTree(tree, originTree, 0);
	drawSnowflake(tree, originSnowflake);
	// save(canvas, 'output.png');
	if(DEPTH > 0 && !animationsDidHappen){
		makeSnowflake();
		DEPTH--;
	}
}

function makeSnowflake(){
	growTree(tree);
	// logTree(tree);
}

function animateGrowth(tree){
	var animationsDidHappen = false;

	findLeaves(tree);

	function findLeaves(tree){
		if(tree.left){
			findLeaves(tree.left);
		}
		if(tree.right){
			findLeaves(tree.right);
		}
		if(tree.valueToBeGrown != undefined){
			animationsDidHappen = true;
			tree.value += ANIMATION_STEP;
			tree.valueToBeGrown -= ANIMATION_STEP;
			if(tree.valueToBeGrown <= 0){
				tree.value += tree.valueToBeGrown;
				tree.valueToBeGrown = undefined;
			}
		}
	}
	return animationsDidHappen;
}

function growTree(tree, params){
	// var density = params["density"];
	// var pressure = params["pressure"];
	// var time = params["time"];
	// var time = 5;
	findLeaves(tree);
	setGlobalTreeVariables(tree);

	function findLeaves(tree){
		var hasChild = false;
		if(tree.left){
			hasChild = true;
			findLeaves(tree.left);
		}
		if(tree.right){
			hasChild = true;
			findLeaves(tree.right);
		}
		if(!hasChild){
			// do the thing
			if(tree.value - 5 > 0){
				// check if new value crosses the line
				// var pointEnd = {
				// 	x:(tree.location.x + value * DIRECTION[start.direction].x), 
				// 	y:(tree.location.y + value * DIRECTION[start.direction].y)
				// };
				// var result = RayLineIntersect(
				// 	{x:0,y:0}, 
				// 	{x:(cos(30/180*Math.PI)), y:(sin(30/180*Math.PI))}, 
				// 	{x:start.location.x, y:abs(start.location.y)}, 
				// 	{x:pEnd.x,y:abs(pEnd.y)}
				// 	);

				// var leftLocation = 
				tree.addChildren(tree.value, tree.value - 5);
			}
		}
	}
}

function makeValue2(start){
	var value = makeValue();

	var pEnd = {x:(start.location.x + value * DIRECTION[start.direction].x), y:(start.location.y + value * DIRECTION[start.direction].y)};
	var result;
	result = RayLineIntersect({x:0,y:0}, {x:(cos(30/180*Math.PI)), y:(sin(30/180*Math.PI))}, {x:start.location.x, y:abs(start.location.y)}, {x:pEnd.x,y:abs(pEnd.y)});
	// console.log("RAY LINE INTERSECT: " + result.x + ", " + result.y  + "       " + pEnd.x + ", " + pEnd.y);

	if(result != undefined){
		// console.log("RESET: " + start.location.y + " " + start.location.x + "  (" (start.location.y/start.location.x) + ")");
		var distance = Math.sqrt( (result.x-start.location.x)*(result.x-start.location.x) + (result.y-abs(start.location.y))*(result.y-abs(start.location.y)) );
		start.dead = true;
		return distance;
	}
	return value;
}

function setGlobalTreeVariables(tree){
	// it's unclear how useful the second step is
	// there may not be any reason to store the same variable
	//   inside every node
	var searchedMaxGeneration = 0;
	findGlobals(tree);
	setGlobals(tree);

	function findGlobals(node){
		if(node.generation > searchedMaxGeneration)
			searchedMaxGeneration = node.generation;
		if(node.left)
			findGlobals(node.left);
		if(node.right)
			findGlobals(node.right);
	}
	function setGlobals(node){
		node.maxGeneration = searchedMaxGeneration;
		if(node.left)
			setGlobals(node.left);
		if(node.right)
			setGlobals(node.right);
	}
}


// function makeValue(){
// 	if( int( random(8)) )
// 		return int( (random(32)) )+3;
// 	return int( (random(32)) )+60;
// }

function mod6(input){
	// throw in any value, negatives included, returns 0-5
	var i = input;
	while (i < 0) i += 6;
	return i % 6;
}

function btree(parent, value){
// nodes contain:  value (magnitude)
				// childType (LEFT or RIGHT)
				// dead (force node into leaf)
				// generation (# child away from top)
				// branchesR (number of cumulative right branches)
				// location (position in euclidean space)

	if(value == undefined)
		value = 0;
	// if animations are enabled, temporarily
	// store value in valueToBeGrown 
	if(ANIMATIONS){
		this.valueToBeGrown = value;
		this.value = 0;
	}
	else{
		this.value = value;
		this.valueToBeGrown = undefined;
	}
	this.childType;
	this.location;
	this.dead; // set true, force node to be a leaf
	this.branchesR;
	this.maxGeneration = 0;

	// manage properties related to the data structure
	this.parent = parent;
	if(parent)
		this.generation = parent.generation+1;
	else{
		this.generation = 0;
		this.direction = 0;
		this.branchesR = 0;
		// this.location = {x:0,y:0};
		this.location = {
			x:(0.0 + this.value * DIRECTION[this.direction].x), 
			y:(0.0 + this.value * DIRECTION[this.direction].y)
		};
	}
	this.right = undefined;
	this.left = undefined;

	this.addChildren = function(leftValue, rightValue){
		this.left = new btree(this, leftValue);
		this.right = new btree(this, rightValue);
		this.right.childType = RIGHT;
		this.left.childType = LEFT;
		this.right.parent = this;
		this.left.parent = this;
		this.left.direction = this.direction;
		this.right.direction = mod6(this.direction+1);
		this.left.location = {
			x:(this.location.x + this.left.value * DIRECTION[this.left.direction].x), 
			y:(this.location.y + this.left.value * DIRECTION[this.left.direction].y)
		};		
		this.right.location = {
			x:(this.location.x + this.right.value * DIRECTION[this.right.direction].x), 
			y:(this.location.y + this.right.value * DIRECTION[this.right.direction].y)
		};
		this.left.branchesR = this.branchesR;
		this.right.branchesR = this.branchesR + 1;
	}
	// this.addLeft = function(child){
	// 	if(child == undefined)
	// 		child = new btree(this);
	// 	else
	// 		child.parent = this;
	// 	this.left = child;
	// }
	// this.addRight = function(child){
	// 	if(child == undefined)
	// 		child = new btree(this);
	// 	else
	// 		child.parent = this;
	// 	this.right = child;
	// }
}

// GEOMETRY

function RayLineIntersect(origin, dV, pA, pB){
	// if intersection, returns point of intersection
	// if no intersection, returns undefined
	var v1 = { x:(origin.x - pA.x), y:(origin.y - pA.y) };
	var v2 = { x:(pB.x - pA.x), y:(pB.y - pA.y) };
	var v3 = { x:(-dV.y), y:(dV.x) };
	var t1 = (v2.x*v1.y - v2.y*v1.x) / (v2.x*v3.x + v2.y*v3.y);
	var t2 = (v1.x*v3.x + v1.y*v3.y) / (v2.x*v3.x + v2.y*v3.y);
	var p = undefined;
	if(t2 > 0.0 && t2 < 1.0 && t1 > 0.0){
		var dAB = {x:undefined,y:undefined};
		var lengthAB = Math.sqrt( (pB.x-pA.x)*(pB.x-pA.x) + (pB.y-pA.y)*(pB.y-pA.y) );
		dAB.x = (pB.x - pA.x) / lengthAB;
		dAB.y = (pB.y - pA.y) / lengthAB;
		p = {x:(pA.x + lengthAB * t2 * dAB.x), y:(pA.y + lengthAB * t2 * dAB.y)};
	}
	return p;
}

// DRAWING & RENDERING

function drawTree(tree, start, angleDepth){
	if(tree != undefined){
		if(tree.left != undefined){
			drawTree(tree.left, {x:start.x + tree.value * DIRECTION[angleDepth].x, y:start.y + tree.value * DIRECTION[angleDepth].y}, angleDepth);
		}
		if(tree.right != undefined){
			drawTree(tree.right, {x:start.x + tree.value * DIRECTION[angleDepth].x, y:start.y + tree.value * DIRECTION[angleDepth].y}, mod6(angleDepth+1));
		}
		line(start.x, start.y, start.x + tree.value * DIRECTION[angleDepth].x, start.y + tree.value * DIRECTION[angleDepth].y);
		// ellipse(start.x, start.y, 5, 5);
	}
}

function drawSnowflake(tree, location){
	for(var i = 0; i < 6; i++)
		drawTreeWithReflections(tree, location, i);

	function drawTreeWithReflections(tree, location, angle){
		if(tree != undefined){

			var start = location;
			var end = {
				x:(location.x + tree.value * DIRECTION[angle].x), 
				y:(location.y + tree.value * DIRECTION[angle].y)
			};

			// stroke(0 + (200/tree.maxGeneration)*tree.generation);
			line(start.x, start.y, end.x, end.y);
			// ellipse(start.x, start.y, 5, 5);

			if(tree.left != undefined)
				drawTreeWithReflections(tree.left, end, angle);
			if(tree.right != undefined){
				drawTreeWithReflections(tree.right, end, mod6(angle+1) );
				drawTreeWithReflections(tree.right, end, mod6(angle-1) );
			}
		}
	}
}


function resizeOrigins(){
	if(windowWidth > windowHeight){
		originSnowflake = {x:windowWidth*.70, y:windowHeight*.5};
		originTree = {x:windowWidth*.133, y:windowHeight*.66};
	}
	else{
		originSnowflake = {x:windowWidth*.5, y:windowHeight*.4};
		originTree = {x:windowWidth*.3, y:windowHeight*.933};
	}
}
// function resizeOrigins(){
// 	if(windowWidth > windowHeight){
// 		originSnowflake = {x:windowWidth*.60, y:windowHeight*.5};
// 		originTree = {x:windowWidth*.033, y:windowHeight*.66};
// 	}
// 	else{
// 		originSnowflake = {x:windowWidth*.5, y:windowHeight*.4};
// 		originTree = {x:windowWidth*.3, y:windowHeight*.933};
// 	}
// }

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	resizeOrigins();
}

function logTree(node){
	if(node != undefined){
		var hasChildren = false;
		if(node.left != undefined || node.right != undefined)
			hasChildren = true;
		var thisChildType;
		if(node.childType == LEFT) thisChildType = "left";
		if(node.childType == RIGHT) thisChildType = "right";
		console.log("Node (" + 
			node.generation + "/" + 
			node.maxGeneration + ") VALUE:(" + 
			node.value + ") PARENT:(" + 
			hasChildren + ") TYPE:(" + 
			node.childType + ") BRANCHES:(" + 
			node.branchesR + ") (" + 
			node.location.x + "," +
			node.location.y + ")");
		logTree(node.left);
		logTree(node.right);
	}
}