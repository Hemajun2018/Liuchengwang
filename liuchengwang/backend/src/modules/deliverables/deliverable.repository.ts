import { EntityRepository, Repository } from 'typeorm';
import { Deliverable } from '../../database/entities/deliverable.entity';

@EntityRepository(Deliverable)
export class DeliverableRepository extends Repository<Deliverable> {
  
} 