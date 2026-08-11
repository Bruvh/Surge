import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

router.post("/chat", async (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Gemini API key is not configured." });
  }

  const message = req.body?.message;
  if (typeof message !== "string" || !message.trim()) {
    return res
      .status(400)
      .json({ error: "The request body must include a non-empty message string." });
  }

  const { systemPrompt, context } = req.body ?? {};
  const userContext = typeof context === "string" && context.trim() ? context.trim() : "";
  const effectiveSystemPrompt = typeof systemPrompt === "string" && systemPrompt.trim() ? systemPrompt.trim() : "";

  try {
    const userText = userContext
      ? `Past Important Topics:\n${userContext}\n\n${message}`
      : message;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: effectiveSystemPrompt }],
          },
          contents: [
            {
              role: "USER",
              parts: [{ text: userText }],
            },
          ],
          generationConfig: {},
        }),
      },
    );

    if (!response.ok) {
      const contentType = response.headers.get("content-type") ?? "";
      let errorBody: unknown = null;

      try {
        if (contentType.includes("application/json")) {
          errorBody = await response.json();
        } else {
          errorBody = await response.text();
        }
      } catch (parseError) {
        errorBody = `Unable to parse Gemini error response: ${parseError}`;
      }

      const status = response.status;
      const statusText = (response as any).statusText || '';
      let safeBody: string;
      try {
        safeBody = typeof errorBody === 'string' ? errorBody : JSON.stringify(errorBody, null, 2);
      } catch (e) {
        safeBody = String(errorBody);
      }

      console.error('Gemini service returned non-2xx response', `status=${status} statusText=${statusText}`, safeBody);

      return res.status(502).json({ error: "Gemini service returned an error." });
    }

    const json = (await response.json()) as unknown;

    function extractText(obj: any): string | null {
      if (!obj || typeof obj !== 'object') return null;

      try {
        const candidate = obj?.candidates?.[0];
        if (!candidate || typeof candidate !== 'object') return null;

        const content = candidate?.content;
        const maybeParts = Array.isArray(content)
          ? content.flatMap((item: any) => (Array.isArray(item?.parts) ? item.parts : []))
          : Array.isArray(content?.parts)
          ? content.parts
          : [];

        if (Array.isArray(maybeParts)) {
          const joined = maybeParts
            .map((part: any) => (typeof part?.text === 'string' ? part.text : ''))
            .filter(Boolean)
            .join('\n');
          if (joined) return joined;
        }

        const messageParts = candidate?.message?.content?.[0]?.parts;
        if (Array.isArray(messageParts)) {
          const joined = messageParts
            .map((part: any) => (typeof part?.text === 'string' ? part.text : ''))
            .filter(Boolean)
            .join('\n');
          if (joined) return joined;
        }

        const c3 = candidate?.output?.[0]?.content?.[0]?.text;
        if (typeof c3 === 'string' && c3.trim()) return c3;

        const c4 = obj?.output?.[0]?.content?.[0]?.text;
        if (typeof c4 === 'string' && c4.trim()) return c4;

        return null;
      } catch (e) {
        return null;
      }
    }

    const responseText = extractText(json as any);

    if (typeof responseText !== 'string') {
      // safe diagnostic logging: include HTTP status metadata and parsed body, but never headers or secrets
      let safeBody: string;
      try {
        safeBody = JSON.stringify(json, null, 2);
      } catch (e) {
        safeBody = String(json);
      }
      const status = (response as any).status || 200;
      const statusText = (response as any).statusText || '';
      console.error('Gemini returned an unexpected/invalid JSON shape', `status=${status} statusText=${statusText}`, safeBody);
      return res.status(502).json({ error: 'Gemini service returned an invalid response.' });
    }

    return res.json({ response: responseText });
  } catch (error) {
    console.error("Gemini chat request failed", {
      error:
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : error,
    });
    return res.status(500).json({ error: "An unexpected error occurred while contacting Gemini." });
  }
});

export default router;
