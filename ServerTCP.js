// 'use strict'

var net = require('net');

var HOST = process.env.HOST||'127.0.0.1';
var PORT =  process.env.PORT||8000;

let buff = null;

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


let hasLoggedIn = false;


net.createServer(function(sock) {

   sock.on('data', function(data) {

       buff = Buffer.from(data);


       if(data)
       {
           

           logIn(buff).then(data =>{

                onWritePdu().then(data =>{
                    console.log("PSSRR SENT");
                }).catch(err=>{

                    console.log("PSSRR NOT SENT");
                })

           }).then(data =>{

                console.log("User not logged in");
                hasLoggedIn = data;

           })

           

       }



   }).o

}).listen(PORT,HOST)

console.log("Server listening on "+HOST+":"+PORT);


function logIn(buff)
{

    let promise = new Promise((resolve,reject)=>{

        if(buff.toString().search('<login COOKIE="ussdgw" NODE_ID="MTNMENU_F02" PASSWORD="mtnm3nu123" RMT_SYS="uxml@ussdgw" USER="MTNMENU_F02"/>'))
        {
            console.log("Loging IN .........");
            sock.write(token) ;
            sock.write(Buffer.from('ff', 'hex'));
            resolve(true);
            


        }else{
            console.log("False Login......");
            reject(false);

        }
    })

    return promise;


}

function onWritePdu()
{
    


    let promise = new Promise((resolve,reject)=>{

        let hasSenWritten =sock.write(msgPDU);
        sock.write(Buffer.from('ff', 'hex'));

        if(hasSenWritten)
        {
            sock.pause();
            resolve(true);

        }else{

            reject(false);
        }


    })

    return promise;

}


