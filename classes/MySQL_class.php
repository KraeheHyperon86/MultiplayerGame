<?php

include_once "Config_class.php";

class MySQL  {

  public object $db;

  function __construct() {
    // Verbindung zur Datenbank herstellen
    $SERVER    = Config::SERVER_NAME;
    $USER_NAME = Config::USER_NAME;
    $PASSWORD  = Config::PASSWORD;
    $DB_NAME   = Config::DB_NAME;
    $PORT      = Config::PORT;

    try {
      $db = new mysqli($SERVER, $USER_NAME, $PASSWORD, $DB_NAME, $PORT);
      $this->db = $db;
    } 
    catch (Exception $e) {
      die("Keine Verbindung zur Datenbank möglich");
    }
    $db = new mysqli($SERVER, $USER_NAME, $PASSWORD, $DB_NAME, $PORT);
  }

  function selectDB2assoc($sql, $show = 0) : array {
    if ($show == 1) {
      echo $sql;
    }
    // Abfrage ausführen
    $result = $this->db->query($sql);
    // Überprüfen, ob die Abfrage erfolgreich war
    $assocArray = [];
    if ($result->num_rows > 0) {
      // Schreiben jedes Datensatzes in ein Array assoc
      $count = $result->num_rows;
      while($count > 0) {
        $assocArray[] = $result->fetch_assoc();
        $count--;
      }
    } 
    return $assocArray;
  }

  
  /**
   * Inkrementiert eine Spalte in einer Datenbanktabelle um 1.
   *
   * @param string $tableName Name der Datenbanktabelle
   * @param int $id ID des Datensatzes
   * @param string $column Name der Spalte
   * @param int $show [optional] Soll die SQL-Abfrage ausgegeben werden?
   * @return int 1, wenn die Abfrage erfolgreich war, -1 sonst
   */
  function updateInc(string $tableName, int $id, string $column, int $show = 0) {
    $sql = "UPDATE $tableName SET $column = $column + 1 WHERE id = $id";
    if ($show == 1) {
      echo $sql;
    }
    if ($this->db->query($sql) === TRUE) {
      return 1;
    }
    return -1;
  }

  function updateDB(string $tableName ,int $id, array $data, int $show = 0) {
    $set = '';
    foreach($data as $field => $value) {
        $set .= "`". $field ."` = '". $value ."', ";
    }
    $set = rtrim($set, ', ');
  
    $sql = "UPDATE $tableName SET $set WHERE id = $id";
    if ($show == 1) {
     echo $sql;
    }  
  
    if ($this->db->query($sql) === TRUE) {
      return 1;
    } 
    else {
      return -1;
    }
  }

  function deleteDB(string $tableName, int $id, int $show = 0) {
    // SQL-Abfrage vorbereiten
    $sql = "DELETE FROM $tableName WHERE id = ".intval($id)."";
    if ($show == 1) {
        echo $sql;
    }
  
    // Abfrage ausführen
    if ($this->db->query($sql) === TRUE) {
      return 1;
    } 
    else {
      return -1;
    }
  
  }

  function selectColumn(string $tableName, string $spalte, string $where = ' 1 ', string $orderBy= '', int $show = 0) : array {

    if (!empty($orderBy)) {
        $orderBy = 'ORDER BY '.$orderBy.'';
    }
    if (!empty($where)) {
        $where = 'WHERE '.$where.'';
    }
    if (preg_match('/^[a-zA-ZäöüÄÖÜß]*$/', $spalte)){
      // SQL-Abfrage vorbereiten
      $sql = "SELECT $spalte FROM $tableName $where $orderBy";
      if ($show == 1) {
         echo $sql;
      }
      // Abfrage ausführen
      $result = $this->db->query($sql);
      // Überprüfen, ob die Abfrage erfolgreich war
      if ($result->num_rows > 0) {
        $valuesArr = array();
        while($row = $result->fetch_row()) {
          
          foreach ($row as $zelle) {
            $valuesArr[] = $zelle;
          }
        }
      }

    }
    else {
      echo "Bitte als Select nur eine Spalte angeben. '*' nicht erlaubt !";
      $valuesArr = array();
    }
    return $valuesArr;
  }

  
  function value(string $tableName, string $columnName, string $where = '', $show = 0) : mixed {

    if (!empty($where)) {
      $where = ' WHERE '.$where.'';
    }
    // SQL-Abfrage vorbereiten
    $sql = "SELECT $columnName FROM $tableName $where LIMIT 1";
    if ($show == 1) {
      echo $sql;
    }
    // Abfrage ausführen
    $result = $this->db->query($sql);
    // Überprüfen, ob die Abfrage erfolgreich war
    if ($result->num_rows > 0) {
      // Rückgabe des ersten Zellenwerts

      return $result->fetch_assoc()[$columnName];
    } 
    else {
      return -1;
    }
    
  }

  function insertDB(string $tableName, array $data, int $show = 0) : int {

    // Daten für die SQL-Abfrage vorbereiten
    $fields = implode(',', array_keys($data));
    $values = implode("','", array_values($data));
  
    // SQL-Abfrage vorbereiten
    $sql = "INSERT INTO $tableName ($fields) VALUES ('$values')";
  
    if ($show == 1) {
      echo $sql;
    }
  
    // Abfrage ausführen
    if ($this->db->query($sql) === TRUE) {
      // ID des eingefügten Datensatzes zurückgeben
      return $this->db->insert_id;
    } 
    else {
      return -1;
    }
  
    
  }
}







