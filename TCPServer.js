// 'use strict'

var net = require('net');



let buff = null;

let buffRespond = null;

const token = '<?xml version="1.0" encoding="ISO-8859-1"?> <cookie VALUE="UXCKB1TAIS7XT6"/>';
const msgPDU = `<?xml version="1.0" encoding="ISO-8859-1"?>
<ussd
PDU="PSSRR"
MSISDN="27788425401"
STRING="*121#"
TID="1034"
REQID="0"
TARIFF="*">
<attributes
IMSI=
"655101234567890"
SUBTYPE="P"
BRAND="TIKTAK"
/>
<cookie/>
</ussd>`

 const contentReply = `<?xml version="1.0" encoding="ISO-8859-1"?>
 <ussd
 PDU="USSRC"
 MSISDN="27788425401"
 STRING="0"
 TID="1034"
 REQID="0"
 TARIFF="*">
 <attributes
 IMSI=
 "655101234567890"
 SUBTYPE="P"
 BRAND="TIKTAK"
 />
 <cookie/>
 </ussd>` 

 const numberReply = `<?xml version="1.0" encoding="ISO-8859-1"?>
 <ussd
 PDU="USSRC"
 MSISDN="27788425401"
 STRING="27788425401"
 TID="1034"
 REQID="0"
 TARIFF="*">
 <attributes
 IMSI=
 "655101234567890"
 SUBTYPE="P"
 BRAND="TIKTAK"
 />
 <cookie/>
 </ussd>` 












 







// //receive the socket and the message PDU *121#
// function sendMessagePDU(sock,msgPDU){

//     sock.on("data", info => {
//             console.log("Debug================Debug");
//             sock.write(msgPDU);
//             sock.write(Buffer.from('ff', 'hex'));

//     });

//     sock.end();

// }


import express from 'express'

//set up the express app 
const app = express()

//Server Endpoint

app.get('/api/v1/option1' , (req , res) => {
    var HOST = process.env.HOST||'127.0.0.1';
    var PORT =  process.env.PORT||8000;

    var socket = net.createConnection(PORT , HOST)
    console.log('Socket created.')

    socket.on( 'data' , function(data) {
        //check if we are receiving any data
        console.log('RESPONSE:' + data)
        //stream data into the buffer
        buff = Buffer.from(data)
        //check if there is data into the pipe 
        if(data){
            // search for the login request in the buffer
            if(buff.toString().search('<login COOKIE="ussdgw" NODE_ID="MTNMENU_F02" PASSWORD="mtnm3nu123" RMT_SYS="uxml@ussdgw" USER="MTNMENU_FO2"/>')){
                socket.write(token)
                socket.write(Buffer.from('ff' , 'hex'))


            }

        }


    }).on('connect' , function(){
        socket.on('data' ,pduReply => {
            console.log("Sending PSSSR")
            let hasWritten = socket.write(msgPDU)
            socket.write(Buffer.from('ff' , 'hex'))

            //checking the pipeline
            if(hasWritten){

                console.log("Checking PDU message sending")


                //writing action request in the pipe
                console.log(pduReply.toString())
                socket.write(numberReply)
                socket.write(Buffer.from('ff' , 'hex'))
                socket.on("data" , gateWayResponse => {
                    console.log(gateWayResponse)
                })
            }
        })

    })






    res.status(200).send({
        success: 'true',
        message: 'Option1 being executed'

    })
})

const portExpress = 5000

app.listen(portExpress , () => {
    console.log(`server running on port ${portExpress}`)
})



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
