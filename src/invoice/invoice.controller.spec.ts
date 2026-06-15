import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../auth/user/user.model';
import { InvoiceFiltersDto } from './dto/invoice-filters.dto';
import { InvoiceDto } from './dto/invoice.dto';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';

describe('InvoiceController', () => {
  let controller: InvoiceController;
  let service: jest.Mocked<InvoiceService>;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@email.com',
    role: 'guest',
    password: 'hashedpassword',
  };

  const mockInvoiceDto: InvoiceDto = {
    amount: 100,
    items: [{ sku: 'item1', qt: 2 }],
  };

  const mockInvoice = {
    reference: '12345',
    customer: 'testuser',
    date: new Date(),
    amount: 100,
    items: [{ sku: 'item1', qt: 2 }],
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceController],
      providers: [
        {
          provide: InvoiceService,
          useValue: {
            getAllInvoices: jest.fn().mockResolvedValue([mockInvoice]),
            getInvoiceById: jest.fn().mockResolvedValue(mockInvoice),
            addInvoice: jest.fn().mockResolvedValue(mockInvoice),
          },
        },
      ],
    }).compile();

    controller = module.get<InvoiceController>(InvoiceController);
    service = module.get<InvoiceService>(
      InvoiceService,
    ) as jest.Mocked<InvoiceService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllInvoices', () => {
    it('should return all invoices for the user', async () => {
      const result = await controller.getAllInvoices(mockUser, undefined);
      expect(result).toEqual([mockInvoice]);
      expect(() =>
        service.getAllInvoices(mockUser, undefined),
      ).toHaveBeenCalledWith(mockUser, undefined);
    });

    it('should handle empty invoices', async () => {
      service.getAllInvoices.mockResolvedValueOnce([]);
      const result = await controller.getAllInvoices(mockUser, undefined);
      expect(result).toEqual([]);
      expect(() =>
        service.getAllInvoices(mockUser, undefined),
      ).toHaveBeenCalledWith(mockUser, undefined);
    });
  });

  describe('getAllInvoices with filters', () => {
    it('should filter invoices by date range', async () => {
      const filters: InvoiceFiltersDto = {
        startDate: new Date('2025-04-01'),
        endDate: new Date('2025-04-30'),
      };
      const result = await controller.getAllInvoices(mockUser, filters);
      expect(result).toEqual([mockInvoice]);
      expect(() =>
        service.getAllInvoices(mockUser, filters),
      ).toHaveBeenCalledWith(mockUser, filters);
    });

    it('should filter invoices by amount range', async () => {
      const filters = { minAmount: 50, maxAmount: 150 };
      const result = await controller.getAllInvoices(mockUser, filters);
      expect(result).toEqual([mockInvoice]);
      expect(() =>
        service.getAllInvoices(mockUser, filters),
      ).toHaveBeenCalledWith(mockUser, filters);
    });
  });

  describe('getInvoiceById', () => {
    it('should return a single invoice by ID', async () => {
      const result = await controller.getInvoiceById('12345', mockUser);
      expect(result).toEqual(mockInvoice);
      expect(() =>
        service.getInvoiceById('12345', mockUser),
      ).toHaveBeenCalledWith('12345', mockUser);
    });

    it('should handle non-existent invoice', async () => {
      service.getInvoiceById.mockResolvedValueOnce(null);
      const result = await controller.getInvoiceById(
        'non-existent-id',
        mockUser,
      );
      expect(result).toBeNull();
    });
  });

  describe('addInvoice', () => {
    it('should create a new invoice', async () => {
      const result = await controller.addInvoice(mockInvoiceDto, mockUser);
      expect(result).toEqual(mockInvoice);
      expect(() =>
        service.addInvoice(mockInvoiceDto, mockUser),
      ).toHaveBeenCalledWith(mockInvoiceDto, mockUser);
    });

    it('should handle errors during invoice creation', async () => {
      service.addInvoice.mockRejectedValueOnce(
        new Error('Failed to create invoice'),
      );
      await expect(
        controller.addInvoice(mockInvoiceDto, mockUser),
      ).rejects.toThrow('Failed to create invoice');
    });
  });
});
