'use strict';

const delay = require('delay')
const { Client, keys } = require('roku-client')
const EventEmitter = require('events')

this.client
this.wasOn

class RokuTV extends EventEmitter {

    constructor(params) {

        super()

        if (typeof params === 'string') {
            this.client = new Client(params)
        }
        else if (typeof params.ip === 'string') {
            this.client = new Client(params.ip)
        }
        else {
            this.client = Client.discover()
        }
    }

    async poll(callback) {

        try {
            const tv = await this.client
            const info = await tv.info()
            const isOn = this.TVIsOn(info)

            if (isOn != this.wasOn) {
                this.wasOn = isOn
                callback(isOn)
                //this.emit('event')
            }

            const milliseconds = isOn ? 5000 : 1000
            await delay(milliseconds)

            this.poll(callback)
        }
        catch (error) {
            console.log(error.stack)
            this.poll(callback)
        }

    }

    TVIsOn(info) {
        return info.powerMode === 'PowerOn'
    }
}

module.exports = RokuTV