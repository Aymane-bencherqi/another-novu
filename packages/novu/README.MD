<div align="center">
  <a href="https://novu.co?utm_source=github" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/2233092/213641039-220ac15f-f367-4d13-9eaf-56e79433b8c1.png">
    <img alt="Novu Logo" src="https://user-images.githubusercontent.com/2233092/213641043-3bbb3f21-3c53-4e67-afe5-755aeb222159.png" width="280"/>
  </picture>
  </a>
</div>

# Code-First Notifications Workflow Platform

  <p align="center">
    <br />
    <a href="https://docs.novu.co" rel="dofollow"><strong>Explore the docs »</strong></a>
    <br />

  <br/>
    <a href="https://github.com/novuhq/novu/issues/new?assignees=&labels=type%3A+bug&template=bug_report.yml&title=%F0%9F%90%9B+Bug+Report%3A+">Report Bug</a>
    ·
    <a href="https://github.com/novuhq/novu/issues/new?assignees=&labels=feature&template=feature_request.yml&title=%F0%9F%9A%80+Feature%3A+">Request Feature</a>
    ·
  <a href="https://discord.novu.co">Join Our Discord</a>
    ·
    <a href="https://roadmap.novu.co/">Roadmap</a>
    ·
    <a href="https://twitter.com/novuhq">X</a>
  </p>

## 🚀 Quickstart

```bash
npx novu@latest dev
```

## 🔥 Flags

| flag | long form usage example | description                 | default value             |
| ---- | ----------------------- | --------------------------- | ------------------------- |
| -p   | --port <port>           | Bridge application port     | 4000                      |
| -r   | --route <route>         | Bridge application route    | /api/novu                 |
| -o   | --origin <origin>       | Bridge application origin   | http://localhost          |
| -d   | --dashboard-url <url>   | Novu Cloud dashboard URL    | https://dashboard.novu.co |
| -sp  | --studio-port <port>    | Local Studio server port    | 2022                      |
| -sh  | --studio-host <host>    | Local Studio server host    | localhost                 |
| -t   | --tunnel <url>          | Self hosted tunnel url      | null                      |
| -H   | --headless              | Run bridge in headless mode | false                     |

Example: If bridge application is running on port `3002` and Novu account is in `EU` region.

```bash
npx novu@latest dev --port 3002 --dashboard-url https://eu.dashboard.novu.co
```

## ⭐️ Why

Building a notification system is hard, at first it seems like just sending an email but in reality it's just the beginning. In today's world users expect multichannel communication experience over email, sms, push, chat and more... An ever-growing list of providers are popping up each day, and notifications are spread around the code. Novu's goal is to simplify notifications and provide developers the tools to create meaningful communication between the system and its users.

## ✨ Features

- 🌈 Single API for all messaging provide`rs (Email, SMS, Push, Chat)
- 💅 Easily manage notification over multiple channels
- 🚀 Equipped with a CMS for advanced layouts and design management
- 🛡 Built-in protection for missing variables (Coming Soon)
- 📦 Easy to set up and integrate
- 🛡 Debug and analyze multichannel messages in a single dashboard
- 📦 Embeddable notification center with real-time updates
- 👨‍💻 Community driven

## 🚀 Getting Started

To start using Novu, run the following command. You'll be guided through the setup process.

```bash
npx novu init
```

After setting up your account using the cloud or docker version you can trigger the API using the `@novu/api` package.

```bash
npm install @novu/api
```

```ts
import { Novu } from '@novu/api';

const novu = new Novu({ secretKey: process.env.NOVU_API_KEY });

await novu.trigger('<WORKFLOW_ID>', {
  to: {
    subscriberId: '<SUBSCRIBER_ID>',
    email: 'john@doemail.com',
    firstName: 'John',
    lastName: 'Doe',
  },
  payload: {
    name: 'Hello World',
    organization: {
      logo: 'https://happycorp.com/logo.png',
    },
  },
});
```

## Inbox

Using the Novu API and admin panel you can easily add real-time notification center to your Next.js or React application without the hassle of building it yourself.

<div align="center">
<img width="762" alt="notification-center-912bb96e009fb3a69bafec23bcde00b0" src="https://github.com/iampearceman/Design-assets/blob/main/Untitled%20design%20(8).gif?raw=true">
  
  Read more about how to add a notification center to your app with the Novu API [here](https://docs.novu.co/platform/inbox/overview?utm_campaign=inapp-cli-readme)

</div>

## Providers

Novu provides a single API to manage providers across multiple channels with a simple-to-use interface.

#### 💌 Email

- [x] [Sendgrid](https://github.com/novuhq/novu/tree/main/providers/sendgrid)
- [x] [Netcore](https://github.com/novuhq/novu/tree/main/providers/netcore)
- [x] [Mailgun](https://github.com/novuhq/novu/tree/main/providers/mailgun)
- [x] [SES](https://github.com/novuhq/novu/tree/main/providers/ses)
- [x] [Postmark](https://github.com/novuhq/novu/tree/main/providers/postmark)
- [x] [NodeMailer](https://github.com/novuhq/novu/tree/main/providers/nodemailer)
- [x] [Mailjet](https://github.com/novuhq/novu/tree/main/providers/mailjet)
- [x] [Mandrill](https://github.com/novuhq/novu/tree/main/providers/mandrill)
- [x] [SendinBlue](https://github.com/novuhq/novu/tree/main/providers/sendinblue)
- [x] [EmailJS](https://github.com/novuhq/novu/tree/main/providers/emailjs)
- [ ] SparkPost

#### 📞 SMS

- [x] [Twilio](https://github.com/novuhq/novu/tree/main/providers/twilio)
- [x] [Plivo](https://github.com/novuhq/novu/tree/main/providers/plivo)
- [x] [SNS](https://github.com/novuhq/novu/tree/main/providers/sns)
- [x] [Nexmo - Vonage](https://github.com/novuhq/novu/tree/main/providers/nexmo)
- [x] [Sms77](https://github.com/novuhq/novu/tree/main/providers/sms77)
- [x] [Telnyx](https://github.com/novuhq/novu/tree/main/providers/telnyx)
- [x] [Termii](https://github.com/novuhq/novu/tree/main/providers/termii)
- [x] [Gupshup](https://github.com/novuhq/novu/tree/main/providers/gupshup)
- [ ] Bandwidth
- [ ] RingCentral

#### 📱 Push

- [x] [FCM](https://github.com/novuhq/novu/tree/main/providers/fcm)
- [x] [Expo](https://github.com/novuhq/novu/tree/main/providers/expo)
- [ ] [SNS](https://github.com/novuhq/novu/tree/main/providers/sns)
- [ ] Pushwoosh

#### 👇 Chat

- [x] [Slack](https://github.com/novuhq/novu/tree/main/providers/slack)
- [x] [Discord](https://github.com/novuhq/novu/tree/main/providers/discord)
- [ ] MS Teams
- [ ] Mattermost

#### 📱 In-App

- [x] [Novu](https://docs.novu.co/notification-center/introduction?utm_campaign=inapp-cli-readme)

#### Other (Coming Soon...)

- [ ] PagerDuty

## 💻 Need Help?

We are more than happy to help you. Don't worry if you are getting some errors or problems while working with the project. Or just want to discuss something related to the project.

Just <a href="https://discord.novu.co">Join Our Discord</a> server and ask for help.

## 🔗 Links

- [Home page](https://novu.co/)
