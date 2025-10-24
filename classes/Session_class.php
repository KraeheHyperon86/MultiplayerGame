<?php


include_once "Config_class.php";

class Session {

  const ZWEI_STUNDEN = 7200;
  private int $_session_TimeOut = Config::SESSION_TIMEOUT;
  private int $_cookie_TimeOut = Config::COOKIE_TTL;
  private string $_domain = Config::DOMAIN;
  private bool $_secure = Config::SECURE;
  private bool $_http_only = Config::HTTP_ONLY;

  public function __construct() {

    ini_set('session.use_only_cookies', 1);
    ini_set('session.use_strict_mode', 1);
    
    $log = session_set_cookie_params([
      'lifetime' => $this->_cookie_TimeOut,
      'domain' => $this->_domain,
      'path' => '/',
      'secure' => $this->_secure,
      'httponly' => $this->_http_only,
    ]);


    if (session_status() === PHP_SESSION_DISABLED) {
      die("Sessions sind nicht aktiviert");
    }
    if (session_status() === PHP_SESSION_NONE) {
      session_start();
    } 


    if (!isset($_SESSION['last_regeneration'])) {
      session_regenerate_id(true);
      $_SESSION['last_regeneration'] = time();
    }
    else {
      $intvall = self::ZWEI_STUNDEN * $this->_session_TimeOut;
      if (time() - $_SESSION['last_regeneration'] >= $intvall) {
        $this->logoutUser();
      }
    }
  }

  public function logoutUser() {
    session_unset();
  }

  public function setSessionValue($keyName, $value) {

    $_SESSION[$keyName] = $value;
  }

  public function getSessionValue($keyName) {
    if (!isset($_SESSION[$keyName])) {
      return null;
    }
    return $_SESSION[$keyName];
  }

  public function unsetSessionValue($keyName) {
    unset($_SESSION[$keyName]);
  }

  public function isUserLoged() {
    return isset($_SESSION['id']);
  }

  public function getUserID() {
    return intval($_SESSION['id']);
  }
  
}   

