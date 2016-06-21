//----------------------------Collections------------------------
ChatMessages = new Mongo.Collection("messages");
PieceCollection = new Mongo.Collection("piece-collection");

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
      $set: { gameData: changedGameData, playerTurn: currentPlayerTurn }}, {upsert: true});
  	},

  	'othello.readGameData'({gameId}) {
  		var readGameData = PieceCollection.findOne({_id: gameId}, {_id: 0, gameData: 1, playerTurn: 1});
  		return readGameData;
  	},
  	'othello.resetGameData' ({gameId}) {
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
  			$set: { gameData: initialData, playerTurn: 0, startDate: Date.now(), endDate: null }}, {upsert: true});

   		console.log("resetGameData ran");
   		ChatMessages.remove({_id: "game1"},); //{justOne: false}
  	}
//Reference
// var currentGameSelector = {_id: "game1"};
  // var currentGameOptions = {_id: 0, gameData: 1};
  // var currentGameDocument = (PieceCollection.findOne(currentGameSelector, currentGameOptions));

  });
}//Methods

//-----------------------------Subscriptions---------------------
if(Meteor.isClient) {
	Meteor.startup(function() {
 //     //TODO: Complete reactive session to verify collection is ready
 //     Session.set('data_loaded', false); //Using a reactive session to verify that the Collection is loaded
	
   Meteor.subscribe("messages");
   Meteor.subscribe("piece-collection", function (){});

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