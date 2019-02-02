

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
tv.poll(tvIsOn => {
    
    Promise.resolve(device).then(device => {
        
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