![Build Status](https://travis-ci.org/nkjm/bot-express.svg?branch=master)

# Overview

bot-express is a chatbot development framework to build tailer-made chatbot lightning fast. Developers can extend the chatbot capability just by adding skills.

# Features

- NLU integration.
- Context aware behavior.
- Auto parameter collection based on skill.
- Auto language translation. \*Google project id is required.
- Support multiple messengers.
- Available as npm package.

# Architecture

### Components

A chatbot based on bot-express is composed of following components.

![architecture](https://raw.githubusercontent.com/nkjm/bot-express/master/material/architecture.png)

- Messenger
- NLU
- Bot instance（Node.js app based on bot-express）

Developers can extend the chatbot capability just by adding skills. 1 skill is simply composed by 1 script file. Developers can make chatbot more painstaking by creating polished skill and make it more capable by adding wide variety of skills.

### Basic workflow

The very basic workflow of bot-express based chatbot is following.

1. A user sends message to a chatbot.
1. bot-express forwards the message to NLU and identifies the intent of the message.
1. bot-express pickup a skill corresponding to the identified intent.
1. The skill is executed. ex: Reply to the user, Update the database, Send signal to IoT devices.

bot-express continues interaction with the user until it accomplish the mission defined by the skill. The interaction is conducted to respond/collect required information. Developers can configure the parser and reaction for every single parameters to collect and they are automatically applied to each messages from the user.

# Getting Started

bot-express can be installed by installing a npm package just like below.

```
$ npm install --save bot-express
```

Running through the tutorial is a fastest way to learn bot-express since it covers the most important configurations step by step.

[Tutorial: Create pizza delivery reception bot using bot-express](http://qiita.com/nkjm/items/1ac1a73d018c13deae30)

Also take a glance at sample_skill directory which contains some sample skills.

[Sample skills](https://github.com/nkjm/bot-express/tree/master/sample_skill)

# Reference

As for the complete configurations, spec of the skill script and API, please refer to the following document.

https://nkjm.github.io/bot-express

# Supported Messengers

- [LINE](https://developers.line.me/en/services/messaging-api/)
- [Facebook Messenger](https://developers.facebook.com/products/messenger/overview/)

# Supported NLU

- [Dialogflow](https://dialogflow.com)

# Limitation

Webhook supports following event at present.

**LINE**

- message
- follow
- unfollow
- join
- leave
- postback
- beacon

**Facebook**

- messages
- messaging-postbacks



Supported number of instance of bot-express based chatbot is 1 since bot-express uses memory-cache as context store.
