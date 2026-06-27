import { Socket } from 'socket.io-client';
import type {
  ICompendiumService,
  ICompendiumItem,
  IClassFeaturePayload,
  IClassFeature
} from '../interfaces/ICompendiumService';

export class CompendiumService implements ICompendiumService {
  private socket: Socket;
  private host: string;

  constructor(socket: Socket) {
    this.socket = socket;
    this.host = window.location.hostname === 'localhost' ? 'http://localhost:3000' : window.location.origin;
  }

  // --- WebSockets (Items & Rules) ---

  createItem(item: ICompendiumItem): Promise<void> {
    return new Promise((resolve) => {
      this.socket.emit('content:create', item);
      // Asumimos resolución inmediata ya que el servidor emite un evento general luego de guardar.
      // En una arquitectura más robusta, esperaríamos un 'ack' del servidor.
      resolve();
    });
  }

  updateItem(id: string | number, item: ICompendiumItem): Promise<void> {
    return new Promise((resolve) => {
      this.socket.emit('content:update', { id, ...item });
      resolve();
    });
  }

  deleteItem(id: string | number): Promise<void> {
    return new Promise((resolve) => {
      this.socket.emit('content:delete', { id });
      resolve();
    });
  }

  // --- API REST (Class Features) ---

  async getFeatures(): Promise<IClassFeature[]> {
    const res = await fetch(`${this.host}/api/class-features`);
    if (!res.ok) throw new Error("Error al obtener los rasgos de clase");
    return res.json();
  }

  async createFeature(feature: IClassFeaturePayload): Promise<IClassFeature> {
    const res = await fetch(`${this.host}/api/class-features`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feature)
    });
    if (!res.ok) throw new Error("Error al crear el rasgo");
    return res.json();
  }

  async updateFeature(id: string | number, feature: IClassFeaturePayload): Promise<IClassFeature> {
    const res = await fetch(`${this.host}/api/class-features/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feature)
    });
    if (!res.ok) throw new Error("Error al actualizar el rasgo");
    return res.json();
  }

  async deleteFeature(id: string | number): Promise<void> {
    const res = await fetch(`${this.host}/api/class-features/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error("Error al eliminar el rasgo");
    return res.json();
  }
}
