/*----------------------------------------------------------------------------
  Modules
  ----------------------------------------------------------------------------
*/
import * as velbuslib from "../modules/velbuslib.js"

export function getModules(req, res) {
    console.log("*** API CTRL-Module : getmodules (json) ***")
    let x = velbuslib.fullSubModuleList()
    console.log("LIST :", x.size)
    let mapObj = Object.fromEntries(x); // Convertir la Map en objet
    
    res.setHeader('content-type', 'application/json')
    res.status(200).json(mapObj) // Envoyer l'objet converti en JSON
}

