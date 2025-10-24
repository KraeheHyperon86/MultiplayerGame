<?php

class Config {
  //Website 
  
  const URL = 'localhost/xx';
  const DOMAIN = 'localhost';
  const TITLE = 'Multiplayer Game'; 
  const ROOT = 'MultiplayerGame';
  const SOCKET_IO_URL = '';

  //MySQL server connection details 
  const SERVER_NAME = "";
  //const SERVER_NAME = "localhost";
  const USER_NAME = "";
  //const USER_NAME = "root";
  const PASSWORD = "";
  //const PASSWORD = "";
  const DB_NAME = "";
  const PORT = "";


  //Session Config

 //Minutes until session expiresDOMAIN
  const SESSION_TIMEOUT = 120;
  //seconds until cookie expires
  const COOKIE_TTL = 7200;
  // Deny Sesssion Acess from Client Side Script
  const HTTP_ONLY = true;
  // Session will only be sent over HTTPS, false while in develop
  const SECURE = false;
}
