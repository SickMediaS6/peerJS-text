(function () {
    let lastPeerId = null;
    let peer = null;
    let conn = null;
    let status = document.getElementById("status");
    let message = document.getElementById("message");
    let sendMessageBox = document.getElementById("sendMessageBox");
    let buttonSend = document.getElementById("buttonSend");
    let receiverID = document.getElementById("receiverid");

    // create peer object and handlers
    function init() {
        // Create peer object
        peer = new Peer();
        peer.on('open', function (id) {
            if (peer.id === null) {
                console.log('Received empty id');
                peer.id = lastPeerId;
            } else {
                lastPeerId = peer.id;
            }
            console.log('ID: ' + peer.id);
            receiverID.innerHTML = "ID: " + peer.id;
            status.innerHTML = "Waiting for receiver to enter your ID";
        });
        peer.on('connection', function (c) {
            // Allow only one connection
            if (conn && conn.open) {
                c.on('open', function() {
                    c.send("Sender is busy with different call");
                    setTimeout(function() { c.close(); }, 500);
                });
                return;
            }
            conn = c;
            console.log("Connected to: " + conn.peer);
            status.innerHTML = "Connected";
            go();
        });
        peer.on('disconnected', function () {
            status.innerHTML = "The connection is gone. Try to reconnect";
            console.log('The connection is gone. Try to reconnect');
            peer.id = lastPeerId;
            peer._lastServerId = lastPeerId;
        });
        peer.on('close', function() {
            conn = null;
            status.innerHTML = "Connection Closed. Please refresh";
            console.log('Connection Closed');
        });
        peer.on('error', function (err) {
            console.log(err);
            alert('' + err);
        });
    }
   //connection achieved? Trigger this.
    function go() {
        conn.on('data', function (data) {
            console.log("Data received");
            switch (data) {
                default:
                    addMessage("<span class=\"peerMessage\">Them: </span>" + data);
                    break;
            }
        });
        conn.on('close', function () {
            status.innerHTML = "Connection reset<br>Awaiting connection...";
            conn = null;
        });
    }
    function addMessage(msg) {
        message.innerHTML = "<br>" + msg + message.innerHTML;
    }
    // Listen for entry in message box
    sendMessageBox.addEventListener('keypress', function (e) {
        let event = e || window.event;
        let char = event.which || event.keyCode;
        if (char === '13')
            buttonSend.click();
    });
    // Send message
    buttonSend.addEventListener('click', function () {
        if (conn && conn.open) {
            let message = sendMessageBox.value;
            sendMessageBox.value = "";
            conn.send(message);
            console.log("Sent: " + message)
            addMessage("<span class=\"selfMessage\">You: </span>" + message);
        } else {
            console.log('Connection is closed');
        }
    });
    init();
})();
