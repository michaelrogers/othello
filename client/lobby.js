if (Meteor.isClient){

// window.onload = function() {
// 	if(Session.get("gameId") === "null" || Session.get("gameId") === undefined ){
// 		$(document).ready(lobbyInit);

// 		console.log("lobby");
// 	}

// 	}


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




lobbyInit = function lobbyInit(){ //Declaring this function to be globally accessible
// document.getElementById('lobby').addEventListener("click", function(){setSession(null)});
 $(document).ready(function(){
 	//Join button
 document.getElementById('joinButton').addEventListener("click", function(){joinGame(null);});

 document.title = "Othello";

 console.count("lobbyInit");
    $('#matchListScroll').delegate('div', 'click', function() {
      console.log($(this).attr('id'));
      joinGame($( this ).attr( 'id' ));
   		});
  
});
}
function generateGameId() {
  if (Meteor.user()){
  Meteor.call('othello.generateGameId', { userId: Meteor.user().username } , (err, res) => {
            if (err) {console.log("Error: \n" + err);}
            else {
              currentGameId = res;
              console.log("Generated: "+ currentGameId);
              setSession(res);
              // returnGameDocument();
             }
              
          });
    }
  }
function joinGame(gameId) {
  if (Meteor.user()){
  Meteor.call('othello.joinGame', {userId: Meteor.user().username, gameId: gameId}, (err, res) => {
    if (err) {console.log("Error: \n" + err);}
    else {currentGameId = res; 
      console.log("Joined: "+ currentGameId); 
      setSession(res); 
      // Session.set('gameId', res);
      // Tracker.flush();
   	}
   });
  }
}
function setSession(gameId){
  console.count("lobby setSession")
  if (gameId == null){
    console.log('nullify')
    Session.clear('gameId')
    sessionStorage.clear('gameId')
  }
  else {
  console.count("setSession");
  Session.set('gameId', gameId);
  sessionStorage.setItem('gameId', gameId);

  }
}

}// end isClient