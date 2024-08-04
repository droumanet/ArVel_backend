// ==================================================================================
// =                       GENERIC VELBUS FUNCTIONS                                 =
// ==================================================================================

import * as VMB from '../models/velbuslib_class.mjs'
import { EndX, PrioLo, StartX } from './velbuslib_constant.js';

function FrameRequestName (addr, part) {
	let trame = new Uint8Array(8);
	trame[0] = StartX;
	trame[1] = PrioLo;
	trame[2] = addr;
	trame[3] = 0x02;    // len 1, RTR off
	trame[4] = 0xEF;     // request name function
	trame[5] = part;
	trame[6] = CheckSum(trame, 0);
	trame[7] = EndX;
	return trame;
}

/**
 * scanModule Create a frame to force module to answer
 * @param {*} adr Address of module
 * @returns Velbus frame ready to emit
 */
 function FrameModuleScan(adr) {
	let trame = new Uint8Array(6);
	trame[0] = StartX;
	trame[1] = PrioLo;
	trame[2] = adr;
	trame[3] = 0x40;    // len 0, RTR on
	trame[4] = CheckSum(trame, 0);
	trame[5] = EndX;
	return trame;
}

/**
 * synchroTime Create a frame able to synchronize time on Velbus modules
  * @param {byte} day value between 0 (monday) and 6 (sunday). Use VelbusDay(d) rather d.getDay() because Velbus offset
  * @param {byte} hour value as 24h format
  * @param {byte} minuts value between 0 and 59
  * @returns Velbus frame ready to emit
  * Nota : if one transmitted value is wrong, then the current system date (server) replace them (be worry with timezone)
 */
 function FrameTransmitTime(day, hour, minuts) {
	let trame = new Uint8Array(9);
	trame[0] = StartX;
	trame[1] = PrioLo;
	trame[2] = 0x00;
	trame[3] = 0x04;    // len 4, RTR off
	trame[4] = 0xD8     // synchronize time function
	if (day > -1 && day < 7 && hour > -1 && hour < 24 && minuts > -1 && minuts < 60) {
		trame[5] = day
		trame[6] = hour
		trame[7] = minuts
	} else {
		let d = new Date()
		trame[5] = VelbusDay(d)
		trame[6] = d.getHours()
		trame[7] = d.getMinutes()
	}
	trame[8] = CheckSum(trame, 0);
	trame[9] = EndX;
	return trame
}

/**
 * Convert JS day to Velbus day (offset problem)
 * @param {date} d date as new Date()
 * @returns 0 for monday (d.getDay() would be 1) to 6 for sunday 
 */
 function VelbusDay(d) {
	if (d.getDay() == 0) return 6
	else return d.getDay() - 1
}

/**
 * Request Real Time Clock status
 * @returns Velbus frame ready to emit
 */
 function FrameRequestTime() {
	let trame = new Uint8Array(5);
	trame[0] = StartX;
	trame[1] = PrioLo;
	trame[2] = 0x00;
	trame[3] = 0x01;    // len 1, RTR off
	trame[4] = 0xD7;    // request time function
	trame[5] = CheckSum(trame, 0);
	trame[6] = EndX;
	return trame;
}

/**
 * Checksum is able to calculate the frame checksum
 * @param {Buffer} frame a Velbus frame from 0F xxxxx to 04
 * @param {number} full number removed from frame length (default=1)
 * @returns {number} sum all bytes then XOR FF + 1
 */
 const CheckSum = (frame, full = 1) => {
	let crc = 0;
	for (let i = 0; i < frame.length - 1 - full; i++) {
		crc = crc + (frame[i] & 0xFF);
	}
	crc = crc ^ 0xFF;
	crc = crc + 1;
	crc = crc & 0xFF;
	return crc;
}

export {FrameModuleScan, FrameRequestName, FrameTransmitTime, FrameRequestTime, CheckSum}