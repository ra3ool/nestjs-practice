# Payever Invoice Reporting System

## Description

The **Payever Invoice Reporting System** is a NestJS-based application that allows users to sign up, manage their invoices, and receive daily sales summary reports via email. The system automatically generates and sends these reports at noon every day.

---

## Features

- **User Sign-Up**: Users can register and manage their accounts.
- **Invoice Management**: Users can create, view, and filter invoices.
- **Daily Sales Reports**: Automatically generates and emails daily sales summaries to users.
- **Email Notifications**: Sends reports to users' registered email addresses.

---

## Project Setup

Follow these steps to set up and run the project:

### 1. extracts the zip file

### 2. Install Dependencies
```bash
npm install
```

### 3. Prepare the Environment Variables
Create a `.env` file in the root directory and configure the following variables:

#### MongoDB Configuration
```plaintext
MONGO_URI=mongodb://localhost:27017/payever
```

#### Email Configuration (Mailtrap Example)
```plaintext
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your-mailtrap-username
EMAIL_PASS=your-mailtrap-password
EMAIL_FROM=no-reply@payever.org
EMAIL_FROM_NAME="Payever Team"
```

#### RabbitMQ Configuration
```plaintext
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_QUEUE=daily_sales_report
```

---

## Running the Services

### 1. Start MongoDB
If you have MongoDB installed locally, you can start it with:
```bash
mongod
```

Alternatively, you can use Docker to run MongoDB:
```bash
docker run -d --name mongodb -p 27017:27017 mongo
```

### 2. Start RabbitMQ
If you have RabbitMQ installed locally, ensure it is running. Alternatively, you can use Docker to run RabbitMQ:
```bash
docker run -d --hostname rabbitmq --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

Access the RabbitMQ Management UI at `http://localhost:15672` (default username: `guest`, password: `guest`).

### 3. Start the Application
Run the application in development mode:
```bash
npm run start:dev
```

The application will be available at `http://localhost:3000`.

---

## Compile and Run the Project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

---

## Run Tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

---

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

---

## Additional Notes on the Implementation

1. **RabbitMQ Integration**:
   - The application uses RabbitMQ to queue email tasks. The `InvoiceService` publishes tasks to the `daily_sales_report` queue, and the `EmailConsumer` processes these tasks to send emails.

2. **Cron Job**:
   - A cron job runs daily at noon to generate sales reports for all users and publish email tasks to RabbitMQ.

3. **Email Sending**:
   - The application uses Mailtrap for email testing. You can configure your SMTP settings in the `.env` file.

4. **Database**:
   - MongoDB is used as the database for storing user and invoice data. Ensure MongoDB is running before starting the application.

5. **Environment Variables**:
   - All sensitive configurations (e.g., database URI, email credentials, RabbitMQ URL) are stored in the `.env` file. Ensure this file is properly configured before running the application.

---

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).

---