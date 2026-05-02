import { GoogleGenerativeAI } from "@google/generative-ai";
import { envVars } from "../../config/env";
import { prisma } from "../../lib/prisma";

const genAI = new GoogleGenerativeAI(envVars.GEMINI_API_KEY);

// gemini model configuration
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: { responseMimeType: "application/json" },
});

// search function
const search = async (query: string, page: number = 1, limit: number = 10) => {
  const prompt = `
    You are an expert AI Prisma Query Builder. 
    Convert the user query: "${query}" into a valid JSON Prisma "where" clause.

    SCHEMA FIELDS: title, description, venue, fee (Float), status, type.

    STRICT RULES:
    1. For text searches (like "Badam Bagicha"), ALWAYS use an "OR" array checking title, description, AND venue.
    2. ALWAYS use {"contains": "...", "mode": "insensitive"} for all text fields.
    3. If query is "free", use {"fee": 0}.
    4. If query mentions a price like "850", use {"fee": 850}.
    5. DO NOT return any text other than the JSON object.

    Example Output for "Badam Bagicha":
    {
      "OR": [
        { "title": { "contains": "Badam Bagicha", "mode": "insensitive" } },
        { "description": { "contains": "Badam Bagicha", "mode": "insensitive" } },
        { "venue": { "contains": "Badam Bagicha", "mode": "insensitive" } }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const whereClause = JSON.parse(result.response.text());
    const skip = (page - 1) * limit;

    // parallel execution for performance
    const [events, total] = await Promise.all([
      prisma.events.findMany({
        where: { isDeleted: false, ...whereClause },
        include: { organizer: { select: { name: true, image: true } } },
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
      }),
      prisma.events.count({ where: { isDeleted: false, ...whereClause } }),
    ]);

    return {
      data: events,
      total,
      page,
      limit,
    };
  } catch (error) {
    // Fallback to basic search if AI fails
    const fallbackWhere = {
      OR: [
        { title: { contains: query, mode: "insensitive" as const } },
        {
          description: { contains: query, mode: "insensitive" as const },
        },
        { venue: { contains: query, mode: "insensitive" as const } },
      ],
    };

    const events = await prisma.events.findMany({
      where: { isDeleted: false, ...fallbackWhere },
      take: limit,
    });
    return {
      data: events,
      total: events.length,
      page,
      limit,
    };
  }
};

// suggestion cache
const suggestionCache = new Map<string, string[]>();

// suggestion function
const suggestion = async (query: string) => {
  if (!query || query.length < 2) return [];

  const cacheKey = query.trim().toLowerCase();
  const cachedSuggestions = suggestionCache.get(cacheKey);

  if (cachedSuggestions) {
    return cachedSuggestions;
  }

  const dbResults = await prisma.events.findMany({
    where: {
      isDeleted: false,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { venue: { contains: query, mode: "insensitive" } },
      ],
    },
    select: { title: true },
    take: 3,
  });

  const dbTitles = dbResults.map((e) => e.title);

  const prompt = `
      You are a search assistant for Planora.
      Based on the partial user input: "${query}", suggest 4-5 short, catchy event-related search phrases.
      Example: if input is "musi", suggest ["Music Festival", "Live Music Concert", "Musical Night"].
      Return ONLY a JSON string array.
    `;

  try {
    const aiResult = await model.generateContent(prompt);
    const aiSuggestions: string[] = JSON.parse(aiResult.response.text());

    const combinedSuggestions = Array.from(
      new Set([...dbTitles, ...aiSuggestions]),
    ).slice(0, 6);

    suggestionCache.set(cacheKey, combinedSuggestions);
    return combinedSuggestions;
  } catch (error) {
    suggestionCache.set(cacheKey, dbTitles);
    return dbTitles;
  }
};

// clear cache every 2 minutes
setInterval(() => {
  suggestionCache.clear();
}, 120000);

export const searchService = {
  search,
  suggestion,
};
