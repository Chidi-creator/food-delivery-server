import { type Logger } from '@nestjs/common';
import {
  type FilterQuery,
  type Model,
  Types,
  type SaveOptions,
  type InsertManyOptions,
  type Connection,
  type HydratedDocument,
  type ClientSession,
  PopulateOptions,
  UpdateQuery,
  UpdateResult,
} from 'mongoose';
import { type AbstractDocument } from './abstract.schema';
import { DatabaseException } from '../exceptions/rpc.exceptions';

export abstract class  AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger;

  protected constructor(
    protected readonly model: Model<TDocument>,
    private readonly connection?: Connection,
  ) {}

  async create(
    document: Omit<TDocument, '_id'> | Partial<TDocument>,
    options?: SaveOptions,
  ): Promise<TDocument> {
    try {
      const createdDocument = new this.model({
        ...document,
        _id: new Types.ObjectId(),
      });
      return await createdDocument.save(options as SaveOptions);
    } catch (error) {
      throw new DatabaseException(`Failed to create document: ${error.message}`);
    }
  }

  async findOneAndPopulate<T>(
    filterQuery: FilterQuery<TDocument>,
    populatePaths: string[],
  ): Promise<T> {
    try {
      const paths = populatePaths.map<PopulateOptions>((path) => ({
        path,
        options: {
          sort: {
            createdAt: 'desc',
          },
        },
      }));
      return (await this.model
        .findOne(filterQuery, {}, { lean: true })
        .populate(paths)) as any;
    } catch (error) {
      throw new DatabaseException(`Failed to find and populate document: ${error.message}`);
    }
  }

  async findById(id: Types.ObjectId): Promise<TDocument | any> {
    try {
      return await this.model.findById(id, {}, { lean: true });
    } catch (error) {
      throw new DatabaseException(`Failed to find document by ID: ${error.message}`);
    }
  }

  async findOne(filterQuery: FilterQuery<TDocument>): Promise<TDocument | any> {
    try {
      return await this.model.findOne(filterQuery, {}, { lean: true });
    } catch (error) {
      throw new DatabaseException(`Failed to find document: ${error.message}`);
    }
  }

  async findAndPopulate<T>(
    filterQuery: FilterQuery<TDocument>,
    populatePaths: string[],
  ): Promise<T[]> {
    try {
      const paths = populatePaths.map<PopulateOptions>((path) => ({
        path,
        options: {
          sort: {
            createdAt: 'desc',
          },
        },
      }));
      return (await this.model
        .find(filterQuery)
        .sort({ createdAt: 'desc' })
        .populate(paths)) as any;
    } catch (error) {
      throw new DatabaseException(`Failed to find and populate documents: ${error.message}`);
    }
  }

  findRaw(): Model<TDocument> {
    try {
      return this.model;
    } catch (error) {
      throw new DatabaseException(`Failed to get raw model: ${error.message}`);
    }
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: FilterQuery<TDocument>,
  ): Promise<any> {
    try {
      const document = await this.model.findOneAndUpdate(filterQuery, update, {
        lean: true,
        new: true,
      });

      if (document === null) {
        this.logger.warn('Document not found with filterQuery:', filterQuery);
      }

      return document;
    } catch (error) {
      throw new DatabaseException(`Failed to find and update document: ${error.message}`);
    }
  }

  async upsert(
    filterQuery: FilterQuery<TDocument>,
    document: Partial<TDocument>,
  ): Promise<any> {
    try {
      return this.model.findOneAndUpdate(filterQuery, document, {
        lean: true,
        upsert: true,
        new: true,
      });
    } catch (error) {
      throw new DatabaseException(`Failed to upsert document: ${error.message}`);
    }
  }

  async deleteMany(
    filterQuery?: FilterQuery<TDocument>,
  ): Promise<any> {
    try {
      return this.model.deleteMany(filterQuery);
    } catch (error) {
      throw new DatabaseException(`Failed to delete documents: ${error.message}`);
    }
  }

  async insertMany(
    documents: Array<TDocument | Omit<TDocument, '_id'>>,
    options?: InsertManyOptions,
  ): Promise<any> {
    try {
      return options 
        ? this.model.insertMany(documents, options)
        : this.model.insertMany(documents);
    } catch (error) {
      throw new DatabaseException(`Failed to insert documents: ${error.message}`);
    }
  }

  async find(filterQuery: FilterQuery<TDocument>): Promise<any> {
    try {
      return this.model
        .find(filterQuery, {}, { lean: true })
        .sort({ createdAt: 'desc' });
    } catch (error) {
      throw new DatabaseException(`Failed to find documents: ${error.message}`);
    }
  }

  async update(
    filterQuery: FilterQuery<TDocument>,
    update: Partial<TDocument>,
  ): Promise<any> {
    try {
      return this.model.updateOne(filterQuery, update);
    } catch (error) {
      throw new DatabaseException(`Failed to update document: ${error.message}`);
    }
  }

  async updateMany(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<UpdateResult> {
    try {
      console.log("Model name:", this.model.modelName);
      return this.model.updateMany(filterQuery, update);
    } catch (error) {
      throw new DatabaseException(`Failed to update documents: ${error.message}`);
    }
  }

  async findAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: Partial<TDocument>,
  ): Promise<any> {
    try {
      return this.model.updateMany(filterQuery, update).sort({ createdAt: 'desc' });
    } catch (error) {
      throw new DatabaseException(`Failed to find and update documents: ${error.message}`);
    }
  }

  async delete(id: Types.ObjectId): Promise<any> {
    try {
      return this.model.findByIdAndDelete(id);
    } catch (error) {
      throw new DatabaseException(`Failed to delete document: ${error.message}`);
    }
  }

  async startTransaction(): Promise<ClientSession | any> {
    try {
      if (this.connection !== undefined) {
        const session = await this.connection.startSession();
        session.startTransaction();
        return session;
      }
    } catch (error) {
      throw new DatabaseException(`Failed to start transaction: ${error.message}`);
    }
  }
}
