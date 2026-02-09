// lib/firebaseUpload.js - Firebase Storage utilities for large file uploads
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

/**
 * Upload PDF file to Firebase Storage with progress tracking
 * Supports files up to 50MB
 */
export async function uploadPdfToFirebase(file, publisherId, onProgress) {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 50MB limit');
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      throw new Error('Only PDF files are allowed');
    }

    ('📤 Starting Firebase upload:', {
      fileName: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      publisherId
    });

    // Get Firebase Storage instance
    const storage = getStorage();
    
    // Create unique file path
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `publishers/${publisherId}/pdfs/${timestamp}_${sanitizedFileName}`;
    
    // Create storage reference
    const storageRef = ref(storage, storagePath);
    
    // Start upload with resumable upload
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: 'application/pdf',
      customMetadata: {
        uploadedBy: publisherId,
        uploadedAt: new Date().toISOString(),
        originalName: file.name
      }
    });

    // Return promise that tracks upload progress
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Calculate progress percentage
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          (`Upload progress: ${progress.toFixed(2)}%`);
          
          // Call progress callback if provided
          if (onProgress) {
            onProgress(progress);
          }

          // Log upload state
          switch (snapshot.state) {
            case 'paused':
              ('Upload paused');
              break;
            case 'running':
              ('Upload in progress...');
              break;
          }
        },
        (error) => {
          // Handle upload errors
          console.error('Upload failed:', error);
          
          let errorMessage = 'Upload failed';
          switch (error.code) {
            case 'storage/unauthorized':
              errorMessage = 'Unauthorized. Please check your permissions.';
              break;
            case 'storage/canceled':
              errorMessage = 'Upload was canceled';
              break;
            case 'storage/unknown':
              errorMessage = 'Unknown error occurred';
              break;
            default:
              errorMessage = error.message;
          }
          
          reject(new Error(errorMessage));
        },
        async () => {
          // Upload completed successfully
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            ('✅ Upload complete:', {
              path: storagePath,
              url: downloadURL
            });
            
            resolve({
              success: true,
              downloadURL,
              storagePath,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type
            });
          } catch (urlError) {
            reject(new Error('Failed to get download URL: ' + urlError.message));
          }
        }
      );
    });
  } catch (error) {
    console.error('Error in uploadPdfToFirebase:', error);
    throw error;
  }
}

/**
 * Upload image to Firebase Storage
 * Supports images up to 10MB
 */
export async function uploadImageToFirebase(file, publisherId, onProgress) {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file size (10MB max for images)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('Image size exceeds 10MB limit');
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }

    ('📤 Starting image upload:', {
      fileName: file.name,
      size: (file.size / 1024).toFixed(2) + ' KB',
      publisherId
    });

    const storage = getStorage();
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `publishers/${publisherId}/images/${timestamp}_${sanitizedFileName}`;
    
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        uploadedBy: publisherId,
        uploadedAt: new Date().toISOString(),
        originalName: file.name
      }
    });

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          console.error('Image upload failed:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            ('✅ Image upload complete');
            
            resolve({
              success: true,
              downloadURL,
              storagePath,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type
            });
          } catch (urlError) {
            reject(new Error('Failed to get download URL: ' + urlError.message));
          }
        }
      );
    });
  } catch (error) {
    console.error('Error in uploadImageToFirebase:', error);
    throw error;
  }
}

/**
 * Convert image file to base64 (for embedding in articles)
 */
export async function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    
    reader.onerror = (error) => {
      reject(new Error('Failed to read file: ' + error.message));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Compress image before upload (optional, for large images)
 */
export async function compressImage(file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              
              ('✅ Image compressed:', {
                original: (file.size / 1024).toFixed(2) + ' KB',
                compressed: (compressedFile.size / 1024).toFixed(2) + ' KB',
                reduction: (((file.size - compressedFile.size) / file.size) * 100).toFixed(1) + '%'
              });
              
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}