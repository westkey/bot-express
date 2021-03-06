"use strict";

require("dotenv").config();

const REQUIRED_OPTIONS = {
    line: ["line_channel_secret", "line_access_token"],
    facebook: ["facebook_app_secret", "facebook_page_access_token"],
    google: []
}

// Import NPM Packages
Promise = require("bluebird");
const Memory = require("./memory");
const debug = require("debug")("bot-express:webhook");

// Import Flows
const flows = {
    beacon: require('./flow/beacon'),
    follow: require('./flow/follow'),
    unfollow: require('./flow/unfollow'),
    join: require('./flow/join'),
    leave: require('./flow/leave'),
    start_conversation: require('./flow/start_conversation'),
    reply: require('./flow/reply'),
    btw: require('./flow/btw'),
    push: require('./flow/push')
}

// Import Messenger Abstraction.
const Messenger = require("./messenger");

const BotExpressWebhookSkip = require("./error/webhook");

/**
Webhook to receive all request from messenger.
@class
*/
class Webhook {
    constructor(options){
        this.options = options;
    }

    /**
    Main function.
    @returns {Promise.<context>}
    */
    run(){
        debug("Webhook runs.\n\n");

        let memory = new Memory(this.options.memory);

        // Identify messenger.
        if (this.options.req.get("X-Line-Signature") && this.options.req.body.events){
            this.options.messenger_type = "line";
        } else if (this.options.req.get("X-Hub-Signature") && this.options.req.body.object == "page"){
            this.options.messenger_type = "facebook";
        } else if (this.options.req.get("google-actions-api-version")){
            this.options.messenger_type = "google";
        } else {
            debug(`This event comes from unsupported message platform. Skip processing.`);
            return Promise.resolve(null);
        }
        debug(`Messenger is ${this.options.messenger_type}`);

        // Check if required options for this message platform are set.
        for (let req_opt of REQUIRED_OPTIONS[this.options.messenger_type]){
            if (typeof this.options[req_opt] == "undefined"){
                debug(`Required option: ${req_opt} is missing.`);
                return Promise.reject({
                    reason: "required option missing",
                    missing_option: req_opt
                });
            }
        }
        debug("Messenger specific required options all set.");

        // Instantiate messenger instance.
        let messenger = new Messenger(this.options);
        debug("Messenger abstraction instantiated.");

        // Signature Validation.
        if (!messenger.validate_signature(this.options.req)){
            return Promise.reject("Signature validation failed.");
        }
        debug("Signature validation suceeded.");

        // Set Events.
        let events = messenger.extract_events(this.options.req.body);

        // Process events.
        let done_all_flows = [];
        for (let event of events){
            debug(`Processing following event.`);
            debug(event);

            messenger.event = event;

            // If this is for webhook validation, we skip processing this.
            if(messenger.type == "line" && (event.replyToken == "00000000000000000000000000000000" || event.replyToken == "ffffffffffffffffffffffffffffffff")){
                debug("This is webhook validation so skip processing.");
                return Promise.resolve();
            }

            /**
            * Overview of Webhook Promise Chain

            1. Recall memory.
            2. Run flow.
            3. Update memory.
            **/

            // Recall Memory
            let memory_id;
            if (messenger.identify_event_type(event) == "bot-express:push"){
                memory_id = messenger.extract_to_id(event);
            } else {
                memory_id = messenger.extract_sender_id(event);
            }
            debug(`memory id is ${memory_id}.`);

            // Run flow.
            let done_flow = Promise.resolve().then((response) => {
                return memory.get(memory_id);
            }).then((context) => {
                messenger.context = context;

                let flow;
                let event_type = messenger.identify_event_type(event);
                debug(`event type is ${event_type}.`);

                if (["follow", "unfollow", "join", "leave"].includes(event_type)) {
                    // ### Follow | Unfollow | Join | Leave Flow ###
                    if (!this.options[event_type + "_skill"]){
                        return Promise.reject(new BotExpressWebhookSkip(`This is ${event_type} flow but ${event_type}_skill not found so skip.`));
                    }

                    try {
                        flow = new flows[event_type](messenger, event, this.options);
                    } catch(err) {
                        return Promise.reject(err);
                    }
                    return flow.run();
                } else if (event_type == "beacon"){
                    // ### Beacon Flow ###
                    let beacon_event_type = messenger.extract_beacon_event_type();

                    if (!beacon_event_type){
                        return Promise.reject(new BotExpressWebhookSkip(`Unsupported beacon event so we skip this event.`));
                    }
                    if (!this.options.beacon_skill || !this.options.beacon_skill[beacon_event_type]){
                        return Promise.reject(new BotExpressWebhookSkip(`This is beacon flow but beacon_skill["${beacon_event_type}"] not found so skip.`));
                    }
                    debug(`This is beacon flow and we use ${this.options.beacon_skill[beacon_event_type]} as skill`);

                    messenger.context = context;
                    try {
                        flow = new flows[event_type](messenger, event, this.options, beacon_event_type);
                    } catch(err) {
                        return Promise.reject(err);
                    }
                    return flow.run();
                } else if (event_type == "bot-express:push"){
                    // ### Push Flow ###
                    try {
                        flow = new flows["push"](messenger, event, this.options);
                    } catch(err) {
                        return Promise.reject(err);
                    }
                    return flow.run();
                } else if (!context){
                    // ### Start Conversation Flow ###
                    try {
                        flow = new flows["start_conversation"](messenger, event, this.options);
                    } catch(err) {
                        return Promise.reject(err);
                    }
                    return flow.run();
                } else {
                    if (context.confirming){
                        // ### Reply Flow ###
                        try {
                            flow = new flows["reply"](messenger, event, context, this.options);
                        } catch(err){
                            return Promise.reject(err);
                        }
                        return flow.run();
                    } else {
                        // ### BTW Flow ###
                        try {
                            flow = new flows["btw"](messenger, event, context, this.options);
                        } catch(err){
                            return Promise.reject(err);
                        }
                        return flow.run();
                    }
                }
            });

            done_all_flows = [];

            // Update memory.
            done_all_flows.push(done_flow.then((context) => {
                debug("Successful End of Flow.");

                // Update memory.
                if (!context){
                    return memory.del(memory_id).then((response) => {
                        debug("Clearing context");
                        return null;
                    })
                } else {
                    return memory.put(memory_id, context).then((response) => {
                        debug("Updating context");
                        return context;
                    })
                }
            }).catch((error) => {
                if (error.name == "BotExpressWebhookSkip"){
                    debug(error.message);
                    return;
                }

                debug("Abnormal End of Flow.");
                // Clear memory.
                return memory.del(memory_id).then((response) => {
                    debug("Context cleared.");
                    return Promise.reject(error);
                });
            })); // End of Completion of Flow

        } // End of Process Events.

        return Promise.all(done_all_flows).then((responses) => {
            debug("All events processed.");
            if (responses && responses.length === 1){
                return responses[0];
            } else {
                return responses;
            }
        });
    }
}

module.exports = Webhook;
