import { Lobby } from "./ClientLobbyMain_class.js";

export class VersusLobby extends Lobby {

  minPlayers = 2
  maxPlayers = 2
  constructor(socket, popupObj, clientObj, lobbyID, minPlayers = 2, maxPlayers = 2) {
    super(socket, popupObj, clientObj, lobbyID);
    this.minPlayers = minPlayers
    this.maxPlayers = maxPlayers
    this.selectedPlaymode = minPlayers;
    this.checkForConnect();
  }
  checkForConnect() {
    this.waitForConnecten().then(() => this.handleConnect());
  }

  handleConnect() {
  
    if (this.id != "" && this.socket.recovered == false) {  // Beitrten mit Einladunglink
      this.handleJoinLobby(); 
    }
    else if (this.hasVariablePlaymode()) {
      this.createPlayerCountInput();
    }  

    $(document).on('click', '#create-private-btn, #create-public-btn', async (event) => {

      const isPrivate = $(event.currentTarget).is('#create-private-btn') ? true : false;
      this.setSelectedPlaymode();


      const Serverlobby = await this.socket.emitWithAck('createLobby', this.client, isPrivate, this.selectedPlaymode);
      if (Serverlobby == null) {
        console.error('Ungültiges Spieler Objekt beim Erstellen einer Lobby');
        return
      }
      this.id = Serverlobby.id;
      this.createLobbyRoomUI();      
      this.addExistingLobbyMembers(Serverlobby);
      const txt = isPrivate ? 'Private' : 'Öffentliche';
      this.info.create_popup(`${txt} Lobby erstellt`, { type: 2, where: 'top' });
    })
    
    $(document).on('click','#join-btn , button.join-public-btn', async (event) => {
      
      if ($(event.currentTarget).is('.join-public-btn')) {
        this.id = $(event.currentTarget).attr('data-lobby-id');
      }
      else {
        this.id = $('#lobbyID').val();
      }
      this.handleJoinLobby();
      
    })

  
  
  };


  /** 
  * Nutzt das Lobby-Objekt des Servers, um die Clients der Lobby Clientseitig hinzuzufügen.
  * @param {object} lobbyserver - Das Lobby-Objekt des Servers, das immer den aktuellen Zustand der Lobby enthätlt
  * @return {void}
  */
  addExistingLobbyMembers(lobbyserver) {

    for (const id in lobbyserver.players) {

      if (!this.doesClientExist(id)) {
        this.addClient(id, lobbyserver.players[id])
        if (id == this.socket.id) {
          this.client = this.getClient(id);
        }
        this.addLobbyMember(id);
      }
    }
  }

  addLobbyMember(id) {

    const {name, ready} = this.getClient(id);

    let readyStatus = ready ? 'ready' : 'unready';

    if(id == this.socket.id) {
        $('.lobby-menber-list table tbody')
      .append(`
        <tr data-id="${id}">
          <td>${name}</td>
          <td>
            <button class="ready-btn ${readyStatus}"></button>
          </td>
        </tr>`
      );
      const button = $(`#form tr[data-id="${id}"] button`);
      $(button).on('click' , () => this.toggleReady())
      return;
    }
    
    $('.lobby-menber-list table tbody')
    .append(`
      <tr data-id="${id}">
        <td>${name}</td>
        <td>
          <span readonly class="ready-btn ${readyStatus}"></span>
        </td>
      </tr>`
    );
  }
  createLobbyRoomUI() {
    $('#form').children().remove();
    $('#public').remove();
    
    $('div#form').append( 
    `<span class="lobby-min-players">Erforderliche Anzahl an Spieler: <br><br> ${this.selectedPlaymode}</span>
     <div class="lobby-menber-list">
      <table>
        <thead>
          <tr>
            <th>Spieler</th>
            <th>Bereit</th>
          </tr>
        </thead>
        <tbody id="lobby-members">
        
        </tbody>
      </table>
    </div>`);
    this.createInvidentLink();
    this.createLeaveButton();
  }

  async handleJoinLobby() {

    if(this.tryJoinLobby(this.id, this.client)) {
      this.createLobbyRoomUI(this.maxPlayers);
      let lobbyserver = await this.getLobbyFromServer(this.id);
      this.addExistingLobbyMembers(lobbyserver);
    }
  }

  createPlayerCountInput() {
    let span         = $(`<span>Anzahl der Spieler beim erstellen einer Lobby</span>`);
    span.css({'display': 'block', 'margin-top': '10px', 'margin-bottom': '5px', 'textAlign': 'center'});
    let radioWrapper = $(`<div class="radio-wrapper" id="playmode"></div>`);
    
    for (let i = this.minPlayers; i <= this.maxPlayers; i++) {
      let checked = i === this.minPlayers ? 'checked' : '';
      let radioDiv = $(`
        <div>
          <label for="playmode-${i}">${i} Spieler</label>
          <input type="radio" name="playmode" id="playmode-${i}" ${checked} value=${i} >
        </div>
      `);
      radioWrapper.append(radioDiv);
    }

    setTimeout(() => {
      console.log($('#form'));
      $('#form').append(span);
      $('#form').append(radioWrapper);
    }, 200);

    
  }
  hasVariablePlaymode() {
    return this.minPlayers != this.maxPlayers;
  }
  setSelectedPlaymode() {
    if (this.hasVariablePlaymode()) {
      this.selectedPlaymode = parseInt($('#form input[type="radio"][name="playmode"]:checked').val())
    } 
    else {
      this.selectedPlaymode = parseInt(this.minPlayers);
    }

    if (this.selectedPlaymode < this.minPlayers || this.selectedPlaymode > this.maxPlayers) {
      this.selectedPlaymode = this.minPlayers;
    }
  }
}
