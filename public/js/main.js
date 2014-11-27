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
    var me     = this,
        doc    = document,
        cfg    = {
            pc: {
                iceServers: [{
                    url: 'stun:stun.l.google.com:19302'
                }]
            }
        };

    // assign properties
    me.localView      = doc.getElementById('local-view');
    me.remoteView     = doc.getElementById('remote-view');
    me.callBtn        = doc.getElementById('call-btn');
    me.answerBtn      = doc.getElementById('answer-btn');
    me.hangupBtn      = doc.getElementById('hangup-btn');
    me.peerConnection = new RTCPeerConnection(cfg.pc);
    me.socket         = io.connect('http://127.0.0.1:3000');

    me.callBtn.disabled   = false;
    me.answerBtn.disabled = true;
    me.hangupBtn.disabled = true;

    // register listeners
    me.socket.on('candidate', me.onCandidate.bind(me));
    me.socket.on('call', me.onCall.bind(me));

    me.callBtn.addEventListener('click', me.onCallBtnClick.bind(me));
    me.answerBtn.addEventListener('click', me.onAnswerBtnClick.bind(me));
    me.hangupBtn.addEventListener('click', me.onHangupBtnClick.bind(me));

    me.peerConnection.addEventListener('addstream', me.onAddStream.bind(me));
    me.peerConnection.addEventListener('icecandidate', me.onIceCandidate.bind(me));
};

App.prototype = {

    /**
     *
     * @param   {Event} evt
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
            me.peerConnection.createOffer(success, failure);
        }.bind(me), me.onGumFailure.bind(me));
    },

    /**
     *
     * @param   {Event} evt
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
            me.peerConnection.createAnswer(success, failure);
        }.bind(me), me.onGumFailure.bind(me));
    },

    /**
     *
     * @param   {Event} evt
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
     *
     * @param   {MediaStream} stream
     * @returns {void}
     */
    onGumSuccess: function (stream) {
        var me = this;

        me.localView.src = URL.createObjectURL(stream);
        me.peerConnection.addStream(stream);
    },

    /**
     *
     * @param   {NavigatorUserMediaError} error
     * @returns {void}
     */
    onGumFailure: function (error) {
        throw error;
    },

    /**
     *
     * @param   {RTCSessionDescription} description
     * @returns {void}
     */
    onCreateOfferOrAnswerSuccess: function (description) {
        var me      = this,
            success = me.onLocalChannelDescriptionSuccess.bind(me, description),
            failure = me.onLocalChannelDescriptionFailure.bind(me);

        me.peerConnection.setLocalDescription(description, success, failure);
    },

    /**
     *
     * @param   {String} error
     * @returns {void}
     * @throws  {Error}
     */
    onCreateOfferOrAnswerFailure: function (error) {
        var me = this;

        throw new Error(error);
    },

    /**
     *
     * @param   {RTCSessionDescription} description
     * @returns {void}
     */
    onLocalChannelDescriptionSuccess: function (description) {
        var me      = this,
            message = JSON.stringify(description);

        me.callBtn.disabled   = true;
        me.answerBtn.disabled = true;
        me.hangupBtn.disabled = false;

        me.socket.emit('call', message);
    },

    /**
     * @param   {String} error
     * @returns {void}
     * @throws  {Error}
     */
    onLocalChannelDescriptionFailure: function (error) {
        var me = this;

        throw new Error(error);
    },

    /**
     *
     * @param   {String} message
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
     *
     * @param   {RTCSessionDescription} description
     * @returns {void}
     */
    onRemoteDescriptionSuccess: function (description) {
        var me = this;

        me.callBtn.disabled   = true;
        me.answerBtn.disabled = !(description.type === 'offer');
    },

    /**
     *
     * @param   {String} error
     * @returns {void}
     * @throws  {Error}
     */
    onRemoteDescriptionFailure: function (error) {
        var me = this;

        throw new Error(error);
    },


    /**
     * Is not triggered by local stream
     *
     * @param   {Event} evt
     * @returns {void}
     */
    onAddStream: function (evt) {
        var me = this;

        me.remoteView.src = URL.createObjectURL(evt.stream);
    },

    /**
     *
     * @param   {Event} evt
     * @returns {void}
     */
    onIceCandidate: function (evt) {
        var me      = this,
            message = JSON.stringify(evt.candidate);

        me.socket.emit('candidate', message);
    },

    /**
     *
     * @param   {Object} message
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
     *
     * @returns {void}
     */
    onAddIceCandidateSuccess: function () {
        var me = this;

    },

    /**
     *
     * @param   {String} error
     * @returns {void}
     * @throws  {Error}
     */
    onAddIceCandidateFailure: function (error) {
        var me = this;

        throw new Error(error);
    }
};

document.addEventListener("DOMContentLoaded", function () {
    var app = new App();

    // global access for debugging
    window.rtcapp = app;
});
