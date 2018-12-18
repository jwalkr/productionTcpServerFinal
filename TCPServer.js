// 'use strict'

var net = require('net');
var bodyParser = require('body-parser');

var express = require('express')
//set up the express app 
const app = express();

app.use(bodyParser.json());


//adding the job queing 
const kue = require('kue')
//job monitoring interface
const kueUiExpress = require('kue-ui-express')

kueUiExpress(app, '/kue/', '/kue-api')
let queue = kue.createQueue()

//mount kue json api
//app.use('/kue-api/', kue.app)
// app.listen(PORT, () => {
//     console.log(`server running on port ${PORT}`)
// });




//Server Endpoint
const portExpress = 4200

app.listen(portExpress, () => {
    console.log(`server running on port ${portExpress}`)
})



let buff = null;

let buffRespond = null;

//translate
const js2xmlparser = require("js2xmlparser");

const token = '<?xml version="1.0" encoding="ISO-8859-1"?> <cookie VALUE="UXCKB1TAIS7XT6"/>';
var HOST = process.env.HOST || '127.0.0.1';
var PORT = process.env.PORT || 8000;

let dataRespond;
let userRequestJob = null

let hasLoggedIn = false;
let iswriting = false

let waspMessage = null;
let socketEndp;
const server = net.createServer((socket) => {
    //wasp authentication
    //socket.resume()
    socketEndp = socket;

    socket.on('data', (waspResponse) => {

        buff = Buffer.from(waspResponse)

        console.log('entering logging in state')
        if (buff.toString().search('<login COOKIE="ussdgw" NODE_ID="TEST_USER" PASSWORD="testp@55" RMT_SYS="uxml@localhost" USER="TEST_USER"/>') > 0) {
            console.log('currently busy writing the token' + token)
            console.log("Seraching for a match======");
            console.log(buff.toString().search('<login COOKIE="ussdgw" NODE_ID="TEST_USER" PASSWORD="testp@55" RMT_SYS="uxml@localhost" USER="TEST_USER"/>'));
            console.log("=========Seraching for a match");
            hasLoggedIn = true;

            socket.write(token)
            socket.write(Buffer.from('ff', 'hex'));


            console.log('socket created')
            console.log(hasLoggedIn);



        }


    })

})



app.post('/api/v1/option1', (req, res) => {

    console.log('translator body');
    console.log(req.body.msgPDU);
    //socket.resume()

    console.log('Sending the network request');

    //Write PDU to the WASP
    let hasWritten = socketEndp.write(req.body.msgPDU);
    let hasTerminated = socketEndp.write(Buffer.from('ff', 'hex'));

    if (hasWritten) {
        if (hasTerminated) {

            onExecutePDU(socketEndp, ).then(dataRes => {
                console.log("Promise Correct");
                console.log(dataRes);
                res.status(200).send(dataRes);
            }).catch(err => {
                console.log("Promise result gone wrong wrong");
            })

        } else {
            

            console.log("255 Character not terminated");
        }

    } else {
        console.log("PDU Not Written");
    }


    socketEndp.on('error', (error) => {
        hasLoggedIn = false;
        console.log('Handled error')
        console.log(error)
        userRequestJob.on('failed', (errorMessage) => {
            console.log(error)

            console.log(errorMessage)
        })



    })
    socketEndp.on('close', () => {

        hasLoggedIn = false;
        console.log('session closed')
    })


})



function onExecutePDU(socketServer) {

    let promise = new Promise(function (resolve, reject) {


        socketServer.on("data", waspInfo => {

            console.log("wasp INFO========");
            console.log(waspInfo.toString());
            console.log(waspInfo.toString().search('/></ussd>'));
            if (waspInfo.toString().search('/></ussd>') > 0) {
                if (waspInfo.toString().search(`PDU="CTRL"`) < 0) {

                    let waspToClient = {
                        msgPDU: waspInfo.toString()
                    }
                    console.log(waspToClient);

                    //waspMessage = waspResponse;


                    console.log("Responding.Promise....");

                    resolve(waspToClient);

                } else {
                    console.log("Found PDU=CTRL");
                    //reject("Err");
                }


            } else {

                console.log("Buff not filled");
                //reject("Err");



            }

        })

    })


    return promise;


}

//A function to write to the wasp
function onWriteToWasp(socket) {

    let promise = new Promise((resolve, reject) => {

        let hasWritten = socket.write(req.body.msgPDU)
        let hasTerminated = socket.write(Buffer.from('ff', 'hex'));

        if (hasWritten) {
            if (hasTerminated) {
                let result = {
                    executed: true
                }
                resolve(result);

            } else {
                let result = {
                    executed: false
                }
                reject(result);
            }

        } else {
            let result = {
                executed: false
            }
            reject(result);
        }

    })

    return promise;

}

server.listen(PORT, HOST)












// net.createServer(function(sock) {

//     sock.on('data', function(data) {

//         buff = Buffer.from(data);


//         if(data)
//         {
//             //Regex

//             if(buff.toString().search('<login COOKIE="ussdgw" NODE_ID="MTNMENU_F02" PASSWORD="mtnm3nu123" RMT_SYS="uxml@ussdgw" USER="MTNMENU_F02"/>'))
//             {


//                     sock.write(token) ;                    
//                     sock.write(Buffer.from('ff', 'hex'));
//                     //sock.destroy();

//                     sock.on("data", pduReply => {
//                             console.log("================");

//                             let hasWritten =sock.write(msgPDU);
//                             let hasSendPDU = sock.write(Buffer.from('ff', 'hex'));


//                             if(hasWritten)
//                             {
//                                 console.log("Check PDU message sending================33");

//                                 // sock.write(msgPDU);
//                                 console.log(pduReply.toString());
//                                 sock.write(numberReply);
//                                 sock.write(Buffer.from('ff', 'hex'));



//                                         // sock.on("data", d5 =>{

//                                         //     console.log(d5);
//                                         // });







//                                 sock.pause();

//                             }






//                  })








//             }

//         }  
//         sock.setKeepAlive(true)



//     })

// }).listen(PORT,HOST)

// console.log("Server listening on "+HOST+":"+PORT);