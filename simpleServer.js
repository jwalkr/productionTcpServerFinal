const net = require('net')

let buff = null 
let buffRespond = null 

const token = '<?xml version="1.0" encoding="ISO-8859-1"?> <cookie VALUE="UXCKB1TAIS7XT6"/>'

const host = '127.0.0.1'
const port = 8000

let dataRespond 
let hasLoggedIn = false
let iswritting = false 


const server = net.createServer((socket) => {
    //wasp authentication 
    console.log('wasp authentication')
    socket.on('data' , (loginToken) => {
        //check if we receiving wasp credentials 
        console.log('check if we receiving wasp credentials')
        console.log(loginToken)
        buff = Buffer.from(loginToken)
        //check if there is data in the pipe matches the regrex
        if(buff.toString().search('<login COOKIE="ussdgw" NODE_ID="MTNMENU_F02" PASSWORD="mtnm3nu123" RMT_SYS="uxml@ussdgw" USER="MTNMENUF02"/>')){
            //writing to the login credentials 
            console.log('writing the login token')
            socket.write(token)
            socket.write(Buffer.from('ff' , 'hex'))
            socket.pause()


        }
        
    })
})


