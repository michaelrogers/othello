
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
          if (Meteor.user())
            var name = Meteor.user().username;
          else
            return false;
            // var name = 'Guest'; //Comment out after testing
          var message = document.getElementById('message');
          if (message.value != '') {
            var gameId = Session.get('gameId');
            if (gameId == undefined){return false}
            ChatMessages.insert({
              gameId: gameId,
              username: name,
              message: message.value,
              time: Date.now()
              });
              $('#chat-message').animate({ scrollTop: $('#chat-end').offset().top }, 'fast'); //Ascending order; newest messages on bottom
               // event.stopPropagation();
         
              document.getElementById('message').value = ''; //Clear message element after insert
              // message.value = '';
              // $('#chat-message').animate({ scrollTop: $('#chat-end').offset().top }, 'slow');
              }
            }
          }
        }
      if (typeof Session.get('gameId') !== 'undefined'){
        ChatMessages.find({gameId: Session.get('gameId')}).observeChanges({
          added: function () {
            $('#chat-message').animate({ scrollTop: $('#chat-end').offset().top }, 'fast'); //Ascending order; newest messages on bottom
          }
          });
          }
}//isClient
// NOTES:
// $("input[type=text]").focus(function(){$(this).css("background","#ffffff");});
