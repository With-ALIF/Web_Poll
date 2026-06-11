export async function generateOptions(question: string) {
  if (!question.trim()) {
    throw new Error("Please provide a question first.");
  }

  try {
    const response = await fetch("/api/photocard/generateOptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }

    return await response.json() as { a: string, b: string, c: string, d: string };
  } catch (error: any) {
    console.error("Error generating options via API:", error);
    throw error;
  }
}
