import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../auth/user/user.entity';
import { InvoiceItem } from './invoice-item.entity';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float', { nullable: false })
  amount: number;

  @Column({ nullable: false })
  reference: string;

  @CreateDateColumn()
  date: Date;

  @ManyToOne(() => User, (user) => user.id, { eager: false })
  customer: User;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, {
    cascade: true,
    eager: false, // Avoid eager loading
  })
  items: InvoiceItem[];
}
