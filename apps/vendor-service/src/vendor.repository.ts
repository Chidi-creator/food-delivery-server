import { AbstractRepository } from "@chidi-food-delivery/common";
import { Vendor } from "@chidi-food-delivery/common/schemas/vendor.schema";
import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";


@Injectable()
export class VendorsRepository extends AbstractRepository<Vendor> {
    protected readonly logger = new Logger(VendorsRepository.name);

    constructor(@InjectModel(Vendor.name) VendorModel: Model<Vendor>) {
        super(VendorModel);
        this.logger.log('VendorsRepository initialized');
    }

}