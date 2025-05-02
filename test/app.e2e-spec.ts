/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-base-to-string */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { InvoiceDto } from '../src/invoice/dto/invoice.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from '../src/auth/user/user.schema';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';

describe('InvoiceController (Integration)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let userModel: Model<User>;
  let accessToken: string;
  let createdInvoice: InvoiceDto;
  let createdInvoiceId: string;

  const testUserData = {
    username: 'testuser',
    password: 'hashedpassword',
  };

  const testInvoiceData: InvoiceDto = {
    amount: 100,
    items: [{ sku: 'item1', qt: 2 }],
  };

  const makeRequest = (method: string, url: string, body?: any) => {
    const req = request(app.getHttpServer())
      [method](url)
      .set('Authorization', `Bearer ${accessToken}`);
    return body ? req.send(body) : req;
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));

    // Create a test user and generate a JWT token
    const testUser = new userModel(testUserData);
    await testUser.save();
    accessToken = jwtService.sign({
      id: testUser._id.toString(),
      username: testUser.username,
    });
  });

  afterAll(async () => {
    await userModel.deleteMany({});
    await app.close();
  });

  describe('GET /invoices', () => {
    it('should return an empty array initially', async () => {
      const response = await makeRequest('get', '/invoices').expect(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('POST /invoices', () => {
    it('should create a new invoice', async () => {
      const response = await makeRequest(
        'post',
        '/invoices',
        testInvoiceData,
      ).expect(201);

      createdInvoice = response.body;
      createdInvoiceId = response.body._id;

      expect(response.body).toMatchObject(testInvoiceData);
    });
  });

  describe('GET /invoices/:id', () => {
    it('should return a single invoice by ID', async () => {
      const response = await makeRequest(
        'get',
        `/invoices/${createdInvoiceId}`,
      ).expect(200);
      expect(response.body).toMatchObject(createdInvoice);
    });

    it('should return 404 if the invoice does not exist', async () => {
      const nonExistentId = '644f1c2e5f1b2c0012345678'; // Valid ObjectId format but non-existent
      await makeRequest('get', `/invoices/${nonExistentId}`).expect(404);
    });
  });

  describe('GET /invoices', () => {
    it('should return the created invoice', async () => {
      const response = await makeRequest('get', '/invoices').expect(200);
      const firstInvoice = response.body[0];
      expect(firstInvoice).toMatchObject(createdInvoice);
    });
  });

  describe('GET /invoices with filters', () => {
    it('should filter invoices by date range', async () => {
      const response = await makeRequest('get', '/invoices')
        .query({ startDate: '2025-04-01', endDate: '2025-04-30' }) //out of range date inserted for testing
        .expect(200);
      expect(response.body).toEqual([]);
    });

    it('should filter invoices by amount range', async () => {
      const response = await makeRequest('get', '/invoices')
        .query({ minAmount: 50, maxAmount: 150 })
        .expect(200);
      expect(response.body).toEqual([createdInvoice]);
    });
  });
});
