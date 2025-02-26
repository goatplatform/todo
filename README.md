# Self-Hosted Minimalistic Todo List

✨ Try it yourself at [todo.goatdb.dev](https://todo.goatdb.dev)! ✅

A simple, minimalistic, self-hosted todo list application powered by
[GoatDB](https://github.com/goatplatform/goatdb). This application demonstrates
how to build a Single Page Application (SPA) with user authentication and data
persistence using GoatDB's server framework.

## Features

- User authentication and registration
- Create, update, and delete todo items
- Easy self-hosting on your own infrastructure
- Clients continue functioning even when the server is offline
- Realtime collaboration engine synchronizes changes across clients

## Roadmap

- [x] Update to Material UI
- [ ] Easier way to configure server
- [ ] Deadline reminder notifications
- [ ] Multiple todo lists per user
- [ ] Share todo lists with others

## Screenshots

<img width="1792" alt="Screenshot 2025-02-24 at 14 30 55" src="https://github.com/user-attachments/assets/206a1f22-929f-458c-8e81-e0205732a6a5" />

## Quick Start

1. Clone this repository
2. Configure email settings in `server/server.ts` (supports SMTP or AWS SES via
   [NodeMailer](https://nodemailer.com/))
3. Run `deno task debug` to start the development server
4. Visit `http://localhost:8001` to access your todo list

### Email Configuration

Edit `server/server.ts` to configure email settings.

Example SMTP configuration (see https://nodemailer.com/smtp/):

```ts
// In main() function
const server = new Server({
  // ... other server config ...
  emailConfig: {
    host: "smtp.gmail.com",
    port: 587,
    secure: true,
    auth: {
      user: "user@gmail.com",
      pass: "app-specific-password",
    },
    from: "system@my.domain.com",
  },
});
```

Example Amazon SES configuration (see https://nodemailer.com/ses/):

```ts
// Insert this import at the top of the file
import { SendRawEmailCommand, SES } from "npm:@aws-sdk/client-ses";

// In main() function
const server = new Server({
  // ... other server config ...
  emailConfig: {
    SES: {
      ses: new SES({ region: "us-east-1" }),
      aws: { SendRawEmailCommand },
    },
    from: "system@my.domain.com",
  },
});
```

## Deployment

```bash
deno task build
```

This demo is currently deployed on a single
[t4g.nano EC2 instance](https://aws.amazon.com/ec2/instance-types/t4/) that is
shared with other projects. Thanks to GoatDB's distributed architecture, clients
act as active replicas of the data. If the server fails, clients retain full
functionality and can restore server state when it comes back online. This
provides resilience against server outages without requiring complex
infrastructure.

A systemd service file is provided at `server/todo.service` which you can use as
a starting point for running the server as a system service on your own Linux
server.

## Backup and Restore

Backing up your todo list data is straightforward. Simply zip the server's data
directory (specified when starting the server, defaults to `todo-data` in the
current directory)
