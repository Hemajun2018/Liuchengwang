import { DeliverableService } from './deliverable.service';
import { Deliverable, DeliverableStatus } from '../../database/entities/deliverable.entity';
export declare class DeliverableController {
    private readonly deliverableService;
    private readonly logger;
    constructor(deliverableService: DeliverableService);
    create(projectId: string, nodeId: string, createDeliverableDto: {
        description: string;
        start_date?: string | null;
        expected_end_date?: string | null;
        duration_days?: number | null;
        status?: DeliverableStatus;
    }): Promise<Deliverable>;
    findAll(projectId: string, nodeId: string): Promise<Deliverable[]>;
    findOne(projectId: string, nodeId: string, id: string): Promise<Deliverable>;
    update(projectId: string, nodeId: string, id: string, updateDeliverableDto: {
        description?: string;
        start_date?: string | null;
        expected_end_date?: string | null;
        duration_days?: number | null;
        status?: DeliverableStatus;
    }): Promise<Deliverable>;
    remove(projectId: string, nodeId: string, id: string): Promise<void>;
}
