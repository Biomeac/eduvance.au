import { 
  checkRateLimit, 
  getClientIP, 
  createSecurityError,
  addSecurityHeaders
} from '@/lib/security';

export async function GET(request) {
    try {
        // Rate limiting check
        const clientIP = getClientIP(request);
        if (!checkRateLimit(clientIP, '/api/members')) {
            return createSecurityError('Rate limit exceeded. Please try again later.', 429);
        }

        // Validate environment variables
        const bot_token = process.env.BOT_TOKEN;
        const guild_id = process.env.GUILD_ID;
        
        if (!bot_token || !guild_id) {
            console.error('Missing Discord API credentials');
            return createSecurityError('Service temporarily unavailable', 503);
        }

        // Validate guild_id format
        if (!/^\d{17,19}$/.test(guild_id)) {
            console.error('Invalid Discord guild ID format');
            return createSecurityError('Invalid configuration', 500);
        }

        const response = await fetch(`https://discord.com/api/v10/guilds/${guild_id}?with_counts=true`, {
            method: "GET",
            headers: {"Authorization": `Bot ${bot_token}`, "Content-Type": "application/json"},
            next: {revalidate: 300}
        });

        if (!response.ok) {
            console.error(`Discord API error: ${response.status} ${response.statusText}`);
            return createSecurityError('External service error', 502);
        }

        const data = await response.json();
        
        // Validate response data
        if (!data || typeof data.approximate_member_count !== 'number') {
            console.error('Invalid Discord API response format');
            return createSecurityError('Invalid external service response', 502);
        }

        const member_count = data.approximate_member_count.toString();
        
        const responseObj = new Response(JSON.stringify({ count: member_count }), {
            headers: { "Content-Type": "application/json" },
        });

        return addSecurityHeaders(responseObj);
    } catch (error) {
        console.error('Members API error:', error.message);
        return createSecurityError('Internal server error', 500);
    }
}