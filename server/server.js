
if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    serverInitialize();
  
//     //
// var row0 = [null,null,null,null,null,null,null,null],
//     row1 = [null,null,null,null,null,null,null,null],
//     row2 = [null,null,null,null,null,null,null,null],
//     row3 = [null,null,null,0,1,null,null,null],
//     row4 = [null,null,null,1,0,null,null,null],
//     row5 = [null,null,null,null,null,null,null,null],
//     row6 = [null,null,null,null,null,null,null,null],
//     row7 = [null,null,null,null,null,null,null,null];
// //Define 2d array
// boardPosition = [row0,row1,row2,row3,row4,row5,row6,row7];
// // new ReactiveVar(boardPosition);
// console.log(boardPosition);

});
  

  function serverInitialize (){  
  // console.log('Server started');
  // if (PieceCollection.find().count() === 0) {
      console.log('Adding initial');        

// var row0 = [null,null,null,null,null,null,null,null],
//     row1 = [null,null,null,null,null,null,null,null],
//     row2 = [null,null,null,null,null,null,null,null],
//     row3 = [null,null,null,0,1,null,null,null],
//     row4 = [null,null,null,1,0,null,null,null],
//     row5 = [null,null,null,null,null,null,null,null],
//     row6 = [null,null,null,null,null,null,null,null],
//     row7 = [null,null,null,null,null,null,null,null];
var objectforCollection = {
  _id: "game1",
  gameData: [
    // "0": {{"0": null}, {"1": null}, {"2": null}, {"3": null}, {"4": null}, {"5": null}, {"6": null}, {"7": null}},
    // "1": [null,null,null,null,null,null,null,null],
    // "2": {"0": null, "1": null, "2": null, "3": null, "4": null, "5": null, "6": null, "7": null},
    {3: [{0: null}, {1: null}, {2: null}, {3: null}, {4: 1}, {5: null}, {6: null}, {7: null}]}
    // "4": {"0": {"value": null}, "1": {"value": null}, "2": {"value": null}, "3": {"value": null}, "4": {"value": null}, "5": {"value": null}, "6": {"value": null}, "7": {"value": null}},
    // "5": {"0": {"value": null}, "1": {"value": null}, "2": {"value": null}, "3": {"value": null}, "4": {"value": null}, "5": {"value": null}, "6": {"value": null}, "7": {"value": null}},
    // "6": {"0": {"value": null}, "1": {"value": null}, "2": {"value": null}, "3": {"value": null}, "4": {"value": null}, "5": {"value": null}, "6": {"value": null}, "7": {"value": null}},
    // "7": {"0": {"value": null}, "1": {"value": null}, "2": {"value": null}, "3": {"value": null}, "4": {"value": null}, "5": {"value": null}, "6": {"value": null}, "7": {"value": null}},
          ]
       
        }; //PieceCollection
        PieceCollection.update({_id: "game1"}, { $set: { objectforCollection}}, {upsert: true})
          //PieceCollection.findOne({_id: "game1"},{'gameData.3.4.$': 1 ,_id: 0})
          
          // console.log(PieceCollection.findOne({_id: "game1"},{$inc: {'gameData'[2][1': 1 , _id: 0}}));
          // console.log(JSON.parse(PieceCollection.findOne({_id: "game1"},{'gamedata.2.1': 1 ,_id: 0}));
          // JSON.parse(PieceCollection.findOne({_id: "game1"},{'gamedata.0.1': 1 ,_id: 0});
    
      // }//If empty
     }//ServerInit
    } //isServer