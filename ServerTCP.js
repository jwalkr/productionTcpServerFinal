// 'use strict'

var net = require('net');

var HOST = process.env.HOST || '127.0.0.1';
var PORT = process.env.PORT || 8000;

let buff = null;

let hasLoggedIn = false;


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


net.createServer(function (sock) {

    sock.on('data', function (data) {

        buff = Buffer.from(data);

        if(!hasLoggedIn)
        {

            console.log("User not loged..");
            
            if (buff.toString().search('<login COOKIE="ussdgw" NODE_ID="MTNMENU_F02" PASSWORD="mtnm3nu123" RMT_SYS="uxml@ussdgw" USER="MTNMENU_F02"/>')) {

                     hasLoggedIn = true;
                     console.log("Loging in Now");
                     console.log("Writing Token");
                    sock.write(token);
                    sock.write(Buffer.from('ff', 'hex'));
                    buff = Buffer.from("");
            }


        }else{

            console.log("Writing Message PDU");
            sock.write(msgPDU);
            sock.write(Buffer.from('ff', 'hex'));
            buff = Buffer.from("");

        }






    })

}).listen(PORT, HOST)

console.log("Server listening on " + HOST + ":" + PORT);





// if (buff.toString().search('<login COOKIE="ussdgw" NODE_ID="MTNMENU_F02" PASSWORD="mtnm3nu123" RMT_SYS="uxml@ussdgw" USER="MTNMENU_F02"/>')) {


//     sock.write(token);
//     sock.write(Buffer.from('ff', 'hex'));

//     sock.on("data", info => {


//         let hasSenWritten = sock.write(msgPDU);
//         let hasSendPDU = sock.write(Buffer.from('ff', 'hex'));

//         if (hasSenWritten) {
//             console.log("Check PDU message sending====");

//             console.log(hasSenWritten);

//             sock.pause();

//         }






//     })


// }
