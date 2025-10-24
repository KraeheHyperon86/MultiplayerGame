<?php

class Validate {
  /**
   * Schützt vor XSS. Gibt ungültige Eingaben ein Standart Wert. Sorgt für eine richtige Typ umwandlung.
   * @access public
   * @param  $input Werte aus POST/GET/REQUEST oder SESSION.
   * @param  $typ Der zu erwartende Datentyp.
   * @param  $default Der Standart Wert.
   * @return mixed Standart Wert oder originaler Wert beides Typensicher.
   * @author Justin Pusse <j.pusse@nolis.de>
   * @since 23.10.2023
   * @brief BRIEFING
   */
  static function filterRequest($input, $typ, $default) {
    $value = $_REQUEST[$input] ?? null;

    switch ($typ) {
      case 'array_int':
        return is_array($value) ? array_map('intval', $value) : $default;
      
      case 'array':
        return is_array($value) ? $value : $default;

      case 'int':
        return is_numeric($value) ? intval($value) : intval($default);

      case 'float':
        return is_numeric($value) ? floatval($value) : floatval($default);

      case 'string':
        return is_string($value) ? htmlspecialchars(stripslashes(trim($value))) : htmlspecialchars(stripslashes(trim($default)));

      case 'bool':
        return filter_var($value, FILTER_VALIDATE_BOOL) !== false ? filter_var($value, FILTER_VALIDATE_BOOL) : filter_var($default, FILTER_VALIDATE_BOOL);

      default:
        die("Error in filterRequest");
    }
  }
}

?>
