/*
   Router : 
*/

import * as express from 'express'
const Router = express.Router()

import * as CtrlModules from '../controllers/CtrlModules.mjs'

// routes list
Router.get('/modules', CtrlModules.getModules)

// default routes
Router.get('/', (req, res) => { res.send({msg:"nothing here"})})
Router.get('*', (req, res) => { res.send({msg:"nothing here"})})

export {Router}