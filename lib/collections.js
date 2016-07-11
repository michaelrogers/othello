//----------------------------Collections------------------------
ChatMessages = new Mongo.Collection("messages");
PieceCollection = new Mongo.Collection("piece-collection");
UserCollection = new Mongo.Collection("user-collection");

//-----------------------------Publish---------------------------
if(Meteor.isServer) {
	Meteor.publish("messages", function(){
		this.ready();
		return ChatMessages.find();
	});
	Meteor.publish("piece-collection", function(){
		this.ready();
		return PieceCollection.find();
	});
	Meteor.publish("user-collection", function(){
		this.ready();
		return UserCollection.find();
	});
}
//-----------------------------Methods---------------------------
if(Meteor.isServer){
Meteor.methods({
  'othello.updateGameData'({ gameId, changedGameData, currentPlayerTurn }) {
    //TODO: Setup schemas to validate DB data
    // new SimpleSchema({
    //   gameId: { type: String },
    //   changedGameData: { type: Object }
    // }).validate({ gameId, changedGameData });

    if (currentPlayerTurn == 0){currentPlayerTurn = 1;}
    else if (currentPlayerTurn == 1){currentPlayerTurn = 0;}
   	
   	PieceCollection.update({_id: gameId}, {
      $addToSet: { turnDataArray: {date: Date.now(), turnPieceData: changedGameData, playerTurn: currentPlayerTurn}}});
      // $push: { turnData: {turn_Id: Date.now(), turnData: changedGameData, playerTurn: currentPlayerTurn}}});
  	

  	},

  	'othello.readGameData'({gameId}) {
  		var readGameDocument = PieceCollection.findOne({_id: gameId}, {_id: 0, turnDataArray: 1 });
  		if (typeof readGameDocument == 'undefined'){return false};
  		var turnDataArray = readGameDocument['turnDataArray'];
        var maxDate = 0; var turnIndex;
        for (x=0; x<turnDataArray.length; x++){
          if (turnDataArray[x]['date'] > maxDate){maxDate = turnDataArray[x]['date']; turnIndex = x;}
        	}
        // console.log('Seconds ago: ' + (Date.now()-maxDate)/1000);
        var mostRecentTurnData = turnDataArray[turnIndex]; //define the currentGameObject for readCollection to use
  		// console.log(mostRecentTurnData);
  		return mostRecentTurnData;
  	},
  	
  	'othello.generateGameId' ({userId}) {
  		var gameId = new Mongo.ObjectID().valueOf(); //Mongo.ObjectID();
  		// console.log("gameId initialized: "+ gameId);
  		
		var initialData = { //Initial starting positions in object literal notation
		    0: {0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null},
		    1: {0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null}, 
		    2: {0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null}, 
		    3: {0: null, 1: null, 2: null, 3: 0, 4: 1, 5: null, 6: null, 7: null}, 
		    4: {0: null, 1: null, 2: null, 3: 1, 4: 0, 5: null, 6: null, 7: null}, 
		    5: {0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null}, 
		    6: {0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null}, 
		    7: {0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null} 
       	}
   		PieceCollection.update({_id: gameId}, {
  			// $set: { gameData: {turn_id: Date.now() {turnData: initialData, playerTurn: 0}, startDate: Date.now(), endDate: null }}, {upsert: true});
  			$set: { turnDataArray: [{date: Date.now(), turnPieceData: initialData, playerTurn: 0}], gameStart: Date.now(), gameEnd: null, playerWhite: userId, playerBlack: null, winner: null }}, {upsert: true});
   		// console.log("New gameId created: " + gameId);

  		return gameId;
  	        
  	},

  	'othello.joinGame' ({userId, gameId}){
  		//If a null _id is passed, a valid game is searched for and its _id is stored as gameId
  		if (gameId == null){ //gameId is null when the joinButton is pressed
  			//Set gameDocument to retrieve one game from the database where game is not over, playerBlack slot is free, and playerWhite is not the current user
  			var gameDocument = PieceCollection.findOne({gameEnd: null, playerBlack: null, playerWhite: {$ne: userId}})
  			if (typeof gameDocument !== 'undefined'){
	  			gameId = gameDocument['_id'].valueOf();
	  			// var playerWhite = gameDocument['playerWhite'];
  				}
			// return gameId;
  			else { //If there is no existing game that the user can join, a new one is created by calling generateGameId
					// throw new Meteor.Error( 500, "There were no available games to join.")
					Meteor.call('othello.generateGameId', {userId: userId}, (err,res)=>{
						if (err){console.log(err)}
						else {gameId = res;}
						});
				}}
		if (gameId != undefined){
	  		var currentGame = PieceCollection.findOne({_id: gameId});
	  		//Player is already in the game, return the gameId	
	  		if (currentGame != undefined && (currentGame['playerBlack'] == userId || currentGame['playerWhite'] == userId)){return gameId}
	  		//If playerBlack slot is free and player is not currently in the game as playerWhite
	  		else if (currentGame != undefined && currentGame['playerBlack'] == null && currentGame['playerWhite'] != userId){
	  		PieceCollection.update({_id: gameId}, {$set: {playerBlack: userId}});
	  		// var joinedGame = PieceCollection.findOne({_id: gameId}, {_id: 0})
  			}
  		}
  		return gameId;

  	},

  	'othello.whatPlayerAmI' ({username, gameId}){
  		// if (username){
  			// console.log(username)
  		var gameDocument = PieceCollection.findOne({_id: gameId})
  		// console.log(gameDocument);
  		var playerBlack = gameDocument['playerBlack']
  		var playerWhite = gameDocument['playerWhite']
  		if (playerWhite == username){return 0;}
  		else if (playerBlack == username){return 1;} 
  		// }
  		else {return false};
  	},

  	'othello.endGame' ({gameId, resignation, userId}){




  		if (Meteor.user()){
  				var thisGame = PieceCollection.findOne({_id: gameId}); 
  				var playerWhite = thisGame['playerWhite'];
  				var playerBlack = thisGame['playerBlack'];

  				if (resignation){
  					var winner;
  					if (userId == playerWhite){ //playerWhite resigns
  						winner = playerBlack; //The opposite player receives a win by default
					}
  					else if (userId == playerBlack){ //playerBlack resigns
  						winner = playerWhite; //The opposite player receives a win by default
  					}	

  					PieceCollection.update({_id: gameId}, {
						$set: { gameEnd: Date.now(), winner: winner }}, {upsert: true});
			    	return true;
  				}




				//Start of for loop declarations to determine most recent game
				var turnDataHistory = thisGame['turnDataArray']
        		//Determine most recent turn for the current game
        		var maxDate = 0; var turnIndex;
        		for (z=0; z<Object.keys(turnDataHistory).length; z++){
          			if (turnDataHistory[z]['date'] > maxDate){maxDate = turnDataHistory[z]['date']; turnIndex = z;}
        				}
        		var mostRecentTurnData = turnDataHistory[turnIndex];
        		//Start counting of score in the most Recent Turn's array to total the score	
        			var x, y; var whiteScore = 0; blackScore = 0;
					for (y=0; y < Object.keys(mostRecentTurnData['turnPieceData']).length; y++) {
					  for (x=0; x < Object.keys(mostRecentTurnData['turnPieceData'][y]).length; x++){
					    if (mostRecentTurnData['turnPieceData'][y][x] == 0){whiteScore +=1;}
					    else if (mostRecentTurnData['turnPieceData'][y][x] == 1){blackScore +=1;}
					    }}


						  
						   if (whiteScore + blackScore == 64){
						   		var winner;
						    	if (whiteScore > blackScore){winner = playerWhite;}
						    	else if (blackScore > whiteScore){winner = playerBlack;}
						    	else if (blackScore == whiteScore){winner = false} // For a tie
						    	PieceCollection.update({_id: gameId}, {
  									$set: { gameEnd: Date.now(), winner: winner }}, {upsert: true});
						    	return true;
						  }
						
							  else if (blackScore == 0 || whiteScore == 0){
							  	if (whiteScore > 2){winner = playerWhite}
								else if (blackScore >2){winner = playerBlack}
							    PieceCollection.update({_id: gameId}, {
	  								$set: { gameEnd: Date.now(), winner: winner }}, {upsert: true});
						    	return true;
							    }
							  
							    else {return false}
					
  							}
  							


  	}




  	

 

//Reference
// var currentGameSelector = {_id: "game1"};
  // var currentGameOptions = {_id: 0, gameData: 1};
  // var currentGameDocument = (PieceCollection.findOne(currentGameSelector, currentGameOptions));

  });
}//isServer Methods

//-----------------------------Subscriptions---------------------
if(Meteor.isClient) {
	Meteor.startup(function() {
 //     //TODO: Complete reactive session to verify collection is ready
 //     Session.set('data_loaded', false); //Using a reactive session to verify that the Collection is loaded
	
   Meteor.subscribe("messages");
   Meteor.subscribe("piece-collection");
   Meteor.subscribe("user-collection");

    		// var updateAvailable = Session.get('updateAvailable');
    		// console.log("I subscribed!")
    		// returnGameDocument();
    	
    	// if (pieceCollectionSubscription.ready()){
    	// 	returnGameDocument();
    	// }

	// Tracker.autorun(function autoRun(){
 //    	// return Session.get('updateAvailable');
 //    	console.log("Autorun");
 //    	// 	returnGameDocument();
 //    	// Session.set('updateAvailable', false);
 //    	// updateAvailable = Session.get('updateAvailable');
 //    	// Meteor.subscribe("piece-collection", function (){
 //    	// 	var updateAvailable = Session.get('updateAvailable');
 //    	// 	console.log("I subscribed!")
 //    	// 	returnGameDocument();
 //    	// 	Session.set('updateAvailable', updateAvailable + 1);	
	// 	    	 // });//Meteor.subscribe
 //    });//Tracker.autorun

	});//Meteor.startup
	}//isClient