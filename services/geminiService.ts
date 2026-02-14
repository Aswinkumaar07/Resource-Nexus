
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeWasteImage = async (base64Image: string): Promise<any> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
        {
          text: "Analyze this image of waste. Identify the specific materials present and estimate the weight of EACH material individually in KG. Also provide 3 upcycling ideas for the collection as a whole.",
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          components: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Name of the material (e.g. Plastic, Copper, Cardboard)" },
                weight_kg: { type: Type.NUMBER, description: "Estimated weight for this specific material component in KG" }
              },
              required: ["name", "weight_kg"]
            }
          },
          upcycling_ideas: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Exactly 3 useful things that can be made from these items",
          },
        },
        required: ["components", "upcycling_ideas"],
      },
    },
  });

  const text = response.text?.trim() || "";
  if (!text) {
    throw new Error("No analysis data received from engine.");
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    throw new Error("Invalid response from analysis engine.");
  }
};

export const findLocalBuyers = async (latitude: number, longitude: number, material?: string): Promise<any[]> => {
  const prompt = material 
    ? `Find 5 authorized ${material} recycling centers or scrap dealers near this location. Specifically look for CPCB (Central Pollution Control Board) registered recyclers or entities authorized under the Plastic/E-Waste Management Rules of India. Provide names, addresses, and any mention of government authorization.`
    : `Find 5 major waste management centers, CPCB authorized recyclers, or municipal waste hubs near this location. Provide names and addresses.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: { latitude, longitude }
        }
      }
    },
  });

  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  return chunks.map((chunk: any, index: number) => ({
    id: `govt-auth-${index}`,
    buyerName: chunk.maps?.title || `Authorized Recycler ${index + 1}`,
    location: chunk.maps?.title || "Local Collection Hub",
    uri: chunk.maps?.uri,
    material: material || "Mixed Waste",
    // Simulate realistic Indian market rates in ₹ per KG
    ratePerKg: Math.random() * (material === 'Copper' ? 450 : material === 'Plastic' ? 15 : 8) + 5,
    coords: { lat: latitude, lng: longitude }
  }));
};
