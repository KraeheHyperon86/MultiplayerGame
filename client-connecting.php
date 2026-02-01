<?php
$gameConfig = $db->selectDB2assoc('SELECT * FROM game WHERE name = "'.CONFIG::ROOT.'"')[0];
?>

<script defer type="module">

<?php
  echo '  const MIN_PLAYERS      = '.$gameConfig['min_players'].';';
  echo '  const MAX_PLAYERS      = '.$gameConfig['max_players'].';';
  echo '  const TEAMS            = '.$gameConfig['teams'].';';
  echo '  const TEAMS_TOTAL      = '.$gameConfig['teams_total'].';';
  echo '  const TEAM_SIZE        = '.$gameConfig['team_size'].';';
  echo '  const PORT             = '.$gameConfig['port'].';';
  echo '  const SUPPORT_RECOVERY = '.$gameConfig['support_recovery'].';';
  echo '  let name               = "'.$name.'";';
  echo '  let lobbyID            = "'.$lobbyID.'";';
  echo '  const socket_io_url = "'.Config::SOCKET_IO_URL.'";';
?>

let playerID = '<?php echo $session->getUserID()?>';
let id_group = 1;
const socket = io('<?php echo Config::SOCKET_IO_URL ?>', {
  transports: ['websocket'],
  auth: {sessionID : '<?php echo md5(session_id())?>', playerID , id_group },
  query: {name: name},
  reconnection: true,         
  reconnectionDelay: 2000,    
  reconnectionDelayMax: 2000, 
  reconnectionAttempts: 10    
});

import {Popup} from '../static/jscript/classes/popup_class.js';
import {TeamLobby} from '../static/jscript/classes/TeamLobby_class.js';
import {VersusLobby} from '../static/jscript/classes/VersusLobby_class.js';
import {client_multiplayer} from './scripts/client/client_multiplayer.js';

const info = new Popup({
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
  lobby = new TeamLobby(socket, info, player, lobbyID, TEAMS_TOTAL, TEAM_SIZE, SUPPORT_RECOVERY, client_multiplayer);
} 
else lobby = new VersusLobby(socket, info, player, lobbyID , MIN_PLAYERS, MAX_PLAYERS, SUPPORT_RECOVERY, client_multiplayer);


socket.on('startGame', (lobby, playersHaende, playersDecks) => {
  $('#game').show();
  $('#lobby').remove();
  client_multiplayer(socket, lobby, playersHaende, playersDecks);
})

</script>