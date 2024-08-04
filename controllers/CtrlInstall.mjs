/*----------------------------------------------------------------------------
  First start on installation
  ----------------------------------------------------------------------------
*/

function installation(req, res) {
    console.log("*** going to installation.ejs ***")
    res.render('installation.ejs')
}

export {installation}