

const Etekcity = require('etekcity-smartplug')
const RokuTV = require('./roku-tv')
const config = require('./env.json')
var nodecast = require('nodecast');
const { delay } = require('lodash');

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
}

async function fireplace() {

    console.log('starting fireplace server')
 
    var devices = nodecast.find();
    
    devices.on('device', function(device) {

        console.log('device found:', JSON.stringify(device))

        if (device.name == 'Shared Screen') {

            var yt = device.app('YouTube')
            console.log('is Roku? ',device.is('roku'))
            
            console.log('starting YouTube Video')
            yt.start('v=AWKzr6n0ea0', function(err) {
                // starts the app on the device
                // also optionally takes data to pass to the app
                // (for example: youtube takes v=id to launch with a video)
                if (err) {
                    console.log('error playing youtube video: ', err.message)
                }
            })


        }

        /*
        var yt = device.app('YouTube');
    
        yt.start('v=12345', function(err) {
            // starts the app on the device
            // also optionally takes data to pass to the app
            // (for example: youtube takes v=id to launch with a video)
        });
        */
    });
}

async function nodecastTest() {
    var Browser = require('nodecast-js');
 
    var url = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4';
    var timestamp = 60; // in seconds
    
    var browser = new Browser();
    browser.onDevice(function (device) {

        device.onError(function (err) {
            console.log(err);
        });
        
        console.log('device:', JSON.stringify(device))
        console.log('list:', browser.getList()); // list of currently discovered devices
    
        //device.play(url, timestamp);
    });
    browser.start();
    
    setTimeout(function () {
        browser.destroy(); // destroy your browser
    }, 20000);
}

async function chromecastAPITest() {
    const ChromecastAPI = require('chromecast-api')
 
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
    //main()
    //fireplace()
    //nodecastTest()
    chromecastAPITest()
}
catch (error) {
    console.log('top level error:', error.message)
}