importScripts('../lib/bit-lib.js');
importScripts('../core/constants.js');
importScripts('../core/bb.js');

self.onmessage = function(e) {
	var data = e.data;	
	
	BB_initConstants();
	var bbRoot = BB_new();
	var res = BB_fromKBN(bbRoot, data.kbn);
	
	if (!res.status) {
		console.log(res.msg);			
		self.close();
	}	
				
	var startTime = new Date().getTime();//performance.now();
	
	//Initialize scores for child boards
	var kids = [];
	var scores = [];
	var moves = bitScan(BB_getMoves(bbRoot));
	for (var i = 0; i < moves.length; i++) {	
		var kid = new Uint32Array(bbRoot);
		BB_makeMove(kid, moves[i]);
		var kidMoves = BB_getMoves(kid);
		if (!eq(kidMoves, EMPTY)) { //Only add non-terminal
			kids.push(kid);
			scores.push(0);
		}		
	}
	
	//Simulate until time runs out
	var i;
	for (i = 0; i < data.maxIterations; i++) {	
		for (var k = 0; k < kids.length; k++) {
			scores[k] -= BB_simulate(kids[k]);
		}
		var duration = new Date().getTime() - startTime;
		if (duration > data.maxTime) break;		
	}
	
	self.postMessage({iter:i, scores:scores, moves:moves, id:data.id});
	self.close();
}