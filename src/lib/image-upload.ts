'use client';

/**
 * Utility for handling client-side image compression.
 * Resizes images and applies aggressive JPEG compression to stay under Firestore's 1MB document limit.
 * Optimized for a maximum of 12 images per document.
 */
export async function compressImage(file: File, maxWidth = 1000, quality = 0.5): Promise<string> {
  // Validate if the file is actually an image
  if (!file.type.startsWith('image/')) {
    throw new Error('File provided is not an image');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      
      // CRITICAL: Attach listeners BEFORE setting src to catch all states
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Resize proportionally if it exceeds maxWidth
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Fill background white for JPEG conversion (prevents black background on transparent PNGs)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        
        // Draw the image onto the canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        try {
          // Convert to base64 with JPEG compression
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } catch (err) {
          reject(new Error('Failed to generate data URL from canvas'));
        }
      };

      img.onerror = () => {
        reject(new Error(`Failed to load image for compression: ${file.name}`));
      };

      // Set the source after handlers are ready
      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error(`Failed to read file: ${file.name}`));
    };

    reader.readAsDataURL(file);
  });
}
