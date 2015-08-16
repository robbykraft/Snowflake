var snowflake;

var STICKY = .8;  // 0 means change every time, 1 means stay on course

//counter clockwise starting from 3:00
var DIRECTION = [
	{x:1, y:0},
	{x:.5,y:-0.86602540378444},
	{x:-.5,y:-0.86602540378444},
	{x:-1, y:0},
	{x:-.5,y:0.86602540378444},
	{x:.5,y:0.86602540378444}
];

var tree;

var RIGHT = 1;
var LEFT = 0;

function makeValue(){
	return int(random(115))+5;
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	// snowflake = buildPointArrays();
	snowflake = buildLineArrays();
	tree = new btree();
	// tree.addRight();
	// tree.addLeft();
	// tree.left.addRight();
	// tree.left.right.addLeft();
	// tree.right = new btree(tree);
	// tree.left = new btree(tree);


	// var node = tree;
	// for(var i = 0; i < 10; i++){
	// 	node.value = random(40) + 10;
	// 	node.addChildren();
	// 	node = node.left;
	// }
	buildSnowflake(tree);
	logTree(tree);
}

function draw() {
	// drawSnowflake({x:(width/10), y:(height/10*9)}, snowflake);

	// strokeWeight(5);
	drawTree(tree, {x:width*.1, y:height*.5}, 0, 0);

	// drawSnowflakeLines({x:(width/10), y:(height*.5)}, snowflake);
	// for(var i = 0; i < snowflake.length; i++){
	// 	snowflake[i].grow();
	// 	if(int(random(500)) == 0){
	// 		sprout(snowflake, i);
	// 	}
	// }
}

function buildSnowflake(node){
	if(node != undefined){
		if(int(random(8)) && node.level < 2){
			// we are not a leaf
			node.addChildren();
			buildSnowflake(node.left);
			buildSnowflake(node.right);
		}
		else{
			// we are a leaf
			node.numChildren = 0;
		}

		node.value = makeValue();
		node.sumValue = node.value;
		node.numChildren = 0;

		if(node.left != undefined){
			node.numChildren += 1 + node.left.numChildren;
			node.sumValue += 1 + node.left.sumValue;
		}
		if(node.right != undefined){
			node.numChildren += 1 + node.right.numChildren;
			node.sumValue += 1 + node.right.sumValue;
		}
	}
}

function drawTree(tree, start, left, right){
	if(tree != undefined){
		if(tree.left != undefined)
			drawTree(tree.left, {x:start.x + tree.value * DIRECTION[left].x, y:start.y + tree.value * DIRECTION[left].y}, left+1, right);
		if(tree.right != undefined)
			drawTree(tree.right, {x:start.x + tree.value * DIRECTION[right].x, y:start.y + tree.value * DIRECTION[right].y}, left, right+1);

		stroke(0 + 40*tree.level);
		line(start.x, start.y, start.x + tree.value * DIRECTION[right].x, start.y + tree.value * DIRECTION[right].y);
	}
}

function btree(parent){
	// store fun stuff here
	this.value = undefined;
	this.sumValue = undefined;
	this.numChildren = undefined;
	this.childType = undefined;

	// data structure parts
	this.parent = parent;
	if(parent)
		this.level = parent.level+1;
	else
		this.level = 0;
	this.right = undefined;
	this.left = undefined;

	this.addChildren = function(){
		this.left = new btree(this);
		this.right = new btree(this);
		this.right.parent = this;
		this.left.parent = this;
		this.right.childType = RIGHT;
		this.left.childType = LEFT;
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

function drawBFlake(root){
	var node = root;

}

function logTree(node){
	if(node != undefined){
		console.log("Node ("+node.level+"): " + node.value + "(" + node.sumValue + ")  CH:(" + node.left + " " + node.right + ")  NumChildren:" + node.numChildren);
		logTree(node.left);
		logTree(node.right);
	}
}

function mousePressed() {
	var index = int(random(0,snowflake.length));
	sprout(snowflake, index);
}

function Vec2(newX, newY){
	this.x = newX;
	this.y = newY;
};

function pointUnit(originVec2, directionVec2){
	this.origin = new Vec2(originVec2.x, originVec2.y);
	this.direction = new Vec2(directionVec2.x, directionVec2.y);

	this.grow = function(){

	}
};

function lineUnit(originVec2, direction, size){
	this.origin = new Vec2(originVec2.x, originVec2.y);
	this.direction = direction;
	this.size = size;
	this.grow = function(){
		this.size++;
	}
};

// adds 2 60deg sprouting lines from parent
function sprout(flake, index){
	var newOrigin = new Vec2(flake[index].origin.x + DIRECTION[flake[index].direction].x * flake[index].size, flake[index].origin.y + DIRECTION[flake[index].direction].y * flake[index].size);

	var d0 = flake[index].direction + 1;
	var d1 = flake[index].direction - 1;
	if(d0 >= DIRECTION.length)
		d0 -= DIRECTION.length;
	if(d1 < 0)
		d1 += DIRECTION.length;

	console.log(flake[index].origin.x + "  X:" + newOrigin.x + "  Y:" + newOrigin.y + "   " + d0 + "  " + d1);
	var sprout1 = new lineUnit(newOrigin, d0, 1);
	var sprout2 = new lineUnit(newOrigin, d1, 1);
	snowflake.push(sprout1);
	snowflake.push(sprout2);
}

function drawSnowflake(origin, sf){
	var SCALE = 2.0;
	for(var i = 0; i < sf.length; i++){
		ellipse(origin.x + sf[i].origin.x * SCALE, origin.y + sf[i].origin.y * SCALE, SCALE, SCALE);
		// line(origin.x + sf[i].x, origin.y + sf[i].y);
	}
}

function drawSnowflakeLines(origin, flake){
	var SCALE = 2.0;
	for(var i = 0; i < flake.length; i++){
		var x1 = origin.x + flake[i].origin.x;
		var y1 = origin.y + flake[i].origin.y;
		var x2 = origin.x + flake[i].origin.x + (DIRECTION[flake[i].direction]).x * flake[i].size;
		var y2 = origin.y + flake[i].origin.y + (DIRECTION[flake[i].direction]).y * flake[i].size;
		line(x1, y1, x2, y2);
	}
}

function buildLineArrays(){
	var s = new Array();
	var start = new lineUnit({x:(0),y:(0)}, 0, 1);
	s.push(start);
	// for(var i = 1; i < 650; i++){
	// 	var rand = random(0,1);
	// }
	return s;
}

// function buildPointArrays(){
// 	var s = new Array();
// 	var start = new pointUnit({x:(0),y:(0)}, {x:(1),y:(0)});
// 	s.push(start);
// 	for(var i = 1; i < 250; i++){  // do not start at 0 !
// 		var rand = random(0,1);
// 		var direction = s[i-1].direction;
// 		if(rand > STICKY){
// 			if(random(0,1) > .5){
// 				direction = D0
// 			}
// 			else{
// 				direction = D1
// 			}
// 		}
// 		var newX, newY;
// 		newX = s[i-1].origin.x + direction.x;
// 		newY = s[i-1].origin.y + direction.y;
// 		// console.log(direction);
// 		s.push(new pointUnit({x:newX, y:newY}, direction));
// 	}

// 	for(var i = 0; i < 100; i++){
// 		var r = int(random(10,250));
// 		var newIndex = int(s.length-1);
// 		var newDirection;
// 		if(s[r].direction.x == D0.x){
// 			newDirection = D1;
// 		}
// 		else if(s[r].direction.y == D1.y){
// 			newDirection = D0;
// 		}
// 		var newPosition = new Vec2(s[r].origin.x+newDirection.x, s[r].origin.y + newDirection.y);
// 		s.push(new pointUnit(newPosition, newDirection));
// 		// COPY CODE
// 		for(var j = 0; j < r; j++){
// 			var rand = random(0,1);
// 			var direction = s[newIndex-1].direction;
// 			if(rand > STICKY){
// 				if(random(0,1) > .5){
// 					direction = D0
// 				}
// 				else{
// 					direction = D1
// 				}
// 			}
// 			var newX, newY;
// 			// console.log("SIZE " + s.length + "(" + int(j+newIndex) + ")");
// 			// console.log("ORIGIN: " + s[j+newIndex].origin.x, s[j+newIndex].origin.y);
// 			newX = s[j+newIndex].origin.x + direction.x;
// 			newY = s[j+newIndex].origin.y + direction.y;
// 			// console.log(direction);
// 			var next = new pointUnit(new Vec2(newX, newY), direction);
// 			s.push(next);
// 		}
// 	}
// 	return s;
// }