if (Meteor.isClient) {
  import {lobbyInit} from "./lobby";
  import {gameInit} from "./client";  
    //TODO: Use registerHelper for universal template logic
    // Template.registerHelper('sessionId', function (){ //
    // Used to globally evaluate multiple templates for a single page app feel
 
  Template.chatBoxTemplate.helpers({
    opponentJoined: function() {
      if (Meteor.user()) {
        var currentGame = PieceCollection.findOne(
          {_id: Session.get('gameId')}
        );
        if (typeof currentGame !== 'undefined') {
        return (
          currentGame['playerWhite'] !== null &&
          currentGame['playerBlack'] !== null
        );
        }
      }
    },
  });

	Template.chatMessagesTemplate.helpers({
		isThisUser: (username) => {
			return username == Meteor.user().username;
		}
	});
  
  Template.opponentUsername.helpers({
  	opponentUsername: function(){
  		if (Meteor.user()) {
  		var currentGame = PieceCollection.findOne({_id: Session.get('gameId')});
  		if (currentGame){
  			if (currentGame['playerWhite'] == Meteor.user().username) {
          return currentGame['playerBlack'];
        } else if (currentGame['playerBlack'] == Meteor.user().username) {
          return currentGame['playerWhite'];
        }
  		}	
  	}
  }
  });

  Template.lobby.helpers({
  	active: function () {
  		if (Meteor.user()) {
        var activeCount = PieceCollection.find(
          {$and: [
              {$or: [
                {playerBlack: Meteor.user().username},
                {playerWhite: Meteor.user().username}
              ]},
              {gameEnd: null}
            ]}
        ).count();
        var joinButton = document.getElementById("joinButton");
        if (joinButton) joinButton.disabled = activeCount > 14 ? true : false;
        return activeCount;
      }
  	},
		matchData: function() {
			if (Meteor.user()) {
				var matchScoreArray = []; //Array of games to return to the lobby template
				var allActiveGames = PieceCollection.find(
          {$and: [
            {$or: [
              {playerBlack: Meteor.user().username},
              {playerWhite: Meteor.user().username}
            ]},
            {gameEnd: null}
          ]},
          { sort: { gameStart: -1}}
        ).fetch();
        
        allActiveGames.map((game) => {
    			//Start of for loop declarations to determine most recent game
      		//Determine most recent turn for the current game
      		var maxDate = 0;
          var turnIndex;
          game['turnDataArray'].map((turn,i) => {
        		if (turn && turn['date'] > maxDate) {
              maxDate = turn['date'];
              turnIndex = i;
            }
  				});
          
          var whiteScore = 0;
          var blackScore = 0;
          //Start counting of score in the most Recent Turn's array to total the score  
          game['turnDataArray'][turnIndex]['turnPieceData'].map((yArray, y) => {
            yArray.map((cellValue, x) => {
              if (cellValue == 0) whiteScore += 1;
              else if (cellValue == 1) blackScore += 1;
            });
          });
  	
			    //Evaluate to determine turn
			    var thisPlayerTurn = false; 
			    if (
            game['turnDataArray'][turnIndex]['playerTurn'] == 0 &&
            Meteor.user().username == game['playerWhite']
          ) thisPlayerTurn = true;
			    else if (
            game['turnDataArray'][turnIndex]['playerTurn'] == 1 &&
            Meteor.user().username == game['playerBlack']
          ) thisPlayerTurn = true;

			    matchScoreArray.push({
            _id: game['_id'],
            whiteScore: whiteScore,
            blackScore: blackScore,
            playerWhite: game['playerWhite'],
            playerBlack: game['playerBlack'],
            thisPlayerTurn: thisPlayerTurn,
            lastUpdated: game['turnDataArray'][turnIndex]['date'],
          });
			  
        });//for loop
				return matchScoreArray;
			} 
		}
	});

//onRendered template to call the respective initialization functions for each screen
  Template.othelloGameTemplate.onRendered(gameInit);
  Template.lobby.onRendered(lobbyInit);

  Template.playerDesignation.helpers({
  	playerDesignation: function() {
  			var thisGame = PieceCollection.findOne(
          {_id: Session.get('gameId')}
        );
  			if (thisGame) {
    			var players = {
    				playerWhite: thisGame['playerWhite'],
    				playerBlack: thisGame['playerBlack']
    			}
       		return players;
    		}
  	}

	});

  Template.sessionId.helpers({
  	gameId: function() {
  		return (
        Session.get("gameId") !== 'null' &&
        Session.get("gameId") !== undefined
      );
  	 }
  });
    
  Template.messaging.helpers({
  	gameId: function() {
   		return (
        Session.get("gameId") !== 'null' &&
        Session.get("gameId") !== undefined
      );
  	}
  });

  Template.buttons.helpers({
  	gameId: function(){
  		return (
        Session.get("gameId") !== 'null' &&
        Session.get("gameId") !== undefined
      );
  	}
  });
      
}//end isClient