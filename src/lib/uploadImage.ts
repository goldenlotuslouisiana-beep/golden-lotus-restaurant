import axios from 'axios';

// ImgBB free anonymous upload key
// You can get your own at https://api.imgbb.com/
const IMGBB_API_KEY = '55b35be9ed9f5bd7df40c4bdc6fb9424';

export const uploadImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        // Remove the data:image/png;base64, prefix
        const base64 = (reader.result as string).split(',')[1];

        const formData = new FormData();
        formData.append('image', base64);

        const response = await axios.post(
          `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
          formData
        );
        resolve(response.data.data.url);
      } catch (error) {
        console.error('Error uploading image to ImgBB:', error);
        reject(new Error('Image upload failed'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};
