PieceCollection = new Mongo.Collection("piece-collection");

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    serverInitialize();
  })



  function serverInitialize (){  
  console.log('Server started');
  if (PieceCollection.find().count() === 0) {
      console.log('Adding initial');        


PieceCollection.insert({
  _id: "game1",
  matrix: [
    {"0": [{"0": null}, {"1": null}, {"2": null}, {"3": null}, {"4": null}, {"5": null}, {"6": null}, {"7": null}]},
    {"1": [{"0": null}, {"1": null}, {"2": null}, {"3": null}, {"4": null}, {"5": null}, {"6": null}, {"7": null}]},
    {"2": [{"0": null}, {"1": null}, {"2": null}, {"3": null}, {"4": null}, {"5": null}, {"6": null}, {"7": null}]},
    {"3": [{"0": null}, {"1": null}, {"2": null}, {"3": 0}, {"4": 1}, {"5": null}, {"6": null}, {"7": null}]},
    {"4": [{"0": null}, {"1": null}, {"2": null}, {"3": 1}, {"4": 0}, {"5": null}, {"6": null}, {"7": null}]},
    {"5": [{"0": null}, {"1": null}, {"2": null}, {"3": null}, {"4": null}, {"5": null}, {"6": null}, {"7": null}]},
    {"6": [{"0": null}, {"1": null}, {"2": null}, {"3": null}, {"4": null}, {"5": null}, {"6": null}, {"7": null}]},
    {"7": [{"0": null}, {"1": null}, {"2": null}, {"3": null}, {"4": null}, {"5": null}, {"6": null}, {"7": null}]},
          ]
        });

       }
     }
    } //isServer