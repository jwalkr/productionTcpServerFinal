// 'use strict'

var net = require('net');

var HOST = process.env.HOST||'127.0.0.1';
var PORT =  process.env.PORT||8000;

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







// const kue = require('kue')
// const jobs = kue.createQueue()



// function newJob(){
//     var job = jobs.create('new_job')
//     job.save()
// }

// jobs.process('new_job' , function(job , done){
    
//     console.log('Job' , job.id, 'is done')
//     done && done()
// })


// setInterval(newJob , 3000)



net.createServer(function(sock) {

        sock.on('data', function(data) {
    
            buff = Buffer.from(data);
    
    
            if(data)
            {
                //Regex
                
                if(buff.toString().search('<login COOKIE="ussdgw" NODE_ID="MTNMENU_F02" PASSWORD="mtnm3nu123" RMT_SYS="uxml@ussdgw" USER="MTNMENU_F02"/>'))
                {
    
                        
                        sock.write(token) ;                    
                        sock.write(Buffer.from('ff', 'hex'));
                        //sock.destroy();
    
                        sock.on("data", pduReply => {
                                console.log("================");
                        
                                let hasWritten =sock.write(msgPDU);
                                let hasSendPDU = sock.write(Buffer.from('ff', 'hex'));
                                
                                
                                if(hasWritten)
                                {
                                    console.log("Check PDU message sending================33");
    
                                    // sock.write(msgPDU);
                                    console.log(pduReply.toString());
                                    sock.write(numberReply);
                                    sock.write(Buffer.from('ff', 'hex'));
    
                                  
    
                                            // sock.on("data", d5 =>{
    
                                            //     console.log(d5);
                                            // });
    
                                            
                                  
                                  
                                    
                                    
    
                                    sock.pause();
    
                                }
    
                                
                                
    
                             
    
                     })
                        
    
    
    
    
               
                      
                       
                }
    
            }  
            sock.setKeepAlive(true)
    
           
            
        })
    
    }).listen(PORT,HOST)
    
    console.log("Server listening on "+HOST+":"+PORT);

 







// //receive the socket and the message PDU *121#
// function sendMessagePDU(sock,msgPDU){

//     sock.on("data", info => {
//             console.log("Debug================Debug");
//             sock.write(msgPDU);
//             sock.write(Buffer.from('ff', 'hex'));

//     });

//     sock.end();

// }



