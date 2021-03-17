// {bpm, confidence}
let hrmInfo;
let hrmInterval;
// {x, y, z, mag, diff}
let accelInfo;
let accelInterval;
Bangle.setHRMPower(1);
Bangle.setPollInterval(250);

const BT_SCAN_INTERVAL = 5000;

const HRM_READ_INTERVAL = 5000;

const ACCEL_READ_INTERVAL = 5000;

const NODEVICE = 'No devices found';

// a bluetooth adok mac cimei
let permittedBLEReceivers = ["3c:71:bf:4f:c1:22", "30:ae:a4:0e:8f:ee"];

//legkozelebbi bluetooth ado mac cime
let nearestBLEReceiver = "";

const menu = {
};

menu[NODEVICE] = {
    value : "",
    onchange : () => {}
};

function init() {
    NRF.setTxPower(-4);
    NRF.restart();
    Bangle.on('HRM', onHRM);
    accelInterval = setInterval(readAcceleration, HRM_READ_INTERVAL);
    //bluetooth scan, elvileg nem kell
    //scan();
    //waitMessage();
    //setInterval(scan, BT_SCAN_INTERVAL);
    setTimeout(() => setWatch(exit, BTN2, { repeat: false, edge: "falling" }), 1000);
}

function onHRM(hrm) {
    hrmInfo = hrm;
    if (hrmInterval) clearInterval(hrmInterval);
    hrmInterval = setInterval(readHeartRate,ACCEL_READ_INTERVAL);
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
        sendOnBluetooth();
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

function scan() {
    NRF.findDevices(devices => {
        // for (let device of devices) {
        //
        //     // Only display devices that advertise a name
        //
        //     if (device.name) {
        //         // Remove no devices found message if it is present
        //         if (menu[NODEVICE]) {
        //             delete menu[NODEVICE];
        //         }
        //         menu[device.name] = {
        //             value : device.rssi,
        //             onchange : () => {}
        //         };
        //         Terminal.println("device name: " + device.name + ", rssi: " + device.rssi);
        //         Terminal.println("device id" + device.id);
        //     }
        // }
        getNearestBLEReceiver(devices);
        // draw();
    }, { active: true });
}

function getNearestBLEReceiver(devices) {
    let nearestDevice = "";
    let nearestDeviceRssi;
    for (let device of devices) {
        let deviceId = device.id.split(" ")[0];
        if (permittedBLEReceivers.indexOf(deviceId, 0) === -1) {
            continue;
        }
        if (!nearestDeviceRssi || device.rssi > nearestDeviceRssi) {
            nearestDeviceRssi = device.rssi;
            nearestDevice = deviceId;
        }
    }
    nearestBLEReceiver = nearestDevice;
    //Terminal.println("nearest bt receiver: " + nearestBLEReceiver);
}


function waitMessage() {
    E.showMessage('scanning');
}

function draw() {
    E.showMenu(menu);
}

const exit = () => {
    if (hrmInterval) clearInterval(hrmInterval);
    if(accelInterval) clearInterval(accelInterval);
    NRF.setScanResponse([]);
    Bangle.setHRMPower(0);
    NRF.setTxPower(0);
    Bangle.showLauncher();
}

init();
