import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

export function initImageAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ No se encontró GEMINI_API_KEY. Generación de imágenes desactivada.');
    return;
  }
  aiClient = new GoogleGenAI({ apiKey });
  console.log('🎨 Generador de imágenes IA inicializado.');
}

/**
 * Genera una imagen D&D para un monstruo o ítem basándose en su nombre y descripción.
 * Devuelve un Data URL base64 o null si falla.
 */
export async function generateItemImage(
  type: 'monster' | 'item' | 'spell',
  name: string,
  description: string
): Promise<string | null> {
  if (!aiClient) return null;

  // Construir prompt optimizado para D&D fantasy art
  let stylePrompt = '';
  if (type === 'monster') {
    stylePrompt = `A detailed fantasy RPG illustration of a creature called "${name}". 
Description: ${description?.substring(0, 300) || 'A dangerous monster'}.
Style: Dark fantasy digital art, dramatic lighting, detailed, painterly style similar to official D&D 5e Monster Manual artwork. 
No text, no UI, portrait orientation, dramatic pose, dark atmospheric background.`;
  } else if (type === 'item') {
    stylePrompt = `A detailed fantasy RPG item illustration of "${name}".
Description: ${description?.substring(0, 300) || 'A magical item'}.
Style: Classic D&D item art, clean background, high detail, painterly digital art, dramatic lighting, rich colors.
No text, no UI, centered composition, glowing magical effects if applicable.`;
  } else {
    stylePrompt = `A magical spell effect illustration for the spell "${name}".
Description: ${description?.substring(0, 300) || 'A magical spell'}.
Style: Fantasy RPG spell art, magical glows, ethereal effects, dark background, dramatic lighting.
No text, no UI.`;
  }

  try {
    const response = await aiClient.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: stylePrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });

    const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (!imageBytes) return null;

    return `data:image/jpeg;base64,${imageBytes}`;
  } catch (e: any) {
    // Imagen API puede no estar disponible en todos los planes — fallback silencioso
    const msg = e?.message || '';
    if (msg.includes('403') || msg.includes('not supported') || msg.includes('permission')) {
      console.warn('⚠️ Imagen API no disponible en este plan. Imágenes desactivadas.');
    } else if (msg.includes('429')) {
      console.warn('⚠️ Rate limit en Imagen API.');
    } else {
      console.error('❌ Error generando imagen:', msg.substring(0, 150));
    }
    return null;
  }
}
