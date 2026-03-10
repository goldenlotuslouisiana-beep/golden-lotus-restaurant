/**
 * Convert an image file to a Base64 data URI string.
 * The resulting string can be stored directly in MongoDB and used as an <img> src.
 * No third-party image hosting service required.
 */
export const uploadImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image'));
      return;
    }

    // Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      reject(new Error('Image file is too large. Maximum size is 5MB.'));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      if (result) {
        resolve(result); // This is a full data:image/xxx;base64,... URI
      } else {
        reject(new Error('Failed to read file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };

    reader.readAsDataURL(file);
  });
};
