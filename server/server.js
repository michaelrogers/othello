
if (Meteor.isServer) {
  Meteor.startup(function () {
    //PieceCollection.ready();
    // code to run on server at startup
    serverInitialize();
    });

  function serverInitialize (){  
  // if (PieceCollection.find().count() === 0) {
      // console.log('Adding initial');   
      var currentGameId = "game1";
     Meteor.call('othello.resetGameData', { gameId: currentGameId } , (err, res) => {
            if (err) {console.log("Error: \n" + err);                }
             else {
                    // console.log("Result: \n" + res);  
                }
              });





  // var serverData = { //Initial starting positions in object literal notation
  //   0: {0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null},
  //   1: {0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null}, 
  //   2: {0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null}, 
  //   3: {0: null, 1: null, 2: null, 3: 0, 4: 1, 5: null, 6: null, 7: null}, 
  //   4: {0: null, 1: null, 2: null, 3: 1, 4: 0, 5: null, 6: null, 7: null}, 
  //   5: {0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null}, 
  //   6: {0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null}, 
  //   7: {0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null} 
  //      };
  //   //NOTES:
  //   //"3": [{0: null}, {1: null}, {2: null}, {3: 1}, {4: 1}, {5: null}, {6: null}, {7: null}], //Note: This format returns the object associated with the index instead of the field value.
  //   //"0": {{"0": null}, {"1": null}, {"2": null}, {"3": null}, {"4": null}, {"5": null}, {"6": null}, {"7": null}}, //Note: improper format
  //   //"1": [null,null,null,1,0,null,null,null], //NOTE: Calls to arrays in objects work properly, but sticking with JSON
       
  //       // }; //PieceCollection
  //     Meteor.call('othello.updateGameData', { gameId: currentGameId, changedGameData: serverData } , (err, res) => {
  //           if (err) {console.log("Error: \n" + err);                }
  //            else {// console.log("Result: \n" + res);  
  //               console.log("Initial DB Data Updated")
  //               }
  //             });

        //PieceCollection.update({_id: "game1"}, { $set: {gameData: serverData}}, {upsert: true});
        // console.log(PieceCollection.findOne({_id: "game1"},{"gameData": 1, _id: 0}));
          
          // var pieceObject = PieceCollection.findOne({_id: "game1"},{gameData: 1, _id: 0});
          //   console.log(pieceObject);
          // var thisPiece = pieceObject["gameData"]["1"]["4"];
          //   console.log(thisPiece);

          // console.log(PieceCollection.findOne({_id: "game1"},{$inc: {'gameData'[2][1': 1 , _id: 0}}));
          // console.log(JSON.parse(PieceCollection.findOne({_id: "game1"},{'gamedata.2.1': 1 ,_id: 0}));
          // JSON.parse(PieceCollection.findOne({_id: "game1"},{'gamedata.0.1': 1 ,_id: 0});
        
      // }//If empty
     }//ServerInit
    } //isServer