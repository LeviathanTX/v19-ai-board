export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, apiKey } = req.body;

    // Use the server-side API key from environment variable
    // Fall back to user-provided key if no env key is set
    const claudeApiKey = process.env.CLAUDE_API_KEY || apiKey;

    if (!claudeApiKey) {
      return res.status(400).json({ error: 'API key is not configured' });
    }

    // Extract system message if present
    let system = null;
    let userMessages = messages;
    
    if (messages[0]?.role === 'system') {
      system = messages[0].content;
      userMessages = messages.slice(1);
    }

    // Build the request body with the correct format
    const requestBody = {
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: userMessages
    };

    // Add system parameter if we have a system message
    if (system) {
      requestBody.system = system;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API Error:', data);
      return res.status(response.status).json(data);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}