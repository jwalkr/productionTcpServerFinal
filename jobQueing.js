const express = require('express')
const kue = require('kue')
const net = require('net')
const bodyParse =require('body-parser')

//set up the express app
const app = express()
const PORT = 5000





// socket.on('data' , (serverResponse) => {
//     //check if we are receiving any data 
//     console.log('RESPONSE:' + data)
//     //stream data into the buffer 
//     buff = Buffer.from(data)
//     //check if there is data in the pipe 
//     if(data){
//          //search for the login request in the buffer
//          if(buff.toString().search('<login COOKIE="ussdgw" NODE_ID="MTNMENU_F02" PASSWORD="mtnm3nu123" RMT_SYS="uxml@ussdgw" USER="MTNMENUF02"/>')){
//              socket.write(token)
//              socket.write(Buffer.from('ff' , 'hex'))
//          }
//     }

// })


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
    }
    // else if (!req.body.numberReply){
    //     return res.status(400).send({
    //         success: 'false',
    //         message: 'The action USSRC is required'
    //     })
    // }

    userRequestJob = queue.create('UserRequest', {
        msgPDU : req.body.msgPDU,
        contentReply: req.body.contentReply,
        numberReply: req.body.numberReply
    })
    .priority(-15).attempts(3).removeOnComplete(true).save()


})

//server connection

const host = process.env.HOST||'127.0.0.1'
const port = process.env.PORT||8000;

//tcp variables
let buff = null 
let buffRespond = null 
const token = '<?xml version="1.0" encoding="ISO-8859-1"?> <cookie VALUE="UXCKB1TAIS7XT6"/>'
let userRequestJob = null





const server = net.createServer((socket) => {
    socket.on('data' , (loginToken) => {
        // check if we receiving wasp credentials 
        console.log('Response:' +  loginToken)
        //stream data into the buffer 
        buff = Buffer.from(loginToken)
        // check if there is data in the pipe
        if(loginToken){
            //search for the login request in the buffer
            if(buff.toString().search('<login COOKIE="ussdgw" NODE_ID="MTNMENU_F02" PASSWORD="mtnm3nu123" RMT_SYS="uxml@ussdgw" USER="MTNMENUF02"/>')){
                socket.write(token)
                socket.write(Buffer.from('ff' , 'hex'))
            }
        }
        console.log('socket created')
    })

    queue.process('UserRequest', 10 ,function(job , done ){

    
        
        console.log('Sending PSSSR')
        socket.write(job.data.msgPDU)
        socket.write(Buffer.from('ff' , 'hex')) 
        
        socket.on('data' ,(pduReply) => {
            socket.write(job.data.contentReply)
            socket.write(Buffer.from('ff' , 'hex'))
            if(job.data.numberReply != ''){
                socket.on('data' , gateWayResponse => {
                    console.log(gateWayResponse.toString())
                    socket.write(job.data.numberReply)
                    socket.write(Buffer.from('ff' , 'hex'))
                })
    
            }
            console.log('The job has been completed')
            console.log('The Request has been Proccessed')
            done && done()
            socket.pause()
    
    
        })
        .on('error' , (error)=>{
            console.log('Handled error')
            console.log(error)
            userRequestJob.on('failed' , (errorMessage)=>{
                console.log(error)
                let jobError = JSON.parse(errorMessage)
                console.log(errorMessage)
            })
    
    
        })
        
       
        // .on('end' , function(){
        //     console.log('The Request has been Proccessed')
        //    done && done()
        // })
    
    
        
    
        
    
    })
    
    


    // .on('connect' , (connectionConfirmation) =>{
    //     console.log('Connected and ready to receive jobs')
    //     console.log(connectionConfirmation.toString())
    // })


})

server.listen(8000 , '127.0.0.1')






