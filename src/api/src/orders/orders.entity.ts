import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
                                                                                                                                                                                                                                                                                                            
@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    customerId?: string;

    @Column('decimal', { precision: 10, scale: 2 })
    total?: number;

    @Column()
    status?: string;
}