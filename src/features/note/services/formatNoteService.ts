export async function formatNoteWithGemini(rawInput: string): Promise<string> {
  const response = await fetch('/api/note/format', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content: rawInput }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Server note formatting request failed.');
  }

  const data = await response.json();
  return data.formattedNote || '';
}
