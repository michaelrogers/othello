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
var boardData;
function init() {

layer1 = document.getElementById("canvas1");
context = layer1.getContext("2d");
layer2 = document.getElementById("canvas2");
contextPieces = layer2.getContext("2d");
//setInterval(drawAll, 20);

//0 for white, 1 for black
//Initialize begininning board position
var row0 = [null,null,null,null,null,null,null,null],
    row1 = [null,null,null,null,null,null,null,null],
    row2 = [null,null,null,null,null,null,null,null],
    row3 = [null,null,null,0,1,null,null,null],
    row4 = [null,null,null,1,0,null,null,null],
    row5 = [null,null,null,null,null,null,null,null],
    row6 = [null,null,null,null,null,null,null,null],
    row7 = [null,null,null,null,null,null,null,null];

var boardPosition = [row0,row1,row2,row3,row4,row5,row6,row7];
//console.log(table[0][0]); // Get the first item in the array


}





 



//define and draw canvas grid after page load
window.onload = function drawAll(){
  init();
  //createCanvas();
  drawGrid();
  drawPieces();
}
//CODE BELOW TO CREATE THE CANVAS FROM THE JAVASCRIPT FILE INSTEAD OF HTML
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
    context.moveTo(p, 0.4 + x + p);
    context.lineTo(bw + p, 0.4 + x + p);
  }

  context.strokeStyle = "#323232";
  context.lineWidth = 1;
  context.stroke();
  }



function drawPieces() {
  var radius = 20;
  var p = 10;
  var cellWidth = 50;

// for (i=0; i < boardPosition.length; i++) {
//   for (j=0; j < boardPosition.length; j++){





    
//   }

// }



  var xPosition;
  var yPosition;
  xPosition = Math.floor((Math.random()*8)); 
  yPosition = Math.floor((Math.random()*8));
  //implement random positioning within cell for added interest and analog feel
  //uses a random number generator to vary between a value -1 to +1
  var randomX = Math.floor((Math.random()*3))-1;
  var randomY = Math.floor((Math.random()*3))-1;
  console.log("xPosition = "+xPosition);
  console.log("yPosition = "+yPosition);
  console.log("randomX = "+randomX);
  console.log("randomY = "+randomY);
  // xPosition += randomX;
  // yPosition += randomY;


  var centerX = cellWidth/2+p+randomX+cellWidth*xPosition;
  var centerY = cellWidth/2+p+randomY+cellWidth*yPosition;
  var my_gradient = contextPieces.createRadialGradient(centerX, centerY, radius/1.5, centerX, centerY, radius);
  










  var pieceColor = Math.random();
  if (pieceColor <= 0.5) {
  //White piece gradient
  my_gradient.addColorStop(0, "white");
  my_gradient.addColorStop(1, "#cfcfcf");
  contextPieces.strokeStyle = '#404040';  //Old value #585858
    }
    else {
     //Black piece gradient
  my_gradient.addColorStop(0, "#202020");
  my_gradient.addColorStop(1, "black");
  contextPieces.strokeStyle = '#E0E0E0';
    }

    //draw circle with gradient fill
  contextPieces.beginPath();
  contextPieces.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  contextPieces.fillStyle = my_gradient;
  contextPieces.fill();
  contextPieces.lineWidth = 2;
  





  contextPieces.stroke();
}
}




if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  // var pieceData {

  // }



  });
  //*/
}


