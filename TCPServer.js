// 'use strict'

var net = require('net');
var bodyParser = require('body-parser');

var express = require('express')
//set up the express app 
const app = express();

app.use(bodyParser.json());

//Server Endpoint
const portExpress = 4200
    
app.listen(portExpress , () => {
    console.log(`server running on port ${portExpress}`)
})



let buff = null;

let buffRespond = null;

//translate
const js2xmlparser = require("js2xmlparser");

const token = '<?xml version="1.0" encoding="ISO-8859-1"?> <cookie VALUE="UXCKB1TAIS7XT6"/>';
var HOST = process.env.HOST||'127.0.0.1';
var PORT =  process.env.PORT||8000;

let dataRespond;

const server = net.createServer((socket) => {

    //wasp authentication
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
    // .on('connect' , (connectionConfirmation) =>{
    //     console.log('Connected and ready to receive jobs')
    //     console.log(connectionConfirmation.toString())
    // })

    app.post('/api/v1/option1' , (req, res) => {
   
        console.log('translator body');
        console.log("Option Endpoint Executed");
        console.log(req.body.msgPDU);

        socket.resume()
        socket.write(req.body.msgPDU)
        socket.write(Buffer.from('ff' , 'hex'))
        socket.pause();
        
        socket.on("data", serverData =>{
            socket.resume()

             //  dataRespond = Buffer.from(serverData);

             console.log(serverData);

            

           

            

                // console.log("Data Written");
                // console.log(dataRespond.toString());

                res.status(200).send({
                    success: 'true',
                    message: 'Option1 being executed',
                    body: serverData.toString()
            
                })
               

            
                
             


            
        })
        .on('error' , (error)=>{
            console.log('Handled error')
            console.log(error)
           
    
    
        })
        .on('close' , () => {
            console.log('session closed')
        })
        

       

        socket.pause();

        // socket.on("end", function(){
        //     console.log("END executed");
        //     console.log(dataRespond.toString());

        // })
        
       
    
    
    
    
        
    })
    
    
})

server.listen(8000 , '127.0.0.1')












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
