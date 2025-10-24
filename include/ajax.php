<?php

require "autoloader.php";

$session = new Session();
$db = new MySQL();

header('Content-Type: application/json');

// Get the raw POST body
$rawJSON = file_get_contents('php://input');

// Decode JSON into an associative array
$data = json_decode($rawJSON, true);

$action = $data['action'] ?? '';
$status = 0;

if ($action === 'createLobby') {
  $set = array(
    'game_id' => $data['game_id'],
    'id'    => $data['uuid'],
    'public'  => $data['public']

  );
  $status = $db->insertDB('lobby', $set);
}
else if ($action === 'deleteLobby') {
  $lobbyId = $data['uuid'];
  $status  = $db->deleteDB('lobby', intval($lobbyId));
}
else if ($action === 'joinLobby') {
  $set = array(
    'lobby_id'          => $data['uuid'],
    'player_socket_id'  => $data['player_socket_id'],
    'player_name'       => $data['name'],
  );
  $status = $db->insertDB('lobby_teilnehmer', $set);
}
else if ($action === 'leaveLobby') {
  $playerID = $data['player_socket_id'];
  $status = $db->db->query("DELETE FROM lobby_teilnehmer WHERE player_socket_id = '$playerID'");
  if ($status === TRUE) {
    $status = 1;
  } else {
    $status = -1;
  }
}
elseif ($action === 'setLobbyStatus') {
  $lobbyId = $data['uuid'];
  $statusValue = $data['status'];
  $set = array(
    'global_state' => $statusValue
  );
  $status = $db->updateDB('lobby', intval($lobbyId), $set);
}
elseif ($action === 'getLobbyStatus') {
  $lobbyId = $data['uuid'];
  $status = $db->value('lobby', 'global_state', "id = '$lobbyId'");
}
elseif ($action === 'getGameConfig') {
  $status = $db->selectDB2assoc('SELECT * FROM game WHERE name = "'.CONFIG::ROOT.'"')[0];
}

echo json_encode($status);