ChatMessages = new Mongo.Collection("messages");
PieceCollection = new Mongo.Collection("piece-collection");

// if(Meteor.isClient) {
//     Meteor.subscribe("ChatMessages");
//     Meteor.subscribe("piece-collection");   
// }