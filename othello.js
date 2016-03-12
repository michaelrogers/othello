if (Meteor.isClient) {
  //Require username for players
Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });



// //Example helpers
//   // counter starts at 0
//   Session.setDefault('counter', 0);

//   Template.hello.helpers({
//     counter: function () {
//       return Session.get('counter');
//     }
//   });

//   Template.hello.events({
//     'click button': function () {
//       // increment the counter when button is clicked
//       Session.set('counter', Session.get('counter') + 1);
//     }
//   });




//defining layers for canvas
var layer1;
var layer2;

function init() {

layer1 = document.getElementById("canvas1");
context = layer1.getContext("2d");
layer2 = document.getElementById("canvas2");
contextPieces = layer2.getContext("2d");
//setInterval(drawAll, 20);
} 



//define and draw canvas grid after page load
window.onload = function drawAll(){
  init();
  //createCanvas();
  drawGrid();
  drawPieces();
}

// function createCanvas () {
// //grid width and height
// var bw = 400;
// var bh = 400;
// //padding around grid
// var p = 10;
// //size of canvas
// var cw = bw + (p * 2) + 1;
// var ch = bh + (p * 2) + 1;

// var canvas = $('<canvas/>').attr({
//   width: cw,
//   height: ch
// }).appendTo('body');
// }

function drawGrid() {
//var context = canvas1.get(0).getContext("2d");
//grid width and height
var bw = 400;
var bh = 400;
//padding around grid
var p = 10;




//draw vertical lines of grid
for (var x = 0; x <= bw; x += 50) {
    context.moveTo(0.4 + x + p, p);
    context.lineTo(0.4 + x + p, bh + p);
  }

//draw horizontal lines of grid
  for (var x = 0; x <= bh; x += 50) {
    context.moveTo(p, 0.5 + x + p);
    context.lineTo(bw + p, 0.5 + x + p);
  }

  context.strokeStyle = "#323232";
  context.lineWidth = 1;
  context.stroke();
  

}

function drawPieces() {
  //var contextPieces = canvas.get(0).getContext("2d");
  // var centerX = canvas1.width / 2;
  // var centerY = canvas1.height / 2;
  var radius = 20;
  var p = 10;
var xPosition = Math.floor((Math.random()*7));
var yPosition = Math.floor((Math.random()*7));

  var centerX = 25+p+50*xPosition;
  var centerY = 25+p+50*yPosition;


  var my_gradient = contextPieces.createRadialGradient(centerX, centerY, radius/1.5, centerX, centerY, radius);
  my_gradient.addColorStop(0, "white");
  my_gradient.addColorStop(1, "#cfcfcf");


  //contextPieces.clearRect(0, 0, WIDTH, HEIGHT);
  contextPieces.beginPath();
  contextPieces.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  contextPieces.fillStyle = my_gradient;
  contextPieces.fill();
  contextPieces.lineWidth = 2;
  contextPieces.strokeStyle = '#585858';
  contextPieces.stroke();

  
}

}



if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
  //*/
}


