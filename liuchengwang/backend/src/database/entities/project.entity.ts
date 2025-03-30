import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Node } from './node.entity';
import { ProjectUser } from './project-user.entity';

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

  @Column({ type: 'date', nullable: true })
  start_time: Date;

  @Column({ type: 'date', nullable: true })
  end_time: Date;

  @Column({ type: 'int', default: 0 })
  days_needed: number;

  @Column({ type: 'json', nullable: true })
  results: Array<{ id?: number; description: string }>;

  @Column({ type: 'int', nullable: true })
  created_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Node, node => node.project)
  nodes: Node[];
  
  @OneToMany(() => ProjectUser, projectUser => projectUser.project)
  projectUsers: ProjectUser[];
} 