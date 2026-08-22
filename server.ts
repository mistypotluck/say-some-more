import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry headers
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Resilient fallback story analyzer for zero downtime / offline demo
function generateFallbackStory(transcript: string) {
  const lower = transcript.toLowerCase();
  let mumSay = "Shared daily happenings from the neighborhood.";
  let actionableItem = "Checking in on the family.";
  let infoNote = "Spoken in Singlish/English.";
  let detectedTopic = "Daily Update";

  if (lower.includes("nex") || lower.includes("st luke") || lower.includes("teochew") || lower.includes("cinema") || lower.includes("woodbridge") || lower.includes("theatre")) {
    mumSay = "At Nex theatre with St. Luke's seniors watching China Teochew show; partnered an 86-year-old retired Woodbridge nurse. Cinema was very cold and fell asleep.";
    actionableItem = "Caught a cold with a very bad runny nose from the cold cinema air-con; needs physical comfort and rest.";
    infoNote = "Immediate physical comfort check-in (not a medical diagnosis). Runny nose from temperature shift.";
    detectedTopic = "St. Luke's Outing & Cold";
  } else if (lower.includes("cat") || lower.includes("mrs tan")) {
    mumSay = "Mrs Tan downstairs has a new cat and it is very cute.";
    actionableItem = "Wants to know whether you all are coming for Sunday makan.";
    infoNote = "Meal time (lunch vs dinner) was not specified.";
    detectedTopic = "Neighbor's Cat & Sunday Meal";
  } else if (lower.includes("market") || lower.includes("papaya") || lower.includes("soup") || lower.includes("cucumber")) {
    mumSay = "Went to Tekka wet market; Uncle Seng gave sweet papaya, bought old cucumber and pork ribs to boil soup.";
    actionableItem = "Asking if daughter wants to come over for dinner soup or take home a container.";
    infoNote = "Soup will be ready for tonight's dinner.";
    detectedTopic = "Wet Market & Dinner Soup";
  } else if (lower.includes("doctor") || lower.includes("knee") || lower.includes("polyclinic") || lower.includes("tcm") || lower.includes("antenna") || lower.includes("tv")) {
    mumSay = "Went for TCM acupuncture downstairs for knee ache; doctor advised more rest and no heavy lifting.";
    actionableItem = "Living room TV antenna cannot receive Channel 8, asking Mei to help check when free.";
    infoNote = "Comfort advice from physician; non-urgent technical help requested.";
    detectedTopic = "TCM Clinic & TV Antenna";
  } else {
    mumSay = transcript.slice(0, 120) + (transcript.length > 120 ? "..." : "");
    if (lower.includes("sunday") || lower.includes("makan") || lower.includes("coming")) {
      actionableItem = "Wants to know whether you all are coming for Sunday makan.";
      infoNote = "Meal time (lunch vs dinner) was not specified.";
      detectedTopic = "Sunday Family Makan";
    } else if (lower.includes("cold") || lower.includes("sick") || lower.includes("flu") || lower.includes("ache") || lower.includes("pain")) {
      actionableItem = "Immediate physical comfort check-in: feeling unwell and resting at home.";
      infoNote = "Personal comfort update (strictly non-diagnostic).";
      detectedTopic = "Health & Comfort Check-in";
    } else {
      actionableItem = "Checking in and sending love to daughter Mei.";
      detectedTopic = "Family Check-in";
    }
  }

  const companionVerification = `${mumSay} And you would like to let Mei know: "${actionableItem}". Did I understand that correctly, Mdm Lim?`;

  return {
    companionVerification,
    mumSay,
    actionableItem,
    infoNote,
    detectedTopic,
    safetyPassed: true,
  };
}

// Fallback reply generator
function generateFallbackReplies(story: any) {
  const combined = ((story?.mumSay || "") + " " + (story?.actionableItem || "") + " " + (story?.infoNote || "")).toLowerCase();

  if (combined.includes("cold") || combined.includes("runny nose") || combined.includes("nex") || combined.includes("st luke")) {
    return [
      {
        id: "warm",
        tone: "Warm & Loving",
        text: "Aiyoh Mum! Stay warm and drink lots of hot water. I'll buy some hot soup and cold medication over for you tonight after work. Rest well, love you!",
      },
      {
        id: "practical",
        tone: "Practical / Direct",
        text: "Mum, please rest in bed and drink warm water. I will drop by tonight around 7:30pm with groceries and tissue. Call me if it gets worse.",
      },
      {
        id: "singlish",
        tone: "Familiar Singlish",
        text: "Aiyoh, the cinema air-con always so freezing one hor! Don't bathe cold water, go drink warm water first. Tonight I bring soup over for you lor.",
      },
    ];
  }

  if (combined.includes("soup") || combined.includes("papaya") || combined.includes("cucumber") || combined.includes("market")) {
    return [
      {
        id: "warm",
        tone: "Warm & Loving",
        text: "Wah your soup is always the best Mum! I would love to drop by tonight to drink a warm bowl with you. Love you!",
      },
      {
        id: "practical",
        tone: "Practical / Direct",
        text: "Thanks Mum, please pack a container for me. I'll pick it up around 7:00pm after work today.",
      },
      {
        id: "singlish",
        tone: "Familiar Singlish",
        text: "Wah sweet papaya! Sure Mum, tonight I come back drink soup with you. Save some for me hor!",
      },
    ];
  }

  if (combined.includes("tcm") || combined.includes("knee") || combined.includes("antenna") || combined.includes("tv")) {
    return [
      {
        id: "warm",
        tone: "Warm & Loving",
        text: "Mum, please listen to the physician and rest your knee well! Don't carry heavy things. I'll come check your TV antenna tonight. Love you!",
      },
      {
        id: "practical",
        tone: "Practical / Direct",
        text: "I will come by this evening at 6:30pm to fix the TV antenna for you. Please sit down and rest your knee today.",
      },
      {
        id: "singlish",
        tone: "Familiar Singlish",
        text: "Aiyoh your knee ache must rest more lah! Tonight I come over help you tune the Channel 8 antenna okay!",
      },
    ];
  }

  return [
    {
      id: "warm",
      tone: "Warm & Loving",
      text: "Aww so nice Mum! Yes, we would love to spend time with you this Sunday. Let me check with the family and confirm our timing tonight. Love you!",
    },
    {
      id: "practical",
      tone: "Practical / Direct",
      text: "Yes Mum, we will be coming over this Sunday around 12:30pm for lunch. See you soon!",
    },
    {
      id: "singlish",
      tone: "Familiar Singlish",
      text: "Wah so nice! Sunday can Mum, we all come over for makan together. Don't cook so much until tired hor!",
    },
  ];
}

// API Route: Translate Mum's Singlish speech into 20-second capsule
app.post("/api/translate-story", async (req, res) => {
  const { transcript } = req.body;
  if (!transcript || typeof transcript !== "string") {
    return res.status(400).json({ error: "Transcript is required." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("No GEMINI_API_KEY detected. Using resilient Singlish heuristics fallback.");
    return res.json(generateFallbackStory(transcript));
  }

  try {
    const prompt = `You are "Say Some More", an empathetic, respectful Singlish-aware attention translator and companion for an elderly Singaporean parent (Mdm Lim) living alone.
Mdm Lim spoke or typed the following story/update:
"""${transcript}"""

Task:
Analyze and cleanly separate Mdm Lim's message into these essential parts:
1. "mumSay" ("Today Mum say..."): Colorful daily lore, outings, people met, and rich cultural context (e.g. dialect differences, old memories, neighborhood happenings, opera shows, market banter).
2. "actionableItem" ("⚡ This one important"): Actionable family requests (e.g. Sunday dinner plans, help with TV antenna) OR immediate physical comfort check-ins (e.g. caught a cold from cinema air-con, bad runny nose, needs groceries or warm soup). Strictly avoid clinical or medical diagnoses—focus purely on practical comfort, filial care, and family coordination.
3. "infoNote": Helpful contextual nuance or missing detail (e.g. "Non-emergency comfort check-in; air-con temperature shift caused runny nose" or "Meal timing lunch vs dinner was not specified").
4. "companionVerification": A polite, warm, respectful verification in natural English/Singlish addressed to Mdm Lim ("... Did I understand that correctly, Mdm Lim?"), summarizing her story and asking if she wants to share with daughter Mei.
5. "detectedTopic": Short 2-4 word topic label (e.g. "St. Luke's Outing & Cold", "Mrs Tan's Cat & Sunday Makan").
6. "safetyPassed": Boolean. Must be true if it complies with non-diagnostic elderly companion guidelines.

Return JSON conforming strictly to the requested schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the companion AI in Say Some More. You treat elderly users with patience, dignity, and warmth. You strictly follow non-diagnostic elderly safety rules.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            companionVerification: {
              type: Type.STRING,
              description: "Warm message asking Mdm Lim if we understood her correctly before proceeding.",
            },
            mumSay: {
              type: Type.STRING,
              description: "Colorful daily lore, outings, people met, and cultural context.",
            },
            actionableItem: {
              type: Type.STRING,
              description: "Actionable family request or immediate physical comfort check-in.",
            },
            infoNote: {
              type: Type.STRING,
              description: "Informational note, contextual nuance, or missing detail.",
            },
            detectedTopic: {
              type: Type.STRING,
              description: "Short 2-4 word topic tag.",
            },
            safetyPassed: {
              type: Type.BOOLEAN,
              description: "True if adhered to non-diagnostic safety guidelines.",
            },
          },
          required: ["companionVerification", "mumSay", "actionableItem", "infoNote", "detectedTopic", "safetyPassed"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Gemini translate error, using fallback:", error?.message);
    return res.json(generateFallbackStory(transcript));
  }
});

// API Route: Draft reply suggestions for daughter Mei
app.post("/api/draft-reply", async (req, res) => {
  const { story } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.json({ drafts: generateFallbackReplies(story) });
  }

  try {
    const prompt = `You are assisting Mei, a busy adult daughter in Singapore, to draft 3 respectful, caring, and prompt reply options to her elderly mother (Mdm Lim) based on this story capsule:
- Mum's story ("Today Mum say..."): "${story?.mumSay || "Daily update"}"
- Key highlight ("⚡ This one important"): "${story?.actionableItem || "Checking in"}"
- Context / note: "${story?.infoNote || "None"}"

Provide exactly 3 distinct AI draft reply options for Mei:
1. "Warm & Loving" (caring, empathetic, reassuring, expresses filial affection)
2. "Practical / Direct" (clear, solution-oriented, confirms logistics, timings, or practical help)
3. "Familiar Singlish" (warm Singaporean colloquial daughter tone with authentic particles like 'lor', 'hor', 'aiyoh', 'lah', 'leh')

Guidelines:
- Keep each reply concise (1-2 sentences).
- If Mum mentions feeling cold, having a runny nose, or needing comfort, offer soothing comfort (e.g. warm water, hot soup, dropping by after work) without making medical diagnoses.
- Human-in-the-loop: Mei will review and edit before sending.
- Tone must feel genuine, filial, and affectionate.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            drafts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  tone: { type: Type.STRING },
                  text: { type: Type.STRING },
                },
                required: ["id", "tone", "text"],
              },
            },
          },
          required: ["drafts"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Gemini draft error, using fallback:", error?.message);
    return res.json({ drafts: generateFallbackReplies(story) });
  }
});

// Start the server with Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Say Some More server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
