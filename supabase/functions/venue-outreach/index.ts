const VENUE_OUTREACH_SKILL = `Structure: specific subject line -> opening line referencing something specific about the venue -> artist in 1-2 sentences with a concrete proof point -> the ask (date + alternates + guarantee/door split if known) -> one clear next step close.
Voice: confident, brief, professional-friendly. No exclamation points unless earned. No padding adjectives ("amazing", "incredible"). Under ~150 words.
If a required data point is missing, do not invent it.

Respond ONLY with valid JSON, no markdown fences, no preamble, matching exactly this schema:
{ "subject": string, "body": string }`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { artist, venue } = await req.json();

    if (!artist?.name || !artist?.genre || !venue?.name || !venue?.email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: artist.name, artist.genre, venue.name, venue.email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userMessage = `Draft a booking outreach email.\n\nArtist:\n${JSON.stringify(artist, null, 2)}\n\nVenue:\n${JSON.stringify(venue, null, 2)}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 800,
        system: VENUE_OUTREACH_SKILL,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(JSON.stringify({ error: `Anthropic API error: ${errText}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const text = (data.content ?? [])
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('\n');
    const cleaned = text.replace(/```json|```/g, '').trim();
    const draft = JSON.parse(cleaned);

    return new Response(JSON.stringify(draft), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
