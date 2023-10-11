//Init
var GRID_SIZE = 10;
var BOARD_SIZE = 64;
var TILES_SIZE = 17;
var MODE_TILE = 0;
var MODE_PIN = 1;
var BITS_PER_BYTE = 4;

var curTileColor = 0;
var curMode = MODE_TILE;

//var POS = new Array(GRID_SIZE);
//var ROW = new Array(BOARD_SIZE);
//var COL = new Array(BOARD_SIZE);
var TILES = new Array(TILES_SIZE);

var POS = [
	[0,1,2, 3, 4,5, 6, 7, 8, -1],
	[8,9,10,11, 12, 13, 14, 15, 13,-1],
	[16,17,18,19,20,21,22,23,-1,-1],
	[24,25,26,27,28,29,30,31,-1,-1],
	[32,33,34,35,36,37,38,39,-1,-1],
	[40,41,42,43,44,45,46,47,-1,-1],
	[48,49,50,51,52,53,54,55,-1,-1],
	[56,57,58,59,60,61,62,63,-1,-1],
	[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
	[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1]
];
var ROW = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7];
var COL = [0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7];

$(function() {    	
	//for (var r = 0; r < GRID_SIZE; r++) {		
	//	POS[r] = new Array(GRID_SIZE);		
	//}
    $('#board td').click(onColClicked);
    $('body').keyup(onKeyUp); 
    $('#curColor input').change(function() {
		changeColor($(this).val());
	});
	//calculate();
});


function changeColor(newColor) {
	if (newColor < 0) newColor = 16;
	else if (newColor >= 17) newColor = 0;
	curTileColor = newColor;
	$('#curColor input').val(newColor);
}

function getPos() {
	console.log('var POS = [');
	for (var i = 0; i < GRID_SIZE; i++) {
		console.log('[' + POS[i][0] + ',' + POS[i][1] + ',' + POS[i][2] + ',' + POS[i][3] + ',' + POS[i][4] + ',' + POS[i][5] + ',' + POS[i][6] + ',' + POS[i][7]  + ',' + POS[i][8] + ',' + POS[i][9] + ']');
	}	
	console.log(']');
}



function padStr(str, length) {
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}

function setChar(str, index, val) {
    return str.substr(0, index) + val + str.substr(index + 1);
}


function toBin(n) {
	//Drop the initial 0x
	n = n.substr(2);
	
	//Convert to bin 1 hex char at a time
	var bitStr = '';
	for (var i = 0; i < n.length; i++) {
		var hexChar = parseInt(n.charAt(i),16);
		bitStr += padStr(hexChar.toString(2), BITS_PER_BYTE);
	}
	
	return bitStr;
}

function toHex(bitStr, length) {
    //Convert to hex 4 bits at a time	
    var hex = '';
    for (var i = 0; i < bitStr.length; i+= BITS_PER_BYTE) {
        var bits = parseInt(bitStr.substr(i, BITS_PER_BYTE), 2);
        hex += bits.toString(16);        
    }    
	var hexStr = '0x';	
	for (var i = 0; i < hex.length; i++) {
		if (hex.charAt(i) != 0) return '0x' + hex.substr(i);
	}
	
	return '0x' + hex;
}

function changeMode() {
	if (curMode == MODE_TILE) curMode = MODE_PIN;
	else curMode = MODE_TILE;
}

function setTiles() {
	var tilesStr = $('#outTiles').val();
	var t = 0; 
	var curTile = '';
	
	for (var i = 0; i < tilesStr.length; i++) {					
		if (tilesStr.charAt(i) == '\n') {
			TILES[t] = curTile;
			var bitStr = toBin(curTile);
			console.log(bitStr);
			for (var p = 0; p < BOARD_SIZE; p++) {
				if (bitStr.charAt(p) == '1') {
					var r = ROW[p];
					var c = COL[p];
					var sel = 'tr[data-row="' + r + '"] td[data-col="' + c + '"]';
					console.log(sel);
					$(sel).addClass('tile' + t);
				}
			}
			break;
			curTile = '';
			t++;
			if (t >= TILES_SIZE) break;
		}
		else curTile += tilesStr[i];					
		
	}	
}

function calculate() {  
	
	for (var t = 0; t < TILES_SIZE; t++) {
		TILES[t] = padStr('', BOARD_SIZE);		
	}
	var p = 0;
	var t = 0;	
	var pinStr = padStr('', BOARD_SIZE);
	//Get the position mapping
	for(var r = 0; r < GRID_SIZE; r++) {
		for (var c = 0; c < GRID_SIZE; c++) {
			var sel = 'tr[data-row="' + r + '"] td[data-col="' + c + '"]';	
			var className = $(sel).attr('class');
			if (className.indexOf('tile') >= 0) {
				POS[r][c] = p;		
				ROW[p] = r;
				COL[p] = c;
				t = parseInt(className.replace('tile', ''));
				TILES[t] = setChar(TILES[t], p, 1); 
				if ($(sel).children('.pin').hasClass('pinOn')) pinStr = setChar(pinStr, p, 1);
				p++;			
			}		
		}
	}
	
	//Output each of the tile masks
	$('#outTiles').html('');
	for (var t = 0; t < TILES_SIZE; t++) {
		$('#outTiles').append(toHex(TILES[t], BOARD_SIZE) + '\n');
	}
		
	$('#outBin').html(pinStr);
    $('#outHex').html(toHex(pinStr, BOARD_SIZE));
}

//Event callbacks
function onKeyUp(e) {
	//alert(e.keyCode);
    if (e.keyCode == 13) setBoard(); //Enter  
	else if (e.keyCode == 9) { //Tab
		changeColor(curTileColor - 1); 
		calculate();
	}
	else if (e.keyCode == 16) { //Shift
		changeColor(curTileColor + 1); 
		calculate();
	}
	else if (e.keyCode == 18) changeMode(); //Alt
	
	
}

function onColClicked(e) {
	if (curMode == MODE_TILE) {
		var tile = 'tile' + curTileColor;
		var col = $(this);		
		if (col.attr('class').indexOf('tile') >= 0) col.attr('class', '');
		else col.addClass(tile);
	}
	else { //MODE_PIN
		var col = $(this).children('.pin');		
		if (col.hasClass('pinOn')) col.removeClass('pinOn');
		else col.addClass('pinOn');
	}
	calculate();
	
}