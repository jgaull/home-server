

const Etekcity = require('etekcity-smartplug')
const RokuTV = require('./roku-tv')
const ChromecastAPI = require('chromecast-api')
const config = require('./env.json')

async function main() {

    const etekcity = new Etekcity()
    try {
        await etekcity.login(config.username, config.password)
    }
    catch (error) {
        console.log('error with etekcity login:', error.message)
        return
    }
    
    let devices
    try {
        devices = await etekcity.getDevices()
    }
    catch (error) {
        console.log('error with etekcity find devices:', error.message)
        return
    }
    
    const device = devices.find((device) => {
        return device.name.includes(config.deviceName)
    })

    const rokuTV = new RokuTV(config.tvName)

    rokuTV.on('power-on', () => {

        try {
            console.log(`turning device ${device.name} on`)
            return etekcity.turnOn(device.id)
        }
        catch (error) {
            console.log(`error turning outlet on: ${error.stack}`)
        }
    })

    rokuTV.on('power-off', () => {

        try {
            console.log(`turning device ${device.name} off`)
            return etekcity.turnOff(device.id)
        }
        catch (error) {
            console.log(`error turning outlet on: ${error.stack}`)
        }
    })

    console.log('chromecast API')
    const client = new ChromecastAPI()
    
    client.on('device', function (device) {
    
        var mediaURL = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4';
        
        console.log('device:', JSON.stringify(device))

        /*
        device.play(mediaURL, function (err) {
            if (!err) console.log('Playing in your chromecast')
        })
        */
    })
}

try {
    main()
}
catch (error) {
    console.log('top level error:', error.message)
}