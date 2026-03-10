import axios from 'axios';

// ImgBB free anonymous upload key
// You can get your own at https://api.imgbb.com/
const IMGBB_API_KEY = '55b35be9ed9f5bd7df40c4bdc6fb9424';

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      formData
    );
    return response.data.data.url;
  } catch (error) {
    console.error('Error uploading image to ImgBB:', error);
    throw new Error('Image upload failed');
  }
};
