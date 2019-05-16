// only works for ASCII characters
function bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
}

// only works for ASCII characters
function stringToBytes(string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
        array[i] = string.charCodeAt(i);
    }
    return array.buffer;
}

function toUTF8Array(str) {
    var utf8 = [];
    for (var i = 0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6),
                0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12),
                0x80 | ((charcode >> 6) & 0x3f),
                0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
            i++;
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charcode = 0x10000 + (((charcode & 0x3ff) << 10)
                | (str.charCodeAt(i) & 0x3ff))
            utf8.push(0xf0 | (charcode >> 18),
                0x80 | ((charcode >> 12) & 0x3f),
                0x80 | ((charcode >> 6) & 0x3f),
                0x80 | (charcode & 0x3f));
        }
    }
    return utf8;
}

function synch() {
    var socket = new Socket();
    socket.open(
        "192.168.1.68",
        3737,
        function () {
            console.log("Connected");
            var dataString = dataS;

            var data = new toUTF8Array(dataString)
            socket.write(data);
            console.log("Socket sent");
            socket.shutdownWrite();
        },
        function (errorMessage) {
            alert("Подключитесь к интернету");
            location.href = 'index.html';
            console.log("No connection");
        });
}


// Nordic UART Service
var SERVICE_UUID = 'BA10';  //PORT BA52
var TX_UUID = 'BA52';
var RX_UUID = '00F1';
var update = []

var dataS = '';

var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function () {
        blePeripheral.onWriteRequest(app.didReceiveWriteRequest);
        blePeripheral.onBluetoothStateChange(app.onBluetoothStateChange);

        // 2 different ways to create the service: API calls or JSON
        // app.createService();
        app.createServiceJSON();

    },
    
    createServiceJSON: function() {
        var property = blePeripheral.properties;
        var permission = blePeripheral.permissions;

        var uartService = {
            uuid: SERVICE_UUID,
            characteristics: [
                {
                    uuid: TX_UUID,
                    properties: property.READ | property.NOTIFY | property.WRITE,
                    permissions: permission.WRITEABLE,
                    descriptors: [
                        {
                            uuid: '2901',
                            value: 'Transmit'
                        }
                    ]
                }
            ]
        };

        Promise.all([
            blePeripheral.createServiceFromJSON(uartService),
            blePeripheral.startAdvertising(uartService.uuid, 'UART')
        ]).then(() => {
            console.log('Created UART Service');
        });
    },
    
    // updateCharacteristicValue: function () {
    //     var input = document.querySelector('input');
    //     var bytes = stringToBytes(input.value);

    //     var success = function () {
    //         console.log('Updated RX value to ' + input.value);
    //     };
    //     var failure = function () {
    //         console.log('Error updating RX value.');
    //     };

    //     blePeripheral.setCharacteristicValue(SERVICE_UUID, RX_UUID, bytes).
    //         then(success, failure);

    // },

    didReceiveWriteRequest: function (request) {
        var message = bytesToString(request.value);
        console.log(message);
        // warning: message should be escaped to avoid javascript injection
        if (message != "0") {
            app.stateChange(message);
        }
    },
    onBluetoothStateChange: function (state) {
        console.log('Bluetooth State is', state);
    },

    stateChange(tlg) {
        document.getElementById("prohod").innerHTML = "Открыто";
        var date = Math.round(+new Date() / 1000);
        var message = date + "=" + tlg + "=" + localStorage.getItem("username") + "=" + localStorage.getItem("work") + "=" + localStorage.getItem("company") + "=" + localStorage.getItem("phone");
        dataS = message;
        synch();
        console.log(message);
        setTimeout(function () {
            if (1 == 1) {
                document.getElementById("prohod").innerHTML = "Закрыто";
            }
        }, 5000);
    }
};

app.initialize();
