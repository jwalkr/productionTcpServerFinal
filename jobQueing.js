const express = require('express')
const kue = require('kue')
const net = require('net')
const bodyParse =require('body-parser')

//set up the express app
const app = express()
const PORT = 5000


//job monitoring interface
const kueUiExpress = require('kue-ui-express')

kueUiExpress(app , '/kue/' , '/kue-api')
const queue = kue.createQueue()

//mount kue json api
app.use('/kue-api/' , kue.app)
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
});



//Parse incoming requests data
app.use(bodyParse.json())
app.use(bodyParse.urlencoded({extended: false}))


//tcp variables
let buff = null 
let buffRespond = null 
const token = '<?xml version="1.0" encoding="ISO-8859-1"?> <cookie VALUE="UXCKB1TAIS7XT6"/>'


//Add a job

app.post('/api/v1/addJob' , (req,res)=>{
    if(!req.body.msgPDU){
        return res.status(400).send({
            success: 'false',
            message: 'The USSRC is required'
        })

    }else if(!req.body.contentReply){
        return res.status(400).send({
            success: 'false', 
            message: 'The USSRC Reply is missing'
        })
    }else if (!req.body.numberReply){
        return res.status(400).send({
            success: 'false',
            message: 'The action USSRC is required'
        })
    }

    queue.create('UserRequest', {
        msgPDU : req.body.msgPDU,
        contentReply: req.body.contentReply,
        numberReply: req.body.numberReply
    }).priority(-15).attempts(3).removeOnComplete(true).save(err => {
        if(err){
            console.error(err)
            done()
        }
        if(!err){
            done()
        }
    })


})



queue.process('UserRequest', 10 ,function(job , done ){

    const host = process.env.HOST||'127.0.0.1'
    const port = process.env.PORT||8000;

    const socket = net.createConnecton(port , host)
    console.log('socket created')
    socket.on('data' , function(data){
        //check if we are receiving any data 
        console.log('RESPONSE:' + data)
        //stream data into the buffer 
        buff = Buffer.from(data)
        //check if there is data in the pipe 
        if(data){
            //search for the login request in the buffer
            if(buff.toString().search('<login COOKIE="ussdgw" NODE_ID="MTNMENU_F02" PASSWORD="mtnm3nu123" RMT_SYS="uxml@ussdgw" USER="MTNMENUF02"/>')){
                socket.write(token)
                socket.write(Buffer.from('ff' , 'hex'))
            }
        }
    }).on('connect' , function(){
        socket.on('data' , pduReply => {
            console.log('Sending PSSSR')
            let hasWritten = socket.write(msgPDU)
            socket.write(Buffer.from('ff' , 'hex'))

            if(hasWritten){
                console.log("checking PDU message sending")

                //writing action request in the pipe 
                console.log(pduReply.toString())

                socket.write(numberReply)
                socket.write(Buffer.from('ff' , 'hex'))

                socket.on('data' , gateWayResponse => {
                    console.log(gateWayResponse)
                })
                socket.pause()
                socket.end()

            }
        })
    }).on('end' , function(){
        console.log('The Request has been Proccessed')
        done()
    })

})





