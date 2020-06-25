(function () {
    let lastPeerId = null;
    let peer = null;
    let conn = null;
    let status = document.getElementById("status");
    let message = document.getElementById("message");
    let buttonSend = document.getElementById("buttonSend");
    let buttonConnect = document.getElementById("buttonConnect");
    let receiverIdInput = document.getElementById("receiverid");

    // create peer object and error handlers
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
        });
        peer.on('connection', function (c) {
            // no futher connections
            c.on('open', function() {
                c.send("Sender is busy with different call");
                setTimeout(function() { c.close(); }, 500);
            });
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
    function join() {
        // Close old conn
        if (conn) {
            conn.close();
        }
        // Create connection to peer inputfield
        conn = peer.connect(receiverIdInput.value, {
            reliable: true
        });
        conn.on('open', function () {
            status.innerHTML = "Connected with: " + conn.peer;
            console.log("Connected with: " + conn.peer);

            // Check URL params for commands that should be sent immediately
            let command = getUrlParam("command");
            if (command)
                conn.send(command);
        });
        // Handle incoming messages
        conn.on('data', function (data) {
            addMessage("<span class=\"peerM\">Them:</span> " + data);
        });
        conn.on('close', function () {
            status.innerHTML = "Connection closed";
        });
    }
    // Href Get function https://stackoverflow.com/questions/979975/how-to-get-the-value-from-the-get-parameters & https://community.esri.com/thread/33634
    function getUrlParam(name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        let regexS = "[\\?&]" + name + "=([^&#]*)";
        let regex = new RegExp(regexS);
        let results = regex.exec(window.location.href);
        if (results == null)
            return null;
        else
            return results[1];
    }
   //message send
    function addMessage(msg) {
        message.innerHTML = "<br>" + msg + message.innerHTML;
    }
    // Listen for entry in message box
    sendMessageBox.addEventListener('keypress', function (e) {
        let event = e || window.event;
        let char = event.which || event.keyCode;
        if (char == '13')
            buttonSend.click();
    });
    // Send message
    buttonSend.addEventListener('click', function () {
        if (conn && conn.open) {
            let message = sendMessageBox.value;
            sendMessageBox.value = "";
            conn.send(message);
            console.log("Sent: " + message);
            addMessage("<span class=\"selfMessage\">You: </span> " + message);
        } else {
            console.log('Connection is closed');
        }
    });
    // peer connection start
    buttonConnect.addEventListener('click', join);

    // Go to ID
    init();
})();
