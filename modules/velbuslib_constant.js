// frame part
const StartX = 0x0F;
const EndX = 0x04;
const PrioHi = 0xF8;
const PrioLo = 0xFB;

//#region modules AS Modules (code, name, desc, power (mA, for 15v BUS), partNumber)
const moduleTypes    = 
[{code : "0x01", name :  "VMB8PB",    power:[30,30],   desc : "8 simple push buttons module", PartNb : 8},
 {code : "0x02", name :  "VMB1RY",    power: [50,50],  desc : "1 relay (with physical button) module", PartNb : 1},
 {code : "0x03", name :  "VMB1BL",    power: [100,100], desc : "1 blind (with physical button) module", PartNb : 1},
 {code : "0x05", name :  "VMB6IN",    power: [150, 150], desc : "6 inputs module", PartNb : 6},
 {code : "0x07", name :  "VMB1DM",    power: [35],  desc : "1 dimmer (with physical button) module", PartNb : 1},
 {code : "0x08", name :  "VMB4RY",    power: [50,250], desc : "4 relays (with physical buttons) module", PartNb : 4},
 {code : "0x09", name :  "VMB2BL",    power: [200], desc : "2 blind (with physical button) module", PartNb : 2},
 {code : "0x0B", name :  "VMB4PD",    power: [30],  desc : "8 (2x4) push buttons with display module", PartNb : 4},
 {code : "0x0C", name :  "VMB1TS",    power: [10],  desc : "1 temperature sensor module", PartNb : 1},
 {code : "0x0D", name :  "VMB1TH",    power: [0], desc : "-never produced-", PartNb : 1},
 {code : "0x0E", name :  "VMB1TC",    power: [50],  desc : "1 temperature sensor module", PartNb : 1},
 {code : "0x0F", name :  "VMB1LED",   power: [20],  desc : "1 LED controller module", PartNb : 1},
 {code : "0x10", name :  "VMB4RYLD",  power: [0], desc : "4 relays (common power source) module", PartNb : 4},
 {code : "0x11", name :  "VMB4RYNO",  power: [30,250], desc : "4 relays module", PartNb : 4},
 {code : "0x12", name :  "VMB4DC",    power: [100], desc : "4 channels controller (0..10v) module", PartNb : 4},
 {code : "0x14", name :  "VMBDME",    power: [30],  desc : "1 dimmer (electronic transformer load) module", PartNb : 1},
 {code : "0x15", name :  "VMBDMI",    power: [30],  desc : "1 dimmer (inductive load) module", PartNb : 1},
 {code : "0x16", name :  "VMB8PBU",   power: [35],  desc : "8 push buttons (different form factor) module", PartNb : 8},
 {code : "0x17", name :  "VMB6BPN",   power: [0], desc : "6 push buttons (Niko compatible) module", PartNb : 6},
 {code : "0x18", name :  "VMB2PBAN",  power: [20],  desc : "2 push buttons (Niko compatible) module", PartNb : 2},
 {code : "0x18", name :  "VMB2PBN",   power: [20],  desc : "2 push buttons (Niko compatible) module", PartNb : 2},
 {code : "0x1A", name :  "VMB4RF",    power: [0], desc : "4 channels wireless remote module", PartNb : 4},
 {code : "0x1B", name :  "VMB1RYNO",  power: [100], desc : "1 relay module", PartNb : 1},
 {code : "0x1C", name :  "VMB1BLE",   power: [100], desc : "1 blind module", PartNb : 1},
 {code : "0x1D", name :  "VMB2BLE",   power: [200], desc : "2 blind module", PartNb : 2},
 {code : "0x1E", name :  "VMBGP1",    power: [20],  desc : "1 push glass button module", PartNb : 1},
 {code : "0x1F", name :  "VMBGP2",    power: [20],  desc : "2 push glass button module", PartNb : 2},
 {code : "0x20", name :  "VMBGP4",    power: [20],  desc : "4 push glass button module", PartNb : 4},
 {code : "0x22", name :  "VMB7IN",    power: [30,150], desc : "7 inputs with minus up to 4 counters", PartNb : 7 },
 {code : "0x25", name :  "VMBGPTC",   power: [20],  desc : "", PartNb : 1},
 {code : "0x28", name :  "VMBGPOD",   power: [20], desc : "", PartNb : 1},
 {code : "0x29", name :  "VMB1RYNOS", power: [15],  desc : "", PartNb : 1},
 {code : "0x2A", name :  "VMBPIRM",   power: [10],  desc : "Infra Red sensor", PartNb : 1},
 {code : "0x2B", name :  "VMBPIRC",   power: [20],  desc : "Infra Red sensor", PartNb : 1},
 {code : "0x2C", name :  "VMBPIRO",   power: [30],  desc : "Infra Red sensor", PartNb : 1},
 {code : "0x2D", name :  "VMBGP4PIR", power: [25],  desc : "4 push buttons + Infra Red sensor", PartNb : 4},
 {code : "0x2E", name :  "VMB1BLS",   power: [100], desc : "", PartNb : 1},
 {code : "0x2F", name :  "VMBDMIR",   power: [30], desc : "", PartNb : 1},
 {code : "0x30", name :  "VMBRFR8X",  power: [30], desc : "", PartNb : 8},
 {code : "0x31", name :  "VMBMETEO",  power: [35],  desc : "light, wind and rain sensor", PartNb : 8},  // mainly 8 alarms
 {code : "0x33", name :  "VMBVP01",   power: [300], desc : "Doorbird interface module", PartNb : 8},	// 2 Bells, 2 motions, 2 doors, 2 virtual
 {code : "0x44", name :  "VMB4PB",    power: [50],  desc : "", PartNb : 4},
 {code : "0x00", name :  "VMBRSUSB",  power: [15],  desc : "USB or serial Interface (for computer)", PartNb : 1}];
//#endregion

//#region VMBfunction AS Velbus functions (code, name)
const functionCode    = 
[{code : 0x00, name :  "VMBInputStatusResponse"},
{code : 0x01, name :  "VMBRelayOff"},
{code : 0x02, name :  "VMBRelayOn"},
{code : 0x03, name :  "VMBRelayTimer"},
{code : 0x04, name :  "VMBBlindHalt"},
{code : 0x05, name :  "VMBBlindUp"},
{code : 0x06, name :  "VMBBlindDown"},
{code : 0x06, name :  "VMBDimmerValueSet"},
{code : 0x0D, name :  "VMBStartBlink"},
{code : 0x0F, name :  "VMBSliderStatusRequest"},
{code : 0x12, name :  "VMBUnlockChannel"},
{code : 0x13, name :  "VMBUnlockChannel"},
{code : 0x66, name :  "VMB update1"},
{code : 0x67, name :  "VMB update2"},
{code : 0x68, name :  "VMB update3"},
{code : 0xAF, name :  "VMBSetDaylightSaving"},
{code : 0xB1, name :  "VMBDisableChannelProgram"},
{code : 0xB2, name :  "VMBEnableChannelProgram"},
{code : 0xB3, name :  "VMBSelectProgram"},
{code : 0xB7, name :  "VMBDateStatus"},
{code : 0xB9, name :  "VMBSensorSettingsPart4"},
{code : 0xBB, name :  "VMBSensorConfigData"},
{code : 0xBD, name :  "VMBCounterStatusRequest"},
{code : 0xBE, name :  "VMBCounterStatusResponse"},
{code : 0xBF, name :  "undefined"},
{code : 0xC6, name :  "VMBSensorSettingsPart3"},
{code : 0xC9, name :  "VMBReadMemBlock"},
{code : 0xCA, name :  "VMBWriteMemBlock"},
{code : 0xCB, name :  "VMBMemDumpRequest"},
{code : 0xCC, name :  "VMBTransmitMemBlock"},
{code : 0xD0, name :  "VMBLCDTextRequest"},
{code : 0xD1, name :  "VMBButtonTimer"},
{code : 0xD2, name :  "VMBLCDBackLightDefault"},
{code : 0xD3, name :  "VMBButtonBackLightDef"},
{code : 0xD4, name :  "VMBButtonBackLight"},
{code : 0xD5, name :  "VMBBackContrastRequest"},
{code : 0xD7, name :  "VMBRealTimeClockRequest"},
{code : 0xD8, name :  "VMBRealTimeClockSet"},
{code : 0xD9, name :  "VMBErrorCountRequest"},
{code : 0xDA, name :  "VMBErrorCountResponse"},
{code : 0xE4, name :  "VMBTempReset"},
{code : 0xE5, name :  "VMBTempRequest"},
{code : 0xE6, name :  "VMBTempResponse"},
{code : 0xE7, name :  "-"},
{code : 0xE8, name :  "VMBSensorSettingsPart1"},
{code : 0xE9, name :  "VMBSensorSettingsPart2"},
{code : 0xEA, name :  "VMBSensorStatusResponse"},
{code : 0xEC, name :  "VMBTransmitBlindStatus"},
{code : 0xED, name :  "VMB7InputStatusResponse"},
{code : 0xEE, name :  "VMBTransmitDimStatus"},
{code : 0xEF, name :  "VMBNameResquest"},
{code : 0xF0, name :  "VMBNamePart1"},
{code : 0xF1, name :  "VMBNamePart2"},
{code : 0xF2, name :  "VMBNamePart3"},
{code : 0xF3, name :  "VMBLCDBackLightSet"},
{code : 0xF4, name :  "VMBLedUpdate"},
{code : 0xF5, name :  "VMBLedClear"},
{code : 0xF6, name :  "VMBLedSet"},
{code : 0xF7, name :  "VMBBlinkSlow"},
{code : 0xF8, name :  "VMBBlinkFast"},
{code : 0xF9, name :  "VMBBlinkVeryFast"},
{code : 0xFA, name :  "VMBStatusRequest"},
{code : 0xFB, name :  "VMBTransmitRelayStatus"},
{code : 0xFC, name :  "VMBWriteMem"},
{code : 0xFD, name :  "VMBReadMem"},
{code : 0xFE, name :  "VMBTransmitMem"},
{code : 0xFF, name :  "VMBModuleStatus"}];
//#endregion

/**
 * send back name module from code module
 * @param {Number} code 
 * @returns name of module
 */
 const getNameFromCode = (code) => {
	let result = moduleTypes.find(item => Number(item.code) == code);
	if (result !== undefined) return result.name;
	return "unknown";
};

/**
 * send back code module from name module
 * @param {String} name 
 * @returns code of module
 */
const getCodeFromName = (name) => {
	for (let item of moduleTypes) {
		if (item.name == name) return Number(item.code);
	}
	return 0x00;
};

/**
 * send back part number from type module else return 1
 * @param {Number} code of module 
 * @returns number of sub part or at least one
 */
const getPartFromCode = (code) => {
	let result = moduleTypes.find(item => Number(item.code) == code);
	if (result !== undefined) {
		return result.PartNb;
	} else { 
		return 1;
	}
}

// send back description module from code or name module
const getDesc = (element) => {
	// if string then search by name...
	if (typeOf(element) == string) {
		for (let item of moduleTypes) {
			if (item.name == element) return item.desc
		}
		return "unknown"
	} else {
		// ... search by code
		for (let item of moduleTypes) {
			if (Number(item.code) == element) return item.desc
		}
		return "unknown"
	}

}
 
/**
 * send back function name module from function code module
 * @param {*} code Function code in the frame
 * @returns Function name
 */
function getFunctionName(code) {
	let result = functionCode.find(item => Number(item.code) == code)
	if (result !== undefined) return result.name
	return "unknown"
}


export {
	StartX, EndX, PrioHi, PrioLo,
	moduleTypes, functionCode,
	getCodeFromName, getDesc, getFunctionName, getNameFromCode, getPartFromCode
}
