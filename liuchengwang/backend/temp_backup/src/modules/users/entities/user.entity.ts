import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ProjectUser } from '../../../database/entities/project-user.entity';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',     // 一级管理员（超级管理员）
  PROJECT_ADMIN = 'project_admin', // 二级管理员（项目管理员）
  CONTENT_ADMIN = 'content_admin', // 三级管理员（普通管理员）
  EMPLOYEE = 'employee'            // 普通用户
}

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.EMPLOYEE
  })
  role: UserRole;

  @Column({ name: 'real_name' })
  realName: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  avatar?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ProjectUser, projectUser => projectUser.user)
  projectUsers: ProjectUser[];
} 