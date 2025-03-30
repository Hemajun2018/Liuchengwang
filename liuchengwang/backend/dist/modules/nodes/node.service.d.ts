import { Repository } from 'typeorm';
import { Node } from '../../database/entities/node.entity';
import { Issue } from '../../database/entities/issue.entity';
import { Material } from '../../database/entities/material.entity';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';
export declare class NodeService {
    private nodeRepository;
    private issueRepository;
    private materialRepository;
    private readonly logger;
    constructor(nodeRepository: Repository<Node>, issueRepository: Repository<Issue>, materialRepository: Repository<Material>);
    create(projectId: string, data: CreateNodeDto): Promise<Node>;
    findAll(projectId: string): Promise<Node[]>;
    findOne(projectId: string, id: number): Promise<Node>;
    update(projectId: string, id: number, data: UpdateNodeDto): Promise<Node>;
    remove(projectId: string, id: number): Promise<void>;
    updateOrder(projectId: string, nodeIds: number[]): Promise<void>;
    createIssue(projectId: string, nodeId: number, createIssueDto: {
        content: string;
        status: string;
        start_date?: string | null;
        expected_end_date?: string | null;
        duration_days?: number | null;
    }): Promise<Issue>;
    updateIssue(projectId: string, nodeId: number, issueId: number, updateIssueDto: {
        content?: string;
        status?: string;
        start_date?: string | null;
        expected_end_date?: string | null;
        duration_days?: number | null;
    }): Promise<Issue>;
    private isValidDateString;
    private calculateDuration;
    getIssues(projectId: string, nodeId: number): Promise<Issue[]>;
    deleteIssue(projectId: string, nodeId: number, issueId: number): Promise<void>;
    createMaterial(projectId: string, nodeId: number, createMaterialDto: CreateMaterialDto): Promise<Material>;
    getMaterials(projectId: string, nodeId: number): Promise<Material[]>;
    getMaterial(projectId: string, nodeId: number, materialId: number): Promise<Material>;
    updateMaterial(projectId: string, nodeId: number, materialId: number, updateMaterialDto: UpdateMaterialDto): Promise<Material>;
    deleteMaterial(projectId: string, nodeId: number, materialId: number): Promise<void>;
}
