const Message = require('./messages/Message.js');

let charList = {};
const attacks = [];

const checkCollisions = (rect1, rect2, width, height) => {
  if (rect1.x < rect2.x + width &&
     rect1.x + width > rect2.x &&
     rect1.y < rect2.y + height &&
     height + rect1.y > rect2.y) {
    return true;
  }
  return false;
};

const checkAttackCollision = (character, attackObj) => {
  const attack = attackObj;

  if (character.hash === attack.hash) {
    return false;
  }

  return checkCollisions(character, attack, attack.width, attack.height);
};

const checkAttacks = () => {
  if (attacks.length > 0) {
    const keys = Object.keys(charList);
    const characters = charList;

    for (let i = 0; i < attacks.length; i++) {
      for (let k = 0; k < keys.length; k++) {
        const char1 = characters[keys[k]];

        const hit = checkAttackCollision(char1, attacks[i]);

      }

      attacks.splice(i);
      i--;
    }
  }
};

setInterval(() => {
  checkAttacks();
}, 20);

