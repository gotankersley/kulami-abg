//BB is a bitboard implementation which uses javascript's typed arrays to emulate 64 bit integers
//Constants
//var GRID_SIZE = 10;
//var BOARD_SIZE = 64;
//var TILES_SIZE = 18; //Includes empty tile
var BB_INVALID = 0xffffffff;
var SCORE_OFFSET = 100;


//Enums 
var P1 = 0; var P2 = 2; 
var P1_LO = 0; var P1_HI = 1; var P2_LO = 2; var P2_HI = 3; var LAST1 = 4; var LAST2 = 5; var TURN = 6; var SCORE = 7;

//Masks
var EMPTY = new Uint32Array([0,0]);
var FULL = new Uint32Array([0xffffffff, 0xffffffff]);

//Global conversion arrays
var MPOS = new Array(BOARD_SIZE); //Mask position
var POS = new Array(BOARD_SIZE); 
var ROW = new Array(BOARD_SIZE);
var COL = new Array(BOARD_SIZE);
var MOVES = new Array(BOARD_SIZE);

var TILES_BY_POS = new Array(BOARD_SIZE); //Indexed by pos
var TILES_BY_ID = new Array(TILES_SIZE); //Indexed by tileId
var TILE_IDS_BY_POS = new Array(BOARD_SIZE); 
var TILE_COUNTS_BY_POS = new Array(BOARD_SIZE);
var TILE_COUNTS_BY_ID = new Array(TILES_SIZE);

//Struct BB
function BB_new() {
	var bb = new Uint32Array([
		0, 			//p1 lo
		0, 			//p1 hi
		0, 			//p2 lo
		0, 			//p2 hi
		BB_INVALID, 	//last1
		BB_INVALID,	//last2
		TURN_PLAYER1,//turn
		0			//score
	]);
	return bb;
}

function BB_initConstants() {
	for (var i = 0; i < GRID_SIZE; i++) {		
		POS[i] = new Array(GRID_SIZE);				
	}
	
	for (var i = 0; i < BOARD_SIZE; i++) {
		MPOS[i] = (i < 32)? new Uint32Array([1 << i, 0]) : new Uint32Array([0, 1 << i]);
	}	
}

function BB_calcScore(bb) {
	//NOTE: Global scoring is where Player1 points are positive, Tie is 0, and Player2 points are negative.
	//However, score is stored in an uint, and can't be negative, so scoring is offset by + 100.	
	//ALSO NOTE: This is used for initialization, but the score is also incrementally calculated 
	//in the makeMove function which is faster
	var globalScore = SCORE_OFFSET;
	var p1 = get(bb, P1);
	var p2 = get(bb, P2);
	for (var t = 1; t < TILES_SIZE; t++) {
		var tileCount1 = bitCount(and(TILES_BY_ID[t], p1));
		var tileCount2 = bitCount(and(TILES_BY_ID[t], p2));
		if (tileCount1 > tileCount2) globalScore += TILE_COUNTS_BY_ID[t];
		else if (tileCount2 > tileCount1) globalScore -= TILE_COUNTS_BY_ID[t];
	}
	return globalScore;
}

function BB_fromKBN(bb, kbn) { //bb passed by reference
	kbn = kbn.toUpperCase();
	var KBN_LENGTH = 2 * (GRID_SIZE * GRID_SIZE);
	if (kbn.length != KBN_LENGTH) {
		var msg = 'Invalid kbn length "' + kbn.length + '", expected ' + KBN_LENGTH;
		return {status:false, msg:msg};
	}
	//Convert to 2D grid
	var p = 0;
	var nonEmptyPos = 0;
	var tiles = new Array(GRID_SIZE);
	var pins = new Array(GRID_SIZE);		
	
	//Clunky j/s array initialization
	for (var i = 0; i < GRID_SIZE; i++) {
		tiles[i] = new Array(GRID_SIZE);
		pins[i] = new Array(GRID_SIZE);			
	}
		
	for (var i = 0; i < TILES_SIZE; i++) {
		TILES_BY_ID[i] = new Uint32Array(2);
	}
	
	for (var i = 0; i < KBN_LENGTH; i+= 2) {
		var r = Math.floor(p / GRID_SIZE);
		var c = Math.floor(p % GRID_SIZE);
		
		//Tile char
		var tileChar = kbn.charAt(i);
		var tile = parseInt(-(ASCII_A - tileChar.charCodeAt(0)));
		if (tile < TILE_EMPTY || tile >= TILES_SIZE) {
			var msg = 'Invalid tile code "' + tileChar + '" in kbn:' + i + ', expected A-R';
			return {status:false, msg:msg};
		}					
		else tiles[r][c] = tile;
		
		//Pin char
		var pinChar = kbn.charAt(i+1);
		var pin = parseInt(-(ASCII_0 - pinChar.charCodeAt(0)));
		if (pin < PIN_EMPTY || pin > PIN_LAST2) {
			var msg = 'Invalid pin code "' + pinChar + '" in kbn:' + i + ', expected 0-4';
			return {status:false, msg:msg};			
		}
		else pins[r][c] = pin;		

		//Pos mapping - from row,col (10x10) -> pos (64)
		if (tile == TILE_EMPTY) POS[r][c] = INVALID; //Empty tile
		else { //Non-empty tile
			ROW[nonEmptyPos] = r;
			COL[nonEmptyPos] = c;
			POS[r][c] = nonEmptyPos;
			nonEmptyPos++;
		}
		p++;		
	}
	
	//Convert to bitboard
	var p1 = new Uint32Array(2);
	var p2 = new Uint32Array(2);
	bb[LAST1] = BB_INVALID;
	bb[LAST2] = BB_INVALID;
	for (var r = 0; r < GRID_SIZE; r++) {
		for (var c = 0; c < GRID_SIZE; c++) {
			if (tiles[r][c] == TILE_EMPTY) continue;
			var pos = POS[r][c];
			var mpos = MPOS[pos];
			
			//Tiles
			var tileId = tiles[r][c];			
			xorEq(TILES_BY_ID[tileId], mpos);
			
			//Pins
			if (pins[r][c] == PIN_EMPTY) continue;
			var pin = pins[r][c];
			if (pin == PIN_PLAYER1) xorEq(p1, mpos);
			else if (pin == PIN_PLAYER2) xorEq(p2, mpos);
			else if (pin == PIN_LAST1) bb[LAST1] = pos;
			else if (pin == PIN_LAST2) bb[LAST2] = pos;
		}
	
	}
	//Add lasts
	if (bb[LAST1] != BB_INVALID) xorEq(p1, MPOS[bb[LAST1]]);
	if (bb[LAST2] != BB_INVALID) xorEq(p2, MPOS[bb[LAST2]]);
	set(bb, P1, p1);
	set(bb, P2, p2);
	
	//Distribute tile masks - and generate move masks
	for (p = 0; p < BOARD_SIZE; p++) {
		var r = ROW[p];
		var c = COL[p];
		
		//Tiles
		var tileId = tiles[r][c];
		TILE_IDS_BY_POS[p] = tileId;
		TILES_BY_POS[p] = TILES_BY_ID[tileId];		
		
		//Move masks		
		MOVES[p] = new Uint32Array(2);
		for (var i = 0; i < GRID_SIZE; i++) {						
			if (POS[r][i] != INVALID) xorEq(MOVES[p], MPOS[POS[r][i]]); //x-axis
			if (POS[i][c] != INVALID) xorEq(MOVES[p], MPOS[POS[i][c]]); //y-axis			
		}		
	}
	
	//Get tile counts - used for scoring
	for (var t = 1; t < TILES_SIZE; t++) { //Start at 1 to ignore EMPTY_TILE
		TILE_COUNTS_BY_ID[t] = bitCount(TILES_BY_ID[t]);
	}

	for (p = 0; p < BOARD_SIZE; p++) {
		var tileId = TILE_IDS_BY_POS[p];
		TILE_COUNTS_BY_POS[p] = TILE_COUNTS_BY_ID[tileId];
	}
	
	//Turn - inferred from pin count: even sum will be player1's turn, odd will be player2's 
	bb[TURN] = bitCount(or(p1, p2)) % 2;
	
	bb[SCORE] = BB_calcScore(bb);
	
	return {status:true, msg:''};
}

function BB_toKBN(bb) {
	var kbn = '';	
	
	var p1 = get(bb, P1);
	var p2 = get(bb, P2);	
		
	//Convert to 2D array				
	for (var r = 0; r < GRID_SIZE; r++) {
		
		for (var c = 0; c < GRID_SIZE; c++) {
			var pos = POS[r][c];
			//Empty tile
			if (pos == INVALID) {
				kbn += 'A0';
				continue;				
			}
			
			//Tile code	
			var tileId = TILE_IDS_BY_POS[pos];
			kbn += String.fromCharCode(ASCII_A + tileId);
			
			//Pins	
			var mpos = MPOS[pos];
			if (pos == bb[LAST1]) kbn += String.fromCharCode(ASCII_0 + PIN_LAST1);
			else if (pos == bb[LAST2]) kbn += String.fromCharCode(ASCII_0 + PIN_LAST2);
			else if (eq(and(p1, mpos), mpos)) kbn += String.fromCharCode(ASCII_0 + PIN_PLAYER1);
			else if (eq(and(p2, mpos), mpos)) kbn += String.fromCharCode(ASCII_0 + PIN_PLAYER2);
			else kbn += '0';
		}
	}
	return kbn;
}

function BB_makeMove(bb, pos) {
	var p1 = get(bb, P1);
	var p2 = get(bb, P2);
	
	var turnCount1 = bitCount(and(p1, TILES_BY_POS[pos])); 
	var turnCount2 = bitCount(and(p2, TILES_BY_POS[pos]));
	
	if (bb[TURN] == TURN_PLAYER1) {
		xorEqOff(bb, P1, MPOS[pos]);
		bb[LAST1] = pos;
		
		//Incremental scoring for player 1
		turnCount1++;
		if (Math.abs(turnCount1 - turnCount2) <= 1) { //If either player has a difference of more than 1 it won't make a difference
			if (turnCount1 >= turnCount2) bb[SCORE] += TILE_COUNTS_BY_POS[pos]; //Only pin on tile, or going from tie to majority, or making a tie				
		}
	}
	else { //Player 2
		xorEqOff(bb, P2, MPOS[pos]);		
		bb[LAST2] = pos;
		
		//Incremental scoring for player 1
		turnCount2++;
		if (Math.abs(turnCount2 - turnCount1) <= 1) { //If either player has a difference of more than 1 it won't make a difference
			if (turnCount2 >= turnCount1) bb[SCORE] -= TILE_COUNTS_BY_POS[pos]; //Only pin on tile, or going from tie to majority, or making a tie				
		}
	}
	
	//Change turn
	bb[TURN] = !bb[TURN];
}

function BB_getMoves(bb) { //Returns mask
	//First move in game - player can play anywhere
	if (bb[LAST1] == BB_INVALID) return FULL;
			
	var last = bb[LAST1];
	var oppLast = bb[LAST2];
	if (bb[TURN] == TURN_PLAYER2) {
		last = bb[LAST2];
		oppLast = bb[LAST1];
	}	
	var p1 = get(bb, P1);
	var p2 = get(bb, P2);
	
	var moves = new Uint32Array(MOVES[oppLast]); //Rule 1 - Add moves on the x, and y axes from opponent's last pin
	xorEq(moves, and(moves, or(p1, p2))); //Rule 0 - Don't place where there is already a pin
	xorEq(moves, and(moves, TILES_BY_POS[oppLast])); //Rule 2 - Subtract pins that intersect opponent's last tile, and opponent's pins
	if (last != BB_INVALID) xorEq(moves, and(moves, TILES_BY_POS[last])); //Rule 3 - Subtract pins that intersect player's last tile
	return moves;
}

function BB_getFirstAvailMove(bb) {
	var moves = bitScan(BB_getMoves(bb));	
	return moves[0];
}

function BB_getRandomMove(bb) {
	var moves = bitScan(BB_getMoves(bb));	
	return moves[Math.floor(Math.random() * moves.length)];
}

function BB_getLastPos(bb) {
	if (bb[TURN] == TURN_PLAYER1) return bb[LAST2];
	else return bb[LAST1];
}

function BB_getLastMove(bb) {
	if (bb[TURN] == TURN_PLAYER1) return {r:ROW[bb[LAST2]], c:COL[bb[LAST2]]};
	else return {r:ROW[bb[LAST1]], c:COL[bb[LAST1]]};
}

function BB_getWinMove(bb) {
	var moves = bitScan(BB_getMoves(bb));	
	for (var m = 0; m < moves.length; m++) {		
		var kidBoard = new Uint32Array(bb);
		BB_makeMove(kidBoard, moves[m]);
		var kidMoves = BB_getMoves(kidBoard);
		if (eq(kidMoves, EMPTY)) {
			if (bb[TURN] == TURN_PLAYER1) {
				if (kidBoard[SCORE] > SCORE_OFFSET) return moves[m];
			}
			else {
				if (kidBoard[SCORE] < SCORE_OFFSET ) return moves[m];
			}				
		}		
	}
	return false;
}


function BB_print(bb) {
	var p1 = get(bb, P1);
	var p2 = get(bb, P2);
	console.log('P1', bitScan(p1));
	console.log('P2', bitScan(p2));
}

function BB_simulate(bbRoot) {
	
	//Scoring is local	
	var bb = new Uint32Array(bbRoot); //Copy, because root is passed by reference	
	var p1 = get(bb, P1);	
	var p2 = get(bb, P2);
	
	var moveCount = bitCount(or(p1, p2));
	for (var i = 0; i < (PINS_SIZE - moveCount); i++) { //Play until out of pins
		var moveMask = BB_getMoves(bb);
		if (eq(moveMask, EMPTY)) break; //Out of moves

		//Make move	- Check for wins
		var moves = bitScan(moveMask);
		/*var nonTerminal = [];
		for (var m = 0; m < moves.length; m++) {
			
			var kidBoard = new Uint32Array(bb);
			BB_makeMove(kidBoard, moves[m]);
			var kidMoves = BB_getMoves(kidBoard);
			if (eq(kidMoves, EMPTY)) {
				if (bb[TURN] == bbRoot[TURN]) {
					if (kidBoard[SCORE] > SCORE_OFFSET && bbRoot[TURN] == TURN_PLAYER1) return WIN;
					else if (kidBoard[SCORE] < SCORE_OFFSET && bbRoot[TURN] == TURN_PLAYER2) return WIN;
				}
			}
			else nonTerminal.push(moves[m]);
		}
		if (nonTerminal.length == 0) return LOSE;*/
		//Make random non-terminal move
		//BB_makeMove(bb, nonTerminal[Math.floor(Math.random() * nonTerminal.length)]);
		
		BB_makeMove(bb, moves[Math.floor(Math.random() * moves.length)]);
	}
	if (bb[SCORE] > SCORE_OFFSET) return (bbRoot[TURN] == TURN_PLAYER1)? WIN : LOSE;
	else if (bb[SCORE] < SCORE_OFFSET) return (bbRoot[TURN] == TURN_PLAYER2)? WIN : LOSE;
	else return TIE;
}

/*function BB_getNonTerminalMoves(bb) { //Does not include win, loss, or ties
	var moves = bitScan(BB_getMoves(bb));
	var nonTerminal = [];
	for (var i = 0; i < moves.length; i++) {
		var kid = new Uint32Array(bb);
		var kidMoves = BB_getMoves(kid);
		if (!eq(kidMoves, EMPTY)) nonTerminal.push(moves[i]);
	}
	return nonTerminal;
}*/

//End struct BB