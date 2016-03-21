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
var boardPosition; //Holds 2d array of piece data
var my_gradient;
//Global variables instantiated for use in translateCoordinate and drawPieces
var xPosition;
var yPosition;
var cellWidth;
var p;
// Global for addPiece function
var cell_x;
var cell_y;

function init() {
//layer 1 = board with lines
layer1 = document.getElementById("canvas1");
context = layer1.getContext("2d");
//layer 2 = pieces
layer2 = document.getElementById("canvas2");
contextPieces = layer2.getContext("2d");
layer2.addEventListener("mousedown",listenMouseDown, false);

function listenMouseDown () {
  //Get canvas ofset using jQuery to get a relative mouse position
  var canvasOffset=$("#canvas2").offset();
  var offset_x = canvasOffset.left;
  var offset_y = canvasOffset.top;


  canvas_x = Math.round(event.pageX - offset_x);
  canvas_y = Math.round(event.pageY - offset_y);
  //console.log ("Mouse Click" + "\n" + "X: "+canvas_x+" Y: "+canvas_y);
  translateCoordinate(canvas_x,canvas_y);
}

function translateCoordinate (){
  
//Determines which cell the coordinate from mouse listener belongs to
  cell_x = Math.floor((canvas_x-p)/cellWidth);
  cell_y = Math.floor((canvas_y-p)/cellWidth);
  console.log ("Mouse x: " + canvas_x  + " y: " + canvas_y + "\n" + " Map x: "+cell_x+" y: "+cell_y);

  //console.log ("Mouse Click" + "\n" + "X: "+canvas_x+" Y: "+canvas_y);
  //Remove erroneous coordinates like outside the grid in the padding
  if (0 <= cell_x && cell_x < 8 && 0 <= cell_y && cell_y < 8){
  addPiece(cell_x, cell_y);
  }
  else {
    console.log("Out of bounds");
  }
}

function addPiece () {
  var thisCell = boardPosition[cell_y][cell_x];
  if (thisCell == null){
    boardPosition[cell_y][cell_x] = 0;
  }
  else if (thisCell == 0){
    boardPosition[cell_y][cell_x] = 1;
  }
  else if (thisCell == 1){ //This will be commented out eventually, used for testing
    boardPosition[cell_y][cell_x] = null;
  }
  xPosition = cell_x;
  yPosition = cell_y;
  drawPieces();
}



//setInterval(drawAll, 20);

//0 for white, 1 for black
//Initialize beginning board position
var row0 = [null,null,null,null,null,null,null,null],
    row1 = [null,null,null,null,null,null,null,null],
    row2 = [null,null,null,null,null,null,null,null],
    row3 = [null,null,null,0,1,null,null,null],
    row4 = [null,null,null,1,0,null,null,null],
    row5 = [null,null,null,null,null,null,null,null],
    row6 = [null,null,null,null,null,null,null,null],
    row7 = [null,null,null,null,null,null,null,null];

boardPosition = [row0,row1,row2,row3,row4,row5,row6,row7];
//console.log(table[0][0]); // Get the first item in the array
}


//define and draw canvas grid after page load
window.onload = function drawAll(){
  init();
  //createCanvas();
  drawGrid();
  //drawPieces();
  readArray();
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




function readArray(){
var x, y;
for (y=0; y < boardPosition.length; y++) {
  for (x=0; x < boardPosition[y].length; x++){
    
    xPosition = x;
    yPosition = y;
    if (boardPosition[y][x] !== null) {
    drawPieces();
    }}}
  

}



function drawPieces() {
  var radius = 20;
  p = 10;
  cellWidth = 50;


  //implement random positioning within cell for added interest and analog feel
  //uses a random number generator to vary between a value -1 to +1
  var randomX = Math.floor((Math.random()*3))-1;
  var randomY = Math.floor((Math.random()*3))-1;
  //console.log("Draw in Cell"+"\n"+"x:" +xPosition + " y: "+yPosition);
  //console.log("randomX = "+randomX);
  //console.log("randomY = "+randomY);



  var centerX = cellWidth/2+p+randomX+cellWidth*xPosition;
  var centerY = cellWidth/2+p+randomY+cellWidth*yPosition;
  var my_gradient = contextPieces.createRadialGradient(centerX, centerY, radius/1.5, centerX, centerY, radius);
  
  if (boardPosition[yPosition][xPosition] == 0) {

  //White piece gradient
  my_gradient.addColorStop(0, "white");
  my_gradient.addColorStop(1, "#cfcfcf");
  contextPieces.strokeStyle = '#404040';  //Old value #585858
    }
    

  else if (boardPosition[yPosition][xPosition] == 1){
     //Black piece gradient
  my_gradient.addColorStop(0, "#202020");
  my_gradient.addColorStop(1, "black");
  contextPieces.strokeStyle = '#b3b3b3'; //'#E0E0E0'
    }

  else if (boardPosition[yPosition][xPosition] == null){
    //Clear existing piece and exit function
    contextPieces.clearRect(centerX-25,centerY-25,50,50);
    return false;
    }

  // var pieceColor = Math.random();
  // if (pieceColor <= 0.5) {
  // //White piece gradient
  // my_gradient.addColorStop(0, "white");
  // my_gradient.addColorStop(1, "#cfcfcf");
  // contextPieces.strokeStyle = '#404040';  //Old value #585858
  //   }
  //   else {
  //    //Black piece gradient
  // my_gradient.addColorStop(0, "#202020");
  // my_gradient.addColorStop(1, "black");
  // contextPieces.strokeStyle = '#E0E0E0';
  //   }

    //draw circle with gradient fill
  contextPieces.clearRect(centerX-25,centerY-25,50,50);
  contextPieces.beginPath();
  contextPieces.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  contextPieces.fillStyle = my_gradient;
  contextPieces.lineWidth = 1;
  contextPieces.fill();
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


