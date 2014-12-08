/*
 * Copyright (C) 2014 rocco
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var App = function () {
    var me  = this,
        doc = document;

    // store references to DOM elements that we need
    me.localView   = doc.getElementById('local-view');
    me.remoteView  = doc.getElementById('remote-view');
    me.messageView = doc.getElementById('message-view');
    me.filesCt     = doc.getElementById('files-ct');
    me.callBtn     = doc.getElementById('call-btn');
    me.answerBtn   = doc.getElementById('answer-btn');
    me.hangupBtn   = doc.getElementById('hangup-btn');
    me.sendMsgBtn  = doc.getElementById('send-msg-btn');
    me.msgInput    = doc.getElementById('msg-input');

    // define resources that we will be using
    me.sendingChannel = undefined;
    me.receiveChannel = undefined;
    me.socket         = io.connect('http://127.0.0.1:3000');
    me.peerConnection = new RTCPeerConnection({
        iceServers: [{
            url: 'stun:stun.l.google.com:19302'
        }]
    });

    // map for incoming message chunks
    me.incoming = new Map();

    // set initial button states
    me.callBtn.disabled    = false;
    me.answerBtn.disabled  = true;
    me.hangupBtn.disabled  = true;
    me.sendMsgBtn.disabled = true;

    // register listeners
    me.socket.on('candidate', me.onCandidate.bind(me));
    me.socket.on('call', me.onCall.bind(me));

    me.callBtn.addEventListener('click', me.onCallBtnClick.bind(me));
    me.answerBtn.addEventListener('click', me.onAnswerBtnClick.bind(me));
    me.hangupBtn.addEventListener('click', me.onHangupBtnClick.bind(me));
    me.sendMsgBtn.addEventListener('click', me.onSendMsgBtnClick.bind(me));

    me.peerConnection.addEventListener('addstream', me.onAddStream.bind(me));
    me.peerConnection.addEventListener('icecandidate', me.onIceCandidate.bind(me));
    me.peerConnection.addEventListener('datachannel', me.onDataChannel.bind(me));
};

App.prototype = {

    /**
     * Event handler for when 'Call' button is clicked.
     * Prompts GetUserMedia asking the user permission to access the camera.
     * Video stream is captured when access is granted and passed to callback function.
     * A data channel to use for sending is then created.
     * An 'offer' is created that we can send over he signaling channel letting
     * the callee know we're calling him/her.
     *
     * @param   {Event} evt The click event
     * @returns {void}
     */
    onCallBtnClick: function (evt) {
        var me = this;

        navigator.getUserMedia({
            video: true
        }, function (stream) {
            var me      = this,
                success = me.onCreateOfferOrAnswerSuccess.bind(me),
                failure = me.onCreateOfferOrAnswerFailure.bind(me);

            me.onGumSuccess(stream);
            me.createSendingDataChannel('sending');

            // this differs from 'onAnswerBtnClick'
            me.peerConnection.createOffer(success, failure);
        }.bind(me), me.onGumFailure.bind(me));
    },

    /**
     * Event handler for when 'Answer' button is clicked.
     * Prompts GetUserMedia asking the user permission to access the camera.
     * Video stream is captured when access is granted and passed to callback function.
     * A data channel to use for sending is then created.
     * An 'answer' is created that we can send over he signaling channel letting
     * the caller know we're answering him/her.
     *
     * @param   {Event} evt The click event
     * @returns {void}
     */
    onAnswerBtnClick: function (evt) {
        var me = this;

        navigator.getUserMedia({
            video: true
        }, function (stream) {
            var me      = this,
                success = me.onCreateOfferOrAnswerSuccess.bind(me),
                failure = me.onCreateOfferOrAnswerFailure.bind(me);

            me.onGumSuccess(stream);
            me.createSendingDataChannel('sending');

            // this differs from 'onCallBtnClick'
            me.peerConnection.createAnswer(success, failure);
        }.bind(me), me.onGumFailure.bind(me));
    },

    /**
     * Event handler for when 'Hang up' button is clicked.
     * Closes peer connection.
     * Sets button states accordingly.
     *
     * @param   {Event} evt The click event
     * @returns {void}
     */
    onHangupBtnClick: function (evt) {
        var me = this;

        me.peerConnection.close();

        me.callBtn.disabled   = false;
        me.answerBtn.disabled = true;
        me.hangupBtn.disabled = true;
    },

    /**
     * Event handler for when 'Send' button is clicked.
     * Reads value from input field (the message).
     * Add the message as 'local' (left side) to the message view.
     * Send the message over the data channel.
     *
     * @param   {Event} evt The click event
     * @returns {void}
     */
    onSendMsgBtnClick: function (evt) {
        var me      = this,
            input   = me.msgInput,
            msg     = input.value,
            message = new Message();

        message.type = Message.TYPE_TEXT;
        message.mime = 'text/plain';
        message.data = msg;

        me.addChatMessage(message, 'local');
        me.doSendMessage(message);

        input.value = null;
    },

    /**
     * Add a chat message to the view.
     * Creates a bit of markup and appends it to the message view.
     *
     * @param   {Message} message    The message to add
     * @param   {String}  source     Where the message originated from local|remote
     * @returns {void}
     */
    addChatMessage: function (message, source) {
        var me  = this,
            doc = document,
            msg = Util.ab2str(message.data),
            txt = doc.createTextNode(msg),
            el  = doc.createElement('span');

        el.classList.add('chat-msg', source);
        el.appendChild(txt);

        me.messageView.appendChild(el);
    },

    /**
     * Event handler for when GetUserMedia successfully captured a stream.
     * Converts the stream to a URL that can be handled by HTML video and
     * set use it as source for the local video.
     * Add the stream to the peer connection.
     *
     * @param   {MediaStream} stream    The captured camera stream
     * @returns {void}
     */
    onGumSuccess: function (stream) {
        var me = this;

        me.localView.src = URL.createObjectURL(stream);
        me.peerConnection.addStream(stream);    // does not trigger 'onaddstream'
    },

    /**
     * Callback for when GetUserMedia failed,
     * e.g. access to camera was denied.
     * Re-throws error
     *
     * @param   {NavigatorUserMediaError} error The error raised by GetUserMedia
     * @returns {void}
     * @throws  {NavigatorUserMediaError}
     */
    onGumFailure: function (error) {
        throw error;
    },

    /**
     * Event handler for when a call offer was successfully created.
     * Sets the session description as being the local one on the peer connection.
     *
     * @param   {RTCSessionDescription} description The local session description to be sent over the signaling channel
     * @returns {void}
     */
    onCreateOfferOrAnswerSuccess: function (description) {
        var me      = this,
            success = me.onLocalDescriptionSuccess.bind(me, description),
            failure = me.onLocalDescriptionFailure.bind(me);

        me.peerConnection.setLocalDescription(description, success, failure);
    },

    /**
     * Event handler for when creating the call offer failed.
     * Wraps error description and throws it.
     *
     * @param   {String} error  Description of the error that occured
     * @returns {void}
     * @throws  {Error}
     */
    onCreateOfferOrAnswerFailure: function (error) {
        var me = this;

        throw new Error(error);
    },

    /**
     * Event handler for when setting the local session description was successfull.
     * Encodes session description as JSON and sends it over the signaling channel
     * so that the callee knows we're calling him/her.
     *
     * @param   {RTCSessionDescription} description The local session description to be sent over the signaling channel
     * @returns {void}
     */
    onLocalDescriptionSuccess: function (description) {
        var me      = this,
            message = JSON.stringify(description);

        me.callBtn.disabled   = true;
        me.answerBtn.disabled = true;
        me.hangupBtn.disabled = false;

        me.socket.emit('call', message);
    },

    /**
     * Event handler for when setting the local session description failed.
     * Wraps error description and throws it.
     *
     * @param   {String} error  Description of the error that occured
     * @returns {void}
     * @throws  {Error}
     */
    onLocalDescriptionFailure: function (error) {
        var me = this;

        throw new Error(error);
    },

    /**
     * Event hander for when we receive a 'call' event over the signaling channel
     * from the caller. In practice this is the callers session description
     * generated by the call offer. From this perspective this represents the
     * remote session description.
     * Parses the (JSON) message and create a new RTCSessionDescription.
     * Set the session description as being the remote description.
     *
     * @param   {String} message    Message send by the caller
     * @returns {void}
     */
    onCall: function (message) {
        var me          = this,
            signal      = JSON.parse(message),
            description = new RTCSessionDescription(signal),
            success     = me.onRemoteDescriptionSuccess.bind(me, description),
            failure     = me.onRemoteDescriptionFailure.bind(me);

        me.peerConnection.setRemoteDescription(description, success, failure);
    },

    /**
     * Event handler for when setting the remote session description was successfull.
     * Disables 'Call' button.
     * Disables 'Answer' button if the session description was not a call offer.
     *
     * @param   {RTCSessionDescription} description The remote session description to be sent over the signaling channel
     * @returns {void}
     */
    onRemoteDescriptionSuccess: function (description) {
        var me = this;

        me.callBtn.disabled   = true;
        me.answerBtn.disabled = (description.type !== 'offer');
    },

    /**
     * Event handler for when setting the remote session description failed.
     * Wraps error description and throws it.
     *
     * @param   {String} error  Description of the error that occured
     * @returns {void}
     * @throws  {Error}
     */
    onRemoteDescriptionFailure: function (error) {
        var me = this;

        throw new Error(error);
    },


    /**
     * Event handler for when media stream is added to the peer connection.
     * Converts the stream to a URL that can be handled by HTML video and
     * set use it as source for the remote video.
     * Is not triggered by adding local stream.
     *
     * @param   {Event} evt
     * @returns {void}
     */
    onAddStream: function (evt) {
        var me = this;

        me.remoteView.src = URL.createObjectURL(evt.stream);
    },

    /**
     * Event handler for when an ICE candidate is added to the peer connection.
     * Encodes ICE candidate as JSON and sends it over the signaling channel.
     *
     * @param   {Event} evt The event that informs us about the ICE candidate
     * @returns {void}
     */
    onIceCandidate: function (evt) {
        var me      = this,
            message = JSON.stringify(evt.candidate);

        me.socket.emit('candidate', message);
    },

    /**
     * Event hander for when we receive a 'candidate' event over the signaling channel.
     * from the caller. In practice this is one of the callers ICE candidates.
     * Parses the (JSON) message and create a new RTCIceCandidate.
     * Add ICE candidate to the peer connection.
     *
     * @param   {Object} message    Message send by the caller/callee
     * @returns {void}
     */
    onCandidate: function (message) {
        var me        = this,
            signal    = JSON.parse(message),
            success   = me.onAddIceCandidateSuccess.bind(me),
            failure   = me.onAddIceCandidateFailure.bind(me),
            candidate;

        if (signal) {
            candidate = new RTCIceCandidate(signal);
            me.peerConnection.addIceCandidate(candidate, success, failure);
        }
    },

    /**
     * Event handler for when an ICE candidate was successfully added to the peer connection.
     * NoOp
     *
     * @returns {void}
     */
    onAddIceCandidateSuccess: function () {
        var me = this;

    },

    /**
     * Event handler for when adding an ICE candidate failed.
     * Wraps error description and throws it.
     *
     * @param   {String} error Description of the error that occured
     * @returns {void}
     * @throws  {Error}
     */
    onAddIceCandidateFailure: function (error) {
        var me = this;

        throw new Error(error);
    },

    /**
     * Event handler for when a data channel was added to the peer connection.
     * Stores the data channel in reference and attach listeners to it.
     *
     * @param   {RTCDataChannelEvent} evt   The event that informs us about the data channel
     * @returns {void}
     */
    onDataChannel: function (evt) {
        var me = this;

        me.receiveChannel = evt.channel;
        me.attachDataChannelListeners(me.receiveChannel);
    },

    /**
     * Creates a data channel to use for sending messages over the peer connection.
     * Stores the data channel in reference and attach listeners to it.
     *
     * @param   {String} label Textual label for the data channel
     * @returns {void}
     */
    createSendingDataChannel: function (label) {
        var me          = this,
            dataChannel = me.peerConnection.createDataChannel(label);

        me.attachDataChannelListeners(dataChannel);
        me.sendingChannel = dataChannel;
    },

    /**
     * Attach listeners to a data channel for the events: open, message, close, error.
     *
     * @param   {RTCDataChannel} dataChannel The data channel to attach the listeners to
     * @returns {void}
     */
    attachDataChannelListeners: function (dataChannel) {
        var me = this;

        dataChannel.addEventListener('open', me.onDataChannelOpen.bind(me));
        dataChannel.addEventListener('message', me.onDataChannelMessage.bind(me));
        dataChannel.addEventListener('close', me.onDataChannelClose.bind(me));
        dataChannel.addEventListener('error', me.onDataChannelError.bind(me));
    },

    /**
     * Event handler for when a data channel opens.
     * Enables 'Send' button.
     * Enables FileDrop.
     *
     * @param   {Event} evt The event that informs us about the data channel that opened
     * @returns {void}
     */
    onDataChannelOpen: function (evt) {
        var me = this;

        if (me.sendingChannel === evt.target) {
            me.sendMsgBtn.disabled = false;
            me.enableFileDrop();
        }
    },

    /**
     * Event handler for when a data channel receives a message.
     * Decodes the message and checks the uuid if it already has part of it in memory.
     * If this is the case, it adds the data to the existing message, otherwise
     * it stores a new message.
     * Checks if the received chuck was also the last one.
     * It this is the case, it check what kind of message it was.
     * A text message is added to the message view with 'remote' as source.
     * A file message is added to the download list.
     *
     * @param   {MessageEvent} evt  The event that informs us about the message from the data channel
     * @returns {void}
     */
    onDataChannelMessage: function (evt) {
        var me  = this,
            msg = Message.parse(evt.data),
            message;

        if (me.incoming.has(msg.uuid)) {
            message = me.incoming.get(msg.uuid);
        } else {
            message = msg;
            me.incoming.set(message.uuid, message);
        }

        message.addChunk(msg.chunkNr, msg.data);

        if (message.complete) {
            switch (message.type) {
                case Message.TYPE_TEXT:
                    me.addChatMessage(message, 'remote');
                    break;
                case Message.TYPE_FILE:
                    me.addFileDownload(message);
                    break;
            }

            me.incoming.delete(message.uuid);
        }
    },

    /**
     * Event handler for when a data channel opens.
     * Disables 'Send' button.
     *
     * @param   {Event} evt The event that informs us about the data channel that closed
     * @returns {void}
     */
    onDataChannelClose: function (evt) {
        var me = this;

        me.sendMsgBtn.disabled = true;
        me.disableFileDrop();
    },

    /**
     * Event handler for when an error occurs on the data channel.
     * NoOp
     *
     * @param   {Event} evt The event that informs us about the data channel error
     * @returns {void}
     */
    onDataChannelError: function (evt) {
        var me = this;

    },

    /**
     * Registers listeners for the dragover, dragenter, dragleave and drop events on the
     * message view, enabling the ability to drag/drop files in the message view
     * to send them to the other party.
     * Removes the 'disabled' class from the message view to indicate is has become active.
     *
     * @returns {void}
     */
    enableFileDrop: function () {
        var me = this;

        me.messageView.addEventListener('dragover', me.onMessageViewDragOver.bind(me));
        me.messageView.addEventListener('dragenter', me.onMessageViewDragEnter.bind(me));
        me.messageView.addEventListener('dragleave', me.onMessageViewDragLeave.bind(me));
        me.messageView.addEventListener('drop', me.onMessageViewDrop.bind(me));
        me.messageView.classList.remove('disabled');
    },

    /**
     * Unregisters listeners for the dragover, dragenter, dragleave and drop events on the
     * message view, disabling the ability to drag/drop files in the message view.
     * Adds the 'disabled' class to the message view to indicate is has become inactive.
     *
     * @returns {void}
     */
    disableFileDrop: function () {
        var me = this;

        me.messageView.removeEventListener('dragover', me.onMessageViewDragOver.bind(me));
        me.messageView.removeEventListener('dragenter', me.onMessageViewDragEnter.bind(me));
        me.messageView.removeEventListener('dragleave', me.onMessageViewDragLeave.bind(me));
        me.messageView.removeEventListener('drop', me.onMessageViewDrop.bind(me));
        me.messageView.classList.add('disabled');
    },

    /**
     * Event lister for when a file is dragged over the message view.
     * NoOp
     *
     * @param   {DragEvent} evt The drag event
     * @returns {void}
     */
    onMessageViewDragOver: function (evt) {
        var me = this;

        evt.preventDefault();
    },

    /**
     * Event lister for when a dragged file enters the message view.
     * Adds the 'over' class to the message view which changes the border color.
     *
     * @param   {DragEvent} evt The drag event
     * @returns {void}
     */
    onMessageViewDragEnter: function (evt) {
        var me = this;

        me.messageView.classList.add('over');
    },

    /**
     * Event lister for when a dragged file leaves the message view.
     * Removes the 'over' class from the message view which restores the border color.
     *
     * @param   {DragEvent} evt The drag event
     * @returns {void}
     */
    onMessageViewDragLeave: function (evt) {
        var me = this;

        me.messageView.classList.remove('over');
    },

    /**
     * Event handler for when a file was dropped on the message view.
     * Removes the 'over' class from the message view, restoring the border color.
     * Starts the proccess of reading the files that were dropped on the message view.
     *
     * @param   {DragEvent} evt The drag event
     * @returns {void}
     */
    onMessageViewDrop: function (evt) {
        var me = this;

        evt.preventDefault();

        me.messageView.classList.remove('over');
        me.readFiles(evt.dataTransfer.files);
    },

    /**
     * Creates a file reader for each file and registers a listener for the 'load'
     * event to it which is triggered when the entire contents of the file was read.
     * Also makes sure the file object is passed to the listener so we still know
     * what the filename etc was.
     * Then read the contents of the file as an array buffer.
     *
     * @param   {FileList} files    The files that were dropped on the message view
     * @returns {void}
     */
    readFiles: function (files) {
        var me = this,
            reader, file, i;

        for (i = 0; i < files.length; i++) {
            file   = files.item(i);
            reader = new FileReader();

            reader.addEventListener('load', me.onFileReaderLoad.bind(me, file));
            reader.readAsArrayBuffer(file);
        }
    },

    /**
     * Event handler for when the entire contents of a file was read.
     * Creates a new message and populates it with the file data.
     * Remove the event listener for the load event as it is no longer needed.
     * Start the process of sending the file.
     *
     * @param   {File}          file    The original file object
     * @param   {ProgressEvent} evt     The load event
     * @returns {void}
     */
    onFileReaderLoad: function (file, evt) {
        var me     = this,
            reader = evt.target,
            msg    = new Message();

        msg.type = 'file';
        msg.name = file.name;
        msg.mime = file.type;
        msg.data = reader.result;

        reader.removeEventListener('load', me.onFileReaderLoad.bind(me, file));

        me.doSendMessage(msg);
    },

    /**
     * Since we cannot send the entire file in one go we need to split it into
     * individual chunks and send these separately.
     *
     * @param   {Message} message   The message to send
     * @returns {void}
     */
    doSendMessage: function (message) {
        var me = this,
            chunk;

        for (chunk of message) {
            me.sendingChannel.send(chunk);
        }
    },

    /**
     * Add a download link of an incoming file to the page.
     *
     * @param   {Message} message   The incoming message containing the file
     * @returns {void}
     */
    addFileDownload: function (message) {
        var me   = this,
            doc  = document,
            a    = doc.createElement('a'),
            txt  = doc.createTextNode(message.name),
            blob = new Blob([message.data], {
                type: message.mime
            });

        a.appendChild(txt);
        a.download = message.name;
        a.title    = 'Download ' + message.name;
        a.href     = URL.createObjectURL(blob);

        a.addEventListener('click', me.onFileDownloadClick.bind(me, message.uuid));

        me.filesCt.appendChild(a);
    },

    /**
     * Event handler for when a download link is clicked.
     * Deletes the reference to the incoming file.
     * Removes the event listener.
     * Removes the link itself.
     *
     * @param   {String} uuid   The unique identifier fo the file
     * @param   {Event}  evt    The click event
     * @returns {void}
     */
    onFileDownloadClick: function (uuid, evt) {
        var me = this,
            a  = evt.target;

        me.incoming.delete(uuid);

        a.removeEventListener('click', me.onFileDownloadClick.bind(me, uuid));
        me.filesCt.removeChild(a);
    }
};

document.addEventListener('DOMContentLoaded', function () {
    var app = new App();

    // global access for debugging
    window.rtcapp = app;
});
