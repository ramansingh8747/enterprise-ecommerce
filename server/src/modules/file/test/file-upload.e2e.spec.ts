import dotenv from 'dotenv';
dotenv.config();

import { fileUploadService } from '../../../container';
import { FileCategory, FileVisibility, StorageProviderType } from '../types/file.types';

/**
 * End-to-End Spec Test Suite for File Upload Module (Module 21.7).
 */
export async function runFileUploadE2ETests(): Promise<void> {
  console.log('=== STARTING FILE UPLOAD MODULE E2E SPEC TESTS ===');

  const dummyBuffer = Buffer.from('Enterprise E-Commerce Test Image Content', 'utf-8');
  const testFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test-product-banner.png',
    encoding: '7bit',
    mimetype: 'image/png',
    size: dummyBuffer.length,
    buffer: dummyBuffer,
    destination: '',
    filename: '',
    path: '',
    stream: null as any,
  };

  // 1. Single File Upload Test
  console.log('\n--- 1. Testing Single File Upload ---');
  const uploadResult = await fileUploadService.uploadFile(
    testFile,
    {
      category: FileCategory.PRODUCT_IMAGE,
      visibility: FileVisibility.PUBLIC,
      folder: 'products/banners',
      tags: ['product', 'banner', 'e2e-test'],
      provider: StorageProviderType.LOCAL,
    },
    '64b8f0a1c2d3e4f5a6b7c8d9'
  );

  console.log('✅ Single File Upload Succeeded:');
  console.log('   ID:', uploadResult._id.toString());
  console.log('   Filename:', uploadResult.filename);
  console.log('   URL:', uploadResult.url);
  console.log('   Category:', uploadResult.category);

  // 2. File Retrieval Test
  console.log('\n--- 2. Testing File Retrieval by ID ---');
  const fetchedFile = await fileUploadService.getFileById(uploadResult._id.toString());
  console.log('✅ Fetched File successfully:', fetchedFile.originalFilename);

  // 3. Public & Signed URL Generation Test
  console.log('\n--- 3. Testing Public and Signed URL Generation ---');
  const publicUrl = await fileUploadService.getPublicUrl(uploadResult._id.toString());
  const signedUrl = await fileUploadService.generateSignedUrl(uploadResult._id.toString(), 1800);
  console.log('✅ Public URL:', publicUrl);
  console.log('✅ Signed URL:', signedUrl);

  // 4. Update Metadata Test
  console.log('\n--- 4. Testing Metadata Update ---');
  const updatedFile = await fileUploadService.updateMetadata(uploadResult._id.toString(), {
    tags: ['product', 'updated', 'v2'],
    visibility: FileVisibility.PRIVATE,
  });
  console.log('✅ Updated Tags:', updatedFile.tags);
  console.log('✅ Updated Visibility:', updatedFile.visibility);

  // 5. Soft Delete & Restore Test
  console.log('\n--- 5. Testing Soft Delete & Restoration ---');
  const deleteSuccess = await fileUploadService.deleteFile(uploadResult._id.toString(), false);
  console.log('✅ Soft Delete Success:', deleteSuccess);

  const restoredFile = await fileUploadService.restoreFile(uploadResult._id.toString());
  console.log('✅ Restored File Success:', restoredFile._id.toString());

  console.log('\n=== FILE UPLOAD MODULE E2E SPEC TESTS COMPLETED SUCCESSFULLY ===');
}

// Execute tests if invoked directly
if (require.main === module) {
  runFileUploadE2ETests().catch((err) => {
    console.error('❌ E2E Spec Test Failed:', err);
    process.exit(1);
  });
}
