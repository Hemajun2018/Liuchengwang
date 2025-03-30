import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from './project.entity';
import { User } from '../../modules/users/entities/user.entity';

@Entity('project_users')
export class ProjectUser {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  project_id: string;
  
  @Column()
  user_id: number;
  
  @Column({ default: false })
  can_edit: boolean;
  
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
  
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
  
  @ManyToOne(() => Project, project => project.projectUsers)
  @JoinColumn({ name: 'project_id' })
  project: Project;
  
  @ManyToOne(() => User, user => user.projectUsers)
  @JoinColumn({ name: 'user_id' })
  user: User;
} 