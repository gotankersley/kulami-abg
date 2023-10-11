var PLAYER_HUMAN = 0;
var PLAYER_RANDOM = 1;
var PLAYER_HEURISTIC = 2;
var PLAYER_EM = 3;
var PLAYER_AB = 4;
var PLAYER_MC = 5;
var PLAYER_BB = 6;
var PLAYER_ALPHA = 7;


//Class Players 
function Players(playerType1, playerType2) {	
	//BB_initConstants();	
	this.player1 = (typeof(playerType1) != 'undefined')? playerType1 : PLAYER_HUMAN;
	this.player2 = (typeof(playerType2) != 'undefined')? playerType2 : PLAYER_HUMAN;	
}

Players.prototype.getCurrent = function(board) {
	if (board.turn == TURN_PLAYER1) return this.player1;
	else return this.player2;	
}

Players.prototype.getMove = function(board, onPlayed) {
	for (var r = 0; r < GRID_SIZE; r++) {
		for (var c = 0; c < GRID_SIZE; c++) {
			game.scoreMap[r][c] = '';
		}
	}
	var player = this.getCurrent(board);
	//Handle no-move, and one move
	var moves = board.getMoves();
	if (moves.length == 0) onPlayed({r:INVALID, c:INVALID});
	else if (moves.length == 1) onPlayed(moves[0]);
	
	//Async
	else if (player == PLAYER_BB) {
		
		MC.getMove(board, onPlayed);
	}
	
	//Sync
	else {
		var move;
		//Random
		if (player == PLAYER_RANDOM) move = this.getRandom(board);				
		
		//Heuristic
		else if (player == PLAYER_HEURISTIC) move = this.getHeuristic(board);
		
		//Native
		else if (player == PLAYER_AB) move = this.getNative(board, 'ab');		
		else if (player == PLAYER_MC) move = this.getNative(board, 'mc');		
		
		//EM
		else if (player == PLAYER_EM) move = this.getEm(board);	
		
		//AB
		else if (player == PLAYER_ALPHA) move = AB.getMove(board);
		
		else move = {r:INVALID, c:INVALID};
		onPlayed(move); //Callback
	}	
	
}

//Moves types for different players
Players.prototype.getEm = function (board) {
	var result = Module.ccall('getMove', 'number', [], []); 
	var moveR = result & 0xff;
	var moveC = (result & 0xff00) >> 8;
	return {r:moveR, c:moveC};
}

Players.prototype.getNative = function (board, engineType) {
    var move = {r: INVALID, c:INVALID};
	var url = '/ai?board=' + board.toString() + '&engine=' + engineType;
	$.ajax({
		url:url ,			 
		success: function(moveStr) {			
			if (moveStr == 0) {
				alert('no moves available');
			}
			else if (moveStr.length > 2) {
				alert('Invalid moveStr: ' + moveStr);
			}			
			else {				
				move.c = parseInt(-(ASCII_A - moveStr.charCodeAt(0)));
				move.r = parseInt(-(ASCII_0 - moveStr.charCodeAt(1)));								
			}
		},
		async: false
    });   
	return move;
}

Players.prototype.getRandom = function(board) {
	var moves = board.getMoves();	
	if (moves.length == 0) return {r: INVALID, c:INVALID};	
	else return moves[Math.floor(Math.random() * moves.length)];
}


Players.prototype.getHeuristic = function(board) {
	var moves = board.getMoves();
	var bestScore = INVALID;
	var bestMove;
	var curTurn = (board.turn == TURN_PLAYER1)? TURN_PLAYER1 : TURN_PLAYER2;
	for (var i = 0; i < moves.length; i++) {
		var tmpBoard = board.copy();
		tmpBoard.makeMove(moves[i].r, moves[i].c);
		var scores = tmpBoard.score();
		var score = (curTurn == TURN_PLAYER1)? scores.p1 : scores.p2;
		if (menu.showScoreMap) game.scoreMap[moves[i].r][moves[i].c] = score;			
		if (score > bestScore) {
			bestScore = score;
			bestMove = i;
		}		
	}
	
	return moves[bestMove];
}
//End class Players