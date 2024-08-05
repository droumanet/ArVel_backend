/*
   Router : 
*/

import * as express from 'express'
const Router = express.Router()

import * as CtrlModules from '../controllers/CtrlModules.mjs'
import * as CtrlAnalyze from '../controllers/CtrlAnalyze.mjs'
import * as CtrlInstall from '../controllers/CtrlInstall.mjs'
import * as CtrlPower from '../controllers/CtrlPower.mjs'
import * as CtrlRelay from '../controllers/CtrlRelay.mjs'
import * as CtrlSensor from '../controllers/CtrlSensor.mjs'

/*
const CtrlAnalyze = require('../controllers/CtrlAnalyze')
const CtrlInstall = require('../controllers/CtrlInstall')
const CtrlPower = require('../controllers/CtrlPower')
const CtrlRelay = require('../controllers/CtrlRelay')
const CtrlSensor = require('../controllers/CtrlSensor')
*/

// routes list
Router.get('/modules', CtrlModules.getModules)
Router.get('/', (req, res) => { res.send({msg:"nothing here"})})
Router.get('*', (req, res) => { res.send({msg:"nothing here"})})

export {Router}