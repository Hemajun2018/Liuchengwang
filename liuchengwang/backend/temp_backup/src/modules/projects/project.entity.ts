import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Node } from '../../database/entities/node.entity';

export enum ProjectStatus {
  NOT_STARTED = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2,
  DELAYED = 3
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ length: 100 })
  password: string;

  @Column({ type: 'text', nullable: true })
  deliverables: string;

  @Column({ type: 'int', default: ProjectStatus.NOT_STARTED })
  status: ProjectStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Node, node => node.project)
  nodes: Node[];
} 