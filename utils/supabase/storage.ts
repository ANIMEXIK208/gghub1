import { getSupabaseClient } from './client';
import { compressImage } from '../imageCompression';

type SupabaseBucket = { name: string };

const PRODUCT_IMAGES_BUCKET = 'product-images';
const ANNOUNCEMENT_IMAGES_BUCKET = 'announcement-images';
const PROFILE_IMAGES_BUCKET = 'profiles';

const ensureBucketExists = async (bucketName: string): Promise<void> => {
  const supabase = getSupabaseClient();
  const { data: existingBuckets, error } = await supabase.storage.listBuckets();

  if (error) {
    console.warn('Could not list storage buckets:', error);
    return;
  }

  const bucketExists = existingBuckets?.some((bucket: SupabaseBucket) => bucket.name === bucketName);
  if (!bucketExists) {
    await supabase.storage.createBucket(bucketName, { public: true });
  }
};

/**
 * Upload a file to Supabase Storage
 */
export const uploadFile = async (
  file: File,
  bucketName: string,
  folderPath: string = ''
): Promise<string> => {
  const supabase = getSupabaseClient();

  await ensureBucketExists(bucketName);

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
    const publicData = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    if (!publicData?.data?.publicUrl) {
      console.error('Public URL error:', publicData);
      throw new Error('Failed to get public URL after upload');
    }

    return publicData.data.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Upload product image with automatic compression
 */
export const uploadProductImage = async (file: File): Promise<string> => {
  try {
    // Compress image first
    const compressedBlob = await compressImage(file, 'PRODUCT');
    const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });

    return uploadFile(compressedFile, PRODUCT_IMAGES_BUCKET, 'products');
  } catch (error) {
    console.error('Error compressing product image:', error);
    // Fallback: upload original if compression fails
    return uploadFile(file, PRODUCT_IMAGES_BUCKET, 'products');
  }
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

export const normalizeSupabaseImageUrl = (rawUrl?: string | null, fallbackBucket?: string): string | null => {
  if (!rawUrl) {
    return null;
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  if (!supabaseUrl) {
    return trimmed;
  }

  const cleaned = trimmed.replace(/^\/+/, '');

  if (cleaned.startsWith('storage/v1/object/public/')) {
    return `${supabaseUrl}/${cleaned}`;
  }

  if (fallbackBucket && !cleaned.startsWith(`${fallbackBucket}/`)) {
    return `${supabaseUrl}/storage/v1/object/public/${fallbackBucket}/${cleaned}`;
  }

  return `${supabaseUrl}/storage/v1/object/public/${cleaned}`;
};

export const getSafeImageUrl = (rawUrl?: string | null, fallbackBucket?: string): string => {
  const normalized = normalizeSupabaseImageUrl(rawUrl, fallbackBucket);
  return normalized || 'https://via.placeholder.com/400x320?text=Image+Not+Found';
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
