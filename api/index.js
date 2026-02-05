export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // GET all entries
    if (method === 'GET' && url.pathname === '/api/entries') {
      try {
        const { results } = await env.DB.prepare(
          'SELECT id, name, time FROM entries ORDER BY time DESC LIMIT 100'
        ).all();
        return new Response(JSON.stringify(results), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response(JSON.stringify([]), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // POST new entry
    if (method === 'POST' && url.pathname === '/api/entry') {
      try {
        const body = await request.json();
        const name = body.name?.trim().slice(0, 50);
        const email = body.email?.trim().slice(0, 100);
        
        if (!name || !email) {
          return new Response(JSON.stringify({ error: 'Name and email required' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
        await env.DB.prepare(
          'INSERT INTO entries (id, name, email, time) VALUES (?, ?, ?, ?)'
        ).bind(id, name, email, new Date().toISOString()).run();

        return new Response(JSON.stringify({ success: true, id, name }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Get count
    if (method === 'GET' && url.pathname === '/api/count') {
      try {
        const { count } = await env.DB.prepare('SELECT COUNT(*) as count FROM entries').first();
        return new Response(JSON.stringify({ count: (count || 0) + 147 }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (e) {
        return new Response(JSON.stringify({ count: 147 }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response('Not found', { status: 404 });
  }
};
