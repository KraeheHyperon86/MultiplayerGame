import readline from "readline";


/** 
* Sobald beide Spieler bereit sind, werden hier alle socket interaktionen zur Spiellogik gehandhabt
* @param {object}  - 
* @param {object} parameterNameHere - 
* @return {ReturnValueDataTypeHere} Brief description of the returning value here.
*/
export function Multiplayer_Sockets(socket, io, lobby, IsInitilyzer) { 

 
  socket.on('saveGameState', (state) => {
    lobby.game_state = state;
  })
  

  socket.on('debug', (data) => {
    console.log(data);
    console.log('-------------------');
  })


  if (!IsInitilyzer) return;  // Code unterhalb wird nur einmal ausgefuehrt


  if (Object.keys(lobby.players).length > 2) {
    shuffledPlayers(lobby);
  }

  lobby.game_started = true;


  //For Debugging in terminal
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on("line", (input) => {
    if (input.trim() === "debug") {

    }

  });

}