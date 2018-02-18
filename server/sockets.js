const xxh = require('xxhashjs');
const child = require('child_process');
const Character = require('./messages/Character.js');
const Message = require('./messages/Message.js');

const charList = {};

let io;

const directions = {
  DOWNLEFT: 0,
  DOWN: 1,
  DOWNRIGHT: 2,
  LEFT: 3,
  UPLEFT: 4,
  RIGHT: 5,
  UPRIGHT: 6,
  UP: 7,
};

const setupSockets = (ioServer) => {
  io = ioServer;

  io.on('connection', (sock) => {
    const socket = sock;

    socket.join('room1');

    const hash = xxh.h32(`${socket.id}${new Date().getTime()}`, 0xCAFEBABE).toString(16);

    charList[hash] = new Character(hash);

    socket.hash = hash;

    socket.emit('joined', charList[hash]);

    socket.on('movementUpdate', (data) => {
      charList[socket.hash] = data;
      charList[socket.hash].lastUpdate = new Date().getTime();

      io.sockets.in('room1').emit('updatedMovement', charList[socket.hash]);
    });

    socket.on('attack', (data) => {
      const attack = data;

      let handleAttack = true;

      switch (attack.direction) {
        case directions.DOWN: {
          attack.width = 66;
          attack.height = 183;
          attack.y = attack.y + 121;
          break;
        }
        case directions.LEFT: {
          attack.width = 183;
          attack.height = 66;
          attack.x = attack.x - 183;
          break;
        }
        case directions.RIGHT: {
          attack.width = 183;
          attack.height = 66;
          attack.x = attack.x + 61;
          break;
        }
        case directions.UP: {
          attack.width = 66;
          attack.height = 183;
          attack.y = attack.y - 183;
          break;
        }
        default: {
          handleAttack = false;
        }
      }

      if (handleAttack) {
        io.sockets.in('room1').emit('attackUpdate', attack);
      }
    });

    socket.on('disconnect', () => {
      io.sockets.in('room1').emit('left', charList[socket.hash]);
      delete charList[socket.hash];

      socket.leave('room1');
    });
  });
};

module.exports.setupSockets = setupSockets;
