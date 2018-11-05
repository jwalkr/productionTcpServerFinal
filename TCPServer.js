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
MSISDN="27832129180"
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

                    sock.on("data", info => {
                            console.log("================");
                    
                            let hasSenWritten =sock.write(msgPDU);
                            let hasSendPDU = sock.write(Buffer.from('ff', 'hex'));
                            
                            if(hasSenWritten)
                            {
                                console.log("Check PDU message sending================33");

                                console.log(hasSenWritten);
                                
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



