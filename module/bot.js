"use strict";

/**
* Toolkit to be used by skill.
* @class
*/
class Bot {
    constructor(messenger){
        /**
        @prop {String} type - Type of messenger. The value can be "line","facebook" and "google".
        @prop {Object} plugin - Object which has direct access to each messenger libraries.
        */
        this.type = messenger.type;
        this.plugin = messenger.plugin;
        this._messenger = messenger;
    }

    /**
    * Reply message to sender. This function can be called just once in a flow. To send multiple messages, give multiple messages to this function or use queue(MESSAGES) function instead.
    * @param {MessageObject|Array.<MessageObject>} messages - Message object[s] to reply.
    * @returns {Promise.<Object>} - Returns promise returning response from Messenger API.
    */
    reply(messages){
        return this._messenger.reply(messages);
    }

    /**
    * Send(Push) message to specified user.
    * @param {String} recipient_id - Recipient user id.
    * @param {MessageObject|Array.<MessageObject>} messages - Messages object[s] to send.
    * @param {String} language - ISO-639-1 based language code to translate to.
    * @returns {Promise.<Object>} - Returns promise returning response from Messenger API.
    */
    send(recipient_id, messages, language){
        return this._messenger.send(recipient_id, messages, language);
    }

    /**
    * Send(Push) messages to multiple users.
    * @param {Array.<String>} recipient_ids - Array of recipent user id.
    * @param {MessageObject|Array.<MessageObject>} messages - Message object[s] to send.
    * @param {String} language - ISO-639-1 based language code to translate to.
    * @returns {Promise.<Object>} - Returns promise returning response from Messenger API.
    */
    multicast(recipient_ids, messages){
        return this._messenger.multicast(recipient_ids, messages, language);
    }

    /**
    * Queue messages. The messages will be sent out when reply(MESSAGES) function is called.
    * @param {MessageObject|Array.<MessageObject>} messages - Message object[s] to queue.
    * @returns {Null}
    */
    queue(messages){
        return this._messenger.queue(messages);
    }

    /**
    * Stop processing final actions including collecting parameters and finish() and keep context.
    * @returns {Null}
    */
    pause(){
        return this._messenger.pause();
    }

    /**
    * Make the specified skill paramter being collected next.
    * @param {String|Skill#skill_parameter_container} arg - Name of the skill parameter or skill_parameter_container object to collect.
    * @returns {Null}
    */
    collect(arg){
        return this._messenger.collect(arg);
    }

    /**
    * Change the message to collect specified parameter.
    * @param {String} parameter_name - Name of the parameter to collect.
    * @param {MessageObject} message - Message object to send.
    * @returns {Null}
    */
    change_message_to_confirm(parameter_name, message){
        return this._messenger.change_message_to_confirm(parameter_name, message);
    }

    /**
    * Extract message of the event.
    * @param {EventObject} event - Event to extract message.
    * @returns {MessageObject} - Extracted message.
    */
    extract_message(event){
        return this._messenger.extract_message(event);
    }

    /**
    * Extract message text.
    * @param {EventObject} event - Event to extract message text.
    * @returns {String} - Extracted message text.
    */
    extract_message_text(event){
        return this._messenger.extract_message_text(event);
    }

    /**
    * Extract sender's user id.
    * @param {EventObject} event - Event to extract message text.
    * @returns {String} - Extracted sender's user id.
    */
    extract_sender_id(event){
        return this._messenger.extract_sender_id(event);
    }

    /**
    * Extract session id.
    * @param {EventObject} event - Event to extract message text.
    * @returns {String} - Extracted sender's user id.
    */
    extract_session_id(event){
        return this._messenger.extract_session_id(event);
    }

    /**
    * Identify the event type.
    * @param {EventObject} event - Event to identify event type.
    * @returns {String} - Event type. In case of LINE, it can be "message", "follow", "unfollow", "join", "leave", "postback", "beacon". In case of Facebook, it can be "echo", "message", "delivery", "read", "postback", "optin", "referral", "account_linking".
    */
    identify_event_type(event){
        return this._messenger.identify_event_type(event);
    }

    /**
    * Identify the message type.
    * @param {MessageObject} message - Message Object to identify message type.
    * @returns {String} - Message type. In case of LINE, it can be "text", "image", "audio", "video", "file", "location", "sticker", "imagemap", "buttons_template, "confirm_template" or "carousel_template". In case of Facebook, it can be "text", "image", "audio", "video", "file", "button_template", "generic_template", "list_template", "open_graph_template", "receipt_template", "airline_boardingpass_template", "airline_checkin_template", "airline_itinerary_template", "airline_update_template".
    */
    identify_message_type(message){
        return this._messenger.identify_message_type(message);
    }

    /**
    * Compile message format to the specified format.
    * @param {MessageObject} message - Message object to compile.
    * @param {String} format - Target format to compile. It can be "line" or "facebook".
    * @returns {Promise.<MessageObject>} - Compiled message object.
    */
    compile_message(message, format = this.type){
        return this._messenger.compile_message(message, format);
    }
}
module.exports = Bot;
