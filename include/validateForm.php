<?php
require "autoloader.php";

$session = new Session();

$name     = Validate::filterRequest("name", "string", '');
$action   = Validate::filterRequest("action", "string", '');

$auth = '';



if ($action == "weiter") {
         
  if(!empty($name)) {
    $session->setSessionValue("name", $name);
    $session->setSessionValue("id", createUID());
    $alert = "Login erfolgreich";
    
  } 
  else {
    $alert = 'Bitte ein Name angeben';
  } 
}

function createUID () {

  $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  $charactersLength = strlen($characters);
  $randomString = '';
  for ($i = 0; $i < 10; $i++) {
      $randomString .= $characters[rand(0, $charactersLength - 1)];
  }
  return $randomString;
}

$session->setSessionValue("alert", $alert);
$auth = empty($auth) ? 'login' : $auth;
header("Location: ../index.php"."?auth=$auth");
exit();



