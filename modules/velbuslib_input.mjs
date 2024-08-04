
// ==================================================================================
// =                       functions VMB ENERGY COUNTER                             =
// ==================================================================================

import * as VMB from './velbuslib_constant.js'
import * as VMBgen from './velbuslib_generic.mjs'

/**
 * Function to create frame for changing relay's state on a module
 * @param {byte} adr address of module on the bus
 * @param {int} part part to change on module
 * @param {*} state  optionnal : true (on) or false (off), default false
 * @returns  Velbus frame ready to emit
 */
 function FrameRequestCounter(adr, part) {
	let trame = new Uint8Array(9);
	trame[0] = VMB.StartX;
	trame[1] = VMB.PrioLo;
	trame[2] = adr;
	trame[3] = 0x03;    // len
	trame[4] = 0xBD;    // Counter Status Request
	trame[5] = part;
	trame[6] = 0;
	trame[7] = VMBgen.CheckSum(trame, 0);
	trame[8] = VMB.EndX;
	return trame;
}

export {
    FrameRequestCounter
}