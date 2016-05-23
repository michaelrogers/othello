//----------------------------Collections------------------------
ChatMessages = new Mongo.Collection("messages");
PieceCollection = new Mongo.Collection("piece-collection");

//-----------------------------Publish---------------------------
if(Meteor.isServer) {
	Meteor.publish("messages", function(){
		return ChatMessages.find();
	});
	Meteor.publish("piece-collection", function(){
		return PieceCollection.find();
	});

}
//-----------------------------Methods---------------------------

Meteor.methods({
  'othello.updateGameData'({ gameId, changedGameData }) {
    // new SimpleSchema({
    //   gameId: { type: String },
    //   changedGameData: { type: Object }
    // }).validate({ gameID, changedGameData });
    
   PieceCollection.update({_id: gameId}, {
      $set: { gameData: changedGameData }}, 
    	{upsert: true});
  	}
  });


//-----------------------------Subscriptions---------------------
if(Meteor.isClient) {
	// Meteor.startup(function() {
 //     //TODO: Complete reactive session to verify collection is ready
 //     Session.set('data_loaded', false); //Using a reactive session to verify that the Collection is loaded
 //  		}); 

    Meteor.subscribe("messages");
    Meteor.subscribe("piece-collection", function (){Session.set('data_loaded', true);});
	}