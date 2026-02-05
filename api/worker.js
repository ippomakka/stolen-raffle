export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;

    // CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // GET entries
    if (method === 'GET' && url.pathname === '/entries') {
      const entries = await env.ENTRIES.list({ limit: 100 });
      const names = await Promise.all(
        entries.keys.map(async (key) => {
          const data = await env.ENTRIES.get(key.name);
          return data;
        })
      );
      return new Response(JSON.stringify(names.filter(n => n)), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST new entry
    if (method === 'POST' && url.pathname === '/entry') {
      try {
        const body = await request.json();
        const name = body.name?.trim();
        const email = body.email?.trim();

        if (!name || !email) {
          return new Response(JSON.stringify({ error: 'Name and email required' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
        const entry = JSON.stringify({ id, name, email, time: new Date().toISOString() });
        await env.ENTRIES.put(id, entry);

        return new Response(JSON.stringify({ success: true, id }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response('Not found', { status: 404 });
  }
};
