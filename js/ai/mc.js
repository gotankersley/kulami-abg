//Namespace MC
var MC = new function() {
	
	var MAX_ITERATIONS = 100000;
	var MAX_TIME_MS = 5000;
	var INFINITY = 100000;
	var MAX_THREADS = 8;
		
	this.finishedCount = 0;
	this.onPlayed;
	this.scores = [];
	this.bb;
	//this.iter;
	//Multi-threaded via web-workers
	this.getMove = function(board, onPlayed) {
		//this.iter = 0;
		this.finishedCount = 0;
		this.scores = [];
		
		//Init bitboard
		BB_initConstants();
		this.bb = BB_new();
		var res = BB_fromKBN(this.bb, board.toString());
		if (!res.status) {
			alert(res.msg);
			onPlayed({r:INVALID, c:INVALID});
		}		
		
		//Check for winning move
		var winMove = BB_getWinMove(this.bb);
		if (winMove !== false) {			
			onPlayed({r:ROW[winMove], c:COL[winMove]});
			return;
		}
				
		
		//Setup workers
		this.onPlayed = onPlayed;
		var workers = [];
		for (var i = 0; i < MAX_THREADS; i++) {
			
			var worker = new Worker('js/ai/mc-worker.js');
			worker.onmessage = onWorkerFinished;
			workers.push(worker);
			var data = {id: i, kbn:board.toString(), maxIterations:MAX_ITERATIONS, maxTime:MAX_TIME_MS};			
			worker.postMessage(data); //Start thread
		}				
	}
	
	var onWorkerFinished = function(e) {
		var data = e.data;		
		//MC.iter += data.iter;
		var kidScores = data.scores;		
		var kidCount = kidScores.length;
		//First
		if (MC.finishedCount == 0) {
			for (var i = 0; i < kidCount; i++) {
				MC.scores.push(0);
			}
		}
		for (var i = 0; i < kidCount; i++) {
			MC.scores[i] += kidScores[i]; //Combine each worker's scores
			
		}
		MC.finishedCount++;
		
		//Last worker finished
		if (MC.finishedCount == MAX_THREADS) {
			//console.log('Iterations', MC.iter);
			//console.log(MC.scores);
			//Get best
			var bestScore = -INFINITY;
			var bestMove;
			for (var k = 0; k < kidCount; k++) {
				if (menu.showScoreMap) {					
					var r = ROW[data.moves[k]];
					var c = COL[data.moves[k]];
					game.scoreMap[r][c] = MC.scores[k];
				}
				if (MC.scores[k] > bestScore) {
					bestScore = MC.scores[k];
					bestMove = k;
				}
			}
			
			//Play chosen move
			if (bestScore != -INFINITY) { 
				var pos = data.moves[bestMove];				
				MC.onPlayed({r:ROW[pos], c:COL[pos]});				
			}
			else { //All moves lead to loss			
				var pos = BB_getFirstAvailMove(MC.bb);
				MC.onPlayed({r:ROW[pos], c:COL[pos]});
			}
			
		}

	}
			
}
//End namespace MC