import type { Socket } from 'socket.io';
import bcrypt from 'bcryptjs';
import { db } from '../bd.js';

/** Administracion de usuarios. */
export function registerAdminHandlers(socket: Socket) {
  socket.on('admin:get_users', () => {
    if (socket.data.role === 'admin') {
      const users = db.prepare("SELECT id, username, password, role FROM users").all();
      socket.emit('admin:users_list', users);
    }
  });

  socket.on('admin:update_user', ({ id, username, password, role }) => {
    if (socket.data.role === 'admin') {
      try {
        let finalPassword = password;
        if (password && !password.startsWith('$2a$') && !password.startsWith('$2b$') && !password.startsWith('$2y$')) {
          finalPassword = bcrypt.hashSync(password, 10);
        }
        db.prepare("UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?").run(username, finalPassword, role, id);
        const users = db.prepare("SELECT id, username, password, role FROM users").all();
        socket.emit('admin:users_list', users);
      } catch (e) {
        socket.emit('admin:error', 'Error al actualizar usuario.');
      }
    }
  });

  socket.on('admin:delete_user', (id) => {
    if (socket.data.role === 'admin') {
      const target: any = db.prepare("SELECT username FROM users WHERE id = ?").get(id);
      if (target && target.username === 'admin') {
        socket.emit('admin:error', 'No puedes borrar a la cuenta admin principal.');
        return;
      }
      db.prepare("DELETE FROM users WHERE id = ?").run(id);
      const users = db.prepare("SELECT id, username, password, role FROM users").all();
      socket.emit('admin:users_list', users);
    }
  });
}
