/**
 * ------------  ArVel  ---------------------------------------------------------------------------------
 * This is main API for connecting Velbus with database and other web services (port 8001)
 * ------------------------------------------------------------------------------------------------------
 * @author David ROUMANET <golfy@free.fr>
 * @version 0.2
 * v0.2 Transform to API Restful
 * ------------------------------------------------------------------------------------------------------
 * This code is experimental and is published only for those who want to use Velbus with NodeJS project.
 * Use it without any warranty.
 * ------------------------------------------------------------------------------------------------------
 */
'use strict';

import path from 'path'
import { dirname } from 'path'
import express from 'express'
import cors from "cors"
import http from 'http'
import { Server } from 'socket.io'
import { Router } from './routes/routes.js'
import { fileURLToPath } from 'url'
import schedule from 'node-schedule'
import VMBserver from './config/VMBServer.json' assert {type: "json"}    // settings for Velbus server TCP port and address
import appProfile from './config/appProfile.json' assert {type: "json"}
import * as velbuslib from "./modules/velbuslib.js"
import { VMBmodule, VMBsubmodule } from './models/velbuslib_class.mjs'
import { getSunrise, getSunset } from 'sunrise-sunset-js'
import { writePowerByDay, writeEnergy } from './controllers/CtrlDatabase.mjs';
import * as TeleInfo from './modules/teleinfo.js'

// GPS coordonates for Grenoble (sunrise and sunset value)
const sunset = getSunset(appProfile.locationX, appProfile.locationY);


// global.subModuleList = new Map()

const __dirname = dirname(fileURLToPath(import.meta.url))
console.log(__dirname)      // "/Users/Sam/dirname-example/src/api"
console.log(process.cwd())  // "/Users/Sam/dirname-example"

let app = express()
app.use('/', Router)

// Make the app available through an ADSL box (WAN) and adding CORS to SocketIO + App
app.use(cors({
    origin: '*',
    optionsSuccessStatus: 200
}));

// create websocket with existing port HTTP for web client
let myhttp = http.createServer(app);
let myio = new Server(myhttp, {
    // manage CORS for NAT traversal
    cors: {
        origin: appProfile.CORSwebsite,
        methods: ["GET", "POST"]
    }
});

// Launch Velbus network (connect to velserv)
velbuslib.VelbusStart(VMBserver.host, VMBserver.port)

// #region SocketIO functions 
// ================================================================================================
// here is an example on how to connect, from HTML/JS page : let listenClients = io.listen(http);

myio.on('connection', (socket) => {
    console.log(`▶️ SocketIO (re)connected to @IP:${socket.request.remoteAddress} (client ${socket.id})`)
    let subList = velbuslib.fullSubModuleList()
    let modulesTeleInfo = TeleInfo.resume()
    velbuslib.setSubModuleList("300-1", modulesTeleInfo[0])
    velbuslib.setSubModuleList("300-2", modulesTeleInfo[1])
    // subModuleList.set("300-1", modulesTeleInfo[0])
    // subModuleList.set("300-2", modulesTeleInfo[1])

    let json = JSON.stringify(Object.fromEntries(velbuslib.fullSubModuleList()))
    myio.emit("resume", json)
    console.log("▶️ Loaded modules numbers : ", velbuslib.lenSubModuleList())
    socket.on("energy", (msg) => {
        console.log("► Energy request transmitted (socketIO client)")
        velbuslib.VMBWrite(velbuslib.CounterRequest(msg.address, msg.part))
    })
    socket.on('relay', (msg) => {
        console.log("▶️ ", msg)
        if (msg.status == "ON") velbuslib.VMBWrite(velbuslib.relaySet(msg.address, msg.part, 1))
        if (msg.status == "OFF") velbuslib.VMBWrite(velbuslib.relaySet(msg.address, msg.part, 0))
        console.log("▶️ Action on relay: ", msg, "address:", msg.address);
    });
    socket.on('blind', (msg) => {
        if (msg.status == "DOWN") velbuslib.VMBWrite(velbuslib.blindMove(msg.address, msg.part, -1, 10))
        if (msg.status == "UP") velbuslib.VMBWrite(velbuslib.blindMove(msg.address, msg.part, 1, 10))
        if (msg.status == "STOP") velbuslib.VMBWrite(velbuslib.blindStop(msg.address, msg.part))
        console.log("▶️ Action on blind: ", msg)
    })
    socket.on('discover', () => {

    })
})

// when a message is detected on Velbus bus, send it to socketIO client
velbuslib.VMBEmitter.on("msg", (dataSend) => {
    myio.emit("msg", dataSend)
});

// NOTE - running Velbus server on port 8001
let portWeb = appProfile.listenPort;
myhttp.listen(portWeb, () => {
    console.log("ARVEL - Velbus Service listening on port ", portWeb)
});

myio.listen(myhttp)
console.log("____________________________________________________________\n")

let pad = function (num) { return ('00' + num).slice(-2) }
// #endregion

// #region CRONTAB functions 
// ================================================================================================
// Timer part (see https://crontab.guru)
// Cron format : SS MM HH Day Month weekday
// ================================================================================================

let launchSync = () => { velbuslib.VMBsyncTime() }

let everyDay5h = schedule.scheduleJob('* * 5 */1 * *', () => {
    // Synchronize time each day at 5:00 (AM)
    velbuslib.VMBSetTime(99, 99, 99)
    console.log("ARVEL CRON for Time synchronisation done...")

})

let everyDay23h59 = schedule.scheduleJob('50 59 23 */1 * *', () => {
    // Record index and some jobs to clear old values
    // read values lists and send to SQL
    let tableCompteur = TeleInfo.resume()
/*
    subModuleList.set("300-1", tableCompteur[0])
    subModuleList.set("300-2", tableCompteur[1])
*/
    velbuslib.setSubModuleList("300-1", tableCompteur[0])
    velbuslib.setSubModuleList("300-2", tableCompteur[1])

    if (velbuslib.getSubModuleList('300-1') != undefined) {
        let date = new Date();
        date = date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate())
        let powerTbl = new Array()
        powerTbl.push(date)
        powerTbl.push(velbuslib.getSubModuleList('300-1').status.indexHP + "")
        powerTbl.push(velbuslib.getSubModuleList('300-1').status.indexHC + "")
        powerTbl.push(velbuslib.getSubModuleList('300-2').status.indexProd + "")
        powerTbl.push(TeleInfo.decodePower(velbuslib.getSubModuleList('300-1').status.powermax) + "")
        powerTbl.push(TeleInfo.decodePower(velbuslib.getSubModuleList('300-1').status.powermax) + "")
        console.log(powerTbl)
        writePowerByDay(powerTbl)
        // DEBUG write is ok but need to add some error's control (like writing twice ?)
        console.log("ARVEL CRON 24H for sending power to DATABASE done...")
    }
})

let everyMinut = schedule.scheduleJob('*/1 * * * *', () => {
    // call every minute energy counter
    let d = new Date()
    // Scan all module and search for a function
    console.log("==== ARVEL CRON 1 minute  ====", d.toISOString(), "====")
    // subModuleList = velbuslib.resume()
    let subList = velbuslib.fullSubModuleList()
    if (subList != undefined) {
        console.log("LISTE EXISTANTE")
        if (subList.size > 0) {
            console.log("THERE ARE ",subList.size," MODULES")
            let ll
            let eventDate=""
            subList.forEach((v, k) => {
                
                /* // planned to have multiples values in v.fct
                fctArray = v.fct.map(x => x.toLowerCase())
                if (fctArray.find(e => e.toLowerCase() == "energy")) {
                    msg = velbuslib.VMBRequestEnergy(v.address, v.part)
                    console.log("CRON energy", msg)
                }

                if (v.fct.find(e => e.toLowerCase() == "temp")) {
                    msg=velbuslib.VMBRequestTemp(v.address, v.part)
                    console.log("CRON temperature", msg)
                }
                */
                if (v.fct == "energy") {
                    velbuslib.VMBRequestEnergy(v.address, v.part)
                    .then((msg) => {console.log(msg)})
                    ll = new Date(v.status.timestamp)
                    eventDate=ll.getFullYear()+"-"+pad(ll.getMonth()+1)+"-"+pad(ll.getDate())+" "+pad(ll.getHours())+":"+pad(ll.getMinutes())+":00"
                    //eventDate = (new Date(v.status.timestamp)-).toISOString().slice(0, 19).replace('T', ' ')
                    console.log(eventDate, v.id, v.fct, v.status.power, v.status.index, 'w (', v.address,'-' ,v.part,')')

                    writeEnergy([v.address, v.part, eventDate, v.status.index, v.status.power])
                }
            })
        } else {
            console.log("!!!!!!   ModuleList empty   !!!!!!!!!!!!!!")
        }
        
    } else { console.log("!!!!!!   ModuleList undefined   !!!!!!!!!!!!!!")}

})

let every5min = schedule.scheduleJob('* */5 * * * *', () => {
    // call every 5 minutes event like temperatures
})
//#endregion
