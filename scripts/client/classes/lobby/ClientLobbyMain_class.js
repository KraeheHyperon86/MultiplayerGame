import {client_multiplayer} from '/MultiplayerGame/scripts/client/client_multiplayer.js';


export class Lobby {
  clients = {};
  id = '';

  constructor(socket, popupObj, clientObj, lobbyID) {
    this.socket     = socket;
    this.info       = popupObj
    this.client     = clientObj
    this.id         = lobbyID
    this.connected  = false

    this.socket.on('connect', async ()  => {
      
      if (this.socket.connected == true && this.socket.recovered == false && $('div#lobby').length == 0) {
        this.createLobbyForm()
        this.#listenForPublicLobbys();
        this.connected = true
      }
      this.#listenForClientJoint();
      this.#listenForClientLeft();
      this.#listenForReconnect();
      this.#listenForDisconnect();
      this.#listenForToggleReady();
    })
  }

  waitForConnecten() {
    return new Promise((resolve, reject) => {
      
      if (this.isConnected) {
        clearTimeout(this.intervalID);
        resolve();
      }
      else {
        this.intervalID = setTimeout(() => this.waitForConnecten(), 500);
      }
    })
  }

  isConnected() {
    return this.connected
  }

  /** 
  * Fügt einen Client zu Lobby hinzu
  * @param {string} id        - Socket ID des Clients
  * @param {object} clientObj - Client Objekt
  * @return {void} 
  */
  addClient(id, clientObj) {
    this.clients[id] = clientObj;
  }

  /** 
  * Entfernt einen Client aus der Lobby 
  * @param {string} id        - Socket ID des Clients
  * @return {void} 
  */
  removeClient(id) {
    delete this.clients[id];
  }
  
  /** 
  * Aktualisiert ein Client-Ojekt in der Lobby
  * @param {string} id    - Socket ID des Clients
  * @param {string} key   - Client Objekt Key der aktualisiert werden soll
  * @param {mixed} value - Neuer Wert
  * @return {void} 
  */
  updateClient(id, key, value) {
    this.clients[id][key] = value
  }

   /** 
  * Erhalte ein Key-Value des Client-Ojekts
  * @param {string} id    - Socket ID des Clients
  * @param {string} key   - Client Objekt Key der angespochen wird
  * @return {mixed} Wert des Keys
  */
  getClientData(id, key) {
    return this.clients[id][key]
  }

  /** 
  * Prüft ob ein Client in der Lobby existiert
  * @param {string} id    - Socket ID des Clients
  * @param {string} key   - Client Objekt Key der angespochen wird
  * @return {bool} 
  */
  doesClientExist(id) {
    return this.clients[id] ? true : false;
  }
  
  /** 
  * Erhalte ein Client Objekt
  * @param {string} id    - Socket ID des Clients
  * @return {object} Client Objekt
  */
  getClient(id) {
    return this.clients[id]
  }
  
  removeLobbyMember(id) {
    $(`#form tr[data-id="${id}"]`).remove();
  }

  /**
  * Der Bereit-Status des eigenen Clients wird gewechselt.
  * Status wird visual im DOM geupdatet, sowie eigens Client Objekt geupdatet.
  * Sendet die Aktion an den Server.
  * @return {void} 
  */
  toggleReady() {

    const button = $(`#form tr[data-id="${this.socket.id}"] button`); // Reference the clicked button
    let status = false

    if (button.hasClass('ready')) {
      button.removeClass('ready').addClass('unready');
      status = false
    } 
    else {
      button.removeClass('unready').addClass('ready');
      status = true
    }
    this.updateClient(this.socket.id, 'ready', status)
    this.socket.emit('toggleReady', this.id, status);
  }


  createInvidentLink() {
    $('div#form').prepend(`<button id="copy-link-btn" data-clipboard-text="${window.location.href}?lobbyID=${this.id}">Einladunglink kopieren</button>`)
    $('div#form').prepend(`<button id="copy-id-btn" data-clipboard-text="${this.id}">Lobby-ID kopieren</button>`)
    $('#copy-link-btn, #copy-id-btn').on('click', (event) => {
      const textToCopy = $(event.currentTarget).attr('data-clipboard-text');
      navigator.clipboard.writeText(textToCopy)
      .then(()=> this.info.create_popup("Wurde kopiert", { type: 2, where: 'top' }))
    });
  };

  createLeaveButton() {
    $('div#form').prepend(`<button type="button" id="leave-btn">Lobby verlassen</button>`)
    $('div#form').prepend(`<h3>Lobby-Raum</h3>`)

    $('#leave-btn').on('click', () => this.handleLeaveLobby())
  };

  async handleLeaveLobby() {
    this.socket.emit('exit');
    window.location.reload()
  }

/**
 * Anhand des Status, der vom Server kommt 
 * nach dem man versucht eine Lobby beizutreten.
 * wird eine Popup angezeigt.
 * @param {number} status
 * @return {void}
 */
  validateJoinStatus(status) {
    let msg = '';
    switch (status) {
      case 1:
        msg = `Lobby beigetreten`;
        break;
      case 2:
        msg = `Lobby bereits voll`;
        break;
      case 3:
        msg = `Lobby existiert nicht`;
        break;
      case 4:
        msg = `Spiel läuft bereits`;
        break;
    }
    this.info.create_popup( msg, { type: 2, where: 'top' });
  }

  /**
   * Versucht, eine Lobby beizutreten, gibt true zurück, wenn erfolgreich war.
   * Zeigt, außerdem eine Popup an mit dem Status
   * @param {string} lobbyID - Die ID der Lobby die man versucht beizutreten
   * @param {object} clientObj - Das Client-Objekt
   * @returns {boolean} - true, wenn das Beitreten erfolgreich war, ansonsten false
   */
  async tryJoinLobby(lobbyID, clientObj) {
    const result = await this.socket.emitWithAck('joinLobby', lobbyID, clientObj);
    this.validateJoinStatus(result.status);
    return result.status == 1
  }

  async getLobbyFromServer(lobbyID) {
    return await this.socket.emitWithAck('getLobby', lobbyID);
  }

  #createPublicLobbyUI = (lobby) => {
    
    const lobbyElement    = $('<div class="lobby-container" id="' + lobby.id + '"></div>');
    const joinButton      = $('<button class="join-public-btn" data-lobby-id="' + lobby.id + '">Beitreten</button>');
    const membersElement  = $('<div    class="members" data-member-count="' + Object.keys(lobby.players).length + '" data-max-players="' + lobby.maxPlayers + '">Teilnehmer: ' + Object.keys(lobby.players).length + ' / ' + lobby.maxPlayers + '</div>');
    const userListElement = $('<ul     class="userlist"></ul>');

    lobbyElement.append(joinButton);
    lobbyElement.append(membersElement);
    lobbyElement.append(userListElement);

    $.each(lobby.players, (id, client) => {
      if (id !== this.socket.id) {
        const memberElement = $('<li data-id="' + id + '">' + client.name + '</li>');
        userListElement.append(memberElement);
      }
    });

    return lobbyElement;
  };
  #updatePublicLobbyUI = (lobbyElement, data) => {
    const memberCountLabel = lobbyElement.find('div.members');
    let currentCount       = parseInt(memberCountLabel.attr('data-member-count'));
    const maxCount         = parseInt(memberCountLabel.attr('data-max-players'));

    if (data.action === 'join') {
      const newMemberElement = $(`<li data-id="${data.clientID}">${data.client.name}</li>`);
      lobbyElement.find('ul.userlist').append(newMemberElement);
      currentCount++;
    } 
    else if (data.action === 'leave') {
      const leavingMemberElement = lobbyElement.find(`ul.userlist li[data-id="${data.clientID}"]`);
      leavingMemberElement.remove();
      currentCount--;
    }
    memberCountLabel.attr('data-member-count', currentCount);
    memberCountLabel.text(`Teilnehmer: ${currentCount} / ${maxCount}`);
  };
  #listenForPublicLobbys = () => {
    const publicLobbiesElement = $('div#public');
    $('#lobby').append(publicLobbiesElement);

    this.socket.on('sendPublicLobbys', (lobbys) => {
      $.each(lobbys, (index, lobby) => {
        const lobbyElement = this.#createPublicLobbyUI(lobby);
        publicLobbiesElement.append(lobbyElement);
      });
    });

    this.socket.on('updatePublicLobbys', (data) => {
      const lobbyElement = publicLobbiesElement.find('div#' + data.lobby.id);
      if (data.action === 'delete') {
        lobbyElement.remove();
        return;
      }
      if (!lobbyElement.length) {
        const newLobbyElement = this.#createPublicLobbyUI(data.lobby);
        publicLobbiesElement.append(newLobbyElement);
      }
      this.#updatePublicLobbyUI(lobbyElement, data);
    });
  };
  #listenForDisconnect() {
    this.socket.on('getClient' , (callback) => {
      callback(this.client);
    });
    this.socket.once('disconnect', () => {
      setTimeout(() => {document.location.reload(); }, 100)
    });
  }
  #listenForReconnect() {
    this.socket.on('recovered', (lobbyObj) => {
      this.id      = lobbyObj.id;
      if (lobbyObj.game_started) {
        $('#game').show();
        $('#lobby').remove();
        this.info.create_popup(`Sitzung wiederhergestellt`, { type: 2, where: 'top' });
        client_multiplayer(this.socket, JSON.parse(JSON.stringify(lobbyObj)));
      }
      else {
        this.handleJoinLobby();
      }
    })
  }
  #listenForClientJoint() {
    this.socket.on('playerJoined', (id, clientObj) => {
      if (!clientObj.recovered) {
        this.info.create_popup(`Spieler ${clientObj.name} beitreten`, { type: 2, where: 'top' });
      } 
      this.addClient(id, clientObj);
      this.addLobbyMember(id);
    }) 
  }
  #listenForClientLeft() {
    this.socket.on('playerLeft', (id) => {      
      this.info.create_popup(`Spieler ${this.getClientData(id, 'name')} verlassen`, { type: 2, where: 'top' });
      this.removeLobbyMember(id);
      this.removeClient(id);
    })
  }
  #listenForToggleReady() {
    this.socket.on('toggleReady', (clientID, status) => {
      this.updateClient(clientID, 'ready', status);
      
      if (status) {
        this.info.create_popup(`Spieler ${this.getClientData(clientID, 'name')} ist bereit`, { type: 2, where: 'top' });
      }
      $(`#form tr[data-id="${clientID}"] span`).toggleClass('unready')
                                               .toggleClass('ready');
    })
  }

  createLobbyForm() {
    
    let form = $(`
      
      <div id="lobby">
        <div id="form">
          <h3>Lobby erstellen oder beitreten<h3>
          <div class="button-wrapper">
            <button type="button" id="create-public-btn">Öffentliche Lobby erstellen </button>
          </div>
          
          <div class="button-wrapper">
            <button type="button" id="create-private-btn">Private Lobby erstellen </button>
          </div>
          
          <div class="button-wrapper">
            <button type="button" id="join-btn">Private Lobby Beitreten</button>
          </div>
          
          <div class="button-wrapper">
            <div class="input-group">
              <input type="text" id="lobbyID" placeholder="Lobby-ID">
            </div>
          </div>
        </div>
        <div id="public">
          <h3>Öffentliche Lobby Liste<i class="fa-solid fa-lock-open"></i></h3>
        </div>
      </div>`
    )


      if ($(window).width() >= 600) {
        form.css({
          width: '90%',
          'display': 'flex',
          'align-items': 'center',
          'justify-content': 'space-evenly'
        });
      }
      else {
        form.css({
          width: 'auto',
          'display': 'block',
          'align-items': 'center',
          'justify-content': 'space-evenly'
        });
      }
      $(window).on('resize', () => {
        if ($(window).width() >= 600) {
          form.css({
            width: '90%',
            'display': 'flex',
            'align-items': 'center',
            'justify-content': 'space-evenly'
          });
        }
        else {
          form.css({
            width: 'auto',
            'display': 'block',
            'align-items': 'center',
            'justify-content': 'space-evenly'
          });
        }
      });
      
      $('body').prepend(form);
  }
}
