import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Node } from './node.entity';

export enum DeliverableStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DELAYED = 'delayed'
}

@Entity('deliverables')
export class Deliverable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  node_id: number;

  @Column('text')
  description: string;

  @Column({ type: 'date', nullable: true })
  start_date: Date | null;

  @Column({ type: 'date', nullable: true })
  expected_end_date: Date | null;

  @Column({ nullable: true })
  duration_days: number | null;

  @Column({
    type: 'enum',
    enum: DeliverableStatus,
    default: DeliverableStatus.NOT_STARTED
  })
  status: DeliverableStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Node, node => node.deliverables, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'node_id' })
  node: Node;
} 