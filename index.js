

const Etekcity = require('etekcity-smartplug')
const RokuTV = require('./roku-tv')
const config = require('./env.json')

async function main() {

    const etekcity = new Etekcity()
    await etekcity.login(config.username, config.password)
    
    const devices = await etekcity.getDevices()
    const device = devices.find((device) => {
        return device.name.includes(config.deviceName)
    })

    const tv = new RokuTV(config.tvName)

    tv.on('power-on', () => {

        try {
            console.log(`turning device ${device.name} on`)
            return etekcity.turnOn(device.id)
        }
        catch (error) {
            console.log(`error turning outlet on: ${error.stack}`)
        }
    })

    tv.on('power-off', () => {

        try {
            console.log(`turning device ${device.name} off`)
            return etekcity.turnOff(device.id)
        }
        catch (error) {
            console.log(`error turning outlet on: ${error.stack}`)
        }
    })
}

main()