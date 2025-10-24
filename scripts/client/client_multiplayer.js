
/** 
* Hier wird die Onlien Multiplayer Logik gehandhabt
* @param {object} socket  - Socket-Objekt des Spielers
* @param {string} lobbyID - Lobby-ID des Spielers
* @return {void} 
*/
export async function client_multiplayer(socket, lobby, haendeArr = []) {
  
  let   players   = lobby.players;
  const lobbyID   = lobby.id;

  if (lobby.game_started) {
    //XXX
  }

  
}