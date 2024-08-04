/**
 * @author David ROUMANET <golfy@free.fr>
 * @description VELBUS Library to use with Velbus NodeJS projects
 * @version 1.0
 * @license CommonCreative BY.
 * information from https://github.com/velbus/moduleprotocol
 */

// [ ] Etat Relais
// [ ] Fonctions relais
// [ ] Liste bouton
// [ ] Appui bouton
// [ ] Etat dimmer
// [ ] Fonctions dimmer
// [ ] Etat volet
// [x] Etat température


/* ====================================================================================================================
	Velbus frame Format 0F (FB|F8) @@ LL ( FT B2 ... Bn) ## 04 
  --------------------------------------------------------------------------------------------------------------------
 |    0    |   1  |  2   |    3    |  4   |   5   |   6   |   7   |   8   |  ...  |   10  |   11  |     x    |   x+1  |
  --------------------------------------------------------------------------------------------------------------------
 | VMBStrt | Prio | Addr | RTR/Len | Func | Byte2 | Byte3 | Byte4 | Byte5 |  ...  | Byte7 | Byte8 | Checksum | VMBEnd |
  --------------------------------------------------------------------------------------------------------------------
  (1) Len = RTR/Len & 0x0F
  (2) RTR = 1 only for Module Type Request (reception). RTR is Remote Transmit Request
 =================================================================================================================== */

import EventEmitter from 'events';
import { VMBmodule, VMBsubmodule } from '../models/velbuslib_class.mjs';
import * as VMB from './velbuslib_constant.js'
import { FrameModuleScan, FrameRequestName, FrameTransmitTime, FrameRequestTime, CheckSum } from './velbuslib_generic.mjs';
import { FrameRequestMove, FrameRequestStop, FrameHello } from './velbuslib_blind.mjs'
import { relaySet, relayTimer } from './velbuslib_relay.mjs';
import { FrameRequestTemp } from './velbuslib_temp.mjs';
import { FrameRequestCounter } from './velbuslib_input.mjs';

// What is for this emitter?
const VMBEmitter = new EventEmitter()

// General list for event
let moduleList = new Map()		// class VMBmodule
let subModuleList = new Map()	// class VMBsubmodule (child of a VMBmodule)
let VMBNameStatus = new Map()
let VMBTempStatus = new Map()
let VMBEnergyStatus = new Map()


// ============================================================================================================
// =                                    Functions for internal use                                            =
// ============================================================================================================

// Manipulation of subModuleList
function setSubModuleList(addresspart, module) {
	subModuleList.set(addresspart, module)
}
function getSubModuleList(addresspart) {
	return subModuleList.get(addresspart)
}
function fullSubModuleList() {
	console.log("subModuleList renvoie de liste complète", subModuleList)
	// moduleList is ok (contains main modules and description)
	return subModuleList
}
function lenSubModuleList() {
	console.log("subModuleList longueur", subModuleList.size)
	return subModuleList.size
}


// #region FRAME functions
/** ---------------------------------------------------------------------------------------------
 * This function split messages that are in the same frame. Example 0F...msg1...04 / 0F...msg2...04
 * @param {*} data RAW frame that could contains multiple messages
 * @returns table
 * --------------------------------------------------------------------------------------------*/
const Cut = (data) => {
	let table = [];
	let longueur, VMBSize;
	let i = 0;
	// search for 0x0F header, then look at size byte and check if end byte is in good place
	while (i < data.length) {
		if (data[i] == 0x0F && i + 3 < data.length) {
			longueur = data[i + 3];
			VMBSize = longueur + 3 + 1 + 1;     // message length + offset 3 + checksum + end byte
			if (data[i + VMBSize] == 0x04) {
				// push de i à VMBSize dans tableau
				// console.log("trame OK à position ",i, " longueur ", VMBSize);
				table.push(data.slice(i, i + VMBSize + 1));     // slice utilise position début et position fin
				i = i + VMBSize;
			} else {
				// console.log("octet à longueur VMBSize : ",data[i+VMBSize])
			}
		}
		i++;
	}
	return table;
}


/** --------------------------------------------------------------------------------------------
 * toHexa convert a buffer into a table containing hexa code (2 chars) for each byte
 * @param {Array} donnees 
 * @returns Hexadecimal string
 * -------------------------------------------------------------------------------------------*/
function toHexa(donnees) {
	if (donnees !== undefined) {
		let c = '';
		let dhex = [];
		for (const donnee of donnees) {
			c = donnee.toString(16).toUpperCase();
			if (c.length < 2) c = '0' + c;
			dhex.push(c);
		}
		return dhex;
	} else { return "" }
}


/** ------------------------------------------------------------------------------------------
 * toButtons convert a binary value into an array with active bit (ex. 0b00110 => [2,4])
 * @param {*} valeur 
 * @param {*} nb 
 * @returns array of active button's number
 * -----------------------------------------------------------------------------------------*/
function toButtons(valeur, nb) {
	let response = [];
	let x = 1;
	for (let t = 1; t < (nb + 1); t++) {
		if (valeur & x) {
			response.push(t);
		}
		x = x << 1
	}
	return response;
}


/** -----------------------------------------------------------------------------------------
 * Convert Binary digit to human part number (0b0100 => 3)
 * @param {*} binValue 
 * @param {*} offset 
 * @returns human readable part
 * ---------------------------------------------------------------------------------------*/
function Bin2Part(binValue, offset = 0) {
	for (let t = 1; t < 9; t++) {
		if (2 ** (t - 1) == binValue) return t + offset
	}
	return offset
}


/** ----------------------------------------------------------------------------------------
 * Convert humar part number to binary element (5 => 0b10000)
 * @param {*} partValue 
 * @returns binary number of partValue
 * ---------------------------------------------------------------------------------------*/
function Part2Bin(partValue) {
	return 2 ** (partValue - 1)
}

function localModuleName(k) {
	let myModule = VMBNameStatus.get(k)
	if (myModule == undefined) return "****"
	return myModule.name
}

function resume() {
	return moduleList;
}

/**
 * This function try to reassemble each frame to create a full name for submodule
 * @param {*} element Frame received (should be F0, F1 or F2 for name)
 */
function checkName(element) {
	let key = element[2] + "-" + Bin2Part(element[5])
	let fctVelbus = element[4]
	let myModule = VMBNameStatus.get(key)
	// console.log("🔁 VMBNameStatus.get(" + key + ")=", myModule) // WIP
	let max = 6
	if (fctVelbus == 0xF2) max = 4

	if (myModule == undefined) {
		VMBNameStatus.set(key, { "address": element[2], "name": "", "n1": "", "n2": "", "n3": "", "flag": 0 })
		myModule = VMBNameStatus.get(key)
	}

	let n = new Array()
	let idx = fctVelbus - 0xF0
	let flag = 2 ** idx
	let f = myModule.flag

	n[0] = myModule.n1
	n[1] = myModule.n2
	n[2] = myModule.n3
	n[idx] = ""

	//FIXME subModuleList without name
	// Filling name char by char (n1 et n2 => max=6, n3 => max=4 as 15 char)
	for (let t = 0; t < max; t++) {
		if (element[6 + t] != 0xFF) {
			n[idx] = n[idx] + String.fromCharCode(element[6 + t])
		}
	}

	// in case name is complete (flag = 100 | 010 | 001)
	if ((f | flag) == 0b111) {
		let m = subModuleList.get(key)
		if (m != undefined) {
			m.name = n[0] + n[1] + n[2]
			console.log("🏷️ ARVEL - VELBUS submodule " + key + " is named " + m.name)
		}
	}
	VMBNameStatus.set(key, { "address": element[2], "name": n[0] + n[1] + n[2], "n1": n[0], "n2": n[1], "n3": n[2], "flag": flag | f })
}


/** ---------------------------------------------------------------------------------------------
 * Check if a module address is already in the list : if yes, it check if it still the same, else
 * it create it, using some constants. 
 * @param {*} VMBmessage message from Velbus bus.
 * --------------------------------------------------------------------------------------------*/
function checkModule(VMBmessage) {
	let adrVelbus = VMBmessage[2]
	let fctVelbus = Number(VMBmessage[4])
	let typVelbus = VMBmessage[5]

	if (moduleList.has(adrVelbus)) {
		// module exist, check if it still same type ?
		if (fctVelbus == 0xFF) {
			let newModule = moduleList.get(adrVelbus)
			if (!fctVelbus == newModule.modType) {
				newModule.modType = typVelbus
				newModule.partNumber = VMB.getPartFromCode(newModule.modType)
			}
			moduleList.set(adrVelbus, newModule)
		}

	} else {
		// module doesn't exist : Create VMBModule
		let newModule = new VMBmodule(adrVelbus, 0x00)
		let key, subModTemp
		if (fctVelbus == 0xFF) {
			newModule.modType = typVelbus
			console.log("CREATE", newModule.modType)
			newModule.partNumber = VMB.getPartFromCode(newModule.modType)	// Fixed 2024-04-07
			moduleList.set(adrVelbus, newModule)							// Fixed 2024-04-12
			// Création des sous-modules
			for (let i=0; i<newModule.partNumber; i++) {
				key=adrVelbus+"-"+(i+1)
				subModTemp = new VMBsubmodule(adrVelbus, i+1, key, "", {})
				setSubModuleList(key, subModTemp)
				console.log("  |_ CREATE", key)
			}
		}
	}

}


/** ----------------------------------------------------------------------------------------------
 * Show a detailled information on a message
 * @param {*} element 
 * @returns texte contening information like temperature, status, energy, etc.
 * ---------------------------------------------------------------------------------------------*/
function analyze2Texte(element) {
	let fctVelbus = Number(element[4])
	let adrVelbus = element[2]
	let texte = "@:" + adrVelbus.toString(16) + " Fct:" + fctVelbus.toString(16).toUpperCase() + "(" + VMB.getFunctionName(fctVelbus) + ") ► "
	let buttonOn = ""
	let keyModule = ""

	switch (fctVelbus) {
		case 0x00:
			buttonOn = toButtons(element[5], 8)
			texte += " [" + buttonOn + "]"
			break;
		case 0xBE: {
			// Read VMB7IN counter
			let division = (element[5] >> 2) * 100;
			let part = (element[5] & 0x3);

			// part is 0 to 3 but keyModule is 1 to 4
			keyModule = element[2] + "-" + (part + 1)
			let compteur = (element[6] * 0x1000000 + element[7] * 0x10000 + element[8] * 0x100 + element[9]) / division;
			compteur = Math.round(compteur * 1000) / 1000;
			let conso = 0;
			if (element[10] != 0xFF && element[11] != 0xFF) {
				conso = Math.round((1000 * 1000 * 3600 / (element[10] * 256 + element[11])) / division * 10) / 10;
			}
			texte += localModuleName(keyModule) + " " + compteur + " KW, (Inst. :" + conso + " W) ";
			break;
		}
		case 0xE6:
			keyModule = adrVelbus + "-1"
			texte += localModuleName(keyModule) + " " + TempCurrentCalculation(element) + "°C";
			break;
		case 0xEA:
			texte += localModuleName(keyModule) + " " + Number(element[8]) / 2 + "°C";
			break;
		case 0xF0:
		case 0xF1:
		case 0xF2: {
			checkName(element)
			let key = adrVelbus + "-" + Bin2Part(element[5])
			texte += " Transmit it name '" + VMBNameStatus.get(key).name + "'"
			break
		}
		case 0xFB:
			buttonOn = toButtons(element[7], 4);
			texte += " [" + buttonOn + "]"
			break
		case 0xFF: { // Module Type Transmit
			let moduleType = element[5]
			console.log(adrVelbus, "Detected module type ", moduleType)
			// WIP checkList(Address, )
			break
		}
		default:
			break
	}
	return texte
}



// ============================================================================================================
// =                                          functions VMB ALL                                               =
// ============================================================================================================

/** --------------------------------------------------------------------------------------------------
 * This method write a Velbus frame to the TCP connexion
 * @param {Buffer} req RAW format Velbus frame
 * @param {*} res not used
 * -------------------------------------------------------------------------------------------------*/
async function VMBWrite(req) {
	console.log('\x1b[32m', "VelbusLib writing", '\x1b[0m', toHexa(req).join())
	VelbusConnexion.write(req);
	await sleep(10)
}


/** --------------------------------------------------------------------------------------------------
 * Synchronize Velbus with host. If day/hour/minute are wrong (ie. 99) then use system date
 * @param {*} day if any field is wrong, function will use system date
 * @param {*} hour 
 * @param {*} minute 
 * -------------------------------------------------------------------------------------------------*/
function VMBSetTime(day, hour, minute) {
	VMBWrite(FrameTransmitTime(day, hour, minute))
}


/** --------------------------------------------------------------------------------------------------
 * Send a scan request for one or all module
 * @param {*} adrModule could be 0 (all) or any address (1-255)
 * -------------------------------------------------------------------------------------------------*/
function VMBscanAll(adrModule = 0) {
	if (adrModule == 0) {
		for (let t = 0; t < 256; t++) {
			VMBWrite(FrameModuleScan(t))
		}
	} else {
		VMBWrite(FrameModuleScan(adrModule))
	}

}

// #endregion

// #region LISTENER Functions
/* ============================================================================================================
   =                                 functions with Listener                                                  =
   ============================================================================================================
   Basic calculation function are named by Type/Value/Calculation
   Listener are named as 'survey'/Type/'Value'
   Function that return a value are named 'VMBRequest'/Type and read a Map
   ===========================================================================================================*/

function EnergyIndexCalculation(msg) {
	let pulse = (msg.RAW[5] >> 2) * 100
	let rawcounter = msg.RAW[6] * 2 ** 24 + msg.RAW[7] * 2 ** 16 + msg.RAW[8] * 2 ** 8 + msg.RAW[9]
	return Math.round(rawcounter / pulse * 1000) / 1000;
}
function EnergyPowerCalculation(msg) {
	let power = 0
	let pulse = (msg.RAW[5] >> 2) * 100
	if (msg.RAW[10] != 0xFF && msg.RAW[11] != 0xFF) {
		power = Math.round((1000 * 1000 * 3600 / (msg.RAW[10] * 256 + msg.RAW[11])) / pulse * 10) / 10;
	}
	return power
}

// Function that calculate full digit for temperature. PartA is main part, partB is low digit part
function FineTempCalculation(partA, partB) {
	return partA / 2 - Math.round(((4 - partB) >> 5) * 0.0625 * 10) / 10
}
// Function to calculate temperature with high precision
function TempCurrentCalculation(msg) {
	// E6 (Transmit Temp) or EA (Sensor status)
	switch (msg[4]) {
		case 0xE6:
			return FineTempCalculation(msg[5], msg[6])
		case 0xEA:
			return FineTempCalculation(msg[8], msg[9])
		default:
			console.error("ERROR with TempCalculation", msg)
			return undefined
	}
}
function TempMinCalculation(msg) {
	// E6 (Transmit Temp)
	if (msg[4] == 0xE6) {
		return FineTempCalculation(msg[7], msg[8])
	} else {
		return undefined
	}
}
function TempMaxCalculation(msg) {
	// E6 (Transmit Temp)
	if (msg[4] == 0xE6) {
		return FineTempCalculation(msg[9], msg[10])
	} else {
		return undefined
	}
}

/**
 * This function actualize element in the collection 'moduleList'
 * @param {String} key Addr-part of module (ex: 7A-1)
 * @param {Object} value specific status information (temp, counter, etc.)
 */
function UpdateModule(key, value) {
	let m = moduleList.get(key)
	if (m != undefined) {
		m.status = value
		moduleList.set(key, m)
		return true
	} else {
		// unexistant module
		return false
	}
}


// Function to wait before reading values (async problem)
async function sleep(timeout) {
	await new Promise(r => setTimeout(r, timeout));
}

/** 🌡️ GESTION TEMPERATURE
 *  This function use an emitter to receive specific message, then analyze and update module status
 */
function surveyTempStatus() {
	VMBEmitter.on("TempStatus", (msg) => {
		if (msg.RAW[4] == 0xE6) {
			let currentT = TempCurrentCalculation(msg.RAW)
			let minT = TempMinCalculation(msg.RAW)
			let maxT = TempMaxCalculation(msg.RAW)
			let key = msg.RAW[2] + "-1"
			let status = { "current": currentT, "min": minT, "max": maxT, "timestamp": Date.now() }
			// WIP : ajout de renseignements manquants dans les sous-modules
			// ajout pour gestion avec subModuleList
			let subModTemp = subModuleList.get(key)
			if (subModTemp) {
				subModTemp.status = status
				if (subModTemp.name == "") {
					// if it has no name, ask it
					VMBWrite(FrameRequestName(msg.RAW[2], 1))
				}
				if (subModTemp.fct == "") {
					subModTemp.fct = "temp"
				}
			}
		}
	})
}

// 🌡️ GESTION TEMPERATURE
async function VMBRequestTemp(adr, part) {
	let trame = FrameRequestTemp(adr, part);
	VMBWrite(trame);
	await sleep(200);
	let result = VMBTempStatus.get(adr + "-" + part)
	if (result != undefined) return result;
	return { "currentT": 1000, "min": 1000, "max": 1000, "timestamp": Date.now() };

}

// 
/** ☢️ GESTION ENERGIE
 *  This function use an emitter to receive specific message, then analyze and update module status
 */
function surveyEnergyStatus() {
	VMBEmitter.on("EnergyStatus", (msg) => {
		if (msg.RAW[4] == 0xBE) {
			let rawcounter = EnergyIndexCalculation(msg)
			let power = EnergyPowerCalculation(msg)
			let addr = msg.RAW[2]
			let part = (msg.RAW[5] & 3) + 1
			let key = addr + "-" + part
			let status = { "index": rawcounter, "power": power, "timestamp": Date.now() }

			// ajout pour gestion avec subModuleList
			let subModTemp = subModuleList.get(key)
			if (subModTemp) {
				subModTemp.status = status
				if (subModTemp.name == "") {
					console.log("MODULE Without name : ", key, subModTemp.name) // TODO Remove this
					// if it has no name, ask it
					VMBWrite(FrameRequestName(msg.RAW[2], 1))
				}
				if (subModTemp.fct == "") {
					subModTemp.fct = "energy"
				}
			}
			// Fin ajout
			/*
			VMBEnergyStatus.set(key, status)
			UpdateModule(key, status)

			// Seems we have found a new module (undefined) : send a request for it name
			if (VMBNameStatus.get(key) == undefined) {
				VMBWrite(FrameRequestName(msg.RAW[2], Part2Bin(part)))
				moduleList.set(key, new VMBsubmodule(addr, part, key, "energy", status))
			}
			*/
		}
	})
}

async function VMBRequestEnergy(adr, part) {
	if (part < 5) {
		// Send request to a specific part
		let trame = FrameRequestCounter(adr, Part2Bin(part)); // need to change 1 => 1, 2 => 2, 3 => 4 and 4 => 8
		VMBWrite(trame);
		await sleep(200); // VMBEmitter isn't synchronous, need to wait few milliseconds to be sure answer is back
		// Received answer
		// let result = VMBEnergyStatus.get(adr + "-" + part)
		let result = subModuleList.get(adr+"-"+part)
		// WIP récupérer les valeurs dans subModuleList
		if (result) return result.status;
		return { "power": undefined, "index": undefined, "timestamp": Date.now() };
	} else {
		// part is 0xF or more : send request on all part of a module
		let tableModule = [];
		let trame = FrameRequestCounter(adr, part || 0xF);
		VMBWrite(trame);

		await sleep(200);
		tableModule.push(subModuleList.get(adr + "-1").status);
		tableModule.push(subModuleList.get(adr + "-2").status);
		tableModule.push(subModuleList.get(adr + "-3").status);
		tableModule.push(subModuleList.get(adr + "-4").status);
		return tableModule;
	}

}

// [ ] Write a function that store the request in a array then,
// [ ] Write a function in receive part, that compare mask & msg and execute callback if true
/*function VMBSearchMsg(msg, callBackFct, part = 0xFF) {
	
}*/
// #endregion





// #region VELBUS COMMUNICATION (TCP)
// ============================================================================================================
// =                                           VELBUS SERVER PART                                             =
// ============================================================================================================

const CNX = { host: "127.0.0.1", port: 8445 }
import net from 'net'
import { get } from 'http';

const connectVelbus = (TCPConnexion) => {
	let velbusConnexion = new net.Socket();
	return velbusConnexion;
}

let VelbusConnexion = connectVelbus(CNX);
const VelbusStart = (host, port) => {
	VelbusConnexion.connect(port, host);
}

let ReconnectTimer
let DisconnectDate


VelbusConnexion.on('connect', () => {
	console.log("  ✅ connected to Velbus server > ", VelbusConnexion.remoteAddress, ":", VelbusConnexion.remotePort);
	console.log("--------------------------------------------------------------", '\n\n')
	surveyTempStatus()
	surveyEnergyStatus()

	if (ReconnectTimer != undefined) {
		let duration = ((Date.now() - DisconnectDate) / 1000)
		console.log("Reconnect after ", Math.round(duration / 60), "minuts and", Math.round(duration % 60), "seconds")
		clearInterval(ReconnectTimer)
		ReconnectTimer = undefined
	}

})

VelbusConnexion.once('connect', () => {
	setTimeout(() => {
		// VMBscanAll()
		console.log("Now scanning all devices on BUS 🔎")
		VMBscanAll(0)
	}, 1000)
})

VelbusConnexion.on('data', (data) => {
	let VMBmessage = {}
	let desc = ''

	// data may contains multiples RAW Velbus frames: send
	Cut(data).forEach(element => {
		checkModule(element);
		desc = analyze2Texte(element);
		console.log("  ➡️",desc)	// use as debug

		VMBmessage = { "RAW": element, "Description": desc, "TimeStamp": Date.now(), "Address": element[2], "Function": element[4] }

		// WIP seems to be for socketIO. Could be removed?
		VMBEmitter.emit("msg", VMBmessage);

		switch (element[4]) {
			case 0xBE:
				VMBEmitter.emit("EnergyStatus", VMBmessage);
				break;
			case 0xE6:
				VMBEmitter.emit("TempStatus", VMBmessage);
				break;
			default:
				break;
		}

	})
});
VelbusConnexion.on('error', (err) => {
	// FIXME: Check if this part is needed (lost connexion start event 'close') and how...
	console.log("  ❌ Connexion Error! Velbus reusedSocket:", VelbusConnexion.reusedSocket, "   err.code:", err.code)
	if (!VelbusConnexion.destroyed) {
		VelbusConnexion.destroy();
		setTimeout(() => {VelbusConnexion=connectVelbus(CNX)}, 5000) // Reconnexion après 5 secondes
	}
});
VelbusConnexion.on('close', () => {
	console.log("  ✂️ Closing velbus server connexion");
});
VelbusConnexion.once('close', () => {
	// Try to reconnect every 10 seconds
	console.log("  📶 Try velbus server reconnexion");
	DisconnectDate = Date.now()
	ReconnectTimer = setInterval(() => {
		VelbusConnexion.connect(CNX.port, CNX.host)
	}, 10 * 1000)
})
// ==================================================================================
// #endregion


export {
	setSubModuleList, getSubModuleList, lenSubModuleList, fullSubModuleList,
	CheckSum,
	Cut,
	toHexa,
	VMB, resume,
	VMBWrite, VMBSetTime, VMBscanAll,
	relaySet, relayTimer,
	FrameRequestCounter as CounterRequest,
	VelbusStart, VMBEmitter,
	VMBRequestTemp, VMBRequestEnergy
}

