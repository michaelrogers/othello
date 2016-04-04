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

var playerTurn;
//Wait for window load before calling initial functions
window.onload = function drawAll(){
  init();
  setInitialPosition();
  drawGrid();
  readArray();
  
  // createCanvasChart();
}

function init() {
//layer 1 = board with lines
layer1 = document.getElementById("canvas1");
context = layer1.getContext("2d");
//layer 2 = pieces
layer2 = document.getElementById("canvas2");
contextPieces = layer2.getContext("2d");
layer2.addEventListener("mousedown",listenMouseDown, false);
playerTurn = 0; //white
document.getElementById("resetButton").addEventListener("click", function(){
  clearArray();
  setInitialPosition();
  readArray();
  if (playerTurn == 1){
    switchTurn();
  }
  });
}
//setInterval(drawAll, 20);
//Initialize beginning board position
//0 for white, 1 for black




function setInitialPosition(){

var row0 = [null,null,null,null,null,null,null,null],
    row1 = [null,null,null,null,null,null,null,null],
    row2 = [null,null,null,null,null,null,null,null],
    row3 = [null,null,null,0,1,null,null,null],
    row4 = [null,null,null,1,0,null,null,null],
    row5 = [null,null,null,null,null,null,null,null],
    row6 = [null,null,null,null,null,null,null,null],
    row7 = [null,null,null,null,null,null,null,null];
//Define 2d array
boardPosition = [row0,row1,row2,row3,row4,row5,row6,row7];
}

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
//Reads the initialized array and draws the start position
var x, y;
for (y=0; y < boardPosition.length; y++) {
  for (x=0; x < boardPosition[y].length; x++){
    if (boardPosition[y][x] !== null) {
      xPosition = x;
      yPosition = y;
      drawPieces();
    }}}
  }
function clearArray(){
  var x, y;
  for (y=0; y < boardPosition.length; y++) {
    for (x=0; x < boardPosition[y].length; x++){
      
      if (boardPosition[y][x] == 1 | boardPosition[y][x] == 0) {
        boardPosition[y][x] = null;
        xPosition = x;
        yPosition = y;
        drawPieces();
        }}}
}


function listenMouseDown () {
  //Get canvas offset using jQuery to get a relative mouse position
  var canvasOffset=$("#canvas2").offset();
  var offset_x = canvasOffset.left;
  var offset_y = canvasOffset.top;

  //Remove ofset from pageX and pageY to get an accurate position
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
  //addPiece(cell_x, cell_y);
  validMove();
  }
  else {
    console.log("Out of bounds");
    document.getElementById("messages").innerHTML = "Out of bounds";
  }
}

function switchTurn (){
  //switches the player turn and then updates h3 with id="turn"
  var playerText = "";
  if (playerTurn == 0) {
    //Takes white's turn and switches to black's
    playerTurn = 1;
    playerText = "Black's turn";
  } 
  //Takes black's turn and switches to white's
  else if (playerTurn == 1) {
    playerTurn = 0;
    playerText = "White's turn";
  }
  console.log("Switch turn");
  document.getElementById("turn").innerHTML = playerText;
  document.getElementById("messages").innerHTML = "Please proceed!";
}

function validMove(){
  var noOppositeMatch = true;
  //Bypass move validation when there is already a piece in the square
  if (boardPosition[cell_y][cell_x] == 1 | boardPosition[cell_y][cell_x] == 0){addPiece();return false;}

  else if (boardPosition[cell_y][cell_x] == null){
    for (dx = -1; dx <= 1; dx++){
        for (dy = -1; dy <=1; dy++){
          if (typeof boardPosition[cell_y+dy] != 'undefined' && typeof boardPosition[cell_y+dy][cell_x+dx] != 'undefined'){
            var adjacentCellValue = boardPosition[cell_y+dy][cell_x+dx];
            //Evaluating for the opposite of playerTurn value
            if (adjacentCellValue != playerTurn && typeof adjacentCellValue != 'undefined' && adjacentCellValue != null){
              addPiece();
              //Only need one opposite color to make a valid move
              noOppositeMatch = false;
              //Prevent occassional piece color unpredictability
              return false;
              }
            }
          }      
        }                  
      }
    if (noOppositeMatch) {
      document.getElementById("messages").innerHTML = "Invalid Move: Can't let you do that star fox!";
      console.log("Invalid move"); 
    }
  }

function addPiece () {
//Testing add piece by alternating between white, black, and null on click
  var thisCell = boardPosition[cell_y][cell_x];
  //var flipAfterDraw = false;
  if (thisCell == null){
    boardPosition[cell_y][cell_x] = playerTurn;
    //Move flip function to after draw 
    //Believe I can return this to default behavior, changed due to troubleshooting. 
    //TODO: remove flipAfterDraw and call switchTurn() after setting the new value
    //flipAfterDraw = true;
     switchTurn();  
    }
  //Leaving manual flipping functionality in place
  else if (thisCell == 0){
    boardPosition[cell_y][cell_x] = 1;
    }
  else if (thisCell == 1){ //This will be commented out eventually, used for testing
    boardPosition[cell_y][cell_x] = 0;
    }
  xPosition = cell_x;
  yPosition = cell_y;
  drawPieces();
}

//define and draw canvas grid after page load

//FOR USE LATER FOR CANVAS CHART
//Code to createCanvasChart for eventual graphing of playerPieceCount
// function createCanvasChart () {
// //grid width and height
// var bw = 400;
// var bh = 40;
// //padding around grid
// //var p = 10;
// //size of canvas
// var cw = bw + (p * 2);
// var ch = bh;

// var canvas = $('<canvas/>').attr({
//   width: cw,
//   height: ch,
//   id: "barChart"
// }).appendTo("#boardChart");
// }

function drawPieces() {
  var radius = 20;
  p = 10;
  cellWidth = 50;
  //implement random positioning within cell for added interest and analog feel
  //uses a random number generator to vary between a value -1 to +1
  var randomX = Math.floor((Math.random()*3))-1;
  var randomY = Math.floor((Math.random()*3))-1;
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

  //draw circle with gradient fill
  contextPieces.clearRect(centerX-25,centerY-25,50,50);
  contextPieces.beginPath();
  contextPieces.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  contextPieces.fillStyle = my_gradient;
  contextPieces.lineWidth = 1;
  contextPieces.fill();
  contextPieces.stroke();
  //document.getElementById("messages").innerHTML = "Please proceed!";
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


