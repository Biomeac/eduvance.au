const bot_token = process.env.BOT_TOKEN
const guild_id = process.env.GUILD_ID
console.log(bot_token)
fetch(`https://discord.com/api/v10/guilds/${guild_id}?with_counts=true`, {
    method: "GET",
    headers: {"Authorization": `Bot ${bot_token}`, "Content-Type": "application/json"},
    next: {revalidate: 300}
})
.then(response => response.json())
.then(data => console.log(data.approximate_member_count))