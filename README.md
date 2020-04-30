# Octwilio

## About

Octwilio is a project to combine the [Octopus Deploy](https://octopus.com) and [Twilio](https://www.twilio.com/) APIs.

### How it works

This project contains [Firebase] cloud functions for connecting Octopus Deploy and Twilio events. The functions handle Octopus Deploy subscription events as well as SMS messages to a Twilio phone number.

More details can be found in this [blog series](https://dev.to/octopus/octwilio-combining-the-octopus-and-twilio-apis-for-twiliohackathon-1846) about building Octwilio.

## Features

- Send SMS alert when an Octopus Deploy deployment requires approval
- Approve or reject a deployment via SMS
- Send SMS alerts for deployment events
- Endpoint for deployment notifications

## How to use it

1. Create a copy using [GitHub's repository template](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/creating-a-repository-from-a-template) functionality
2. Update the [`README.md`](README.md) and [`.firebaserc`](.firebaserc) with the respective values.
3. Configure your Firebase, Octopus Deploy, and Twilio accounts
4. Create your Firebase project
5. Deploy the functions to Firebase
6. Configure your Octopus Deploy subscriptions
7. Configure your Twilio phone number webhook

## Set up

### Requirements

- [Node.js](https://nodejs.org/)
- A Twilio account - [sign up](https://www.twilio.com/try-twilio)
- A Firebase account - [sign up](https://firebase.google.com/)
- The [Firebase CLI](https://firebase.google.com/docs/cli/)
- An Octopus Deploy instance - [sign up](https://octopus.com/start/cloud)

### Application Settings

You will need the following values to configure Octwilio to work with your Firebase, Octopus Deploy, and Twilio accounts.

#### Twilio Account Settings

| Config&nbsp;Value | Description                                                                                                                                                  |
| :---------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Account&nbsp;Sid  | Your primary Twilio account identifier - find this [in the Console](https://www.twilio.com/console).                                                         |
| Auth&nbsp;Token   | Used to authenticate - [just like the above, you'll find this here](https://www.twilio.com/console).                                                         |
| Phone&nbsp;number | A Twilio phone number in [E.164 format](https://en.wikipedia.org/wiki/E.164) - you can [get one here](https://www.twilio.com/console/phone-numbers/incoming) |

#### Octopus API Key

| Config&nbsp;Value | Description                                                                                                                                                  |
| :---------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API&nbsp;Key      | An [API key]([API key](https://octopus.com/docs/octopus-rest-api/how-to-create-an-api-key).) for authenticating requests to Octopus Deploy                   |

#### Firebase Settings

| Config&nbsp;Value | Description                                                                                                                                                  |
| :---------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project&nbsp;ID   | The ID of your project (not always the same as the name) - find this [in the Console](https://console.firebase.google.com/u/1/)                              |

#### Local development

After the above requirements have been met:

1. Clone this repository and `cd` into it

```bash
git clone git@github.com:youraccount/octwilio.git
cd octwilio
```

2. Configure your project with the Firebase CLI

After creating your Firebase project, replace `octwilio` in [`.firebaserc`](.firebaserc) with your project's ID.

3. Update the following commands with your values and run them with the Firebase CLI.

```bash
firebase functions:config:set octwilio.octopus.token="Use any token / passphrase you want here but keep it secure"
firebase functions:config:set octwilio.octopus.apikey="API-MYSECRETISSAFE"
firebase functions:config:set octwilio.twilio.account_sid="The account ID from Twilio"
firebase functions:config:set octwilio.twilio.auth_token="The auth token from Twilio"
firebase functions:config:set octwilio.twilio.approval.from_number="+15555555555 - the Twilio number to send approval alerts from"
firebase functions:config:set octwilio.twilio.approval.to_number="+15555555555 - the number to send approval alerts to"
firebase functions:config:set octwilio.twilio.deployment.from_number="+15555555555 - the Twilio number to send deployment alerts from"
firebase functions:config:set octwilio.twilio.deployment.to_number="+15555555555 - the number to send deployment alerts to"
```

4. Install dependencies

```bash
cd functions
npm install
```

5. Deploy the functions to your Firebase project

```bash
npm run deploy
```

6. Update Twilio number with processMessage URL

Navigate to your [Twilio number](https://www.twilio.com/console/phone-numbers/incoming) that will accept messages from the user.

Update the `A Message Comes In` webhook endpoint to the `processMessage` URL. It will look something like `https://us-central1-octwilio.cloudfunctions.net/processMessage`.

7. Create Octopus subscriptions

In your Octopus instance, create a subscription for `Manual intervention interruption raised` events that posts to your `approvalRaised` function URL. See more details in [Building Octwilio #2](https://dev.to/octopus/reacting-to-events-raised-by-octopus-4fmm#subscription)

You can create a subscription for deployment events if you want to receive alerts for those.

8. Create Octopus projects (if none exist)

If you're new to Octopus, follow our [Getting Started guide](https://octopus.com/docs/getting-started) or [webinar](https://www.youtube.com/watch?v=dHg4xm8Omtg&feature=youtu.be) to set up some environment and projects. For testing, you can set up projects with simple script steps or just a manual intervention.

## Resources

- [GitHub's repository template](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/creating-a-repository-from-a-template) functionality
- [Building Octwilio](https://dev.to/octopus/octwilio-combining-the-octopus-and-twilio-apis-for-twiliohackathon-1846)

## License

[MIT](http://www.opensource.org/licenses/mit-license.html)

## Disclaimer

No warranty expressed or implied. Software is as is.
