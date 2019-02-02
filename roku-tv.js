'use strict';

const delay = require('delay')
const { Client, keys } = require('roku-client')
const EventEmitter = require('events')
const _ = require('lodash')

const pollFunctions = [
    'info'
]

const events = [
    {
        name: 'power-on',
        comparator: (previous, next) => {
            return _.get(previous, 'info.powerMode') !== 'PowerOn' && _.get(next, 'info.powerMode') === 'PowerOn'
        }
    }, {
        name: 'power-off',
        comparator: (previous, next) => {
            return _.get(previous, 'info.powerMode') === 'PowerOn' && _.get(next, 'info.powerMode') !== 'PowerOn'
        }
    }
]

class RokuTV extends EventEmitter {

    constructor(params) {

        super()

        this.state = {}
        
        if (typeof params === 'string') {
            this.client = new Client(params)
        }
        else if (typeof params.ip === 'string') {
            this.client = new Client(params.ip)
        }
        else {
            this.client = Client.discover()
        }

        this.poll()
    }

    async poll() {

        try {
            const tv = await this.client

            const newState = {}
            for (let i = 0; i < pollFunctions.length; i++) {
                const functionName = pollFunctions[i]
                newState[functionName] = await tv[functionName]()
            }

            const toEmit = []
            events.forEach(event => {
                if (event.comparator(this.state, newState)) {
                    toEmit.push(event)
                }
            })

            this.state = newState

            toEmit.forEach(event => {
                this.emit(event.name)
            })
        }
        catch (error) {
            console.log(error.stack)
            this.poll()
        }

        const milliseconds = this.isOn() ? 5000 : 1000
        await delay(milliseconds)

        this.poll()

    }

    isOn() {
        return _.get(this.state, 'info.powerMode') === 'PowerOn'
    }
}

module.exports = RokuTV