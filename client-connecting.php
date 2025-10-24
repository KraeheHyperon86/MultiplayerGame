
<script defer type="module">

const socket = io(socket_io_url , {
  auth: {sessionID : '<?php echo md5(session_id())?>'},
  query: {name: name},
  reconnection: true,         
  reconnectionDelay: 2000,    
  reconnectionDelayMax: 2000, 
  reconnectionAttempts: 10    
});

import Popups from './scripts/popup.js';
import {TeamLobby} from './scripts/client/classes/Lobby/TeamLobby_class.js';
import {VersusLobby} from './scripts/client/classes/Lobby/VersusLobby_class.js';
import {client_multiplayer} from './scripts/client/client_multiplayer.js';

const info = new Popups({
  ttl: 3000,
  speed: 1000,
  style: {
    bgColor: '#f0f0f0',
    color: 'black',
    padding: '0.25rem 1rem',
    textAlign: 'center',
    borderRadius: '3px',
    boxShadow: '5px 5px 0 0 #000',
    fontSize: '1rem',
    textAlign: 'center',
    width: '15rem',
    border: '3px solid #000',
    zIndex: 5001,
  },
  distance: {
    top: 8,
  }
});

let player = {name: name , ready: false}; 
let lobby = null
if (TEAMS === 1) {
  lobby = new TeamLobby(socket, info, player, lobbyID, TEAMS_TOTAL, TEAM_SIZE);
} 
else lobby = new VersusLobby(socket, info, player, lobbyID , MIN_PLAYERS, MAX_PLAYERS);


socket.on('startGame', (lobby, playerCards, kartendeck) => {
  $('#game').show();
  $('#lobby').remove();
  client_multiplayer(socket, lobby, playerCards, kartendeck);
})

</script>