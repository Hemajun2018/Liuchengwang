import { Repository } from 'typeorm';
import { Deliverable, DeliverableStatus } from '../../database/entities/deliverable.entity';
import { Node } from '../../database/entities/node.entity';
export declare class DeliverableService {
    private readonly deliverableRepository;
    private readonly nodeRepository;
    private readonly logger;
    constructor(deliverableRepository: Repository<Deliverable>, nodeRepository: Repository<Node>);
    findAll(projectId: string, nodeId: number): Promise<Deliverable[]>;
    findOne(projectId: string, nodeId: number, deliverableId: number): Promise<Deliverable>;
    create(projectId: string, nodeId: number, data: {
        description: string;
        start_date?: string | null;
        expected_end_date?: string | null;
        duration_days?: number | null;
        status?: DeliverableStatus;
    }): Promise<Deliverable>;
    update(projectId: string, nodeId: number, deliverableId: number, data: {
        description?: string;
        start_date?: string | null;
        expected_end_date?: string | null;
        duration_days?: number | null;
        status?: DeliverableStatus;
    }): Promise<Deliverable>;
    remove(projectId: string, nodeId: number, deliverableId: number): Promise<void>;
}
