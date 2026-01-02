import crypto from 'crypto';

interface TelegramUser {
    id: string;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    auth_date: number;
    hash: string;
}

export function verifyTelegramWebAppData(data: TelegramUser, botToken: string): boolean {
    if (!botToken) throw new Error("Bot token is missing");

    const { hash, ...userData } = data;

    // 1. Create a data-check-string
    const dataCheckArr = Object.keys(userData)
        .sort()
        .map((key) => `${key}=${userData[key as keyof typeof userData]}`);

    const dataCheckString = dataCheckArr.join('\n');

    // 2. Compute the secret key
    const secretKey = crypto.createHash('sha256').update(botToken).digest();

    // 3. Calculate the HMAC
    const hmac = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

    // 4. Compare
    return hmac === hash;
}
