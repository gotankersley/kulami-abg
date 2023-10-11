//Constants
var CANVAS_SIZE = 800;
var UNIT_SIZE = CANVAS_SIZE / GRID_SIZE;
var HALF_UNIT = UNIT_SIZE / 2;
var QUARTER_UNIT = UNIT_SIZE / 4;
var TILE_RADIUS_SIZE = 20;
var TILE_MARGIN_SIZE = 4;
var PIN_HOLE_SIZE = UNIT_SIZE / 6;
var PIN_RADIUS_SIZE = UNIT_SIZE / 3;

//Colors
var COLOR_BLACK = '#000';
var COLOR_TILE_EDGE = '#493d26';
var COLOR_AXES = '#a9a9f5';
var COLOR_CURSOR = '#7C6741';
var COLOR_P1 = '#f00';
var COLOR_P2 = '#303030';
var COLOR_P1_EDGE = '#600';
var COLOR_P2_EDGE = '#000';
var COLOR_TILE = '#deb887';	
var COLOR_TILE_DISABLED = '#8E775A';


//Class Game
function Game(boardStr) {
	//Init board - Convert tile cells to rectangle shapes for easier drawing
	this.board = new Board(boardStr);
	this.tileShapes = new Array(TILES_SIZE);
	this.scoreMap = new Array(GRID_SIZE);
	for (var r = 0; r < GRID_SIZE; r++) {
		var y = r * UNIT_SIZE;
		this.scoreMap[r] = new Array(GRID_SIZE);
		for (var c = 0; c < GRID_SIZE; c++) {
			this.scoreMap[r][c] = '';
			var x = c * UNIT_SIZE;
			var tile = this.board.tiles[r][c];
			var shape = this.tileShapes[tile];
			if (tile == TILE_EMPTY) continue;
			//See if this is the first time this tile has been seen
			else if (typeof(shape) == 'undefined') this.tileShapes[tile] = {x:x + TILE_MARGIN_SIZE, y:y + TILE_MARGIN_SIZE, w:0, h:0};
			else { //Update the width, and height dimensions
				this.tileShapes[tile].w = Math.max(shape.w, (x - shape.x + UNIT_SIZE) - TILE_MARGIN_SIZE);
				this.tileShapes[tile].h = Math.max(shape.h, (y - shape.y + UNIT_SIZE) - TILE_MARGIN_SIZE);
			}                                                                         
		}
	}
	
	//Players
	this.players = new Players(PLAYER_HUMAN, PLAYER_HUMAN);			
	
	this.cursorR = 0;
	this.cursorC = 0;
	
	var canvas = document.getElementById('mainCanvas');
	var pinCanvas = document.getElementById('pinCanvas');
	
	this.ctx = canvas.getContext('2d');    
	this.pinCtx = pinCanvas.getContext('2d');       
	
	this.ctx.font = "20px Georgia";
	this.draw();
}

//Game logic
Game.prototype.onMoveStart = function(r, c) {
	if (this.board.isGameOver()) return;
	
	if (this.players.getCurrent(this.board) != PLAYER_HUMAN) {
		this.players.getMove(this.board, function(move) {		
			game.onMakeMove(move.r, move.c);				
		});
	}	
}

Game.prototype.onMakeMove = function(r, c) {
	
	if (this.board.isValid(r, c)) {
		this.board.makeMove(r, c);			
		this.onMoveMade(r, c);
	}
	else this.onInvalidMove(r, c);
	
}

Game.prototype.onMoveMade = function(r, c) {
	//Update pin counts	
	var score = this.board.score();
	$('#score').text(score.p1 + ' - ' + score.p2);
	
	if (this.board.isGameOver()) this.onGameOver();
	else {
		$('#turn').attr('class', 'turn' + (this.board.turn + 1)); //Change turn			
		if (this.players.getCurrent(this.board) != PLAYER_HUMAN) {
			setTimeout(function() { //Give draw enough time to display board
				game.onMoveStart(); 
			}, menu.moveDelay + 10);
		}
	}
}

Game.prototype.onInvalidMove = function(r, c) {
	console.log('Invalid move: ', r, c);
	alert('Invalid move: ' + r + ',' + c);
}

Game.prototype.onGameOver = function() {
	var score = this.board.score();
	var noMoves = (this.board.pinCount1 + this.board.pinCount2 < PINS_SIZE)? 'No moves - ' : '';
	var msg;
	var winClass;
	if (score.p1 > score.p2) {
		msg = noMoves + 'Red WINS!!';
		winClass = 'win1';
	}
	else if (score.p2 > score.p1) {
		msg = noMoves + 'Black WINS!!';
		winClass = 'win2';
	}
	else {
		msg = noMoves + 'Tie score!';
		winClass = 'tie';
	}
	
	$('#turn').attr('class', winClass);
	$('#turn').text(msg);
	alert(msg);
}


//Event functions
Game.prototype.onClick = function(e) {
	
	var x,y;
	if(e.offsetX == undefined) { //Required for FF
		x = e.pageX - $('#mainCanvas').offset().left;
		y = e.pageY - $('#mainCanvas').offset().top; 
	}
	else {
		x = e.offsetX; 
		y = e.offsetY; 
	}	
	
	var r = Math.floor(y / UNIT_SIZE);
	var c = Math.floor(x / UNIT_SIZE);
	
	//Make sure in bounds
	if (game.players.getCurrent(game.board) == PLAYER_HUMAN) {
		if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && game.board.tiles[r][c] != TILE_EMPTY) {
			if (game.board.isValid(r, c)) {
				game.board.makeMove(r, c);
				game.onMoveMade(r, c);
			}
			else game.onInvalidMove(r, c); 
		}
	}
	
}

Game.prototype.onMouse = function(e) {
	var x,y;
	if(e.offsetX == undefined) { //Required for FF
		x = e.pageX - $('#mainCanvas').offset().left;
		y = e.pageY - $('#mainCanvas').offset().top; 
	}
	else {
		x = e.offsetX; 
		y = e.offsetY; 
	}	
	
	game.cursorR = Math.floor(y / UNIT_SIZE);
	game.cursorC = Math.floor(x / UNIT_SIZE);
}

//Draw functions
Game.prototype.draw = function() {	
	var board = this.board;
	var last = board.last1;
	var oppLast = board.last2;
	if (board.turn == TURN_PLAYER2) {		
		last = board.last2;
		oppLast = board.last1;
	}
	var oppLastX = oppLast.c * UNIT_SIZE;
	var oppLastY = oppLast.r * UNIT_SIZE;
	var lastX = last.c * UNIT_SIZE;
	var lastY = last.r * UNIT_SIZE;
		
	//Clear canvases
	var ctx = this.ctx;
	ctx.clearRect(0,0, CANVAS_SIZE, CANVAS_SIZE);		
	var pinCtx = this.pinCtx;
	pinCtx.clearRect(0,0, 200, CANVAS_SIZE);
	
	var gridLength = GRID_SIZE * UNIT_SIZE;	
	
	
	//Tiles background
	ctx.lineWidth = 5;	
	for (var t = 1; t < TILES_SIZE; t++) {			
		var shape = this.tileShapes[t];
		if (menu.expertMode || oppLast.r == INVALID) ctx.fillStyle = COLOR_TILE;
		else if (oppLastX + HALF_UNIT >= shape.x && oppLastX <= (shape.x + shape.w) &&
			oppLastY + HALF_UNIT >= shape.y && oppLastY <= (shape.y + shape.h)) ctx.fillStyle = COLOR_TILE_DISABLED;					
		else if (lastX + HALF_UNIT >= shape.x && lastX <= (shape.x + shape.w) &&
			lastY + HALF_UNIT >= shape.y && lastY <= (shape.y + shape.h)) ctx.fillStyle = COLOR_TILE_DISABLED;					
		else ctx.fillStyle = COLOR_TILE;
		
		drawRoundedRect(ctx, shape.x, shape.y, shape.w, shape.h, menu.tileRounding); //Draw background		
		ctx.strokeStyle = COLOR_TILE_EDGE;
		ctx.stroke();				
	}
	
	
		
	//Axes lines
	if (menu.showAxes && !menu.expertMode) {
		if (oppLast.r != INVALID) {		
			ctx.strokeStyle = COLOR_AXES;
					
			var axisY = oppLastY + HALF_UNIT;
			var axisX = oppLastX + HALF_UNIT;
			drawLine(ctx, 0, axisY, gridLength, axisY);
			drawLine(ctx, axisX, 0, axisX, gridLength);
		}
	}
	
	
	//Pins and holes
	var pinHoleMargin = HALF_UNIT - PIN_HOLE_SIZE;
	var pinMargin = HALF_UNIT - PIN_RADIUS_SIZE;
	for (var r = 0; r < GRID_SIZE; r++) {
		var y = r * UNIT_SIZE;
		for (var c = 0; c < GRID_SIZE; c++) {
			var x = c * UNIT_SIZE;
			var tile = board.tiles[r][c];
			var pin = board.pins[r][c];
			
			//Empty tile - used to mask axes lines
			if (tile == TILE_EMPTY) { 
				ctx.fillStyle = '#fff';
				ctx.fillRect(x, y, UNIT_SIZE, UNIT_SIZE);				
			}					
			
			//Pin
			else if (pin != PIN_EMPTY) {								
				if (pin == PIN_PLAYER1) {
					ctx.fillStyle = COLOR_P1;
					ctx.strokeStyle = COLOR_P1_EDGE;
				}
				else if (pin == PIN_PLAYER2) {
					ctx.fillStyle = COLOR_P2;			
					ctx.strokeStyle = COLOR_P2_EDGE;
				}
				drawCircle(ctx, x + pinMargin, y + pinMargin, PIN_RADIUS_SIZE, 0);	
				ctx.lineWidth = 2;
				ctx.stroke();
			}
			
			//Cursor
			else if (r == this.cursorR && c == this.cursorC) {
				var cursorX = this.cursorC * UNIT_SIZE;
				var cursorY = this.cursorR * UNIT_SIZE;							
				ctx.fillStyle = (board.turn == TURN_PLAYER1)? COLOR_P1 : COLOR_P2;
				drawCircle(ctx, x + pinHoleMargin - 5, y + pinHoleMargin - 5, PIN_HOLE_SIZE + 5, 0);
			}
			
			//Empty pin hole
			else { 
				ctx.fillStyle = COLOR_TILE_EDGE;
				drawCircle(ctx, x + pinHoleMargin, y + pinHoleMargin, PIN_HOLE_SIZE, 0);
			}
			
		}
	}
		
	
	
	//Grid	
	if (menu.showGrid) {
		ctx.lineWidth = 1;	
		ctx.strokeStyle = COLOR_BLACK;
		for (var i = 0; i < GRID_SIZE; i++) {
			var unit = i * UNIT_SIZE;
			drawLine(ctx, unit, 0, unit, gridLength); //Horizontal
			drawLine(ctx, 0, unit, gridLength, unit); //Vertical
		}
	}
	
	//Pins Remaining
	if (menu.showPinsRemaining) {	
		//Player 1's remaining pins
		pinCtx.fillStyle = COLOR_P1;
		for (var i = 0; i < PINS_PER_PLAYER - board.pinCount1; i++) 
		{
			var r = Math.floor(i / 4);
			var c = i % 4;		
			var x = 2 * (PIN_HOLE_SIZE + 1) * c;							
			var y = 2 * (PIN_HOLE_SIZE + 1) * r;			
			drawCircle(pinCtx, x, y + 50, PIN_HOLE_SIZE, 0);				
		}
		
		//Player 2's remaining pins
		pinCtx.fillStyle = COLOR_P2;
		for (var i = board.pinCount2; i < PINS_PER_PLAYER; i++) 
		{
			var r = Math.floor(i / 4);
			var c = i % 4;		
			var x = 2 * (PIN_HOLE_SIZE + 1) * c;							
			var y = 2 * (PIN_HOLE_SIZE + 1) * r;			
			drawCircle(pinCtx, x, y + 350, PIN_HOLE_SIZE, 0);				
		}
	}
	
	//Score map
	if (menu.showScoreMap) {
		for (var r = 0; r < GRID_SIZE; r++) {
			var y = ((r + 1) * UNIT_SIZE) - (QUARTER_UNIT) + 5;
			for (var c = 0; c < GRID_SIZE; c++) {
				var x = (c * UNIT_SIZE) + QUARTER_UNIT;
				if (this.board.tiles[r][c] == TILE_EMPTY) continue;
				var s = this.scoreMap[r][c];
				if (s == 100000) ctx.fillText('Win', x, y); 
				else if (s == -100000) ctx.fillText('Loss', x, y);
				else ctx.fillText(this.scoreMap[r][c], x, y); 
			}
		}		
	}
	
    requestAnimationFrame(this.draw.bind(this));
}

//End class Game
