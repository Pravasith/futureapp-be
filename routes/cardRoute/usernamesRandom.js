'use strict'

const getRandomUsername = () => {

    let randomUsernames = [
        'Rabbit','Snowmass','Mysterious','Super',
        'Star','Blackhole','Shining','blue','black',
        'white','dog','rambo','sky','neo','matrix',
        'secret','shaman','psycho','mad','god',
        'amazing','rock','stone','greek','swagger',
        'cyber','warrior','white','storm','electro',
        'dragon','lion','tiger','executive','hammer',
        'suit','art','warhead','alien','smoke',
        'velocity','proton','photon','electron',
        'hustler','bat','wolf','shaker','sun','moon',
        'shine','mask','marvel','vanilla','solver',
        'CEO','water','turtle','shark','whale','fish',
        'iron','shot','marine','rebellion','kickass',
        'accelerator','neutron','cloud','rain','class',
        'flare','light','bone','screw','space','money',
        'bee','Napalm','Bomb','Knight','King','emperor',
        'Bear','Bloom','Toxic','Fire','Chuckles','Don',
        'Fabulous','Avenger','Damager','Silver','Rose',
        'Samurai','Slayer','Bold','Passion',
        'Sword','Blade','Penguin','Death','Demon',
        'brain','boogie','Legend','Mars','Raging',
        'Scarface','zeus','Zesty','Robin','Square',
    ]
    
    let randomUsers = []
    let randomUsername
    
    const getRndInteger = (min, max) => {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    randomUsernames.map((item, index) => {
        randomUsers.push(item.toLowerCase())
    })

    randomUsername = randomUsers[getRndInteger(0, randomUsernames.length)] + '.' + randomUsers[getRndInteger(0, randomUsernames.length)]
    return randomUsername

}

module.exports = getRandomUsername