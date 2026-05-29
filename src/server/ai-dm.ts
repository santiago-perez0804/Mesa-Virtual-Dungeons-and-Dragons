import { GoogleGenAI, Type } from '@google/genai';

let aiClient: GoogleGenAI | null = null;
const activeSessions: Map<number, any> = new Map();

// Types for callbacks
export type SpawnMonsterCallback = (name: string, count: number) => void;

export function initAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ No se encontró GEMINI_API_KEY en las variables de entorno. DM IA estará desactivado.");
    return;
  }
  aiClient = new GoogleGenAI({ apiKey });
  console.log("🤖 Cliente DM IA inicializado con Gemini.");
}

export function startAISession(campaignId: number, campaignName: string, campaignDesc: string, onSpawnMonster: SpawnMonsterCallback) {
  if (!aiClient) return false;

  const systemInstruction = `
Eres un Dungeon Master de Dungeons & Dragons 5e.
Tu tarea es narrar la campaña "${campaignName}".
Descripción: ${campaignDesc || 'Una aventura épica en D&D.'}

Reglas:
1. Sé narrativo, descriptivo pero conciso (no escribas párrafos inmensamente largos).
2. Pide tiradas de dados (ej: "Haz una tirada de Percepción") a los jugadores cuando intenten hacer algo arriesgado o que requiera habilidad.
3. Responde a los resultados de los dados que te informará el sistema.
4. Cuando inicie un combate, TIENES que invocar a los monstruos en la grilla usando la herramienta 'spawn_monsters'. Pasa una lista de monstruos a invocar. Trata de usar nombres estándar del SRD en español o inglés (ej: "Goblin", "Orco", "Bandido"). NO inventes monstruos.
5. Mantente siempre en personaje de DM.
`;

  const chat = aiClient.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
      tools: [{
        functionDeclarations: [{
          name: 'spawn_monsters',
          description: 'Invoca monstruos en la grilla (tablero) cuando empieza un combate. Usa esto SIEMPRE que aparezcan enemigos físicos.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              monsters: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: 'Nombre del monstruo (ej: Goblin, Orco, Bandido)' },
                    count: { type: Type.INTEGER, description: 'Cantidad de este monstruo a invocar (ej: 3)' }
                  },
                  required: ['name', 'count']
                }
              }
            },
            required: ['monsters']
          }
        }]
      }]
    }
  });

  activeSessions.set(campaignId, { chat, onSpawnMonster });
  console.log(`🤖 Sesión de IA iniciada para la campaña ${campaignId}`);
  return true;
}

export async function sendChatMessageToAI(campaignId: number, author: string, message: string): Promise<string | null> {
  const session = activeSessions.get(campaignId);
  if (!session) return null;

  try {
    const prompt = `${author}: ${message}`;
    const response = await session.chat.sendMessage({ message: prompt });
    return await handleAIResponse(session, response);
  } catch (error) {
    console.error("Error al enviar mensaje a la IA:", error);
    return "DM IA: (Ha ocurrido una perturbación mágica. Por favor, repite lo que dijiste.)";
  }
}

export async function sendDiceRollToAI(campaignId: number, player: string, result: number, die: string): Promise<string | null> {
  const session = activeSessions.get(campaignId);
  if (!session) return null;

  try {
    const prompt = `[SISTEMA]: El jugador ${player} acaba de tirar un ${die} y sacó un ${result}. Responde a este resultado de acuerdo a la situación actual.`;
    const response = await session.chat.sendMessage({ message: prompt });
    return await handleAIResponse(session, response);
  } catch (error) {
    console.error("Error al notificar dado a la IA:", error);
    return null;
  }
}

async function handleAIResponse(session: any, response: any): Promise<string> {
  let textContent = '';

  // Gemini SDK actual: si hay llamadas a función, están en response.functionCalls o dentro de response.candidates[0].content.parts
  const parts = response.candidates?.[0]?.content?.parts || [];
  
  for (const part of parts) {
    if (part.text) {
      textContent += part.text + '\n';
    }
    
    if (part.functionCall) {
      const call = part.functionCall;
      if (call.name === 'spawn_monsters') {
        const args = call.args;
        if (args && args.monsters) {
          console.log(`🤖 La IA decidió invocar monstruos:`, args.monsters);
          let spawnMessage = `\n*[Sistema: El DM IA ha invocado enemigos en la grilla]*\n`;
          for (const m of args.monsters) {
            session.onSpawnMonster(m.name, m.count);
            spawnMessage += `- ${m.count}x ${m.name}\n`;
          }
          textContent += spawnMessage;
          
          // Enviar confirmación a la IA de que se invocaron
          const toolResponse = await session.chat.sendMessage({
            message: [{
              functionResponse: {
                name: 'spawn_monsters',
                response: { result: "Monstruos invocados exitosamente en la grilla." }
              }
            }]
          });
          const followUp = await handleAIResponse(session, toolResponse);
          textContent += '\n' + followUp;
        }
      }
    }
  }

  return textContent.trim();
}

export function endAISession(campaignId: number) {
  activeSessions.delete(campaignId);
}

export function isAISessionActive(campaignId: number) {
  return activeSessions.has(campaignId);
}
