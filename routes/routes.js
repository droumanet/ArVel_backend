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

let racine = (req, res) => {
    res.render('accueil')
}

// routes list
Router.get('/analyze', CtrlAnalyze.view)
Router.get('/sensor', CtrlSensor.view)
Router.get('/installation', CtrlInstall.installation)
Router.get('/modules', CtrlModules.getModules)
Router.get('/', racine)
Router.get('*', racine)

export {Router}