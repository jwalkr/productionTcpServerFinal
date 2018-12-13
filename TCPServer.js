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

let toClientMessagePDU = null;

const server = net.createServer((socket) => {
    //wasp authentication
    //socket.resume()
    socket.on('data', (waspResponse) => {
        // check if we receiving wasp credentials 
        console.log('Response:' + waspResponse)
        //stream data into the buffer 
        buff =  Buffer.from(waspResponse)
        // check if there is data in the pipe
        console.log('Response:' + buff.toString())

        console.log(hasLoggedIn)

        if (!hasLoggedIn) {
            if (waspResponse) {

                //search for the login request in the buffer
                if (iswriting === false) {
                    console.log('entering logging in state')
                    if (buff.toString().search('<login COOKIE="ussdgw" NODE_ID="MTNMENU_F02" PASSWORD="mtnm3nu123" RMT_SYS="uxml@ussdgw" USER="MTNMENUF02"/>')) {
                        console.log('currently busy writing the token' + token)
                        hasLoggedIn = true;
                        iswriting = true

                        socket.write(token)
                        socket.write(Buffer.from('ff', 'hex'))
                        
                        iswriting = false
                        console.log('finished writing , writing state back to ' + iswriting)
                        console.log('socket created')
                        // buff = Buffer.clear()
                        // socket.pause()

                    }

                }


            }


        } else if (hasLoggedIn == true) {
            // socket.resume()
            console.log("logged == " + hasLoggedIn)


            app.post('/api/v1/option1', (req, res) => {
                userRequestJob = queue.create('UserRequest', {
                        msgPDU: req.body.msgPDU
                    })
                    .priority(-15).attempts(3).removeOnComplete(true).save()

                console.log('translator body');
                console.log("Option Endpoint Executed");
                console.log(req.body.msgPDU);
                //socket.resume()




                //queing job
                queue.process('UserRequest', 10, (job, done) => {

                    console.log('Sending the network request')
                    // socket.write(req.body.msgPDU)
                    // socket.write(Buffer.from('ff', 'hex'));

                   

                    let hasWritten = socket.write(req.body.msgPDU)
                    let hasTerminated = socket.write(Buffer.from('ff', 'hex'))
                    //socket.pause()

                    if (hasWritten) {
                        if (hasTerminated) {
                            

                            onWritwData(socket)
                            .then(menu =>{

                                console.log("Extracting Information");
                                console.log("wasp INFO========");
                                console.log(menu.toString());
                                console.log(menu.toString().search('<ussd'));
                                
                            if(menu.toString().search('<ussd')> 0)
                            {


                            let waspToClient = {
                                msgPDU: menu.toString()
                            }
                            console.log(waspToClient);

                            //waspMessage = waspResponse;

                           
                                console.log("Responding.....");
                                // res.setHeader('Content-Type', 'application/json');
                                // res.setHeader('X-Foo', 'bar');
                                // res.writeHead(200, {
                                //     'Content-Type': 'application/json'
                                // });
                                // res.end(JSON.stringify(waspToClient));
                                res.status(200).send(waspToClient);
                                //socket.pause()
                                

                            } else {

                                console.log("Buff not filled");



                            }


                            }).catch(error =>{

                                console.log(error);
                            })

                            

                            // if (buff.toString().search('<ussd ENCODING="" MSISDN="27788425401" PDU="USSRR" REQID="" STATUS="" STRING="#wegotyou1) Airtime &#xa;2) Data &#xa;3) Social Bundles&#xa;4) Call Center&#xa;0) Exit&#xa;?" TARIFF="" TID="">' === true)){
                            //     // socket.resume()
                            
       
                            //     console.log("Res from wasp");

                            //     let waspToClient = {
                            //         msgPDU: waspResponse.toString()
                            //     }
                            //     console.log(waspToClient);

                            //     //waspMessage = waspResponse;

                            //     if (waspResponse) {

                            //         console.log("Responding.....");
                            //         // res.setHeader('Content-Type', 'application/json');
                            //         // res.setHeader('X-Foo', 'bar');
                            //         // res.writeHead(200, {
                            //         //     'Content-Type': 'application/json'
                            //         // });
                            //         // res.end(JSON.stringify(waspToClient));
                            //         res.status(200).send(waspToClient);
                            //         //socket.pause()
                                    

                            //     } else {

                            //         console.log("Buff not filled");

                            //     }

                            // }





                        } else {

                            console.log("Something Happened");
                        }

                    } else {
                        console.log("Something Happened=======");
                    }

                    done && done()


                    socket.on('error', (error) => {
                        hasLoggedIn = false;
                        console.log('Handled error')
                        console.log(error)
                        userRequestJob.on('failed', (errorMessage) => {
                            console.log(error)
                            let jobError = JSON.parse(errorMessage)
                            console.log(errorMessage)
                        })



                    })
                    socket.on('close', () => {

                        hasLoggedIn = false;
                        console.log('session closed')
                    })


                })


            })


        }


    })


})

//A function to Send data to the request 

function onWritwData(socket)
{
    let promise = new Promise((resolve, reject)=>{

        socket.on("data", waspInfo =>{

            if(waspInfo)
            {
                resolve({menu: waspInfo});

            }else{
                reject({menu:"Not found"})
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