// src/invoice/invoice.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../auth/user/user.entity';

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float')
  amount: number;

  @Column('json')
  items: { sku: string; qt: number }[];

  @Column()
  reference: string;

  @CreateDateColumn()
  date: Date;

  @ManyToOne(() => User, (user) => user.invoices, { eager: false })
  customer: User;
}
