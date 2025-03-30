import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Node } from './node.entity';

export enum MaterialType {
  DOCUMENT = 'document',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  OTHER = 'other'
}

export enum MaterialStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DELAYED = 'delayed'
}

@Entity('materials')
export class Material {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'node_id' })
  nodeId: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 255, nullable: true })
  url: string;

  @Column({
    type: 'enum',
    enum: MaterialType,
    default: MaterialType.DOCUMENT,
    nullable: true
  })
  type: MaterialType;

  @Column({ length: 50, nullable: true })
  fileSize: string;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  start_date: Date | null;

  @Column({ name: 'expected_end_date', type: 'date', nullable: true })
  expected_end_date: Date | null;

  @Column({ name: 'duration_days', type: 'int', nullable: true })
  duration_days: number | null;

  @Column({
    type: 'enum',
    enum: MaterialStatus,
    default: MaterialStatus.NOT_STARTED,
    nullable: true
  })
  status: MaterialStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Node, node => node.materials)
  @JoinColumn({ name: 'node_id' })
  node: Node;
}