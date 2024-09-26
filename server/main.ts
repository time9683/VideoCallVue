// @deno-types="npm:@types/express@4.17.15"
// import express from "npm:express@4.18.2";
// const app = express()

const clients = new Map<string,WebSocket>();


 Deno.serve({
  port: 3000,
 },(req)=>{

  const {socket,response} = Deno.upgradeWebSocket(req);

  const id = crypto.randomUUID();
  clients.set(id, socket);

  socket.onopen = () => {

    console.log(`socket connected ${id}`);
 
  }

  socket.onmessage = (e) => {
    console.log(`message received ${e.data}`);
    for (const client of clients.values()) {
      // send the message to all clients except the sender
      if (client !== socket) {
        if(client.readyState === WebSocket.OPEN){

          client.send(e.data);
        }
      }
    }
  }


 

 return response;
})