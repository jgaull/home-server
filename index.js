

const Etekcity = require('etekcity-smartplug')
const RokuTV = require('./roku-tv')

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

const tv = new RokuTV(config.tvIp)

tv.on('power-on', () => {
    Promise.resolve(device).then(device => {

        console.log(`turning device ${device.name} on`)
        return etekcity.turnOn(device.id)

    }).catch(error => {
        console.log(`error turning outlet ${isOn ? 'on' : 'off'}: ${error.stack}`)
    })
})

tv.on('power-off', () => {
    Promise.resolve(device).then(device => {

        console.log(`turning device ${device.name} off`)
        return etekcity.turnOff(device.id)

    }).catch(error => {
        console.log(`error turning outlet ${isOn ? 'on' : 'off'}: ${error.stack}`)
    })
})