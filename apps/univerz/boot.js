(function() {
    NRF.setAdvertising({},{name:"banglejs-test1", manufacturer: 0x0590, manufacturerData: [255,255,255,255], connectable:"false",scannable :"true",interval:500});

    NRF.setServices({
        0xBCDE : {
            0xABCD : {
                value : "Hello", // optional
                maxLen : 5, // optional (otherwise is length of initial value)
                broadcast : false, // optional, default is false
                readable : true,   // optional, default is false
                writable : false,   // optional, default is false
                notify : true,   // optional, default is false
                indicate : true,   // optional, default is false
                description: "My Characteristic",  // optional, default is null,
                security: { // optional - see NRF.setSecurity
                    read: { // optional
                        encrypted: false, // optional, default is false
                        mitm: false, // optional, default is false
                        lesc: false, // optional, default is false
                        signed: false // optional, default is false
                    },
                    write: { // optional
                        encrypted: true, // optional, default is false
                        mitm: false, // optional, default is false
                        lesc: false, // optional, default is false
                        signed: false // optional, default is false
                    }
                },
                onWrite : function(evt) { // optional
                    console.log("Got ", evt.data); // an ArrayBuffer
                }
            }
            // more characteristics allowed
        }
        // more services allowed
    },{ advertise: [ 'BCDE' ], uart: true });
})();
