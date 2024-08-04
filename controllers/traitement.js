function enHexa(donnees) {
    let c='';
    let dhex=[];
    for (let donnee of donnees) {
        c = donnee.toString(16).toUpperCase()
        if (c.length < 2) c='0'+c;
        dhex.push(c);
    }
    return dhex.toString()+' ('+donnees.length+')';
}

export {enHexa}
