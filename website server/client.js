const fs = require('fs')
const config = require('config')
const TLSClient = require('tls-json').Client

const client = new TLSClient({
    options: {
        ca: fs.readFileSync(config.API_CERT),
        rejectUnauthorized: false
    },
    reconnectInterval: 3000,
    requestTimeout: 5000, // optional, defaults to 10000 ms
    host: config.MASTER_API_HOST,
    port: config.MASTER_API_PORT,
    password: config.API_PASSWORD,
})

client.on('authenticated', () => {})
client.on('message', msg => {
    console.log('Message from Master lobby', msg)
})
client.on('close', () => {
    console.log('Master lobby closed')
})
client.on('error', err => {
    console.log('Master lobby err:', err)
})

const createLobby = function () {
    client.send({
        type: 'createLobby',
        info: {
            lobbyId: 87878,
            requiredPlayers: 2,
            currentPlayer: 1,
            playersIp: ['13.24.53.4']
        }
    })
}

const playerJoin = function () {
    client.send({
        type: 'playerJoin',
        info: {
            lobbyId: 87878,
            playerIp: '13.24.53.4'
        }
    })
}

// setTimeout(() => {
//     createLobby()
// }, 4000)
