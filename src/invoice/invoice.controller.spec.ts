import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { InvoiceDto } from './dto/invoice.dto';
import { User } from '../auth/user.model';

describe('InvoiceController', () => {
  let controller: InvoiceController;
  let service: InvoiceService;

  const mockUser: User = {
    id: '1',
    username: 'testuser',
    password: 'hashedpassword',
  };
  const mockInvoiceDto: InvoiceDto = {
    amount: 100,
    items: [{ sku: 'item1', qt: '2' }],
  };
  const mockInvoice = {
    reference: '12345',
    customer: 'testuser',
    date: new Date(),
    amount: 100,
    items: [{ sku: 'item1', qt: '2' }],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceController],
      providers: [
        {
          provide: InvoiceService,
          useValue: {
            getAllInvoices: jest.fn().mockReturnValue([mockInvoice]),
            getInvoiceById: jest.fn().mockReturnValue(mockInvoice),
            addInvoice: jest.fn().mockReturnValue(mockInvoice),
          },
        },
      ],
    }).compile();

    controller = module.get<InvoiceController>(InvoiceController);
    service = module.get<InvoiceService>(InvoiceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllInvoices', () => {
    it('should return all invoices for the user', () => {
      const result = controller.getAllInvoices(mockUser);
      expect(result).toEqual([mockInvoice]);
      expect(service.getAllInvoices).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('getInvoiceById', () => {
    it('should return a single invoice by ID', () => {
      const result = controller.getInvoiceById('12345', mockUser);
      expect(result).toEqual(mockInvoice);
      expect(service.getInvoiceById).toHaveBeenCalledWith('12345', mockUser);
    });
  });

  describe('addInvoice', () => {
    it('should create a new invoice', () => {
      const result = controller.addInvoice(mockInvoiceDto, mockUser);
      expect(result).toEqual(mockInvoice);
      expect(service.addInvoice).toHaveBeenCalledWith(mockInvoiceDto, mockUser);
    });
  });
});
