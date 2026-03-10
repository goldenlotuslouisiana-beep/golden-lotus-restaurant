// ImgBB upload utility
// ImgBB free anonymous upload key
// You can get your own at https://api.imgbb.com/
const IMGBB_API_KEY = '55b35be9ed9f5bd7df40c4bdc6fb9424';

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  // Append the raw File object directly
  formData.append('image', file);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
      // Do NOT set Content-Type header. Fetch sets it automatically with the correct boundary.
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ImgBB API Error:', response.status, errorText);
      throw new Error(`ImgBB API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return data.data.url;
  } catch (error) {
    console.error('Fetch error during image upload:', error);
    throw new Error('Image upload failed');
  }
};
