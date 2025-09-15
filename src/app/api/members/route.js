export async function GET(request) {
    const bot_token = process.env.BOT_TOKEN
    const guild_id = process.env.GUILD_ID
    const response = await fetch(`https://discord.com/api/v10/guilds/${guild_id}?with_counts=true`, {
        method: "GET",
        headers: {"Authorization": `Bot ${bot_token}`, "Content-Type": "application/json"},
        next: {revalidate: 300}
    });
    const data = await response.json();
    const member_count = data.approximate_member_count.toString();
    
    return new Response(JSON.stringify({ count: member_count }), {
        headers: { "Content-Type": "application/json" },
    });
}