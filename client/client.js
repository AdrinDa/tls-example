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

client.on('authenticated', () => {
    //authenticated()
})

client.on('message', msg => { console.log('Message from Master lobby', msg)})
client.on('close', () => { console.log('Master lobby closed') })
client.on('error', err => { console.log('Master lobby err:', err) })


function syncListing() {
    client.send({
        type: 'c_newUser',
        listing: {
            lobbyId: 123,
            port: 3232,
            CP: 2,     
            maxPlayers: 3,
            mode: 'gameMode',
        }    
    })
}

function newLobby() {
    client.send({
        type: 'c_newLobby',
        listing: {
            lobbyId: 123,
            port: 3265,
            CP: 2,     
            maxPlayers: 3,
            mode: 'gameMode',
        }    
    })
}

setTimeout(() => {
    newLobby()
}, 3000)










function updatelobbyInfo() {
    client.send({
        listing: {
            type: false,
            lobbyOpen: IsOpen,
            CP: currentPlayers,
        }  
    })
}

function addCode() {
    client.send({
        listing: {
            type: true,
            lobbyOpen: IsOpen,
            CP: currentPlayers,
            codes: PWFCs,
        }
    })
}
