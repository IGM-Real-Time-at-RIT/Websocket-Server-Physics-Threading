//when we receive a character update
const update = (data) => {
  //if we do not have that character (based on their id)
  //then add them
  if(!squares[data.hash]) {
    squares[data.hash] = data;
    return;
  }

  //if the update is for our own character (we dont need it)
  //Although, it could be used for player validation
  if(data.hash === hash) {
    return;
  }

  //if we received an old message, just drop it
  if(squares[data.hash].lastUpdate >= data.lastUpdate) {
    return;
  }

  //grab the character based on the character id we received
  const square = squares[data.hash];
  //update their direction and movement information
  //but NOT their x/y since we are animating those
  square.prevX = data.prevX;
  square.prevY = data.prevY;
  square.destX = data.destX;
  square.destY = data.destY;
  square.direction = data.direction;
  square.moveLeft = data.moveLeft;
  square.moveRight = data.moveRight;
  square.moveDown = data.moveDown;
  square.moveUp = data.moveUp;
  square.alpha = 0.05;
};

//function to remove a character from our character list
const removeUser = (data) => {
  //if we have that character, remove them
  if(squares[data.hash]) {
    delete squares[data.hash];
  }
};

//function to set this user's character
const setUser = (data) => {
  hash = data.hash; //set this user's hash to the unique one they received
  squares[hash] = data; //set the character by their hash
  requestAnimationFrame(redraw); //start animating
};

//when receiving an attack (cosmetic, not collision event)
//add it to our attacks to draw
const receiveAttack = (data) => {
  attacks.push(data);
};

//function to send an attack request to the server
const sendAttack = () => {
  const square = squares[hash];
  
  //create a new attack in a certain direction for this user
  const attack = {
    hash: hash,
    x: square.x,
    y: square.y,
    direction: square.direction,
    frames: 0,
  }

  //send request to server
  socket.emit('attack', attack);
};

//when a character is killed
const playerDeath = (data) => {
  //remove the character
  delete squares[data];
 
  //if the character killed is our character
  //then disconnect and draw a game over screen
  if(data === hash) {
    socket.disconnect();
    cancelAnimationFrame(animationFrame);
    ctx.fillRect(0, 0, 500, 500);
    ctx.fillStyle = 'white';
    ctx.font = '48px serif';
    ctx.fillText('You died', 50, 100);
  }
};

//update this user's positions based on keyboard input
const updatePosition = () => {
  const square = squares[hash];

  //move the last x/y to our previous x/y variables
  square.prevX = square.x;
  square.prevY = square.y;

  //if user is moving up, decrease y
  if(square.moveUp && square.destY > 0) {
    square.destY -= 2;
  }
  //if user is moving down, increase y
  if(square.moveDown && square.destY < 400) {
    square.destY += 2;
  }
  //if user is moving left, decrease x
  if(square.moveLeft && square.destX > 0) {
    square.destX -= 2;
  }
  //if user is moving right, increase x
  if(square.moveRight && square.destX < 400) {
    square.destX += 2;
  }

  //determine direction based on the inputs of direction keys
  if(square.moveUp && square.moveLeft) square.direction = directions.UPLEFT;

  if(square.moveUp && square.moveRight) square.direction = directions.UPRIGHT;

  if(square.moveDown && square.moveLeft) square.direction = directions.DOWNLEFT;

  if(square.moveDown && square.moveRight) square.direction = directions.DOWNRIGHT;

  if(square.moveDown && !(square.moveRight || square.moveLeft)) square.direction = directions.DOWN;

  if(square.moveUp && !(square.moveRight || square.moveLeft)) square.direction = directions.UP;

  if(square.moveLeft && !(square.moveUp || square.moveDown)) square.direction = directions.LEFT;

  if(square.moveRight && !(square.moveUp || square.moveDown)) square.direction = directions.RIGHT;

  //reset this character's alpha so they are always smoothly animating
  square.alpha = 0.05;

  //send the updated movement request to the server to validate the movement.
  socket.emit('movementUpdate', square);
};