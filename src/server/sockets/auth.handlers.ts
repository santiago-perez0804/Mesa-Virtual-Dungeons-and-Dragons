import type { Server, Socket } from 'socket.io';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../bd.js';
import { sendCharactersToSocket } from '../utils/sync.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dnd-vtt-secret-key-fallback-2026';

function enviarDatosIniciales(socket: Socket) {
  sendCharactersToSocket(socket);
  const monsters = db.prepare("SELECT * FROM content_items WHERE type = 'monster'").all();
  socket.emit('monsters:list', monsters);
}

/** Autenticacion: login, registro, re-login por token y actualizacion de perfil. */
export function registerAuthHandlers(_io: Server, socket: Socket) {
  socket.on('auth:login', ({ username, password }) => {
    try {
      const user: any = db.prepare("SELECT id, username, password, role, profile_image FROM users WHERE username = ?").get(username);
      if (user && bcrypt.compareSync(password, user.password)) {
        socket.data.userId = user.id;
        socket.data.userName = user.username;
        socket.data.role = user.role;

        const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        const safeUser = { id: user.id, username: user.username, role: user.role, profile_image: user.profile_image };
        socket.emit('auth:success', { user: safeUser, token });
        console.log(`\u{1F464} ${user.username} entr\u00f3 como ${user.role} (JWT generado)`);

        enviarDatosIniciales(socket);
      } else {
        socket.emit('auth:error', 'Usuario o contrase\u00f1a incorrectos.');
      }
    } catch (e) {
      console.error(e);
      socket.emit('auth:error', 'Error interno en el servidor.');
    }
  });

  socket.on('auth:register', ({ username, password, role, profile_image }) => {
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const result = db.prepare("INSERT INTO users (username, password, role, profile_image) VALUES (?, ?, ?, ?)")
        .run(username, hashedPassword, role || 'player', profile_image || null);

      const newUserId = result.lastInsertRowid;
      const token = jwt.sign({ userId: newUserId, username, role: role || 'player' }, JWT_SECRET, { expiresIn: '7d' });

      const safeUser = { id: newUserId, username, role: role || 'player', profile_image: profile_image || null };

      socket.data.userId = newUserId;
      socket.data.userName = username;
      socket.data.role = role || 'player';

      socket.emit('auth:register_success', 'Usuario creado exitosamente.');
      socket.emit('auth:success', { user: safeUser, token });
      console.log(`\u{1F464} Nuevo aventurero registrado: ${username} como ${role || 'player'}`);

      enviarDatosIniciales(socket);
    } catch (e: any) {
      if (e.message.includes('UNIQUE constraint failed')) {
        socket.emit('auth:error', 'Ese nombre de usuario ya existe.');
      } else {
        socket.emit('auth:error', 'Error al crear la cuenta.');
      }
    }
  });

  socket.on('auth:token_login', ({ token }) => {
    try {
      if (!token) {
        socket.emit('auth:token_invalid');
        return;
      }
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user: any = db.prepare("SELECT id, username, role, profile_image FROM users WHERE id = ?").get(decoded.userId);

      if (user) {
        socket.data.userId = user.id;
        socket.data.userName = user.username;
        socket.data.role = user.role;

        socket.emit('auth:success', { user, token });
        console.log(`\u{1F464} Re-autenticaci\u00f3n autom\u00e1tica exitosa para: ${user.username}`);

        enviarDatosIniciales(socket);
      } else {
        socket.emit('auth:token_invalid');
      }
    } catch {
      socket.emit('auth:token_invalid');
    }
  });

  socket.on('auth:update_profile', ({ profile_image }) => {
    if (socket.data.userId) {
      try {
        db.prepare("UPDATE users SET profile_image = ? WHERE id = ?").run(profile_image, socket.data.userId);
        const user: any = db.prepare("SELECT id, username, role, profile_image FROM users WHERE id = ?").get(socket.data.userId);
        socket.emit('auth:success', { user });
      } catch {
        socket.emit('auth:error', 'Error al actualizar perfil.');
      }
    }
  });
}
