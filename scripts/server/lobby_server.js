
import { io } from './websocket.js';
import { Multiplayer_Sockets } from './MultiplayerGame_server.js';
import { randomUUID } from 'crypto';
import axios from 'axios';




class Game {

  lobbys = {};
  disconnectedPlayers = {};

  constructor(data) {
    
    this.id          = data.id;
    this.name        = data.name;
    this.maxPlayers  = data.max_players;
    this.minPlayers  = data.min_players;
    this.useTeams    = (parseFloat(data.teams) === 1);
    this.teams_total = data.teams_total;
    this.team_size   = data.team_size;
    this.port        = data.port;
  }

  sendPostToDB(data) {
    // axios.post('http://localhost/kartenspie/include/ajax.php', data)
    // .then(response => {
    //   console.log('Post successful:', response.data);
    // })
    // .catch(error => {
    //   console.error('Error posting data:', error);
    // });
  }
   

  getAllPublicLobbies() {
    const publicLobbies = [];
    for (const lobbyID in this.lobbys) {
      const lobby = this.lobbys[lobbyID];
      if (!lobby.isPrivate() && !lobby.game_started) publicLobbies.push(lobby);
    }
    return publicLobbies;
  }
  addDisconnectedPlayer(socket, lobby) {
    this.disconnectedPlayers[socket.handshake.auth.sessionID] = {
      lobby: lobby,
      timeStamp: Date.now()
    }
    this.removeDisconnectedPlayersAfter2Min();
  }
  setAsNotDisconnected(sessionID) {
    delete this.disconnectedPlayers[sessionID];
  }

  wasDisconnected(sessionID) {
    return this.disconnectedPlayers[sessionID] != undefined;
  }
  
  removeDisconnectedPlayersAfter2Min() {

    const TWO_MINUTES = 1000 * 60 * 2;

    setTimeout(() => {

      for (const key in this.disconnectedPlayers) {
        if ((Date.now() - this.disconnectedPlayers[key].timeStamp) > TWO_MINUTES) {
          delete this.disconnectedPlayers[key];
          console.log('Spieler geloescht der nicht verbunden war');
          
        }
      }
      
    }, TWO_MINUTES);
  }

  createLobby(playmode, isPrivate) {

    let lobby = new Lobby(parseInt(playmode), isPrivate);
    const data = { action: 'createLobby', uuid: lobby.id, game_id: 1, public: isPrivate ? 0 : 1, };

    this.sendPostToDB(data);
    this.lobbys[lobby.id] = lobby;
    console.log('Lobby erstellt mit ID: ' + lobby.id);
    return lobby;
  }
  createTeamLobby(isPrivate) {
    const lobby = this.createLobby(this.teams_total * this.team_size, isPrivate);
    lobby.setTeams(this.teams_total, this.team_size);
    return lobby;
  }
 
  deleteLobby(lobbyID) {
    const data = { action: 'deleteLobby', uuid: lobbyID };
    this.sendPostToDB(data);
    delete this.lobbys[lobbyID];
  }

  getLobby(lobbyID) {
    return this.lobbys[lobbyID];
  }
  
  doesLobbyExist(lobbyID) {
    return this.lobbys[lobbyID] != undefined;
  }

   handleEmptyLobby() {

    const TWO_MINUTES = 1000 * 60 * 2;

    setTimeout(() => {
      
      for (const lobbyID in this.lobbys) {

        const lobby = this.lobbys[lobbyID];

        if (lobby.emptyTimeStamp === null) continue 

        if((Date.now() - lobby.emptyTimeStamp) > TWO_MINUTES) {
          this.deleteLobby(lobbyID);
          console.log('Lobby geloescht die zu lange leer war');
          Multiplayer.sendPublicLobbyUpdate('delete', null, lobby);

        }
      }

    }, TWO_MINUTES);
  }
  async handleDisconnectedPlayer({exit, socket}) {
  
    for (const lobbyID in this.lobbys) {

      if (!this.doesLobbyExist(lobbyID))  continue;
      const lobby = this.getLobby(lobbyID);
      if (!lobby.doesGivenPlayerExist(socket.id)) continue;
      
      if (!exit) {
        this.addDisconnectedPlayer(socket, lobby);
      }
      else {
        console.log('Lobby exit');
      }
      
      if(lobby.players[socket.id]['teamID']) {
        lobby.removePlayerFromTeam(lobby.players[socket.id]['teamID'], socket.id);
      }

      if (!lobby.isPrivate()) {
        // Bei Public Lobby Status aktuallisieren für Spieler die noch auf der Startseite sind
        Multiplayer.sendPublicLobbyUpdate('leave', socket.id, lobby);
      }
      lobby.leave(socket.id);

      if (lobby.isLobbyEmpty()) {
        lobby.emptyTimeStamp = Date.now();
        this.handleEmptyLobby()
      }
    }
  }

  isPlayerInAnyLobby(socketID) {
    for (const lobbyID in this.lobbys) {
      const lobby = this.getLobby(lobbyID);
      
      if (lobby.doesGivenPlayerExist(socketID)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Sendet ein Update an alle Spieler die noch nicht in einer Lobby sind
   * @param {string} action - Aktion die ausgefuehrt werden soll ('join' oder 'leave oder 'delete')
   * @param {string} currentSocketID - ID des Clients der den Server Request gestartet hat
   * @param {Lobby} lobby - Lobby die auf der Startseite aktualisiert werden soll
   */
  sendPublicLobbyUpdate(action, currentSocketID, lobby) {
    
    io.sockets.sockets.forEach((socket, socketId) => {
      if (!Multiplayer.isPlayerInAnyLobby(socketId) ) {
        socket.emit('updatePublicLobbys', {
          action: action,
          clientID: currentSocketID,
          client: lobby.players[currentSocketID],
          lobby: lobby
        }); 
      }            
    });
  }

}

class Lobby {
  
  private             = false;
  id                  = null
  emptyTimeStamp      = null
  players             = {};
  disconnectedPlayers = {};
  maxPlayers          = 4
  teams               = null
  team_size           = null
  game_state          = {}
  game_started        = false

  constructor(maxPlayers = 4, isPrivate = false) {
    this.maxPlayers = maxPlayers
    this.private    = isPrivate;
    this.id         = randomUUID();
  }

  setTeams(teams_total, team_size) {
    this.team_size = team_size
    this.teams = {}
    for (let i = 0; i < teams_total; i++) {
      this.teams['team-' + i] = [];
    }
    console.log(this);
    
  }

  getTeams() {
    return this.teams;
  }

  getTeam(teamID) {
    return this.teams[teamID];
  }

  isTeamFull(teamID) {
    console.log(teamID);
    return this.teams[teamID].length >= this.team_size;
  }

  isTeamEmpty(teamID) {
    return this.teams[teamID].length == 0;
  }

  addPlayerToTeam(teamID, playerID) {
    this.teams[teamID].push(playerID);
  }

  removePlayerFromTeam(teamID, playerID) {
    const index = this.teams[teamID].indexOf(playerID);
    if (index > -1) {
      this.teams[teamID].splice(index, 1);
    }
  }

  isPrivate() {
    return this.private;
  }
  
  join(socket, playerObj) {
    const playerID = socket.id;
    const data     = { action: 'joinLobby', uuid: this.id,  player_socket_id: playerID, name: playerObj.name};
    Multiplayer.sendPostToDB(data);
    socket.join(this.id); // Socket zum Raum hinzufügen
    this.players[playerID] = playerObj; 
    return this;
  }
  
  leave(playerID) {
    delete this.players[playerID];
    const data = { action: 'leaveLobby', player_socket_id: playerID};
    Multiplayer.sendPostToDB(data);
    io.to(this.id).emit('playerLeft', playerID);
  }

  doesGivenPlayerExist(playerID) {
    return this.players[playerID] != undefined;
  }
  

  isLobbyFull() {
    return this.getPlayerCount() >= this.maxPlayers;
  }

  isLobbyEmpty() {
    return this.getPlayerCount() == 0;
  }

  getPlayerCount() {
    
    return Object.keys(this.players).length;
  }

  arePlayersReady() {
    
    if (!this.isLobbyFull()) {
      return false;
    }

    for (const player in this.players) {
      if (!this.players[player].ready) {
        return false;
      }
    }
    return true;
  }
  setPlayersUnready() {
    for (const player in this.players) {
      this.players[player].ready = false;
    }
  }
}


let response = await axios.post('http://localhost/MultiplayerGame/include/ajax.php', { action: 'getGameConfig' })

let Multiplayer = new Game(response.data);



export async function Lobby_Sockets(){

  io.on('connection', async (socket) => {

    console.log('Spieler verbunden: ' + socket.id);
    const sessionID = socket.handshake.auth.sessionID;
    
    if (Multiplayer.wasDisconnected(sessionID)) {
      console.log('Wieder verbunden:');
      
      const {lobby} = Multiplayer.disconnectedPlayers[sessionID];
      
      if (Multiplayer.doesLobbyExist(lobby.id) && !lobby.isLobbyFull()) {

        socket.emit('getClient', (clientObj) => {

          if (lobby.game_started) { //NOTE Spiel läuft bereits also, EVTL. Spielzustand wiederherstellen
            lobby.join(socket, clientObj);
            Multiplayer_Sockets(socket, io, lobby, false);
          }
          socket.emit('recovered', lobby);
        });
      }      
      Multiplayer.setAsNotDisconnected(sessionID);
    }
    else {
      socket.emit('sendPublicLobbys', Multiplayer.getAllPublicLobbies());
    }

    socket.on('joinTeam' , (lobbyID, teamID, callback) => {
      const lobby = Multiplayer.getLobby(lobbyID);
      
      if (lobby.isTeamFull(teamID)) {
        callback(false);
      }
      else {
        lobby.addPlayerToTeam(teamID, socket.id);
        lobby.players[socket.id]['teamID'] = teamID;
        lobby.players[socket.id].ready = false;
        console.log('Spieler: ' + socket.id + ' ist dem Team: ' + teamID + ' beigetreten');
        socket.to(lobbyID).emit('joinTeam', teamID, socket.id)
        console.log(lobby.teams);
        callback(true);
      }
    })

    socket.on('leaveTeam' , (lobbyID, teamID) => {
      console.log('Spieler: ' + socket.id + ' hat das Team: ' + teamID + ' verlassen');
      const lobby = Multiplayer.getLobby(lobbyID);
      lobby.removePlayerFromTeam(teamID, socket.id);
      lobby.players[socket.id].ready = false;
      lobby.players[socket.id]['teamID'] = null;
      console.log(lobby.teams);
      socket.to(lobbyID).emit('leaveTeam', teamID, socket.id);
      
    })
    socket.on('switchTeam' , (lobbyID, oldTeamID, newTeamID, callback) => {
      const lobby = Multiplayer.getLobby(lobbyID);

      if (lobby.isTeamFull(newTeamID)) {
        callback(false);
      }
      else {
        lobby.removePlayerFromTeam(oldTeamID, socket.id);
        lobby.addPlayerToTeam(newTeamID, socket.id);
        lobby.players[socket.id]['teamID'] = newTeamID;
        console.log('Spieler: ' + socket.id + ' ist zum Team: ' + newTeamID + ' gewechselt');
        lobby.players[socket.id].ready = false;
        console.log(lobby.teams);
        socket.to(lobbyID).emit('switchTeam', oldTeamID, newTeamID, socket.id);
         callback(true);
      }

    })
      
    socket.on('createLobby', (playerObj, isPrivate, playmode,  createClb) => {
      
      if (playerObj == undefined || playerObj == null) {
        console.log('Ungültiges Spieler Objekt beim Erstellen einer Lobby');
        createClb(null); // Code 0 = Ungultiges Spieler Objekt
      }
      let lobby = null;
      console.log(Multiplayer);
      
      if (Multiplayer.useTeams) {
        lobby = Multiplayer.createTeamLobby(isPrivate);
      }
      else lobby = Multiplayer.createLobby(playmode, isPrivate);

      lobby.join(socket, playerObj);

      if (!lobby.isPrivate()) {
        // Bei Public Lobby Status aktuallisieren für Spieler die noch auf der Startseite sind
        Multiplayer.sendPublicLobbyUpdate('join', socket.id, lobby);
      }
      createClb(lobby);
    });

    socket.on('joinLobby', (lobbyID, playerObj, joinClb) => {
      console.log( 'Join Lobby mit ID: ' + lobbyID);
      if (playerObj == undefined || playerObj == null) {
        console.log('Ungültiges Spieler Objekt beim Joinen');
        joinClb({status: 0}); // Code 0 = Ungultiges Spieler Objekt
      }
      if (Multiplayer.doesLobbyExist(lobbyID)) {
    
        const lobby = Multiplayer.getLobby(lobbyID);
        lobby.emptyTimeStamp = null;

        if (lobby.game_started) {
          console.log('Spiel läuft bereits');
          joinClb({status: 4, lobbyID}); // Code 4 = Spiel läuft bereits
        }  
        else if ((lobby.isLobbyFull())) {
          console.log('Lobby voll');
          joinClb({status: 2, lobbyID}); // Code 2 = Lobby voll
        
        }
        else {
          console.log('Spieler einer Lobby beitreten');
          // Anderen Spieler in dieser Lobby informieren
          lobby.join(socket, playerObj);
          socket.to(lobby.id).emit('playerJoined', socket.id, playerObj); 

          if (!lobby.isPrivate()) {
            // Bei Public Lobby Status aktuallisieren für Spieler die noch auf der Startseite sind
            Multiplayer.sendPublicLobbyUpdate('join', socket.id, lobby);
          }
          socket.emit('lobbyJoined', lobby);


          joinClb({status: 1, lobbyID, maxPlayers: lobby.maxPlayers}); // Code 1 = Lobby beitreten
        }
    
      } 
      else {
        console.log('Lobby existiert nicht');
        joinClb({status: 3, lobbyID}); // Code 3 = Lobby existiert nicht
      }
    });


    socket.on('getLobby' , (lobbyID, playerClb) => {
      playerClb(Multiplayer.getLobby(lobbyID))
    });
 
    socket.on('toggleReady' , async (lobbyID, status) => {
      
      const lobby = Multiplayer.getLobby(lobbyID);
      lobby.players[socket.id].ready = status;
      socket.to(lobbyID).emit('toggleReady', socket.id, status);

      if (lobby.arePlayersReady()) {
        Multiplayer.sendPublicLobbyUpdate('delete', null, lobby); // Diese Lobby von der Startseite entfernen
        lobby.setPlayersUnready();
        Multiplayer_Sockets(socket, io, lobby, true);
        const CURRENT_ID     = socket.id;
        const socketsInLobby = await io.in(lobby.id).fetchSockets()        
        socketsInLobby.forEach((socket) => {
          if (socket.id != CURRENT_ID) {
            Multiplayer_Sockets(socket, io, lobby, false);
          }
        });
      }
    })

    socket.on('gameOver' , (lobbyID) => {
      let lobby = Multiplayer.getLobby(lobbyID);
      lobby.game_started = false;
      lobby.game_state = {};
    });
    
    socket.on('exit',  () =>  {
       Multiplayer.handleDisconnectedPlayer({exit: true, socket});
    });

    socket.on('disconnect', () => {
      console.log('Spieler getrennt: ' + socket.id);
      
      Multiplayer.handleDisconnectedPlayer({exit: false, socket});
    });

    
  });

}