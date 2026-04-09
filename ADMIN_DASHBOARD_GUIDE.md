# Admin Dashboard Setup Guide

## Overview
The GGHub Admin Dashboard provides a comprehensive interface for managing products and announcements in your gaming accessories store.

## Features

### 1. Product Management
- **Add Products**: Upload new products with images, descriptions, prices, and categories
- **Edit Products**: Modify existing product information
- **Delete Products**: Remove products from the store
- **Mark Trending**: Flag products to highlight them on the homepage
- **Image Upload**: Store product images in Supabase Storage
- **Search & Filter**: Find products by name or category

### 2. Announcement Management
- **Add Announcements**: Create announcements with titles, messages, emojis, and images
- **Edit Announcements**: Modify existing announcements
- **Delete Announcements**: Remove announcements
- **Image Upload**: Add promotional images to announcements
- **Search**: Find announcements by keyword

## Access Control

### Admin Authorization
Access to the admin dashboard is controlled via email addresses configured in the `.env.local` file.

**Configuration:**
```env
NEXT_PUBLIC_GGHUB_ADMIN_EMAILS=admin@example.com,admin2@example.com
```

Add comma-separated admin email addresses to grant access to the dashboard.

## Setup Instructions

### 1. Configure Admin Emails
Update `.env.local` with your admin email addresses:
```env
NEXT_PUBLIC_GGHUB_ADMIN_EMAILS=your-email@gmail.com
```

### 2. Create Supabase Storage Buckets
The following buckets will be automatically created on first use:
- `product-images` - Store product images
- `announcement-images` - Store announcement images

**Manual Setup (if needed):**
1. Go to Supabase Dashboard → Your Project → Storage
2. Create two public buckets:
   - Name: `product-images`
   - Name: `announcement-images`
3. For each bucket, set the following policies:
   - **Read**: Allow public read access
   - **Write**: Allow authenticated users to upload

### 3. Set Up Row-Level Security (RLS) Policies
If creating policies manually, ensure:
1. Products table policies allow:
   - Public read access
   - Authenticated/admin insert/update/delete
2. Announcements table policies allow:
   - Public read access
   - Authenticated/admin insert/update/delete

### 4. Access the Dashboard
Navigate to: `https://yourdomain.com/admin`

If not a configured admin, you'll see an "Access Denied" message.

## Usage Guide

### Adding a Product

1. Click **"Add New Product"** button
2. Fill in the product details:
   - **Name**: Product name (required)
   - **Description**: Detailed description (required)
   - **Price**: Product price in NGN (required)
   - **Category**: Select from predefined categories
   - **Image**: Upload a product image (required)
   - **Rating**: Set a rating from 0-5
   - **Trending**: Check to mark as trending

3. Click **"Add Product"** to save

### Editing a Product

1. Click the **"✏️ Edit"** button on any product
2. Modify the details as needed
3. Click **"Update Product"** to save changes

### Deleting a Product

1. Click the **"🗑️ Delete"** button on any product
2. Confirm the deletion in the prompt
3. Product will be removed from the store

### Managing Announcements

Follow similar steps as products:
- Click **"📝 Add New Announcement"**
- Fill in announcement details
- Select an emoji (optional)
- Upload an image (optional)
- Click **"Add Announcement"** to save

## Image Upload

### Supported Formats
- PNG, JPG, GIF, WEBP
- Maximum file size: 5MB

### File Organization
Images are automatically organized in Supabase Storage:
- Product images: `product-images/products/`
- Announcement images: `announcement-images/announcements/`

### Image URLs
After upload, images are publicly accessible at:
```
https://[supabase-url]/storage/v1/object/public/product-images/...
https://[supabase-url]/storage/v1/object/public/announcement-images/...
```

## API Integration

### Product Context
All product operations use the `ProductContext`:
```typescript
import { useProducts } from '@/contexts/ProductContext';

const { products, loading, addProduct, editProduct, deleteProduct } = useProducts();
```

### Announcement Context
All announcement operations use the `AnnouncementsContext`:
```typescript
import { useAnnouncements } from '@/contexts/AnnouncementsContext';

const { announcements, loading, addAnnouncement, editAnnouncement, deleteAnnouncement } = useAnnouncements();
```

### Storage Utilities
Image upload functions in `@/utils/supabase/storage.ts`:
```typescript
import { uploadProductImage, uploadAnnouncementImage } from '@/utils/supabase/storage';

// Upload product image
const imageUrl = await uploadProductImage(file);

// Upload announcement image
const imageUrl = await uploadAnnouncementImage(file);
```

## Real-Time Updates

Both products and announcements use Supabase real-time subscriptions. Changes made by one admin are instantly visible to all other admins.

## Troubleshooting

### Cannot Access Admin Dashboard
- Verify your email is in `NEXT_PUBLIC_GGHUB_ADMIN_EMAILS`
- Make sure you're authenticated with that email address
- Check that Supabase authentication is working

### Image Upload Fails
- Check file size (must be < 5MB)
- Verify file is a valid image format
- Ensure Supabase Storage buckets exist
- Check Supabase Storage bucket RLS policies

### Products/Announcements Not Appearing
- Verify data was saved (check Supabase dashboard)
- Check browser console for errors
- Ensure ProductContext/AnnouncementsContext are properly wrapped in app layout
- Verify real-time subscriptions are enabled in Supabase

### Slow Performance
- Optimize image sizes before uploading
- Consider pagination for large product lists
- Clear browser cache

## Security Considerations

1. **Email-Based Access Control**: Only configured admin emails can access the dashboard
2. **Row-Level Security**: Supabase RLS policies protect data at the database level
3. **File Uploads**: Validated on both client and server side
4. **Authentication**: Uses Supabase JWT authentication

## Best Practices

1. **Image Optimization**
   - Compress images before uploading
   - Use appropriate image dimensions
   - Aim for images under 1MB when possible

2. **Product Management**
   - Use clear, descriptive product names
   - Provide detailed descriptions for better SEO
   - Update pricing regularly
   - Keep product information accurate

3. **Announcements**
   - Keep announcements concise and engaging
   - Use relevant emojis for better visual appeal
   - Update announcements regularly
   - Include call-to-action when appropriate

4. **Admin Access**
   - Regularly review admin email list
   - Remove access from departed team members
   - Use strong passwords for admin accounts
   - Enable two-factor authentication on Supabase

## Support

For issues or questions:
1. Check the Supabase dashboard for database errors
2. Review browser console for JavaScript errors
3. Verify environment variables are correctly set
4. Check Supabase real-time subscription status
