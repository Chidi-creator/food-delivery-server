import { AbstractRepository, User } from '@chidi-food-delivery/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UsersRepository extends AbstractRepository<User> {
  protected readonly logger = new Logger(UsersRepository.name);

  constructor(@InjectModel(User.name) UserModel: Model<User>) {
    super(UserModel);
    this.logger.log('UsersRepository initialized');
  }

 
}
