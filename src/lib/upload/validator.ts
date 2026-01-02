export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
export const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
];

export function validateFile(file: File | Blob): { valid: boolean; error?: string } {
    if (!file) {
        return { valid: false, error: "No file provided" };
    }

    if (file.size > MAX_FILE_SIZE) {
        return { valid: false, error: "File size exceeds 20MB limit" };
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return { valid: false, error: "Invalid file type. Only JPEG, PNG, WebP, GIF, and SVG are allowed." };
    }

    return { valid: true };
}
