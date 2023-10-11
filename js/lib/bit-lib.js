/* Note: This uses Javascript typed arrays to emulate 64 bit integers, and to do bitwise operations with them */
var MASK_TO_BIT = {1:0,2:1,4:2,8:3,16:4,32:5,64:6,128:7,256:8,512:9,1024:10,2048:11,4096:12,8192:13,16384:14,32768:15,65536:16,131072:17,262144:18,524288:19,1048576:20,2097152:21,4194304:22,8388608:23,16777216:24,33554432:25,67108864:26,134217728:27,268435456:28,536870912:29,1073741824:30,2147483648:31};

function set(bb, off, val) {
	bb[off] = val[0];
	bb[off+1] = val[1];
}
function get(bb, off) {
	var n = new Uint32Array([
		bb[off],
		bb[off+1]
	]);
	return n;
}

function eq(x, y) {
	if (x[0] == y[0] && x[1] == y[1]) return true;
	else return false;
}

function and(x, y) { 
	var n = new Uint32Array([
		x[0] & y[0],
		x[1] & y[1]
	]);
	return n;
}

function or(x, y) { 
	var n = new Uint32Array([
		x[0] | y[0],
		x[1] | y[1]
	]);
	return n;
}

function xor(x, y) { 
	var n = new Uint32Array([
		x[0] ^ y[0],
		x[1] ^ y[1]
	]);
	return n;
}

function xorEq(x, y) { // ^=	
	x[0] ^= y[0];
	x[1] ^= y[1];
}

function xorEqOff(bb, off, y) {
	bb[off] ^= y[0];
	bb[off+1] ^= y[1];
}

function bitCount(x) {
	var lo = x[0];
	lo = lo - ((lo >>> 1) & 0x55555555);
	lo = (lo & 0x33333333) + ((lo >>> 2) & 0x33333333);
	var loCount = ((((lo + (lo >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24);
	
	var hi = x[1];
	hi = hi - ((hi >>> 1) & 0x55555555);
	hi = (hi & 0x33333333) + ((hi >>> 2) & 0x33333333);
	return loCount + ((((hi + (hi >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24);	
}

function bitScan(x){
	var bits = [];
	var lo = x[0];
	while (lo) {
		var minBit = lo & -lo;
		bits.push(MASK_TO_BIT[minBit >>> 0]);
		lo &= lo-1;
	}
	
	var hi = x[1];
	while (hi) {
		var minBit = hi & -hi;
		bits.push(MASK_TO_BIT[minBit >>> 0] + 32);
		hi &= hi-1;
	}	
	return bits;
}
