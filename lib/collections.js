//----------------------------Collections------------------------
ChatMessages = new Mongo.Collection("messages");
PieceCollection = new Mongo.Collection("piece-collection");
//-----------------------------Methods---------------------------




//-----------------------------Subscriptions---------------------
if(Meteor.isClient) {
    Meteor.subscribe("ChatMessages");
    Meteor.subscribe("PieceCollection");   
	}