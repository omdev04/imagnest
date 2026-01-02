import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), 'cache');
const ORIGINALS_DIR = path.join(CACHE_DIR, 'originals');
const RESIZED_DIR = path.join(CACHE_DIR, 'resized');

// Ensure dirs exist
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR);
if (!fs.existsSync(ORIGINALS_DIR)) fs.mkdirSync(ORIGINALS_DIR);
if (!fs.existsSync(RESIZED_DIR)) fs.mkdirSync(RESIZED_DIR);

export function getCachePath(id: string, size?: string): string {
    if (!size || size === 'original') {
        return path.join(ORIGINALS_DIR, id);
    }
    return path.join(RESIZED_DIR, `${id}-${size}`);
}

export function existsInCache(id: string, size?: string): boolean {
    const p = getCachePath(id, size);
    return fs.existsSync(p);
}

export function getReadStream(id: string, size?: string): fs.ReadStream {
    return fs.createReadStream(getCachePath(id, size));
}

export async function writeToCache(id: string, buffer: Buffer, size?: string) {
    const p = getCachePath(id, size);
    await fs.promises.writeFile(p, buffer);
}
