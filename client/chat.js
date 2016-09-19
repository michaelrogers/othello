if (Meteor.isClient) {
  Template.chatMessagesTemplate.helpers({
    messages: function() {
        var gameId = Session.get('gameId');
        if (gameId !== undefined && gameId !== null){
        // console.log('Chat gameId: '+ gameId);
        // $('#chat-message').animate({ scrollTop: $('#chat-end').offset().top }, 'fast'); //Ascending order; newest messages on bottom
          return ChatMessages.find({gameId: gameId}, { sort: { time: 1}});
        }
        else { return [{username: "", message: "You are not connected to a game."}];}
    }

  });
  
  Template.input.events = {
    'keydown input#message' : function (event) {
      if (event.which == 13) { // Enter or return key event
        if (Meteor.user()) {var name = Meteor.user().username;}
        else {return false;}
          // var name = 'Guest'; //Comment out after testing
        var message = document.getElementById('message');
        if (message.value != '') {
          var gameId = Session.get('gameId');
          if (gameId == undefined){return false;}
            if (Meteor.user()){
              Meteor.call('othello.chatMessageInsert', {gameId: gameId, username: Meteor.user().username, message: message.value} , (err, res) => {
                if (err) {console.log('Error: \n' + err);}
                else {}
                });
            }
          // ChatMessages.insert({
          //   gameId: gameId,
          //   username: name,
          //   message: message.value,
          //   time: Date.now()
          // });
            message.value = ''; //Clear message element after insert
            $('#chat-message').animate({ scrollTop: $('#chat-end').offset().top }, 'slow'); //Ascending order; newest messages on bottom
            event.stopPropagation();
          }
        }
      }
    }
     
}//isClient

// NOTES:
 // if (typeof Session.get('gameId') !== 'undefined'){
      //   $(document).ready(function(){
      //   ChatMessages.find({gameId: (Session.get('gameId'))}).observeChanges({
      //     added: function () {
      //       console.count('Chat listener triggered')
      //       $('#chat-message').animate({ scrollTop: $('#chat-end').offset().top }, 'fast'); //Ascending order; newest messages on bottom
      //        event.stopPropagation();

      //     }
      //     });
      // });
      //     }