if (Meteor.isClient) {
  //TODO: Use registerHelper for universal template logic
  // Template.registerHelper('sessionId', function (){ //
     		//Used to globally evaluate multiple templates for a single page app feel
     		// return Session.get("gameId") !== "null";
    		// return sessionStorage.getItem('gameId') !== null;
     		// Session.set("gameId", sessionStorage.getItem('gameId'))
      		
     		// return typeof sessionStorage.getItem("gameId") == 'undefined';
  // 				return Session.get("gameId") !== 'null' && Session.get("gameId") !== 'undefined';
  //     	      });


  Template.sessionId.helpers({
      	gameId: function() {
      		// return sessionStorage.getItem('gameId') !== null;
     		// Session.set("gameId", sessionStorage.getItem('gameId'))
      		return Session.get("gameId") !== 'null' && Session.get("gameId") !== undefined;
     		// return typeof sessionStorage.getItem("gameId") == 'undefined';
      	}
      });
  

  Template.opponentUsername.helpers({
      	opponentUsername: function(){
      		if (Meteor.user()){
      		var currentGame =  PieceCollection.findOne({_id: Session.get('gameId')});
      		if (typeof currentGame !== 'undefined'){
      			if (currentGame['playerWhite'] == Meteor.user().username){return currentGame['playerBlack']};
      			if (currentGame['playerBlack'] == Meteor.user().username){return currentGame['playerWhite']};
      		// else {return "Waiting"}
      		}	
      	}
      }
  	});
  Template.lobby.helpers({
      	
  		active: function (){
  			if (Meteor.user()){
  			return PieceCollection.find({$and: [{$or: [{playerBlack: Meteor.user().username}, {playerWhite: Meteor.user().username}]}, {gameEnd: null}]}).count()
  		}
  	},
  		matchData: function(){
  			if (Meteor.user()){
  				console.count("matchData");
  				var matchScoreArray = [];
  				var allActiveGames = PieceCollection.find({$and: [{$or: [{playerBlack: Meteor.user().username}, {playerWhite: Meteor.user().username}]}, {gameEnd: null}]}, { sort: { gameStart: 1}}).fetch();
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
        		//Start counting of score in the most Recent Turn's array to total the score	
        			var x, y; var whiteScore = 0; blackScore = 0;
					for (y=0; y < Object.keys(mostRecentTurnData['turnPieceData']).length; y++) {
					  for (x=0; x < Object.keys(mostRecentTurnData['turnPieceData'][y]).length; x++){
					    if (mostRecentTurnData['turnPieceData'][y][x] == 0){whiteScore +=1;}
					    else if (mostRecentTurnData['turnPieceData'][y][x] == 1){blackScore +=1;}
					    }}
				    // var scoreTotal = {whiteScore: whiteScore, blackScore: blackScore};
				    // console.log(scoreTotal)
				    // matchScoreArray[z] = {score: scoreTotal, players: players};
				    
				    //Evaluate to determine turn
				    var thisPlayerTurn; //Boolean
				    if (mostRecentTurnData['playerTurn'] == 0 && Meteor.user().username == thisGame['playerWhite']){
				    	thisPlayerTurn = true;
				    }
				    else if (mostRecentTurnData['playerTurn'] == 1 && Meteor.user().username == thisGame['playerBlack']){
				    	thisPlayerTurn = true;
				    }
				    else {thisPlayerTurn = false;}

				    matchScoreArray[z] = {_id: thisGame['_id'], whiteScore: whiteScore, blackScore: blackScore, playerWhite: thisGame['playerWhite'], playerBlack: thisGame['playerBlack'], thisPlayerTurn: thisPlayerTurn};

				    
				     

						}//for loop
					console.log(matchScoreArray);	
  					return matchScoreArray;
  					}
  				}
				


  	
      	
      });
//onRendered template to call the respective initialization functions for each screen
  Template.gameCanvas.onRendered(function(){
  	gameInit();


  });

  Template.lobby.onRendered(function(){
  	lobbyInit();

  });

  Template.playerDesignation.helpers({
      	playerDesignation: function(){
      		var currentGame =  PieceCollection.findOne({_id: Session.get('gameId')},{playerWhite: 1, playerBlack: 1});
       		},
   		// players: {
   		// 	playerWhite: PieceCollection.findOne({_id: Session.get('gameId')})['playerWhite'],
   		// 	playerBlack: PieceCollection.findOne({_id: Session.get('gameId')})['playerBlack']
   		// 	}
       		
      		});
  Template.messaging.helpers({
      	gameId: function() {
      		// return Session.get("gameId") !== undefined;
      		// return typeof Session.get("gameId") == 'string';
      		return Session.get("gameId") !== 'null' && Session.get("gameId") !== undefined;
      		// return typeof sessionStorage.getItem("gameId") == 'undefined';

      	}
      });
  Template.playerTurn.helpers({
      	gameId: function() {
      		return Session.get("gameId") !== 'null' && Session.get("gameId") !== undefined;
      		// return typeof sessionStorage.getItem("gameId") == 'undefined';

      	}
      });
  Template.buttons.helpers({
  		gameId: function(){
      		return Session.get("gameId") !== 'null' && Session.get("gameId") !== undefined;
      		// return typeof sessionStorage.getItem("gameId") == 'undefined';

  		}
  })



      
  }//end isClient