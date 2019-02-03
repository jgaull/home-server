'use strict';

const delay = require('delay')
const { Client, keys } = require('roku-client')
const EventEmitter = require('events')
const _ = require('lodash')
const ipRegex = require('ip-regex')

const pollFrequency = 1 //seconds
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

    constructor(connectionString) {

        super()

        this.state = {}
        this.connectionString = connectionString
        
        this.connect()
    }

    connect() {

        const connectionString = this.connectionString
        
        let client
        if (typeof connectionString === 'string') {

            const isIp = ipRegex({ exact: true }).test(connectionString)
            if (isIp) {
                client = new Client(connectionString)
            }
            else {
                client = this.discoverByName(connectionString)
            }
        }
        else if (typeof connectionString.ip === 'string') {
            client = new Client(connectionString.ip)
        }
        else {
            client = Client.discover()
        }

        this.client = client
        this.poll()
    }

    async discoverByName(name) {

        let clients = await Client.discoverAll()

        const promises = clients.map(async client => {

            const info = await client.info()
            return {
                info: _.cloneDeep(info),
                client
            }
        })

        const tvs = await Promise.all(promises)
        const tv = tvs.find(tv => {
            return tv.info.userDeviceName === name
        })

        return tv.client
    }

    async poll() {

        let tv
        try {
            tv = await this.client
        }
        catch(error) {
            console.log('error connecting to TV:', error.stack)
        }

        if (tv === undefined) {
            console.log('No TV found on network')
            await delay(pollFrequency * 1000)
            this.connect()
            return
        }

        try{

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

        await delay(pollFrequency * 1000)

        this.poll()

    }
}

module.exports = RokuTV