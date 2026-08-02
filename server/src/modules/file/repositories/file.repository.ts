import { IFileRepository } from '../interfaces/file-repository.interface';
import { FileModel, IFile } from '../models/file.model';
import { ListFilesQueryDto } from '../dto/file.dto';
import { UploadStatus } from '../types/file.types';
import { Types } from 'mongoose';

/**
 * Enterprise File Repository Persistence Layer (Module 21.6).
 * Manages database queries, polymorphic index filters, and soft delete states.
 */
export class FileRepository implements IFileRepository {
  async create(data: Partial<IFile>): Promise<IFile> {
    return FileModel.create(data);
  }

  async findById(id: string): Promise<IFile | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return FileModel.findById(id);
  }

  async find(query: ListFilesQueryDto): Promise<{
    files: IFile[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const filter: Record<string, any> = {
      isDeleted: false,
    };

    if (query.provider) filter.provider = query.provider;
    if (query.uploadStatus) filter.uploadStatus = query.uploadStatus;
    if (query.visibility) filter.visibility = query.visibility;
    if (query.category) filter.category = query.category;

    if (query.uploadedBy && Types.ObjectId.isValid(query.uploadedBy)) {
      filter.uploadedBy = query.uploadedBy;
    }

    if (query.ownerType && query.ownerId && Types.ObjectId.isValid(query.ownerId)) {
      filter['owner.entityType'] = query.ownerType;
      filter['owner.entityId'] = query.ownerId;
    }

    if (query.folder) filter.folder = query.folder;
    if (query.mimeType) filter.mimeType = query.mimeType;

    if (query.tags && Array.isArray(query.tags) && query.tags.length > 0) {
      filter.tags = { $in: query.tags };
    }

    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) filter.createdAt.$gte = new Date(query.startDate);
      if (query.endDate) filter.createdAt.$lte = new Date(query.endDate);
    }

    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const sortField = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [sortField]: sortOrder };

    const [files, total] = await Promise.all([
      FileModel.find(filter).sort(sort).skip(skip).limit(limit).lean<IFile[]>(),
      FileModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      files,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async update(id: string, updateData: Partial<IFile>): Promise<IFile | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return FileModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });
  }

  async softDelete(id: string): Promise<IFile | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return FileModel.findByIdAndUpdate(
      id,
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          uploadStatus: UploadStatus.DELETED,
        },
      },
      { new: true }
    );
  }

  async restore(id: string): Promise<IFile | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return FileModel.findByIdAndUpdate(
      id,
      {
        $set: {
          isDeleted: false,
          deletedAt: undefined,
          uploadStatus: UploadStatus.COMPLETED,
        },
      },
      { new: true }
    );
  }

  async hardDelete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await FileModel.findByIdAndDelete(id);
    return !!result;
  }
}
