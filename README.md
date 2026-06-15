# Invoice Reporting System

A backend application built with NestJS and TypeScript for managing invoices and generating automated reports.

The system demonstrates modular architecture, background processing and asynchronous communication using RabbitMQ.

## Features

* JWT authentication
* Invoice management
* Scheduled tasks with Cron Jobs
* Email notifications
* RabbitMQ integration
* Modular architecture
* DTO validation
* E2E testing
* MongoDB implementation
* Alternative MySQL branch
* Telegram reporting integration (MySQL branch)

## Tech Stack

* NestJS
* TypeScript
* MongoDB
* MySQL
* RabbitMQ
* TypeORM
* Mongoose
* Passport JWT
* Nodemailer
* Jest
* Supertest

## Architecture

The application follows NestJS modular architecture and separates responsibilities into dedicated modules.

Background tasks are processed asynchronously through RabbitMQ, while scheduled jobs generate daily reports automatically.

## Testing

The project includes end-to-end tests using Jest and Supertest.

## Purpose

This repository was created to explore backend architecture, asynchronous communication and automated reporting systems using NestJS.

## Repository

https://github.com/rasoolzia/nestjs-practice

## Available Branches

- main → MongoDB implementation
- mysql_database → MySQL + Telegram reporting