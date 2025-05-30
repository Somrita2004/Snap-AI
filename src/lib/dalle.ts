
export async function generateImage(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      size: '1024x1024',
      quality: 'standard',
      n: 1,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('DALL-E API Error:', error);
    throw new Error(error.error?.message || 'Failed to generate image');
  }

  const data = await response.json();
  return data.data[0].url;
}
