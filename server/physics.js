// our custom message class for sending message back
// to the main process
const Message = require('./messages/Message.js');

let charList = {}; // list of characters
const attacks = []; // array of attack to handle

// box collision check between two rectangles
// of a set width/height
const checkCollisions = (rect1, rect2, width, height) => {
  if (rect1.x < rect2.x + width &&
     rect1.x + width > rect2.x &&
     rect1.y < rect2.y + height &&
     height + rect1.y > rect2.y) {
    return true; // is colliding
  }
  return false; // is not colliding
};

// check attack collisions to see if colliding with the
// user themselves and return false so users cannot damage
// themselves
const checkAttackCollision = (character, attackObj) => {
  const attack = attackObj;

  // if attacking themselves, we won't check collision
  if (character.hash === attack.hash) {
    return false;
  }

  // otherwise check collision of user rect and attack rect
  return checkCollisions(character, attack, attack.width, attack.height);
};

// handle each attack and calculate collisions
const checkAttacks = () => {
  // if we have attack
  if (attacks.length > 0) {
    // get all characters
    const keys = Object.keys(charList);
    const characters = charList;

    // for each attack
    for (let i = 0; i < attacks.length; i++) {
      // for each character
      for (let k = 0; k < keys.length; k++) {
        const char1 = characters[keys[k]];

        // call to see if the attack and character hit
        const hit = checkAttackCollision(char1, attacks[i]);

        if (hit) { // if a hit
          /**
            Since this is a separate process we can only communicate
            via messages. Having this process send a message back
            to the other process means the other process has a 
            process.on listener for messages. 
          **/
          //send an 'attackHit' message back to the main process
          //along with the character that is being hit
          process.send(new Message('attackHit', char1.hash));
          // kill that character and remove from our user list
          delete charList[char1.hash];
        } else {
          // if not a hit
          console.log('miss');
        }
      }

      // once the attack has been calculated again all users
      // remove this attack and move onto the next one
      attacks.splice(i);
      // decrease i since our splice changes the array length
      i--;
    }
  }
};

// check for collisions every 20ms
setInterval(() => {
  checkAttacks();
}, 20);

//listen for messages from the main process
/** 
 Since this is a child process and it has separate memory, it
 cannot directly access variables or call functions in the main process
 and vice versa. 
 
 The server will send() messages to this process. We are using a custom
 message type for consistency in messages.
**/
process.on('message', (messageObject) => {
  //check our custom message object for the type
  switch (messageObject.type) {
    //if message type is charList
    case 'charList': {
      //update our character list with the data provided
      charList = messageObject.data;
      break;
    }
    //if message type is char
    case 'char': {
      //update a specific character with the character provided
      const character = messageObject.data;
      charList[character.hash] = character;
      break;
    }
    //if message type is attack
    case 'attack': {
      //add our attack object from the message
      attacks.push(messageObject.data);
      break;
    }
    //otherwise default
    default: {
      console.log('Type not recognized');
    }
  }
});

