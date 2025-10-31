import { Lobby } from "./ClientLobbyMain_class.js";

export class TeamLobby extends Lobby {
  teams_total = 2
  team_size   = 2
  constructor(socket, popupObj, clientObj, lobbyID, teams_total, team_size) {
    super(socket, popupObj, clientObj, lobbyID);
    this.teams_total = teams_total
    this.team_size   = team_size
    this.teams       = {}
    this.teamID      = null
    this.intervalID  = null
    this.checkForConnect();
  }
  checkForConnect() {
    this.waitForConnecten().then(() => this.handleConnect());
  }

  handleConnect() {
  
    if (this.id != "" && this.socket.recovered == false) {  // Beitrten mit Einladunglink
      this.handleJoinLobby(); 
    }
    
    $(document).on('click', '#create-private-btn, #create-public-btn', async (event) => {
      
      const isPrivate = $(event.currentTarget).is('#create-private-btn') ? true : false;

      const Serverlobby = await this.socket.emitWithAck('createLobby', this.client, isPrivate, null);
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

    this.listenForTeamChanges();
    this.handeTeamChanges();
  };

  async handleJoinLobby() {

    if(await this.tryJoinLobby(this.id, this.client)) {
      this.createLobbyRoomUI();
      let lobbyserver = await this.getLobbyFromServer(this.id);
      this.addExistingLobbyMembers(lobbyserver);
    }
  }


  createLobbyRoomUI() {
    let self = this;
    $('#form').children().remove();
    $('#public').remove();

    let teams = $('<div id="teams"></div>');
    
    $('div#form').append(`<span class="lobby-min-players">Erforderliche Anzahl an Spieler: <br><br> ${self.teams_total * self.team_size}</span>`);
    $('div#form').append(`<table class="team">
                            <thead>
                              <tr>
                                <th>Spieler</th>
                              </tr>
                            </thead>
                            <tbody id="lobby-visitors">
                            
                            </tbody>
                          </table>`)
    $('div#form').append(teams);
    
    for (let teamIndex = 0; teamIndex < self.teams_total; teamIndex++) {
      
      let lobbyMenberList = $(`<div class="lobby-menber-list team" id="team-${teamIndex}">
                                <div class="team-header">
                                  <h3>Team ${teamIndex + 1}</h3>
                                  <p class="join-leave-icon join"><i class="fa-solid fa-user-plus"></i></p>
                                </div>
                                <table class="team">
                                  <thead>
                                    <tr>
                                      <th>Spieler</th>
                                      <th>Bereit</th>
                                    </tr>
                                  </thead>
                                  <tbody id="lobby-members-${teamIndex}">
                                  
                                  </tbody>
                                </table>
                              </div>`);
      teams.append(lobbyMenberList);                        
    }


    this.createInvidentLink();
    this.createLeaveButton();
  }

  addLobbyMember(id) {

    const {name} = this.getClient(id);

    $('tbody#lobby-visitors')
    .append(`
      <tr data-id="${id}">
        <td>${name}</td>
      </tr>`
    );
  }

  removeTeamMember(teamID, clientID) {
    
    const index = this.teams[teamID].indexOf(clientID);
    if (index > -1) {
      this.teams[teamID].splice(index, 1);
    }
    $(`#form tr[data-id="${clientID}"]`).remove(); 

    const {name} = this.getClient(clientID);

    $('tbody#lobby-visitors')
    .append(`
      <tr data-id="${clientID}">
        <td>${name}</td>
      </tr>`
    );
    return this  
  }

  addTeamMember(teamID, clientID) {
    
    if (!this.teams[teamID]) {
      this.teams[teamID] = [];
    }
    this.teams[teamID].push(clientID);

    const {name, ready} = this.getClient(clientID);

    let readyStatus = ready ? 'ready' : 'unready';

    if($('#form').length == 0) return 

    $(`#form tr[data-id="${clientID}"]`).remove(); 


    if (clientID == this.socket.id) {

      $(`#form #${teamID} tbody`)
      .append(`
        <tr data-id="${clientID}">
          <td>${name}</td>
          <td>
            <button class="ready-btn ${readyStatus}"></button>
          </td>
        </tr>`
      );
      const button = $(`#form tr[data-id="${clientID}"] button`);
      $(button).on('click' , () => this.toggleReady())
      return;
    }

    $(`#form #${teamID} tbody`)      
    .append(`
        <tr data-id="${clientID}">
          <td>${name}</td>
          <td>
            <span readonly class="ready-btn ${readyStatus}"></span>
          </td>
        </tr>`
      );

    return this  
  }

  listenForTeamChanges() {

    this.socket.on('joinTeam' , (teamID, socketID) => {
      this.updateClient(socketID, 'ready', false);
      this.addTeamMember(teamID, socketID);
      let {name} = this.getClient(socketID);
      this.info.create_popup(`Spieler ${name}, ist dem Team ${teamID.split('-')[1]+1} beigetreten`, { type: 2, where: 'top' });
    }) 
    this.socket.on('switchTeam' ,(oldTeamID, newTeamID, socketID) => {        
      this.updateClient(socketID, 'ready', false);
      this.removeTeamMember(oldTeamID, socketID).addTeamMember(newTeamID, socketID);
      let {name} = this.getClient(socketID);
      this.info.create_popup(`Spieler ${name}, ist zum Team ${teamID.split('-')[1]+1} gewechselt`, { type: 2, where: 'top' });
    });
    this.socket.on('leaveTeam' ,(teamID, socketID) => {
      this.updateClient(socketID, 'ready', false);
      this.removeTeamMember(teamID, socketID)
      let {name} = this.getClient(socketID);
      this.info.create_popup(`Spieler ${name}, hat das Team ${teamID.split('-')[1]+1} verlassen`, { type: 2, where: 'top' });
    })
  };
  handeTeamChanges() {
    $(document).on('click', 'p.join-leave-icon', async (el) => {

      
      const team   = $(el.currentTarget).closest('div.lobby-menber-list.team')
      const teamID = team.attr('id')
      let action   = '';

      if ($(el.currentTarget).hasClass('join')) {
        if (this.teamID) {
          action = 'switch';
        }
        else action = 'join';
      }
      else {
        action = 'leave';
      }

      let status = false
      let txt    = '';

      if (action === 'join') {
        status = await this.socket.emitWithAck('joinTeam', this.id, teamID);
        if (status) {
          this.toggleTeamJoinLeaveIcon(el.currentTarget, action);
          this.client.ready = false;
          this.teamID = teamID;
          txt = `Team ${teamID.split('-')[1]+1} beitreten.`;
          this.addTeamMember(teamID, this.socket.id);
        }
        else txt = `Team ${teamID.split('-')[1]+1} ist voll.`;
        this.info.create_popup(txt, { type: 2, where: 'top' });

      }
      else if (action === 'leave') {
        this.socket.emitWithAck('leaveTeam', this.id, teamID);
        this.toggleTeamJoinLeaveIcon(el.currentTarget, action);
        this.teamID = null;
        this.client.ready = false;
  
        
        
        this.removeTeamMember(teamID, this.socket.id);
        this.info.create_popup(`Team ${teamID.split('-')[1]+1} verlassen.`, { type: 2, where: 'top' });

      }
      else if (action === 'switch') {
        status = await this.socket.emitWithAck('switchTeam', this.id, this.teamID, teamID);
        if (status) {
          this.toggleTeamJoinLeaveIcon(el.currentTarget, action);
          this.client.ready = false;
          this.removeTeamMember(this.teamID, this.socket.id);          
          this.addTeamMember(teamID, this.socket.id);
          this.teamID = teamID;
          this.info.create_popup(`Zu Team ${teamID.split('-')[1]+1} gewechselt.`, { type: 2, where: 'top' });
        }
        else this.info.create_popup(`Team ${teamID.split('-')[1]+1} ist voll.`, { type: 2, where: 'top' });
      }
    });
  }
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
        if (lobbyserver.players[id].teamID) {
          
          this.addTeamMember(lobbyserver.players[id].teamID, id);
        }
      }
    }
  }

/**
 * Tauscht die Icons für den Beitritt/Verlassen Button an, je nachdem Aktionstyp.
 * @param {jQuery} iconEL - Das Element des Beitritt/Verlassen Buttons
 * @param {string} action - Der Typ der Aktion ('join', 'switch' oder 'leave')
 */
  toggleTeamJoinLeaveIcon(iconEL, action) {
    if (action === 'switch') {
      $(`#form #${this.teamID}`).find('p.join-leave-icon')
                                .toggleClass('leave')
                                .toggleClass('join')
                                .html('<i class="fa-solid fa-user-plus"></i>');
    }
    if (action === 'join' || action === 'switch') {
      $(iconEL).html('<i class="fa-solid fa-user-minus"></i>');
    }
    else if (action === 'leave') {
      $(iconEL).html('<i class="fa-solid fa-user-plus"></i>');
    }
    $(iconEL).toggleClass('join').toggleClass('leave')
  }
}

