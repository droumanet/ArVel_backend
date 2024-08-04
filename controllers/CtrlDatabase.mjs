/*----------------------------------------------------------------------------
  DataBase management
  ----------------------------------------------------------------------------
*/

import * as DB from '../models/DBModel.mjs'

async function writePowerByDay(req) {
   console.log(DB.SQLsetPowerDay(req))
}

async function readPowerDay(dateIN, dateOUT) {
  return DB.SQLgetPowerDay(dateIN, dateOUT)
}

async function writeEnergy(req) {
  console.log("WriteEnergy : ",req)
  return DB.SQLsetEnergy(req)
}

export {writePowerByDay, readPowerDay, writeEnergy}