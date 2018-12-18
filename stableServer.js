//initialize the server 
var net = require('net')
var bodyParser = require('body-parser')
var express = require('express')

//set up the express app
const app = express()
app.use(bodyParser.json())

//adding the job queing
const kue = require('kue')
//job monitoring interface
const kueUiExpress = require('kue-ui-express')

kueUiExpress(app, '/kue/', '/kue-api')
let queue = kue.createQueue()


//Server endpoint 
const portExpress = 4200 

app.listen(portExpress , () => {
    console.log(`server running on port ${portExpress}`)
})

let buff = null 
let buffResponsd = null 

//translate 
const js2xmlparser = require('js2xmlparser')

const host =  '127.0.0.1'
const port = 8000

let dataRespond ;
let userRequestJob = null 

let hasLoggedIn = false 
let isWriting = false 

let waspMessage = null 


app.post('/api/v1/newWaspRequest' , (req , res) => {
    console.log('user request has been created')
    userRequestJob = queue.create('userWaspRequest' , {
        msgPDU: req.body.msgPDU
    })
    .priority(-15).attempts(3).removeOnComplete(true).save()

    //queing job
    console.log('starting job')
    queue.process('userWaspRequest' , 10 , (job,done) => {
        console.log('starting server')
        const server = net.createServer((socket) => {
            socket.on('data' , (waspResponse) => {
                //check if we receiving wasp credentials 
                console.log('Response:' + waspResponse)
                buff = Buffer.from(waspResponse)
                //check if there is data in the pipe 
                console.log('Response: ' + buff.toString())
                console.log(hasLoggedIn)


                if(!hasLoggedIn){
                    if(waspResponse){
                        //search for the login request in the buffer 
                        console.log('entering the loggin state')
                        if(buff.toString().search('<login COOKIE="ussdgw" NODE_ID="TEST_USER" PASSWORD="testp@55" RMT_SYS="uxml@localhost" USER="TEST_USER"/>')>0){
                            console.log('currently busy writing the token' + token)
                            hasLoggedIn = true 
                            isWriting = true

                            socket.write(token)
                            socket.write(Buffer.from('ff', 'hex'))

                            console.log('finished writing , writing state back to ' + iswriting)
                            console.log('socket created')

                        }
                    }
                }else if (hasLoggedIn === true){
                    console.log("logged ==" + hasLoggedIn)
                    let hasWritten = socket.write(req.body.msgPDU)
                    let hasTerminated = socket.write(Buffer.from('ff', 'hex'))

                    if(hasWritten){
                        if(hasTerminated){

                            socket.on("data" , waspInfo => {
                                console.log("wasp Info ------")
                                console.log(waspInfo.toString());
                                console.log(waspInfo.toString().search('<ussd'));
                                if(waspInfo.toString().search('<ussd') > 0){

                                    let waspToClient = {
                                        msgPDU: waspInfo.toString()
                                    }
                                    console.log(waspToClient)
                                    res.status(200).send(waspToClient)
                                    socket.close()
                                    done && done()
                                }

                            })
                        }
                    }

                }
            })
            .on('close' , () => {
                console.log('job completed')
            })
        })
    })

})