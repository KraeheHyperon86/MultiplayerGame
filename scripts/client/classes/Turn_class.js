export 
  class Turn {
    spielerreihenfolge = [];
    currentTurn        = null 
    nextTurn           = null   
    socketID           = null
    socketIDMate       = null
    turnDirection      = 'right'
    fistPlayer         = null
    secondPlayer       = null
    thirdPlayer        = null
    fourthPlayer       = null
    roundStarter       = null
    playedTurns        = 0


    constructor(players, socketID) {
      this.socketID = socketID
      this.spielerreihenfolge = Object.keys(players);
      this.#setPlayers();
      this.#setMatePlayer();
      this.setRoundStarter(this.spielerreihenfolge[0]);
    }

    updateSocketID(oldID, newID) {
      const index = this.spielerreihenfolge.indexOf(oldID);

       // Indem Fall wurde Spielerreihenfolge noch nicht aktualisiert
      if (index !== -1) {
        this.spielerreihenfolge[index] = newID;
      }

      this.#setPlayers();
      this.#setMatePlayer();
      this.#setCurrentTurn();
      this.#setNextTurn();
      this.#setPrevTurn();
      if (this.roundStarter === oldID) this.roundStarter = newID;
    }
    
    /**
     * Setzt den Spieler, der als erster am Zug ist.
     * Wenn eine Runde endet, wird der neue Startspieler bestimmt und das Array mit der spielerreihenfolge
     * so lange nach rechts rotiert, bis der Startspieler am Anfang steht.
     * @param {string} RoundStarterID - Die Socket-ID des Spielers der die Runde startet
     */
    setRoundStarter(RoundStarterID) {
      this.roundStarter = RoundStarterID
      while (this.roundStarter !== this.spielerreihenfolge[0]) {
        this.#rotateRight();
      }
      this.#setCurrentTurn();
      this.#setNextTurn();
      this.#setPrevTurn();
      this.playedTurns = 0

    }


    /** 
    * Setzt die Spielerbelegung anhand der start Spielerreihenfolge. Spielerbelegung bleibt unverändert.
    * Der firstPlayer ist man immer selbst
    * @return {void} 
    */
    #setPlayers() {
      const index = this.spielerreihenfolge.indexOf(this.socketID);
      this.fistPlayer   = this.spielerreihenfolge[index];

      this.secondPlayer = this.spielerreihenfolge[(index + 1) % this.spielerreihenfolge.length]
      
      this.thirdPlayer  = this.spielerreihenfolge[(index + 2) % this.spielerreihenfolge.length]

      this.fourthPlayer = this.spielerreihenfolge[(index + 3) % this.spielerreihenfolge.length]
    }
    #setMatePlayer() {
      this.socketIDMate = this.thirdPlayer
    }

    setTurnDirection(direction) {
      switch (direction) {
        case 'right':
          this.turnDirection = 'right'
          break;
        case 'left':
          this.turnDirection = 'left'
          break;
        default:
          this.turnDirection = 'right'
      }
    }

    #setCurrentTurn() {
      this.currentTurn = this.spielerreihenfolge[0];
    }
    #setNextTurn() {
      this.nextTurn = this.spielerreihenfolge[1];
    }
    #setPrevTurn() {
      this.prevTurn = this.spielerreihenfolge[this.spielerreihenfolge.length - 1];
    }

    #rotateRight() {
      this.spielerreihenfolge.unshift(this.spielerreihenfolge.pop());
      this.playedTurns++;
    }
    #rotateLeft() {
      this.spielerreihenfolge.push(this.spielerreihenfolge.shift());
      this.playedTurns++;
    }

    /**
     * Setzt den nächsten Spieler in der Spielerreihenfolge. Die Richtung wird durch das Attribut turnDirection
     * bestimmt. Gibt den neuen aktuellen Spieler, den nächsten Spieler und den vorherigen Spieler
     * an die zugehörigen Attribute.
     */
    doNextTurn() {
      if (this.turnDirection === 'right') {
        this.#rotateRight();
      } 
      else if (this.turnDirection === 'left') {
        this.#rotateLeft();
      }
      this.#setCurrentTurn();
      this.#setNextTurn();
      this.#setPrevTurn();
    }
    skipNextTurns(turns) {
      for (let turn = 1; i <= turns + 1; i++) {
        this.doNextTurn();
      }
    }
    
    /**
     * Prüft ob man selber am Zug ist
     * @return {boolean} 
     */
    isMyTurn() {
      return this.currentTurn === this.socketID;
    }
    /**
     * Prüft ob der Teampartner am Zug ist
     * @return {boolean} 
     */
    isMateTurn() {
      return this.currentTurn === this.socketIDMate;
    }
    /**
     * Prüft ob man selber oder sein Teampartner am Zug ist
     * @return {boolean} 
     */
    isTeamTurn() {
      return this.isMateTurn() || this.isMyTurn();
    }
    

    /**
     * Prüft ob es der letzte Zug der Runde ist
     * @return {boolean} 
     */
    isLastTurn() {
      return this.playedTurns === this.spielerreihenfolge.length;
    }

    /**
     * Prüft ob es der erste Zug der Runde ist
     * @return {boolean} 
     */
    isFirstTurn() {
      return this.playedTurns === 0
    }

    /**
     * Gibt die Anzahl der Züge, die in der aktuellen Runde
     * bereits gespielt wurden, zurück.
     * @return {number} Anzahl der Züge
     */
    getPlayedTurns() {
      return this.playedTurns;
    }
    
    /**
     * Gibt die Socket-ID des Spielers zurück, der am Zug ist
     * @return {string} Socket-ID des Spielers
     */
    getSocketIDByCurrentTurn() {
      return this.currentTurn
    }

  }
