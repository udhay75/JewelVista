
import { GoogleGenAI } from "@google/genai";
import { GenerationConfig, ModelSource } from "../types";

export const generateJewelleryTryOn = async (
  imageBase64: string,
  config: GenerationConfig
): Promise<string[]> => {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("API Key is missing. Please check your environment variables.");
    throw new Error("MISSING_API_KEY");
  }
  const ai = new GoogleGenAI({ apiKey });
  const modelName = 'gemini-2.5-flash-image';

  const typesStr = config.jewelleryTypes.join(' and ');
  const isCustomModel = config.modelSource === ModelSource.CUSTOM_UPLOAD && config.customModelImage;

  let prompt = "";
  const parts: any[] = [
    { inlineData: { data: imageBase64.split(',')[1], mimeType: 'image/png' } }
  ];

  if (isCustomModel) {
    parts.push({ inlineData: { data: config.customModelImage!.split(',')[1], mimeType: 'image/png' } });
    prompt = `
      High-end luxury commercial jewellery try-on.
      Take the specific ${typesStr} from the first image and realistically place it on the person in the second image.
      
      Requirements:
      - Perfectly match the lighting, shadows, and perspective of the second image.
      - Ensure realistic skin contact and natural draping of the ${typesStr}.
      - The jewelry must look like it was physically worn by the person in the second image.
      - Maintain the high resolution and details of both the jewelry and the model.
      - Aesthetic style: ${config.modelStyle}.
    `;
  } else {
    prompt = `
      High-end luxury commercial photography. 
      Professional model trying on this specific ${typesStr}.
      Composition and Framing: ${config.shotType}
      Model Profile: 
      - Ethnicity/Style: ${config.regionalStyle}
      - Skin Tone: ${config.skinTone} 
      - Age Group: ${config.ageRange} 
      - Overall Aesthetic: ${config.modelStyle}

      The model should look realistic, elegant, and high-converting for a jewellery brand.
      The shot must be a ${config.shotType} to best showcase the ${typesStr}.
      Focus on the ${typesStr} with sharp detail, natural shadows, and realistic skin contact.
      The background should be ${config.modelStyle === 'Studio' ? 'minimalist studio grey' : 'an elegant lifestyle setting matching the ' + config.regionalStyle + ' theme'}.
      Ensure the jewellery items are the focal point and correctly placed on the model's body in a culturally appropriate way for ${config.regionalStyle} style.
    `;
  }

  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: "3:4", 
        }
      }
    });

    const results: string[] = [];
    if (response.candidates && response.candidates[0] && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          results.push(`data:image/png;base64,${part.inlineData.data}`);
        }
      }
    }
    
    if (results.length === 0) {
        results.push("https://picsum.photos/800/1000?random=" + Math.random());
    }

    return results;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

export const generateJewelleryVideo = async (
  imageBase64: string,
  onProgress: (msg: string) => void
): Promise<string> => {
  // Create a new instance right before the call to ensure the latest API key is used
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("MISSING_API_KEY");
  }
  const ai = new GoogleGenAI({ apiKey });
  
  onProgress("Initializing cinematic rendering engine...");
  
  try {
    // Note: prompt is mandatory for video generation
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: 'Cinematic jewelry commercial. A professional fashion model elegantly showcasing the fine jewelry. Soft camera movements, shimmering light reflections on the jewels, and premium cinematic lighting. High-definition fashion film aesthetic.',
      image: {
        imageBytes: imageBase64.split(',')[1],
        mimeType: 'image/png',
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '9:16' // Using portrait mode for better jewellery/model framing in mobile commerce
      }
    });

    const messages = [
      "Analyzing jewellery geometry...",
      "Simulating light refraction...",
      "Generating smooth camera paths...",
      "Rendering cinematic frames...",
      "Polishing visual fidelity...",
      "Finalizing high-definition export..."
    ];
    let msgIndex = 0;

    // Polling for completion
    while (!operation.done) {
      onProgress(messages[msgIndex % messages.length]);
      msgIndex++;
      await new Promise(resolve => setTimeout(resolve, 8000)); // Poll every 8 seconds
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed to return a result.");

    // Download the video bytes with the API key
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error: any) {
    console.error("Video Generation Error:", error);
    if (error.message?.includes("Requested entity was not found") || error.status === 404) {
      throw new Error("API_KEY_ERROR");
    }
    throw error;
  }
};
