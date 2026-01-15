import { AbstractRepository } from '@chidi-food-delivery/common';
import { Rider } from '@chidi-food-delivery/common/schemas/rider.schema';
import { Inject, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export class RiderRepository extends AbstractRepository<Rider> {
  protected readonly logger = new Logger(RiderRepository.name);

  constructor(
    @InjectModel(Rider.name) private readonly riderModel: Model<Rider>,
  ) {
    super(riderModel);
    this.logger.log('RiderRepository initialized');
  }
}
