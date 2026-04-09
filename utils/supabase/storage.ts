import { getSupabaseClient } from './client';

type SupabaseBucket = { name: string };

const PRODUCT_IMAGES_BUCKET = 'product-images';
const ANNOUNCEMENT_IMAGES_BUCKET = 'announcement-images';

/**
 * Upload a file to Supabase Storage
 */
export const uploadFile = async (
  file: File,
  bucketName: string,
  folderPath: string = ''
): Promise<string> => {
  const supabase = getSupabaseClient();

  // Generate unique filename
  const timestamp = new Date().getTime();
  const fileExtension = file.name.split('.').pop();
  const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
  const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;

  try {
    // Upload file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error(`Upload error to ${bucketName}:`, error);
      throw error;
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicData.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Upload product image
 */
export const uploadProductImage = async (file: File): Promise<string> => {
  return uploadFile(file, PRODUCT_IMAGES_BUCKET, 'products');
};

/**
 * Upload announcement image
 */
export const uploadAnnouncementImage = async (file: File): Promise<string> => {
  return uploadFile(file, ANNOUNCEMENT_IMAGES_BUCKET, 'announcements');
};

/**
 * Delete file from Supabase Storage
 */
export const deleteFile = async (bucketName: string, filePath: string): Promise<void> => {
  const supabase = getSupabaseClient();

  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error(`Delete error from ${bucketName}:`, error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Create buckets if they don't exist
 */
export const ensureBucketsExist = async (): Promise<void> => {
  const supabase = getSupabaseClient();
  const buckets = [
    { name: PRODUCT_IMAGES_BUCKET, public: true },
    { name: ANNOUNCEMENT_IMAGES_BUCKET, public: true },
  ];

  try {
    for (const bucket of buckets) {
      // Check if bucket exists
      const { data: existingBuckets } = await supabase.storage.listBuckets();
      const bucketExists = existingBuckets?.some((b: SupabaseBucket) => b.name === bucket.name);

      if (!bucketExists) {
        // Create bucket
        await supabase.storage.createBucket(bucket.name, {
          public: bucket.public,
        });
        console.log(`✅ Created bucket: ${bucket.name}`);
      }
    }
  } catch (error) {
    console.error('Error ensuring buckets exist:', error);
    // Don't throw - buckets might already exist
  }
};
