# Self-Hosted Todo List

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

## Quick Start

1. Clone this repository
2. Configure email settings in `server/server.ts` (supports SMTP or AWS SES)
3. Run `deno task debug` to start the development server
4. Visit `http://localhost:8001` to access your todo list

## Deployment

```bash
deno task build
```

This demo is currently deployed on a single t4g.nano EC2 instance that is shared
with other GoatDB projects. Thanks to GoatDB's distributed architecture, clients
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

## Roadmap

- [ ] Update to Material UI
- [ ] Deadline reminder notifications
- [ ] Multiple todo lists per user
- [ ] Share todo lists with others
