/*----------------------------------------------------------------------------
  Power Controller (energy from TeleInfo database)
  source for example project: https://github.com/rrazvanrraducanu/Node.js-MySQL-MVC-
  ----------------------------------------------------------------------------
*/

// import * as db from '../Database.mjs'
import * as myModel from '../models/DBModel.mjs'

// Because there is no easiest way to convert a timestamp to a date
function formatDate(milliseconds) {
  let d = new Date(milliseconds),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

      month=String(month).padStart(2,'0')
      day  = String(day).padStart(2,'0')

  return [year, month, day].join('-');
}

function formatHour(milliseconds) {
  let d = new Date(milliseconds),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear(),
      hour = d.getHours(),
      minut= d.getMinutes()

  month=String(month).padStart(2,'0')
  day  = String(day).padStart(2,'0')
  hour = String(hour).padStart(2,'0')
  minut= String(minut).padStart(2,'0')

  return [year, month, day].join('-')+" "+hour+":"+minut;
}

async function viewGlobalEnergy(req, res) {
    let data = await myModel.SQLgetPowerDay(undefined, undefined)
    console.log("Données retour getPowerDay() :", data)
    let dataJour=[], dataHP=[], dataHC=[], dataProd=[]
    console.log(data[0])
    data[0].forEach((pwrObj) => {
      dataJour.push(formatDate(pwrObj.jour))
      dataHP.push(pwrObj.ecartHP)
      dataHC.push(pwrObj.ecartHC)
      dataProd.push(pwrObj.ecartProd)
    })
    dataJour.shift()
    dataHP.shift()
    dataHC.shift()
    dataProd.shift()
    res.render('statGlobalEnergy', {statistiques: data[0], dataJour: dataJour, dataHP: dataHP, dataHC: dataHC, dataProd:dataProd})
}

async function viewLocalEnergy(req, res) {
  let addr = req.query.addr
  let part = req.query.part
  console.log("*********** ", addr, part)
  if (addr == undefined) addr = 6
  if (part == undefined) part = 3
  let data = await myModel.SQLgetEnergyDay(undefined, undefined, addr, part)
  // console.log("Données retour getPowerDay() :", data)
  let dataDay=[], dataPowerDay=[]
  console.log(data[0])
  data[0].forEach((pwrObj) => {
    dataDay.push(formatDate(pwrObj.dateRecord))
    dataPowerDay.push(pwrObj.ConsoJour)
  })
  dataDay.shift()
  dataPowerDay.shift()
  res.render('statLocalEnergy', {"statistiques": data[0], "dataDay": dataDay, "dataPowerDay": dataPowerDay})
}

/**
 * Return Instant power values to statLocalEnergyInst view
 * @param {*} req ?addr=x&part=y
 * @param {*} res 
 */
async function viewLocalEnergyInstant(req, res) {
  let addr = req.query.addr
  let part = req.query.part

  if (addr == undefined) addr = 6
  if (part == undefined) part = 3
  let data = await myModel.SQLgetEnergyInstant(addr, part)
  // console.log("Données retour getPowerDay() :", data)
  let dataDay=[], dataPowerInst=[]
  console.log(data[0])
  data[0].forEach((pwrObj) => {
    //dataDay.push(formatDate(pwrObj.dateRecord))
    dataDay.push(formatHour(pwrObj.dateRecord))
    dataPowerInst.push(pwrObj.PowerInst)
  })
  dataDay.shift()
  dataPowerInst.shift()
  res.render('statLocalEnergyInst', {"statistiques": data[0], "dataDay": dataDay, "dataPowerInst": dataPowerInst})
}

export {viewGlobalEnergy, viewLocalEnergy, viewLocalEnergyInstant}