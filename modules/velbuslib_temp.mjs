// ==================================================================================
// =                       functions VMB TEMPERATURE                                =
// ==================================================================================

import * as VMB from './velbuslib_constant.js'

const FrameRequestTemp = (addr, part=1, interval=0) => {
	let trame = new Uint8Array(8);
	trame[0] = VMB.StartX;
	trame[1] = VMB.PrioLo;
	trame[2] = addr;
	trame[3] = 0x02;    // len 1, RTR off
	trame[4] = 0xE5;     // request Temp function
	trame[5] = interval;
	trame[6] = VMB.CheckSum(trame, 0);
	trame[7] = VMB.EndX;
	return trame;
}


export {
    FrameRequestTemp

}