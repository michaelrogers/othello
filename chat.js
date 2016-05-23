
if (Meteor.isClient) {
      Template.messages.helpers({
        messages: function() {
            return ChatMessages.find({}, { sort: { time: 1}}, function (){

            });
            $('#chat-message').animate({ scrollTop: $('#chat-end').offset().top }, 'slow'); //Ascending order; newest messages on bottom
           }
           });

    Template.input.events = {
      'keydown input#message' : function (event) {
        if (event.which == 13) { // Enter key event
          if (Meteor.user())
            var name = Meteor.user().username;
          else
            var name = 'Guest'; //Comment out after testing
          var message = document.getElementById('message');
          if (message.value != '') {
            ChatMessages.insert({
              username: name,
              message: message.value,
              time: Date.now(),
              });
              $('#chat-message').animate({ scrollTop: $('#chat-end').offset().top }, 'slow');
              // event.stopPropagation();
              document.getElementById('message').value = ''; //Clear message element after insert
              // message.value = '';

              }
        }
      }
    }

}