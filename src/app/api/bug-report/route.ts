import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendMessage } from "@/lib/telegram/bot-manager";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { title, description, priority, deviceInfo } = body;

        if (!title || !description) {
            return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
        }

        const name = session.user.name || 'No Name';
        const email = session.user.email || 'No Email';
        // @ts-ignore
        const userId = session.user.id;

        // Format message for Telegram
        const message = `
🐞 <b>NEW BUG REPORT</b>

<b>Title:</b> ${title}
<b>Priority:</b> ${priority.toUpperCase()}
<b>Reported By:</b> ${name}
<b>Email:</b> ${email}
<b>User ID:</b> <code>${userId}</code>

<b>Description:</b>
${description}

<b>Device Info:</b>
Platform: ${deviceInfo?.platform || 'Unknown'}
Screen: ${deviceInfo?.screenSize || 'Unknown'}
        `.trim();

        // Send to Telegram
        await sendMessage(message);

        return NextResponse.json({
            success: true,
            message: "Bug report sent to team"
        });

    } catch (error) {
        console.error("Bug Report Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
