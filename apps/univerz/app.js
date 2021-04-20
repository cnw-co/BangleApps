// {bpm, confidence}
let hrmInfo;
let hrmInterval;
// {x, y, z, mag, diff}
let accelInfo;
let accelInterval;

let advertiseStarted = false;

// let txPower = 0;

const SENSOR_READ_INTERVAL = 20000;

// let mainMenu = {
//     "" : { "title" : "-- Main Menu --" },
//     "Set tx power" : function() { getTxPowerMenu(); },
//     "Exit" : function() { exit(); }, // remove the menu
// };

// const txPowerOptions = [-20, -16, -8, -4, 0];

// let txPowerMenu = {};

function init() {
    NRF.setTxPower(4);
    Bangle.setPollInterval(250);
    getMainMenu();
}

function getMainMenu() {
    let mainMenu = {"": {"title": ""}};
    if (!advertiseStarted) {
        mainMenu['Start'] = () => {start();};
    } else {
        mainMenu['Stop'] = () => {stop();};
    }
    mainMenu[NRF.getAddress()] = function() {};
    mainMenu["Kilepes"] = () => {exit();}
    E.showMenu(mainMenu);
}

function start() {
    Bangle.setHRMPower(1);
    Bangle.on('HRM', onHRM);
    accelInterval = setInterval(readAcceleration, SENSOR_READ_INTERVAL);
    advertiseStarted = !advertiseStarted;
    getMainMenu();
}

function stop() {
    Bangle.setHRMPower(0);
    Bangle.on('HRM', function() {});
    NRF.setScanResponse([]);
    if (hrmInterval) clearInterval(hrmInterval);
    if(accelInterval) clearInterval(accelInterval);
    advertiseStarted = !advertiseStarted;
    getMainMenu();
}

// function getTxPowerMenu() {
//         txPowerMenu = {};
//         txPowerMenu[""] = {"title": "-- Set tx power (dbm) --"};
//         console.log("txPower: " + txPower);
//         txPowerOptions.forEach((val, index) => {
//             if (txPower === val) {
//             txPowerMenu["" + val + "*"] = () => setTxPower(val);
//         } else {
//             txPowerMenu["" + val] = () => setTxPower(val);
//         }
//     });
//     txPowerMenu["< Back"] = function() { E.showMenu(mainMenu); };
//     E.showMenu(txPowerMenu);
// }

// const setTxPower = (power) => {
//     NRF.setTxPower(power);
//     txPower = power;
//     console.log("new txPower: " + txPower);
//     E.showMenu(mainMenu);
// };

function onHRM(hrm) {
    hrmInfo = hrm;
    if (hrmInterval) clearInterval(hrmInterval);
    hrmInterval = setInterval(readHeartRate,SENSOR_READ_INTERVAL);
}

function readHeartRate() {
    if (hrmInfo) {
        // Terminal.println("------ Read heart rate ------");
        // Terminal.println("bpm: " + hrmInfo.bpm);
        // Terminal.println("bpm first char: " +  ("" + hrmInfo.bpm).split("")[0]);
        // Terminal.println("hrm confidence: " + hrmInfo.confidence);
        // Terminal.println("hrm raw data: " + hrmInfo.raw);
        // Terminal.println("");
    }
}



function readAcceleration() {
    accelInfo = Bangle.getAccel();
    if (accelInfo) {
        // Terminal.println("------ Read acceleration ------");
        // let x = ("" + accelInfo.x).substr(0,4);
        // let y = ("" + accelInfo.y).substr(0,4);
        // let z = ("" + accelInfo.z).substr(0,4);
        // Terminal.println("x: " + x + "y: " + y + "z: " + z);
        // Terminal.println("diff: " + accelInfo.diff);
        // Terminal.println("magnitude: " + accelInfo.mag);
        // Terminal.println("");
        if (hrmInfo) {
            sendOnBluetooth();
        }
    }
}

function sendOnBluetooth() {
    let data = {bpm: addLeadingZeros("" + hrmInfo.bpm),
        confidence: addLeadingZeros("" + hrmInfo.confidence),
        x: prepareFloatToHexConvert(accelInfo.x),
        y: prepareFloatToHexConvert(accelInfo.y),
        z: prepareFloatToHexConvert(accelInfo.z),
        mag: prepareFloatToHexConvert(accelInfo.mag)
    };
    let scanResponse = [];
    scanResponse = convertValueToHex(scanResponse, data.bpm);
    scanResponse = convertValueToHex(scanResponse, data.confidence);
    scanResponse = convertValueToHex(scanResponse, data.x);
    scanResponse = convertValueToHex(scanResponse, data.y);
    scanResponse = convertValueToHex(scanResponse, data.z);
    scanResponse = convertValueToHex(scanResponse, data.mag);
    //Terminal.println("data length" + scanResponse.length);
    //a kiolvasott eszkoz mert adatokbol, és a mar meglévő tömb elemekből a scan response package hosszának kiszámítása
    scanResponse.unshift(+("0x" + (3 + scanResponse.length).toString(16)), 0xff, 0xff, 0xff);
    //Terminal.println(" data length: " + scanResponse.length);
    NRF.setScanResponse(scanResponse);
}

function convertValueToHex(hexArray, value) {
    for(let i = 0; i < value.length; i++) {
        hexArray.push(+("0x" + value.charCodeAt(i).toString(16)));
    }
    return hexArray;
}

function prepareFloatToHexConvert(value) {
    if (!value) return;
    value = "" + value;
    let numberSign = "+";
    if (value.includes("-", 0)) {
        numberSign = "-";
        value = value.replace("-", "");
    }
    if (value.includes(".", 0)) {
        let val = value.split(".");
        val[1] = val[1].substr(0,1);
        value = "" + val[0] + val[1];
    } else {
        value = "0" + value;
    }
    value = numberSign + value;
    return value;
}

function addLeadingZeros(value) {
    if (value && value.length < 3) {
        let zeros = "";
        for(let i = 0; i < 3 - value.length; i++) {
            zeros += "0";
        }
        value = zeros + value;
    }
    return value;
}

const exit = () => {
    if (hrmInterval) clearInterval(hrmInterval);
    if(accelInterval) clearInterval(accelInterval);
    E.showMenu();
    NRF.setScanResponse([]);
    Bangle.setHRMPower(0);
    NRF.setTxPower(0);
    NRF.restart();
    Bangle.showLauncher();
};

init();
