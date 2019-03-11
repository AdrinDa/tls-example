const fs = require('fs')
const config = require('config')
const TLSServer = require('tls-json').Server
var express = require('express')
var cors = require('cors')

var app = express()
app.use(cors())

app.get('/', (req, res) => {
    res.json(lobbies)
    //res.sendFile(path.join(__dirname, 'lobbies.json'));
})

const server = new TLSServer({
    options: {
        key: fs.readFileSync(config.API_KEY),
        cert: fs.readFileSync(config.API_CERT),
        rejectUnauthorized: false,
        requestTimeout: 10000 // optional, defaults to 10000 ms
    },
    password: config.API_PASSWORD
})

let clients = new Map()
let lobbies = []

server.on('authenticated', (id, socket) => {
    let ip = socket.remoteAddress
    ip.startsWith("::ffff:") ? ip = ip.slice(7) : void(0)
    clients.set(id, ip)
})

server.on('message', (id, message) => {

    /**  
     * *this message is coming from*
     * createLobby  ==> from website Server ===> create a new lobby
     * playerJoin   ==>  from website Server ===> join this player to lobby
     * 
     * removeLobby  ==> from game Server ===> remove lobby
     * playerLeft   ==> from game Server ===> a player left a lobby
     * gameResult   ==> from game Server ===> game finished and this is the result of the match
     *
     * iAmGameServer ==> from game Server ===> game server announcing himself as the game server (yes it's a he)
     * iAmWebsiteServer ==> from website Server ===> ...
    */

    for ([key, value] of clients) {
        key !== id ? server.send(key, message) : void(0)
    }

    message.type === 'createLobby' ? lobbies.push(message) : void(0)
    createJson(lobbies)
})

server.on('close', id => {
    clients.delete(id)
    console.log(clients)
})

server.on('error', (id, err) => {
    //console.log('error', err, 'from', id, '(might be caused by client disconnection)')
})

const createJson = function (data) {
    fs.writeFile('./lobbies.json', JSON.stringify(data, null, 2), () => {})
}

const requesting = function () {
    server.request(id, {
            any: message
        })
    .then(data => {})
    .catch(err => {})
}

server.listen(config.MASTER_API_PORT, () => {
    console.log(`TLSServer listening on port ${config.MASTER_API_PORT}`)
})

// for responding to the web
let master_http_port = 7999
app.listen(master_http_port, () => {
    console.log(`MASTER HTTP listening on ${master_http_port}`)
})



















// const fs = require('fs')
// const config = require('config')
// const TLSServer = require('tls-json').Server
// var express = require('express')
// var cors = require('cors')

// var app = express()
// app.use(cors())

// app.get('/', (req, res) => {
//     res.json(lobbies)
//     //res.sendFile(path.join(__dirname, 'lobbies.json'));
// })

// const server = new TLSServer({
//     options: {
//         key: fs.readFileSync(config.API_KEY),
//         cert: fs.readFileSync(config.API_CERT),
//         rejectUnauthorized: false,
//         requestTimeout: 10000 // optional, defaults to 10000 ms
//     },
//     password: config.API_PASSWORD
// })

// let clients = [{type: null, id: null, ip: null}, {type: null, id: null, ip: null}]
// let gameServerInfo = {id: null, ip: null}
// let lobbies = []

// server.on('authenticated', (id, socket) => {
//     let ip = socket.remoteAddress
//     ip.startsWith("::ffff:") ? ip = ip.slice(7) : void(0)

//     for (let i = 0 ; i < clients.length ; i++) {
//         if (clients[i].id === null) {
//             clients[i].id = id
//             clients[i].ip = ip
//             break
//         }
//     }
// })

// server.on('message', (id, message) => {

//     /**  
//      * *this message is coming from*
//      * createLobby  ==> from website Server ===> create a new lobby
//      * playerJoin   ==>  from website Server ===> join this player to lobby
//      * 
//      * removeLobby  ==> from game Server ===> remove lobby
//      * playerLeft   ==> from game Server ===> a player left a lobby
//      * gameResult   ==> from game Server ===> game finished and this is the result of the match
//      *
//      * iAmGameServer ==> from game Server ===> game server announcing himself as the game server (yes it's a he)
//      * iAmWebsiteServer ==> from website Server ===> ...
//     */

//    if (message.type === 'createLobby')
//    {
//        server.send(gameServerInfo.id, message)  
//    } 
//    else if (message.type === 'playerJoin')
//    {
//        server.send(gameServerInfo.id, message)
//    } 
//    else if (message.type === 'iAmGameServer')
//    {
//        for (let i = 0 ; i < clients.length ; i++) {
//            clients[i].id == id ? clients[i].type = 'gameServer' : void(0)
//        }
//    }
//    else if (message.type === 'iAmWebsiteServer')
//    {
//        for (let i = 0 ; i < clients.length ; i++) {
//            clients[i].id == id ? clients[i].type = 'websiteServer' : void(0)
//        }
//    }

//    createJson(lobbies)
// })

// server.on('close', id => {
//    for (let i = 0 ; i < clients.length ; i++) {
//        clients[i].id == id ? clients[i].id = clients[i].ip = clients[i].type = null : void(0)
//    }
// })

// server.on('error', (id, err) => {
//    //console.log('error', err, 'from', id, '(might be caused by client disconnection)')
// })

// const createJson = function (data) {
//    fs.writeFile('./lobbies.json', JSON.stringify(data, null, 2), () => {
//    })
// }

// const requesting = function () {
//    server.request(id, { any: message })
//    .then(data => {} )
//    .catch (err => {} )
// }

// server.listen(config.MASTER_API_PORT, () => {
//    console.log(`TLSServer listening on port ${config.MASTER_API_PORT}`)
// })

// // for responding to the web
// let master_http_port = 7999
// app.listen(master_http_port, () => {
//    console.log(`MASTER HTTP listening on ${master_http_port}`)
// })