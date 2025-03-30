import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Node } from './node.entity';

export enum IssueStatus {
  PENDING = 'pending',
  RESOLVED = 'resolved'
}

export enum IssuePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

@Entity('issues')
export class Issue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 20 })
  status: string;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  start_date: Date | null;

  @Column({ name: 'expected_end_date', type: 'date', nullable: true })
  expected_end_date: Date | null;

  @Column({ name: 'duration_days', type: 'int', nullable: true })
  duration_days: number | null;

  @ManyToOne(() => Node, node => node.issues)
  node: Node;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}