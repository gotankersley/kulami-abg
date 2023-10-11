var AB = new function() {
	var MAX_DEPTH = 10;
	var INFINITY = 100000;
	
	var bestMoveAtDepth = [];
	var compare = function(a, b) {
		if (a[TURN] == TURN_PLAYER1) return a[SCORE] - b[SCORE];
		else return b[SCORE] - a[SCORE];
	}	
	
	this.getMove = function(board) {
		
		//Init bitboard		
		BB_initConstants();	
		bb = BB_new();
		var res = BB_fromKBN(bb, board.toString());
		var moveCount = bitCount(or(bb, get(bb, P2)));		
		if (moveCount == 0) MAX_DEPTH = 8;		
		else if (moveCount <= 4) MAX_DEPTH = 10;
		else if (moveCount <= 6) MAX_DEPTH = 12;
		else if (moveCount <= 20) MAX_DEPTH = 13;
		else if (moveCount <= 30) MAX_DEPTH = 14;
		else if (moveCount <= 32) MAX_DEPTH = 15;
		else if (moveCount <= 34) MAX_DEPTH = 16;
		else if (moveCount <= 36) MAX_DEPTH = 18;
		else if (moveCount <= 38) MAX_DEPTH = 20;		
		else MAX_DEPTH = 25;
		
		//Alpha beta driver
		bestMoveAtDepth = new Array(MAX_DEPTH);
		var bestScore = negamax(bb, -INFINITY, INFINITY, 0);		
		var bestMove = bestMoveAtDepth[0];

		if (bestScore == -INFINITY) {
			var pos = BB_getFirstAvailMove(bb);
			return {r:ROW[pos], c:COL[pos]};
		}
		else return {r:ROW[bestMove], c:COL[bestMove]};
	}
	
	var negamax = function(bb, alpha, beta, depth) {
		
		//Anchor
		if (depth >= MAX_DEPTH) { //Max depth
			if (bb[TURN] == TURN_PLAYER1) return bb[SCORE] - SCORE_OFFSET;
			else return -(bb[SCORE] - SCORE_OFFSET); //Convert from global score to minmax score
		}
		
		var moveMask = BB_getMoves(bb);
				
		if (eq(moveMask, EMPTY)) { //No moves - Game over - return winner
			if (bb[SCORE] == SCORE_OFFSET) return 0;
			else if (bb[TURN] == TURN_PLAYER1) return (bb[SCORE] > SCORE_OFFSET)? INFINITY : -INFINITY;
			else return (bb[SCORE] < SCORE_OFFSET)? INFINITY : -INFINITY;
		}
		
		//Move ordering - to help AB achieve its full potential 
		var moves = bitScan(moveMask);
		var kids = [];		
		for (var i = 0; i < moves.length; i++) {
			var kidBoard = new Uint32Array(bb);
			BB_makeMove(kidBoard, moves[i]);
			kids.push(kidBoard);			
		}
		
		kids.sort(compare);		
		
		//Loop through sorted moves
		bestMoveAtDepth[depth] = INVALID;	
		var bestScore = -INFINITY;
		
		for (var i = 0; i < kids.length; i++) {		
			var kid = kids[i];
			//Recurse
			var recursedScore = negamax(kid, -beta, -Math.max(alpha, bestScore), depth+1);
			var currentScore = -recursedScore;
			if (menu.showScoreMap && depth == 0) { //Score map
				var p = (kid[TURN] == TURN_PLAYER1)? kid[LAST2] : kid[LAST1];
				game.scoreMap[ROW[p]][COL[p]] = currentScore; 			
			}
			if (currentScore > bestScore) {
				bestScore = currentScore;
				bestMoveAtDepth[depth] = (kid[TURN] == TURN_PLAYER1)? kid[LAST2] : kid[LAST1];

				if (bestScore >= beta) return bestScore; //AB cutoff			
			}					
		}
		return bestScore;	
	}
	
}