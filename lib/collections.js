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
  'othello.updateGameData'({ gameId, changedGameData }) {
    // new SimpleSchema({
    //   gameId: { type: String },
    //   changedGameData: { type: Object }
    // }).validate({ gameID, changedGameData });
    
   	PieceCollection.update({_id: gameId}, {
      $set: { gameData: changedGameData }}, {upsert: true});
   		// Session.set('updateAvailable',true);
		// if(Meteor.isClient){returnGameDocument(); Session.set('updateAvailable',true); }
  	},

  	'othello.readGameData'({gameId}) {
  		var readGameData = PieceCollection.findOne({_id: gameId}, {_id: 0, gameData: 1});
  		return readGameData;
  		// if(Meteor.isClient){Session.set('updateAvailable',false);}
  	}
  });
}

//-----------------------------Subscriptions---------------------
if(Meteor.isClient) {
	Meteor.startup(function() {
 //     //TODO: Complete reactive session to verify collection is ready
 //     Session.set('data_loaded', false); //Using a reactive session to verify that the Collection is loaded
  		Session.set('updateAvailable', 0);
  		
	
    Meteor.subscribe("messages");
    // Session.set('updateAvailable',false)

	Tracker.autorun(function autoRun(){
    	// return Session.get('updateAvailable');
    	console.log("Autorun");
    	var updateAvailable = Session.get('updateAvailable');
    	console.log(updateAvailable);
    	// Meteor.subscribe("piece-collection", function (){
    	// 	var updateAvailable = Session.get('updateAvailable');
    	// 	console.log("I subscribed!")
    	// 	returnGameDocument();
    	// Session.set('updateAvailable', false);
    	// updateAvailable = Session.get('updateAvailable');
    	// Meteor.subscribe("piece-collection", function (){
    	// 	var updateAvailable = Session.get('updateAvailable');
    	// 	console.log("I subscribed!")
    	// 	returnGameDocument();
    	// 	Session.set('updateAvailable', updateAvailable + 1);	
		    	 // });//Meteor.subscribe
    });//Tracker.autorun
    }); 
	}//isClient