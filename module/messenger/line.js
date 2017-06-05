'use strict';

let Promise = require('bluebird');
let request = require('request');
let crypto = require('crypto');
let debug = require("debug")("bot-express:messenger");

Promise.promisifyAll(request);

module.exports = class ServiceLine {

    constructor(channel_id, channel_secret, channel_access_token){
        this._channel_id = channel_id;
        this._channel_secret = channel_secret;
        this._channel_access_token = channel_access_token;
    }

    send(event, to, messages){
        // If this is test, we will not actually issue call out.
        if (process.env.BOT_EXPRESS_ENV == "test"){
            debug("This is test so we skip the actual call out.");
            return Promise.resolve();
        }

        let headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this._channel_access_token
        };
        let body = {
            to: to,
            messages: messages
        }
        let url = 'https://api.line.me/v2/bot/message/push';
        return request.postAsync({
            url: url,
            headers: headers,
            body: body,
            json: true
        }).then(
            (response) => {
                if (response.statusCode != 200){
                    debug("line.send() failed");
                    if (response.body && response.body.message && response.body.details && response.body.details.length > 0){
                        let error_message = "Error code is " + response.statusCode + ". " + response.body.message + ".";
                        for (let detail of response.body.details){
                            error_message += " " + detail.message;
                        }
                        return Promise.reject(new Error(error_message));
                    } else if (response.body && response.body.message){
                        return Promise.reject(new Error(response.body.message));
                    } else if (response.statusMessage){
                        return Promise.reject(new Error(response.statusMessage));
                    } else {
                        return Promise.reject(new Error("line.reply() failed."));
                    }
                }
                return response;
            }
        );
    }

    reply(event, messages){
        // If this is test, we will not actually issue call out.
        if (process.env.BOT_EXPRESS_ENV == "test"){
            debug("This is test so we skip the actual call out.");
            return Promise.resolve();
        }

        let headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this._channel_access_token
        };
        let body = {
            replyToken: event.replyToken,
            messages: messages
        }
        let url = 'https://api.line.me/v2/bot/message/reply';
        return request.postAsync({
            url: url,
            headers: headers,
            body: body,
            json: true
        }).then(
            (response) => {
                if (response.statusCode != 200){
                    debug("line.reply() failed");
                    if (response.body && response.body.message && response.body.details && response.body.details.length > 0){
                        let error_message = "Error code is " + response.statusCode + ". " + response.body.message + ".";
                        for (let detail of response.body.details){
                            error_message += " " + detail.message;
                        }
                        return Promise.reject(new Error(error_message));
                    } else if (response.body && response.body.message){
                        return Promise.reject(new Error(response.body.message));
                    } else if (response.statusMessage){
                        return Promise.reject(new Error(response.statusMessage));
                    } else {
                        return Promise.reject(new Error("line.reply() failed."));
                    }
                }
                return response;
            }
        );
    }

    validate_signature(signature, raw_body){
        // If this is test, we will not actually validate the signature.
        if (process.env.BOT_EXPRESS_ENV == "test"){
            debug("This is test so we skip validating signature.");
            return true;
        }

        // Signature Validation
        let hash = crypto.createHmac('sha256', this._channel_secret).update(raw_body).digest('base64');
        if (hash != signature) {
            return false;
        }
        return true;
    }

};