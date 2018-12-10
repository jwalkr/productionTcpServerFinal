// 'use strict'

var net = require('net');
var bodyParser = require('body-parser');

var express = require('express')
//set up the express app 
const app = express();

app.use(bodyParser.json());


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

let hasLoggedIn = false;


const server = net.createServer((socket) => {


    //wasp authentication


    if (!hasLoggedIn) {

        socket.on('data', (loginToken) => {

            console.log('Response:' + loginToken)
            //stream data into the buffer 
            buff = Buffer.from(loginToken)



            console.log('Loggin IN')
            if (buff.toString().search('<login COOKIE="ussdgw" NODE_ID="MTNMENU_F02" PASSWORD="mtnm3nu123" RMT_SYS="uxml@ussdgw" USER="MTNMENUF02"/>')) {
                console.log('writing the token' + token)
                hasLoggedIn = true;

                socket.write(token)
                socket.write(Buffer.from('ff', 'hex'))


            }




        })



    } else {

        console.log("Is logged =  " + hasLoggedIn)


        app.post('/api/v1/option1', (req, res) => {

            console.log('translator body');
            console.log(req.body.msgPDU);
            //socket.resume()


            console.log('Sending the network request')
            socket.write(req.body.msgPDU)
            socket.write(Buffer.from('ff', 'hex'));

            socket.on("data", pduMessages => {

                console.log("Sending ....response ....");
                console.log(pduMessages.toString());
                res.status(200).send({
                    success: 'true',
                    message: 'PDU Sent',
                    body: pduMessages.toString()

                })

            })



            


            socket.on('error', (error) => {
                hasLoggedIn = false;
                console.log('Error occured')
                console.log(error)
 
            })
            socket.on('close', () => {

                hasLoggedIn = false;
                console.log('On close')
            })




        })


        //Execute if states are not met 
        // socket.on('error', (error) => {
        //     hasLoggedIn = false;
        //     console.log('Error occured out of state')
        //     console.log(error)

        // })
        // socket.on('close', () => {

        //     hasLoggedIn = false;
        //     console.log('On close out of state')
        // })




    }


   


})

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