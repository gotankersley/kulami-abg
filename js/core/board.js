var defaultBoardStr = 
	'B0B0C0D0D0D0E0E0A0A0' +
	'B0B0C0F0F0G0E0E0A0A0' +
	'H0H0C0F0F0G0E0E0A0A0' +
	'H0H0I0I0I0J0J0J0A0A0' +
	'K0K0I0I0I0L0L0M0A0A0' +
	'N0O0O0P0P0L0L0M0A0A0' +
	'N0O0O0Q0Q0Q0R0R0A0A0' +
	'N0O0O0Q0Q0Q0R0R0A0A0' +
	'A0A0A0A0A0A0A0A0A0A0' +
	'A0A0A0A0A0A0A0A0A0A0';

var irrBoardStr = 
	'A0A0A0A0B0B0A0A0A0A0' +
	'A0A0C0C0B0B0D0A0A0A0' +
	'E0E0C0C0F0F0D0A0A0A0' +
	'E0E0G0H0H0H0D0I0I0I0' +
	'E0E0G0H0H0H0J0J0J0A0' +
	'K0K0G0L0L0L0J0J0J0A0' +
	'A0A0M0M0N0O0O0P0P0A0' +
	'A0A0M0M0N0O0O0P0P0A0' +
	'A0A0A0Q0Q0R0R0P0P0A0' +
	'A0A0A0A0A0R0R0A0A0A0';

var KBNS = [
	"B0B0C0D0D0D0E0E0A0A0B0B0C0F0F0G0E0E0A0A0H0H0C0F0F0G0E0E0A0A0H0H0I0I0I0J0J0J0A0A0K0K0I0I0I0L0L0M0A0A0N0O0O0P0P0L0L0M0A0A0N0O0O0Q0Q0Q0R0R0A0A0N0O0O0Q0Q0Q0R0R0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0", //default
	"A0A0A0A0B0B0A0A0A0A0A0A0C0C0B0B0D0A0A0A0E0E0C0C0F0F0D0A0A0A0E0E0G0H0H0H0D0I0I0I0E0E0G0H0H0H0J0J0J0A0K0K0G0L0L0L0J0J0J0A0A0A0M0M0N0O0O0P0P0A0A0A0M0M0N0O0O0P0P0A0A0A0A0Q0Q0R0R0P0P0A0A0A0A0A0A0R0R0A0A0A0", //irreg
	"B0B0B0C0C0D0D0D0A0A0E0E0E0C0C0D0D0D0A0A0F0G0G0H0H0I0I0I0A0A0F0J0J0H0H0I0I0I0A0A0F0K0K0L0L0M0M0M0A0A0N0O0O0L0L0M0M0M0A0A0N0P0P0Q0Q0R0R0R0A0A0N0P0P0Q0Q0R0R0R0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0",
	"B0C0C0C0D0D0E0E0A0A0B0C0C0C0D0D0E0E0A0A0B0F0G0G0H0H0E0E0A0A0I0F0J0J0H0H0K0K0A0A0I0F0L0L0M0M0K0K0A0A0N0O0O0O0M0M0K0K0A0A0N0P0P0P0Q0Q0R0R0A0A0N0P0P0P0Q0Q0R0R0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0",
	"B0C0C0D0D0E0E0E0A0A0B0C0C0F0F0E0E0E0A0A0G0G0G0F0F0H0H0I0A0A0J0J0K0K0K0H0H0I0A0A0J0J0K0K0K0L0L0I0A0A0M0M0M0N0N0O0P0P0A0A0Q0Q0Q0R0R0O0P0P0A0A0Q0Q0Q0R0R0O0P0P0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0",
	"B0B0B0C0D0D0E0E0A0A0B0B0B0C0D0D0E0E0A0A0F0G0G0C0H0H0E0E0A0A0F0G0G0I0H0H0J0K0A0A0L0L0L0I0M0M0J0K0A0A0L0L0L0N0M0M0J0O0A0A0P0P0Q0N0R0R0R0O0A0A0P0P0Q0N0R0R0R0O0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0",
	"B0B0B0C0C0C0D0D0A0A0E0E0F0F0G0G0D0D0A0A0E0E0H0H0G0G0I0I0A0A0J0J0H0H0K0K0I0I0A0A0L0L0L0M0K0K0I0I0A0A0L0L0L0M0K0K0N0N0A0A0O0O0P0M0Q0Q0N0N0A0A0O0O0P0R0R0R0N0N0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0",
	"B0B0B0C0C0D0D0E0A0A0F0G0G0C0C0H0H0E0A0A0F0G0G0C0C0H0H0E0A0A0I0I0I0J0J0K0K0K0A0A0I0I0I0J0J0K0K0K0A0A0L0M0M0N0N0O0O0P0A0A0L0M0M0N0N0O0O0P0A0A0L0Q0Q0N0N0R0R0R0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0",
	"B0B0C0C0C0D0E0E0A0A0B0B0C0C0C0D0F0F0A0A0G0G0H0I0I0D0F0F0A0A0G0G0H0I0I0J0J0J0A0A0G0G0K0K0K0J0J0J0A0A0L0L0M0M0N0O0P0P0A0A0Q0Q0M0M0N0O0R0R0A0A0Q0Q0M0M0N0O0R0R0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0A0",
];
	
//Class Board
function Board(boardStr) {
	this.tiles = new Array(GRID_SIZE);
	this.pins = new Array(GRID_SIZE);
	this.turn = TURN_PLAYER1;
	this.last1 = {r: INVALID, c: INVALID};
	this.last2 = {r: INVALID, c: INVALID};	
	this.pinCount1 = 0;	
	this.pinCount2 = 0;
	
	for (var i = 0; i < GRID_SIZE; i++) {
		this.tiles[i] = new Array(GRID_SIZE);
		this.pins[i] = new Array(GRID_SIZE);
	}
	
	//Load board
	if (typeof (boardStr) != 'undefined') this.loadFromString(boardStr);	
	else this.loadFromString(defaultBoardStr);	
}

Board.prototype.copy = function() {
	var newBoard = new Board();
	newBoard.pinCount1 = this.pinCount1;
	newBoard.pinCount2 = this.pinCount2;
	newBoard.last1.r = this.last1.r;
	newBoard.last1.c = this.last1.c;
	newBoard.last2.r = this.last2.r;
	newBoard.last2.c = this.last2.c;
	newBoard.turn = this.turn;
	for (var r = 0; r < GRID_SIZE; r++) {
		for (var c = 0; c < GRID_SIZE; c++) {
			newBoard.tiles[r][c] = this.tiles[r][c];
			newBoard.pins[r][c] = this.pins[r][c];
		}
	}
	return newBoard;
}


Board.prototype.loadFromString = function(boardStr) {
	boardStr = boardStr.toUpperCase();
	var p = 0;
	for (var i = 0; i < 2 * (GRID_SIZE * GRID_SIZE); i+= 2) {
		var r = Math.floor(p / GRID_SIZE);
		var c = Math.floor(p % GRID_SIZE);
		
		//Tile char
		var tileChar = boardStr.charAt(i);
		var tile = parseInt(-(ASCII_A - tileChar.charCodeAt(0)));
		if (tile < TILE_EMPTY || tile >= TILES_SIZE) { 
			alert('Error parsing tile "' + tileChar + '": ' + boardStr);
			return false;
		}
		this.tiles[r][c] = tile;
		
		//Pin char
		var pinChar = boardStr.charAt(i+1);
		var pin = parseInt(-(ASCII_0 - pinChar.charCodeAt(0)));
		if (pin < PIN_EMPTY || pin > PIN_LAST2) {
			alert('Error parsing pin: "' + pinChar + '": ' + boardStr);
			return false;
		}
		else if (pin == PIN_LAST1) {
			this.pins[r][c] = PIN_PLAYER1;
			this.last1 = {r:r, c:c};
		}
		else if (pin == PIN_LAST2) {
			this.pins[r][c] = PIN_PLAYER2;
			this.last2 = {r:r, c:c};
		}
		else this.pins[r][c] = pin;
		p++;		
	}
	return true;
}

Board.prototype.toString = function() {
	var boardStr = '';
	for (var r = 0; r < GRID_SIZE; r++) {
		for (var c = 0; c < GRID_SIZE; c++) {
			boardStr += String.fromCharCode(ASCII_A + this.tiles[r][c]);
			if (r == this.last1.r && c == this.last1.c) boardStr += String.fromCharCode(ASCII_0 + PIN_LAST1);
			else if (r == this.last2.r && c == this.last2.c) boardStr += String.fromCharCode(ASCII_0 + PIN_LAST2);			
			else boardStr += String.fromCharCode(ASCII_0 + this.pins[r][c]);
		}
	}	
	return boardStr;
}

Board.prototype.isValid = function(r, c) {
	if (this.pinCount1 + this.pinCount2 >= PINS_SIZE) return false; //Out of pins - each player gets 28
	else if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return false; //Out of 10x10 bounds
	else if (this.tiles[r][c] == TILE_EMPTY) return false; //Not on a tile
	else if (this.pins[r][c] != PIN_EMPTY) return false; //There is already a pin in the space
	else if (this.last1.r == INVALID) return true; //First move can play anywhere

	//Additional rules for after the first move
	var last = (this.turn == TURN_PLAYER1)? this.last1 : this.last2;
	var oppLast = (this.turn == TURN_PLAYER1)? this.last2 : this.last1;
		
	if (r != oppLast.r && c != oppLast.c) return false; //Rule 1 - Have to play on either the x, or y axes of opponent's last move
	else if (this.tiles[r][c] == this.tiles[oppLast.r][oppLast.c]) return false; //Rule 2 - Can't play in same tile that contains opponent's last move
	else if (last.r == INVALID) return true; //On the second move, player 2 doesn't have a last move, and so Rule 3 doesn't apply
	else if (this.tiles[r][c] == this.tiles[last.r][last.c]) return false; //Rule 3 - Can't play in same tile that contains player's last move	
	else return true;
}

Board.prototype.isGameOver = function() {
	
	if (this.pinCount1 + this.pinCount2 >= PINS_SIZE) return true; //Out of pins to play
	else if (this.getMoves().length == 0) return true; //No moves available 
	else return false;
}

Board.prototype.getMoves = function() {
	var moves = [];
	//First move - any valid tile can be chosen
	if (this.last1.r == INVALID) { 
		for (var r = 0; r < GRID_SIZE; r++) {
			for (var c = 0; c < GRID_SIZE; c++) {
				if (this.tiles[r][c] != TILE_EMPTY) moves.push({r: r, c: c});
			}
		}
	}
	else { //After the first move
		var last = (this.turn == TURN_PLAYER1)? this.last1 : this.last2;
		var lastTile = (last.r == INVALID)? INVALID : this.tiles[last.r][last.c];
		var oppLast = (this.turn == TURN_PLAYER1)? this.last2 : this.last1;
		var oppLastTile = this.tiles[oppLast.r][oppLast.c];
		for (var i = 0; i < GRID_SIZE; i++) {
			//Y-axis moves
			var tileR = this.tiles[oppLast.r][i];			
			if (this.pins[oppLast.r][i] == PIN_EMPTY && //empty space
				tileR != TILE_EMPTY && //On tile							
				tileR != oppLastTile && //Not in same tile where opponent last moved
				tileR != lastTile //Not in the same tile where player last moved
			) {
				moves.push({r:oppLast.r, c:i});
			}
			
			//X-axis moves
			var tileC = this.tiles[i][oppLast.c];
			if (this.pins[i][oppLast.c] == PIN_EMPTY && //empty space
				tileC != TILE_EMPTY && //On tile							
				tileC != oppLastTile && //Not in same tile where opponent last moved
				tileC != lastTile //Not in the same tile where player last moved
			) {
				moves.push({r:i, c:oppLast.c});
			}		
		}
	
	}
	return moves;
}

Board.prototype.score = function() {
	var tiles1 = new Array(TILES_SIZE);
	var tiles2 = new Array(TILES_SIZE);
	var tileCounts = new Array(TILES_SIZE);
	
	for (var t = 1; t < TILES_SIZE; t++) {
		tiles1[t] = 0;
		tiles2[t] = 0;
		tileCounts[t] = 0;
	}
	
	for (var r = 0; r < GRID_SIZE; r++) {
		for (var c = 0; c < GRID_SIZE; c++) {
			var tile = this.tiles[r][c];
			if (tile == TILE_EMPTY) continue;
			if (this.pins[r][c] == PIN_PLAYER1) tiles1[tile]++;
			else if (this.pins[r][c] == PIN_PLAYER2) tiles2[tile]++;
			tileCounts[tile]++;
		}
	}
	
	var score = {p1:0, p2:0};
	for (var t = 1; t < TILES_SIZE; t++) {		
		if (tiles1[t] > tiles2[t]) score.p1 += tileCounts[t];
		else if (tiles2[t] > tiles1[t]) score.p2 += tileCounts[t];
	}
	return score;
}

Board.prototype.makeMove = function(r, c) {	
	//Place pin
	if (this.turn == TURN_PLAYER1) { 
		this.pins[r][c] = PIN_PLAYER1;
		this.last1 = {r: r, c: c}; //Update last		
		this.pinCount1++; 
	}
	else { //Player 2
		this.pins[r][c] = PIN_PLAYER2;
		this.last2 = {r: r, c: c}; //Update last
		this.pinCount2++;
	}	
	
	this.turn = !this.turn; //Change turn
}

//End class Board
	
