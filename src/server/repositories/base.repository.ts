import { PrismaClient, Prisma } from '@prisma/client';
import prisma from '../db/prisma';
import { PaginationQuery, PaginationMetadata, calculatePagination } from '../types/api.types';

/**
 * Base repository class with common CRUD operations
 * All other repositories should extend this class
 */
export abstract class BaseRepository<
  T extends { id: string },
  TCreateInput = any,
  TUpdateInput = any,
  TWhereInput = any,
  TWhereUniqueInput = any
> {
  protected prisma: PrismaClient;
  protected modelName: Prisma.ModelName;

  constructor(modelName: Prisma.ModelName) {
    this.prisma = prisma;
    this.modelName = modelName;
  }

  /**
   * Get the Prisma delegate for the model
   */
  protected abstract getDelegate(): any;

  /**
   * Find by ID
   */
  async findById(id: string, include?: any): Promise<T | null> {
    return this.getDelegate().findUnique({
      where: { id },
      include,
    });
  }

  /**
   * Find one by criteria
   */
  async findOne(where: TWhereInput, include?: any): Promise<T | null> {
    return this.getDelegate().findFirst({
      where,
      include,
    });
  }

  /**
   * Find all records
   */
  async findAll(options?: {
    where?: TWhereInput;
    include?: any;
    orderBy?: any;
    skip?: number;
    take?: number;
  }): Promise<T[]> {
    return this.getDelegate().findMany(options);
  }

  /**
   * Find with pagination
   */
  async findPaginated(
    query: PaginationQuery,
    where?: TWhereInput,
    include?: any
  ): Promise<{ data: T[]; pagination: PaginationMetadata }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder || 'asc' }
      : undefined;

    const [data, total] = await Promise.all([
      this.getDelegate().findMany({
        where,
        include,
        orderBy,
        skip,
        take: limit,
      }),
      this.count(where),
    ]);

    const pagination = calculatePagination(page, limit, total);

    return { data, pagination };
  }

  /**
   * Create a new record
   */
  async create(data: TCreateInput): Promise<T> {
    return this.getDelegate().create({ data });
  }

  /**
   * Create many records
   */
  async createMany(data: TCreateInput[]): Promise<Prisma.BatchPayload> {
    return this.getDelegate().createMany({ data, skipDuplicates: true });
  }

  /**
   * Update a record
   */
  async update(id: string, data: TUpdateInput): Promise<T> {
    return this.getDelegate().update({
      where: { id },
      data,
    });
  }

  /**
   * Update many records
   */
  async updateMany(where: TWhereInput, data: TUpdateInput): Promise<Prisma.BatchPayload> {
    return this.getDelegate().updateMany({
      where,
      data,
    });
  }

  /**
   * Upsert a record
   */
  async upsert(
    where: TWhereUniqueInput,
    create: TCreateInput,
    update: TUpdateInput
  ): Promise<T> {
    return this.getDelegate().upsert({
      where,
      create,
      update,
    });
  }

  /**
   * Delete a record
   */
  async delete(id: string): Promise<T> {
    return this.getDelegate().delete({
      where: { id },
    });
  }

  /**
   * Delete many records
   */
  async deleteMany(where: TWhereInput): Promise<Prisma.BatchPayload> {
    return this.getDelegate().deleteMany({ where });
  }

  /**
   * Soft delete (if model has deletedAt field)
   */
  async softDelete(id: string): Promise<T> {
    return this.update(id, { deletedAt: new Date(), isDeleted: true } as any);
  }

  /**
   * Count records
   */
  async count(where?: TWhereInput): Promise<number> {
    return this.getDelegate().count({ where });
  }

  /**
   * Check if record exists
   */
  async exists(where: TWhereInput): Promise<boolean> {
    const count = await this.count(where);
    return count > 0;
  }

  /**
   * Find or create
   */
  async findOrCreate(
    where: TWhereInput,
    create: TCreateInput
  ): Promise<{ record: T; created: boolean }> {
    const existing = await this.findOne(where);
    
    if (existing) {
      return { record: existing, created: false };
    }

    const newRecord = await this.create(create);
    return { record: newRecord, created: true };
  }

  /**
   * Aggregate data
   */
  async aggregate(options: any): Promise<any> {
    return this.getDelegate().aggregate(options);
  }

  /**
   * Group by
   */
  async groupBy(options: any): Promise<any> {
    return this.getDelegate().groupBy(options);
  }

  /**
   * Execute raw query
   */
  async executeRaw(query: string, params?: any[]): Promise<any> {
    return this.prisma.$queryRawUnsafe(query, ...(params || []));
  }

  /**
   * Execute in transaction
   */
  async transaction<R>(
    fn: (tx: Prisma.TransactionClient) => Promise<R>
  ): Promise<R> {
    return this.prisma.$transaction(fn);
  }

  /**
   * Bulk create or update
   */
  async bulkUpsert(
    records: Array<{ where: TWhereUniqueInput; create: TCreateInput; update: TUpdateInput }>
  ): Promise<T[]> {
    return this.prisma.$transaction(
      records.map((record) =>
        this.getDelegate().upsert({
          where: record.where,
          create: record.create,
          update: record.update,
        })
      )
    );
  }

  /**
   * Find by IDs
   */
  async findByIds(ids: string[], include?: any): Promise<T[]> {
    return this.getDelegate().findMany({
      where: { id: { in: ids } },
      include,
    });
  }

  /**
   * Search with full-text search (if supported by model)
   */
  async search(
    searchTerm: string,
    searchFields: string[],
    options?: {
      where?: TWhereInput;
      include?: any;
      limit?: number;
    }
  ): Promise<T[]> {
    const searchConditions = searchFields.map((field) => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive' as Prisma.QueryMode,
      },
    }));

    return this.getDelegate().findMany({
      where: {
        ...options?.where,
        OR: searchConditions,
      },
      include: options?.include,
      take: options?.limit || 50,
    });
  }
}