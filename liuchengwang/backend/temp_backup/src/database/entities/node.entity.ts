import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Project } from './project.entity';
import { Issue } from './issue.entity';
import { Material } from './material.entity';
import { Deliverable } from './deliverable.entity';

export enum NodeStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked'
}

@Entity('nodes')
export class Node {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'project_id' })
  projectId: string;

  @Column({ length: 100 })
  name: string;

  @Column()
  order: number;

  @Column({ name: 'is_prerequisite', type: 'boolean', default: false })
  isPrerequisite: boolean;

  @Column({ name: 'is_result', type: 'boolean', default: false })
  isResult: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Project, project => project.nodes)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @OneToMany(() => Issue, issue => issue.node)
  issues: Issue[];

  @OneToMany(() => Material, material => material.node)
  materials: Material[];
  
  @OneToMany(() => Deliverable, deliverable => deliverable.node)
  deliverables: Deliverable[];
} 