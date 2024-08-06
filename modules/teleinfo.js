// Require node js dgram module.
import Dgram from "dgram"
import {VMBmodule, VMBsubmodule} from '../models/velbuslib_class.mjs'
// const Dgram = require('dgram')
let port = 65432
// Create a udp socket client object.
const TeleInfo = Dgram.createSocket("udp4")

let compteurConso = {
    "TYPE":"CONSOMMATION",
    "DATE": "",
    "PRM": "",
    "EASF01": "",
    "EASF02": "",
    "IRMS1": "",
    "URMS1": "",
    "SINSTS": "",  // current power consummed
    "UMOY1": "",
    "NGTF": "",
    "NTARF": "",
    "MSG1": "",
    "SMAXSN": "",
    "SMAXSN1": "",
    "RELAIS": "",
}
let compteurProd = {
    "TYPE":"PRODUCTION",
    "DATE": "",
    "PRM": "",
    "EASF01": "",
    "EAIT": "",
    "IRMS1": "",
    "URMS1": "",
    "SINSTI": "",  // current power injected
    "SMAXIN": "",
    "SMAXIN1": "",
    "NGTF": "",
    "MSG1": ""
}

/**
 * This function return an array with two VMBsubModule (address with $300-1 and $300-2)
 * @returns array of two VMBSubModule
 */
function resume() {
    // let statusConso = {"power":compteurConso.SINSTS*1, "indexHP":compteurConso.EASF01*1, "indexHC":compteurConso.EASF02*1, "powermax":compteurConso.SMAXSN, "timestamp":Date.now()}
    let statusConso = { "index": compteurConso.EASF01*1, "power": compteurConso.SINSTS*1, "indexHC":compteurConso.EASF02*1, "powerMax":compteurConso.SMAXSN, "timestamp": Date.now() }

    let cptConso = new VMBsubmodule(300, 1, "300-1", ["energy", "electricity"], statusConso)
    cptConso.name = "TeleInfo Conso"

    // let statusProd = {"power":compteurProd.SINSTI*1, "indexProd":compteurProd.EAIT*1, "indexConso":compteurProd.EASF01*1, "powerMax":compteurProd.SMAXIN, "timestamp":Date.now()}
    let statusProd = {"index":compteurProd.EAIT*1, "power":compteurProd.SINSTI*1, "indexConso":compteurProd.EASF01*1, "powerMax":compteurProd.SMAXIN, "timestamp":Date.now()}

    let cptProd = new VMBsubmodule(300, 2, "300-2", ["energy", "electricity"], statusProd)
    cptProd.name = "TeleInfo Prod"
    return [cptConso, cptProd]
}

// decode TeleInfo date :SAISON (E/H)+YYMMDDHHmmSS
function decodeDate(m) {
    let msg = m.split(" ")
    // let HeureEte = "E" == m[0].substr(0,1)
    if (msg[0].length >12) {
        return "20"+msg[0].substr(1,2) + "-" + msg[0].substr(3,2) + "-" + msg[0].substr(5,2) + " " + msg[0].substr(7,2) + ":" + msg[0].substr(9,2) + ":" + msg[0].substr(11,2)
    } 
    return msg[0]

}
// decode TeleInfo max power :"DATE POWER"
function decodePower(m) {
    let msg = m.split(" ")
    return msg[1]*1
}


TeleInfo.on('listening', () => {
    console.log("ARVEL - Connexion to TeleInfo established (UDP)")
})
// example on how to use it
TeleInfo.on('message', (message) => {
    let maVariable = JSON.parse(message.toString())
    if (maVariable.TYPE =="CONSOMMATION") {
        console.log("------------------------------------------")
        if (compteurConso!= undefined && maVariable.EASF01 > compteurConso.EASF01) {
            compteurConso = structuredClone(maVariable)
        }
         console.log(compteurConso.TYPE+" : ", compteurConso.SINSTS*1, "Pmax : ", decodePower(compteurConso.SMAXSN),"W" , decodeDate(compteurConso.SMAXSN), "Urms:",compteurConso.URMS1*1, "Umoy:",decodePower(compteurConso.UMOY1)*1, decodeDate(compteurConso.UMOY1));
    } else {
        try {
            // Keep best index value but show current Power
            if (compteurProd!= undefined && maVariable.EAIT > compteurProd.EAIT) {
                compteurProd = structuredClone(maVariable)
            } else {
                compteurProd.SINSTI = maVariable.SINSTI
            }
             console.log(compteurProd.TYPE+" : ", compteurProd.SINSTI*1, "Pmax : ", decodePower(compteurProd.SMAXIN),"W" , decodeDate(compteurProd.SMAXIN))
        } catch {
            console.log(compteurProd.TYPE, maVariable)
        }
    }
})
TeleInfo.on('error', (message, info) => {
    console.log("Error message from TeleInfo", message)

})

TeleInfo.bind(port)

export {resume, decodeDate, decodePower}