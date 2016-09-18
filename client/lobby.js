if (Meteor.isClient){

  function lobbyInit(){ //Declaring this function to be globally accessible
    $(document).ready(function(){
    //Join button
      document.getElementById('joinButton').addEventListener('click', function(){joinGame(null);});
      document.title = 'Lobby - Othello';
      // console.count("lobbyInit");
      $('#matchListScroll').delegate('div', 'click', function() { //TODO: Research compatability of .on() method in place of .delegate()
        // console.log($(this).attr('id'));
        joinGame($(this).attr('id'));
      });
    });
  };

  function generateGameId() {
    if (Meteor.user()){
      Meteor.call('othello.generateGameId', { userId: Meteor.user().username } , (err, res) => {
        if (err) {console.log('Error: \n' + err);}
        else {
          // currentGameId = res;
          // console.log("Generated: "+ currentGameId);
          setSession(res);
          }
                
      });
    }
  }
  function joinGame(gameId) {
    if (Meteor.user()){
      Meteor.call('othello.joinGame', {userId: Meteor.user().username, gameId: gameId}, (err, res) => {
        if (err) {console.log('Error: \n' + err);}
        else {//currentGameId = res; 
          // console.log("Joined: "+ currentGameId); 
          setSession(res); 
        
        }
      });
    }
  }
  function setSession(gameId){
    if (gameId == null){
      Session.clear('gameId');
      sessionStorage.clear('gameId');
    }
    else {
    Session.set('gameId', gameId);
    sessionStorage.setItem('gameId', gameId);
    }
  }
  export {lobbyInit}; //export lobbyInit to template.js to control session
}// end isClient

//----------------------------------------------NOTES---------------------------------------
// window.onload = function() {
//  if(Session.get("gameId") === "null" || Session.get("gameId") === undefined ){
//    $(document).ready(lobbyInit);
//    console.log("lobby");
//  }
//  }

// Tracker.autorun(function(){
//   var sessionState = Session.get("gameId");
  //   console.log("Session State: "+sessionState);
//   setSession(Session.get("gameId"));
//   if (Session.get("gameId") === "null" || Session.get("gameId") === undefined ){
//     var sessionState = Session.get("gameId");
//     // window.onload = function (){
//       $(document).ready(lobbyInit);
//     // }
//   }
// });