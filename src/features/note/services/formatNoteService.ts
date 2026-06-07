export async function formatNoteWithGemini(rawInput: string): Promise<string> {
  const response = await fetch('/api/formatNote', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content: rawInput }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    let errorMessage = `Server responded with status ${response.status}`;
    try {
      const errorData = JSON.parse(responseText);
      errorMessage = errorData.error || errorMessage;
    } catch (_) {
      // If responseText is HTML or not JSON, use a snippet of it
      if (responseText) {
        errorMessage += `: ${responseText.substring(0, 150)}`;
      }
    }
    throw new Error(errorMessage);
  }

  try {
    const data = JSON.parse(responseText);
    return data.formattedNote || '';
  } catch (err: any) {
    throw new Error(`Invalid JSON response from server: ${err.message}. Response: ${responseText.substring(0, 150)}`);
  }
}
