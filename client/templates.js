if (Meteor.isClient) {
  import {lobbyInit} from "./lobby";
  import {gameInit} from "./client";  
    //TODO: Use registerHelper for universal template logic
    // Template.registerHelper('sessionId', function (){ //
    //    		// Used to globally evaluate multiple templates for a single page app feel
    //    	// 	return Session.get("gameId") !== "null";
    //   		// return sessionStorage.getItem('gameId') !== null;
    //    	// 	Session.set("gameId", sessionStorage.getItem('gameId'))
    //    		// return typeof sessionStorage.getItem("gameId") == 'undefined';
    // 				return Session.get("gameId") !== null && Session.get("gameId") !== undefined;
    //  });

	Template.chatBoxTemplate.helpers({
    opponentJoined: function(){
		  if (Meteor.user()){
			 var currentGame = PieceCollection.findOne({_id: Session.get('gameId')});
				if (typeof currentGame !== 'undefined'){
  				return currentGame['playerWhite'] !== null && currentGame['playerBlack'] !== null;
		    }
  	   }
      },
		
	});

	Template.chatMessagesTemplate.helpers({
		isThisUser: (username) => {
			console.log(username, Meteor.user().username)
			return username == Meteor.user().username

		}
	});
  
  Template.opponentUsername.helpers({
  	opponentUsername: function(){
  		if (Meteor.user()){
  		var currentGame = PieceCollection.findOne({_id: Session.get('gameId')});
  		if (typeof currentGame !== 'undefined'){
  			if (currentGame['playerWhite'] == Meteor.user().username){return currentGame['playerBlack']} //Returning the correct opponents username
        else if (currentGame['playerBlack'] == Meteor.user().username){return currentGame['playerWhite']}
  		}	
  	}
  }
  });

  Template.lobby.helpers({
  	active: function (){
  		if (Meteor.user()){
  		 var activeCount = PieceCollection.find({$and: [{$or: [{playerBlack: Meteor.user().username}, {playerWhite: Meteor.user().username}]}, {gameEnd: null}]}).count();
  			if (activeCount > 14) {document.getElementById("joinButton").disabled = true; }
  			else {document.getElementById("joinButton").disabled = false; }
  			return activeCount;
      }
  	},
		matchData: function(){
			if (Meteor.user()){
				// console.count("Template matchData");
				var matchScoreArray = [];
				var allActiveGames = PieceCollection.find({$and: [{$or: [{playerBlack: Meteor.user().username}, {playerWhite: Meteor.user().username}]}, {gameEnd: null}]}, { sort: { gameStart: -1}}).fetch();
        for (z = 0; z<Object.keys(allActiveGames).length; z++){
          var thisGame = allActiveGames[z];
    			// var players = {playerWhite: thisGame['playerWhite'], playerBlack: thisGame['playerBlack']} 
    			//Start of for loop declarations to determine most recent game
          var turnDataHistory = thisGame['turnDataArray']
      		//Determine most recent turn for the current game
      		var maxDate = 0; var turnIndex;
      		for (x=0; x<Object.keys(turnDataHistory).length; x++){
        		if (turnDataHistory[x]['date'] > maxDate){maxDate = turnDataHistory[x]['date']; turnIndex = x;}
      				}
      		var mostRecentTurnData = turnDataHistory[turnIndex];
          // console.log(mostRecentTurnData);
      		//Start counting of score in the most Recent Turn's array to total the score	
    			var x, y; var whiteScore = 0, blackScore = 0;
  				for (y=0; y < Object.keys(mostRecentTurnData['turnPieceData']).length; y++) {
  				  for (x=0; x < Object.keys(mostRecentTurnData['turnPieceData'][y]).length; x++){
  				    if (mostRecentTurnData['turnPieceData'][y][x] == 0){whiteScore +=1;}
  				    else if (mostRecentTurnData['turnPieceData'][y][x] == 1){blackScore +=1;}
  				    }}
  			    // var scoreTotal = {whiteScore: whiteScore, blackScore: blackScore};
  			    // console.log(scoreTotal)
  			    // matchScoreArray[z] = {score: scoreTotal, players: players};
			    
			    //Evaluate to determine turn
			    var thisPlayerTurn = false; //Boolean
			    if (mostRecentTurnData['playerTurn'] == 0 && Meteor.user().username == thisGame['playerWhite']){thisPlayerTurn = true;}
			    else if (mostRecentTurnData['playerTurn'] == 1 && Meteor.user().username == thisGame['playerBlack']){thisPlayerTurn = true;}
			    else {thisPlayerTurn = false;}
			    matchScoreArray[z] = {_id: thisGame['_id'], whiteScore: whiteScore, blackScore: blackScore, playerWhite: thisGame['playerWhite'], playerBlack: thisGame['playerBlack'], thisPlayerTurn: thisPlayerTurn, lastUpdated: mostRecentTurnData['date']};
				  }//for loop
					return matchScoreArray;
					}
				}
			});

//onRendered template to call the respective initialization functions for each screen
  Template.othelloGameTemplate.onRendered(gameInit);

  Template.lobby.onRendered(lobbyInit);

  Template.playerDesignation.helpers({
  	playerDesignation: function(){
   		// var thisSession = Session.get('gameId');
  			var thisGame = PieceCollection.findOne({_id: Session.get('gameId')});
  			if (thisGame !== undefined){
  			var players = {
  				playerWhite: thisGame['playerWhite'],
  				playerBlack: thisGame['playerBlack']
  			}
     		return players;
    		}
  	}
        // thisPlayerTurn: function(){
        //     var thisPlayerTurn = false; //Boolean
        //     if (mostRecentTurnData['playerTurn'] == 0 && Meteor.user().username == thisGame['playerWhite']){thisPlayerTurn = true;}
        //     else if (mostRecentTurnData['playerTurn'] == 1 && Meteor.user().username == thisGame['playerBlack']){thisPlayerTurn = true;}
        //     else {thisPlayerTurn = false;}
        // }

	});

  Template.sessionId.helpers({
  	gameId: function() {
  		// return sessionStorage.getItem('gameId') !== null;
  		// Session.set("gameId", sessionStorage.getItem('gameId'))
  		return Session.get("gameId") !== 'null' && Session.get("gameId") !== undefined;
  		// return typeof sessionStorage.getItem("gameId") == 'undefined';
  	 }
  });
    
  Template.messaging.helpers({
  	gameId: function() {
  		// return Session.get("gameId") !== undefined;
  		// return typeof Session.get("gameId") == 'string';
  		return Session.get("gameId") !== 'null' && Session.get("gameId") !== undefined;
  		// return typeof sessionStorage.getItem("gameId") == 'undefined';
  	}
  });
  // Template.playerTurn.helpers({
  //     	gameId: function() {
  //     		return Session.get("gameId") !== 'null' && Session.get("gameId") !== undefined;
  //     		// return typeof sessionStorage.getItem("gameId") == 'undefined';
  //     	}
  //     });

  Template.buttons.helpers({
  	gameId: function(){
    		return Session.get("gameId") !== 'null' && Session.get("gameId") !== undefined;
    		// return typeof sessionStorage.getItem("gameId") == 'undefined';
  	}
  });
      
}//end isClient