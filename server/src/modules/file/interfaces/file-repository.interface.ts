import { IFile } from '../models/file.model';
import { ListFilesQueryDto } from '../dto/file.dto';

/**
 * File Metadata Repository Interface Contract (Module 21.6).
 */
export interface IFileRepository {
  create(data: Partial<IFile>): Promise<IFile>;
  findById(id: string): Promise<IFile | null>;
  find(query: ListFilesQueryDto): Promise<{
    files: IFile[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  update(id: string, updateData: Partial<IFile>): Promise<IFile | null>;
  softDelete(id: string): Promise<IFile | null>;
  restore(id: string): Promise<IFile | null>;
  hardDelete(id: string): Promise<boolean>;
}
