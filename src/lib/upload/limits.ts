import User, { IUser } from "@/models/User";
import { PLANS, PlanType } from "@/config/plans";
import dbConnect from "@/lib/mongodb";

export async function checkUploadLimit(userId: string, fileSize: number): Promise<{ allowed: boolean; error?: string }> {
    await dbConnect();

    const user = await User.findById(userId);
    if (!user) {
        return { allowed: false, error: "User not found" };
    }

    const plan = PLANS[user.plan as PlanType] || PLANS.free;

    // 1. Check file size limit
    if (fileSize > plan.limits.maxFileSizeMB * 1024 * 1024) {
        return { allowed: false, error: `File verification failed: Max size for ${plan.name} plan is ${plan.limits.maxFileSizeMB}MB` };
    }

    // 2. Check daily uploads
    if (user.usage.uploadsToday >= plan.limits.dailyUploads) {
        return { allowed: false, error: `Daily upload limit reached (${plan.limits.dailyUploads})` };
    }

    // 3. Check image count limit
    if (user.usage.totalImages >= plan.limits.maxImages) {
        return {
            allowed: false,
            error: `Image limit reached! You've uploaded ${user.usage.totalImages} of ${plan.limits.maxImages} images on your ${plan.name} plan. Upgrade to Pro for 10,000 images or Enterprise for 100,000 images.`
        };
    }

    return { allowed: true };
}

export async function incrementUsage(userId: string) {
    await dbConnect();
    await User.findByIdAndUpdate(userId, {
        $inc: {
            "usage.uploadsToday": 1,
            "usage.totalImages": 1
        }
    });
}

export async function decrementUsage(userId: string) {
    await dbConnect();
    await User.findByIdAndUpdate(userId, {
        $inc: {
            "usage.totalImages": -1
        }
    });
}
