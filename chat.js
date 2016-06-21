
if (Meteor.isClient) {
      Template.messages.helpers({
        messages: function() {
            // var game_Id = Session.get('game_Id');
            return ChatMessages.find({_id: "game1"}, { sort: { time: 1}}, function (){});
            }
           });

    Template.input.events = {
      'keydown input#message' : function (event) {
        if (event.which == 13) { // Enter or return key event
          if (Meteor.user())
            var name = Meteor.user().username;
          else
            var name = 'Guest'; //Comment out after testing
          var message = document.getElementById('message');
          if (message.value != '') {
              var game_Id = Session.get('game_Id');
            ChatMessages.insert({
              _id: "game1",
              username: name,
              message: message.value,
              time: Date.now(),
              });
              // event.stopPropagation();
              document.getElementById('message').value = ''; //Clear message element after insert
              // message.value = '';
              // $('#chat-message').animate({ scrollTop: $('#chat-end').offset().top }, 'slow');
              }
            }
          }
        }

  ChatMessages.find().observeChanges({
    added: function () {
      $('#chat-message').animate({ scrollTop: $('#chat-end').offset().top }, 'fast'); //Ascending order; newest messages on bottom
      event.stopPropagation();
    }
    });

}//isClient