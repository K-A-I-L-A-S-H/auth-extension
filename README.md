<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

## Description

Simple [Nest](https://github.com/nestjs/nest) application to understand a way to authenticate and authorise the application.
This explains how guards and decorators can be used to authenticate private routes and let few routes be accessible publicly.

## Installation

```bash
$ pnpm install
```

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Using prisma

```bash
# Push DB schema
$ npx prisma db push

# Create DB migration
$ pnpm run prisma:migrate:dev

# Run DB migration on prod server
$ pnpm run prisma:migrate:prod

# Generate prisma client
$ pnpm run prisma:generate
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
