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
    var turn_Id = Date.now()
    var currentTurn = '';
    if (currentPlayerTurn == 0){currentPlayerTurn = 1;}
    else if (currentPlayerTurn == 1){currentPlayerTurn = 0;}
   	
   	PieceCollection.update({_id: gameId}, {
      $addToSet: { turnDataArray: {date: Date.now(), turnPieceData: changedGameData, playerTurn: currentPlayerTurn}}});
      // $push: { turnData: {turn_Id: Date.now(), turnData: changedGameData, playerTurn: currentPlayerTurn}}});
  	

  	},

  	'othello.readGameData'({gameId}) {
  		var readGameDocument = PieceCollection.findOne({_id: gameId}, {_id: 0, turnDataArray: 1 });
  		
  		
        var turnDataArray = readGameDocument['turnDataArray']
        // console.log(turnDataArray);
        var maxDate = 0;
        var turnIndex;
        for (x=0; x<turnDataArray.length; x++){
          if (turnDataArray[x]['date'] > maxDate){maxDate = turnDataArray[x]['date']; turnIndex = x;}
        }
        console.log('Seconds ago: ' + (Date.now()-maxDate)/1000);

        var currentGameData = turnDataArray[turnIndex]; //define the currentGameObject for readCollection to use
        
  		return currentGameData;
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
  			// $set: { gameData: {turn_id: date.Now() {turnData: initialData, playerTurn: 0}, startDate: Date.now(), endDate: null }}, {upsert: true});
  			$set: { turnDataArray: [{date: Date.now(), turnPieceData: initialData, playerTurn: 0}], gameStart: Date.now(), gameEnd: null }}, {upsert: true});

   		console.log("resetGameData ran");
   		ChatMessages.remove({_id: "game1"},); //{justOne: false}
  	},
  	'othello.generateGameId' ({userId}) {
  		var gameId = new Mongo.ObjectId().valueOf(); //Mongo.ObjectID();
  		// console.log(gameId);
  		
  		Meteor.call('othello.resetGameData', { gameId: gameId } , (err, res) => {
            if (err) {console.log("Error: \n" + err);}
            else {console.log("Successfully set _id to: " + gameId)}
        });
        return gameId;
  	},
  	'othello.joinGame' ({userId, gameId}){
  		//TODO: add a database call to retrieve where the users are stored





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
   Meteor.subscribe('user-collection');

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