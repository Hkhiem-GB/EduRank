/**
 * ImgBB Image Upload Service
 * Provides integration with ImgBB API (https://api.imgbb.com/) for cloud image hosting.
 */

export interface ImgBBUploadResult {
  success: boolean;
  url: string;
  displayUrl?: string;
  deleteUrl?: string;
  thumbnailUrl?: string;
}

/**
 * Upload an image buffer or array buffer to ImgBB
 * @param buffer - Binary data of the image
 * @param fileName - Optional file name
 * @returns Direct URL of the uploaded image
 */
export async function uploadToImgBB(
  buffer: Buffer | ArrayBuffer,
  fileName?: string
): Promise<string> {
  const apiKey = process.env.IMGBB_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey === "your_imgbb_api_key_here") {
    throw new Error(
      "Chưa cấu hình IMGBB_API_KEY trong file .env.local. Vui lòng lấy API key miễn phí tại https://api.imgbb.com và thêm biến IMGBB_API_KEY vào .env.local"
    );
  }

  // Convert buffer to base64 string
  const base64Data = Buffer.isBuffer(buffer)
    ? buffer.toString("base64")
    : Buffer.from(buffer).toString("base64");

  const formData = new FormData();
  formData.append("image", base64Data);

  if (fileName) {
    const cleanName = fileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
    formData.append("name", cleanName);
  }

  const endpoint = `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey.trim())}`;

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  const json = await response.json().catch(() => null);

  if (!response.ok || !json?.success) {
    const errorMsg =
      json?.error?.message ||
      json?.status_txt ||
      `Lỗi máy chủ ImgBB (mã HTTP ${response.status})`;
    throw new Error(`Tải ảnh lên ImgBB thất bại: ${errorMsg}`);
  }

  // Prefer display_url or direct image url
  const imageUrl = json.data?.display_url || json.data?.url || json.data?.image?.url;

  if (!imageUrl) {
    throw new Error("Không nhận được đường dẫn ảnh hợp lệ từ ImgBB.");
  }

  return imageUrl;
}
