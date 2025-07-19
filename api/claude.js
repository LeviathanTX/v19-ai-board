export default async function handler(req, res) {
  const { messages, apiKey } = req.body;
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey || process.env.CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      messages: messages,
      max_tokens: 1000
    })
  });
  
  const data = await response.json();
  res.status(200).json(data);
}