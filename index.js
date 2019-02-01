

const { Client, keys } = require('roku-client')
const Etekcity = require('etekcity-smartplug')
const delay = require('delay')

//setup the switch
const config = require('./env.json')
const etekcity = new Etekcity()

let device = etekcity.login(config.username, config.password).then(() => {
    return etekcity.getDevices()

}).then(devices => {

    const device = devices.find((device) => {
        return device.name.includes(config.deviceName)
    })

    return device
})

let wasOn
function poll(client, callback) {

    client.info().then(info => {

        const isOn = TVIsOn(info)

        if (isOn != wasOn) {
            wasOn = isOn
            callback(isOn)
        }

        const milliseconds = isOn ? 5000 : 1000
        return delay(milliseconds)

    }).then(() => {
        poll(client, callback)

    }).catch(error => {
        console.log(error.stack)
        poll(client, callback)
    })
}

function TVIsOn(info) {
    return info.powerMode === 'PowerOn'
}

const client = new Client(config.tvIp)
poll(client, tvIsOn => {
    
    Promise.resolve(device).then(device => {
        
        const isOn = outletIsOn(device)
        if (!tvIsOn) {
            console.log(`turning device ${device.name} off`)
            return etekcity.turnOff(device.id)
        }
        else if (tvIsOn) {
            console.log(`turning device ${device.name} on`)
            return etekcity.turnOn(device.id)
        }
    }).catch(error => {
        console.log(`error turning outlet ${isOn ? 'on' : 'off'}: ${error.stack}`)
    })
})

function outletIsOn(device) {
    return device.status === 'open'
}

/*
let client = Client.discover()
    .then((client) => {
        console.log(`roku device found at ${client.ip}`);
        return client.apps();
    })
    .then((apps) => {
        apps.forEach(app => console.log(app));
        // [{ id, name, type, version }, ...]
    })
    .catch(err => {
        console.error(err.stack)
    });
*/

/*
.then((device) => {
    if (device.status === 'open') {
        console.log(`turning device ${device.name} off`);
        return etekcity.turnOff(device.id);
    }
    else {
        console.log(`turning device ${device.name} on`);
        return etekcity.turnOn(device.id);
    }
})
*/