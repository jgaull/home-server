

const Etekcity = require('etekcity-smartplug')
const RokuTV = require('./roku-tv')

//setup the switch
const config = require('./env.json')
const etekcity = new Etekcity()


async function main() {

    await etekcity.login(config.username, config.password)

    const devices = await etekcity.getDevices()
    const device = devices.find((device) => {
        return device.name.includes(config.deviceName)
    })

    const tv = new RokuTV(config.tvName)
    
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
}

main()