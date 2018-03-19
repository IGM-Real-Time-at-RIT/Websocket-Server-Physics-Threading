/** 
 Custom message class for object consistency
 when sending messages between the main and physics
 processes.
**/
class Message {
  constructor(type, data) {
    this.type = type;
    this.data = data;
  }
}

module.exports = Message;
