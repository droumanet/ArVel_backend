/*--------------------------------------------------------------------------
  Initialisation for database connexion.
  Change here for connexion settings.
  2024-04-14    Add .env file for connectDB()
  --------------------------------------------------------------------------
*/
import * as dotenv from 'dotenv';
import mysql from 'mysql2/promise.js'
// import Pool from 'mysql2/typings/mysql/lib/Pool.js';
let db
dotenv.config();

async function connectDB() {
    const connection = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    console.log("Connected to remote database");
    return connection;
  }

async function getPower(callback){

    let sql='SELECT * FROM pwrDay';
    db.query(sql, function (err, data, fields) {
        if (err) throw err;
        return callback(data)
    })

    
}

/**
 * @param values Array of TeleInfo for production and cunsomption
 */
async function SQLsetPowerDay(values) {
    let sql='INSERT INTO pwrDay (jour, pwrconsohp,pwrconsohc, pwrprod, pwrconsomax, pwrprodmax) VALUES (?)';
    db.query(sql, [values], function (err, data) {
        if (err) throw err;
        console.log("setPowerDay success");
        return data.affectedRows;
    })
}

/**
 * @param values Array of TeleInfo for production and cunsomption
 */
 async function SQLsetEnergy(values) {
    let sql='REPLACE INTO Energie (ModAddr, ModPart, dateRecord, PowerIndex, PowerInst) VALUES (?)';
    db.query(sql, [values], function (err, data) {
        if (err) throw err;
        console.log("setEnergy success");
        return data.affectedRows;
    })
}


// launch initial connexion
db = await connectDB()
if (db != undefined) console.log("ARVEL - Connexion with database established.")

export {getPower, SQLsetPowerDay, SQLsetEnergy}