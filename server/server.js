
if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    // serverInitialize();
    });

  function serverInitialize (){ 

    }
     
    } //isServer

//--------------------------------------Notes-------------------------------------------
      // console.log(PieceCollection.findOne({_id: "game1"},{$inc: {'gameData'[2][1': 1 , _id: 0}}));
      // console.log(JSON.parse(PieceCollection.findOne({_id: "game1"},{'gamedata.2.1': 1 ,_id: 0}));
      // JSON.parse(PieceCollection.findOne({_id: "game1"},{'gamedata.0.1': 1 ,_id: 0});
