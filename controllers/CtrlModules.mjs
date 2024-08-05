/*----------------------------------------------------------------------------
  Modules
  ----------------------------------------------------------------------------
*/
import * as velbuslib from "../modules/velbuslib.js"

export function getModules(req, res) {
  let x = velbuslib.fullSubModuleList()
  let mapObj
  let filter = req.query;
  if (filter.cat) {
    console.log("*** API CTRL-Module : Filtered request", filter)
    let y = new Map()
    for (const [key, value] of x) {
      if (x.get(key).cat == filter.cat) {
        y.set(key, value)
      }
    }
    mapObj = Object.fromEntries(y);
  } else {
    console.log("*** API CTRL-Module : full ***")
    mapObj = Object.fromEntries(x); // Convertir la Map en objet
  }

  res.setHeader('content-type', 'application/json')
  res.status(200).json(mapObj) // Envoyer l'objet converti en JSON
}

