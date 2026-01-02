export const PLANS = {
    free: {
        name: "Free",
        price: 0,
        limits: {
            dailyUploads: 100,
            maxImages: parseInt(process.env.FREE_PLAN_MAX_IMAGES || '100'),
            maxFileSizeMB: 5,
            privateImages: false,
        },
        features: ["100 Uploads/day", `${process.env.FREE_PLAN_MAX_IMAGES || '100'} Images`, "Public links only", "Ad supported"],
    },
    pro: {
        name: "Pro",
        price: 9,
        limits: {
            dailyUploads: 1000,
            maxImages: parseInt(process.env.PRO_PLAN_MAX_IMAGES || '10000'),
            maxFileSizeMB: 20,
            privateImages: true,
        },
        features: ["Unlimited Uploads", `${process.env.PRO_PLAN_MAX_IMAGES || '10000'} Images`, "Private links", "Priority Support", "Analytics"],
    },
    enterprise: {
        name: "Enterprise",
        price: 49,
        limits: {
            dailyUploads: 10000,
            maxImages: parseInt(process.env.ENTERPRISE_PLAN_MAX_IMAGES || '100000'),
            maxFileSizeMB: 50,
            privateImages: true,
        },
        features: ["Custom Limits", `${process.env.ENTERPRISE_PLAN_MAX_IMAGES || '100000'} Images`, "SLA", "Dedicated Account Manager"],
    },
};

export type PlanType = keyof typeof PLANS;
