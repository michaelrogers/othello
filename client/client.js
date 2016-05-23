if (Meteor.isClient) {
  //Require username for players
Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
Session.set('data_loaded', false);

//Global for access from console
var debugErrorMessage = false;
var currentGameId = "game1";
//defining layers for canvas
var layer1, layer2;
//Canvas variables for window resizing
var cellWidth, padding, radius;
//Local gamePiece Data
var boardPosition; //Holds 2d array of piece data
var flipCoordinate_x = [], flipCoordinate_y = []; //Temporary coordinate array for holding pieces that need to be flipped
//States
var intSet; //Used in interval delay function
var clickInputAccepted = true; //Used to lock the player while setInterval is repeating/flipping
var gameOn = true;
var playerTurn;
var currentGameObject;
//Wait for window load before calling initial functions
window.onload = function drawAll(){
  init();
  setInitialPosition();
  drawGrid();
  // readArray();
  globalDebug();
  readCollection();  
  $('#chat-message').animate({ scrollTop: $('#chat-end').offset().top }, 'slow'); //Scroll to the chat end div on page load
  
  $(window).resize(function(){
    drawGrid();
    // readArray();
    });
}
// function respondCanvas (){
// //layer 1 = board with lines
// layer1 = document.getElementById("canvas1");
// context = layer1.getContext("2d");
// //layer 2 = pieces
// layer2 = document.getElementById("canvas2");
// contextPieces = layer2.getContext("2d");
// }

function readCollection(){
 
  var currentGameSelector = {_id: "game1"};
  var currentGameOptions = {_id: 0, gameData: 1};
  var currentGameDocument = (PieceCollection.findOne(currentGameSelector, currentGameOptions));
  // var currentGameObject = (PieceCollection.find({_id: "game1"}, {_id: 0, gameData: 1}).fetch());
  if (currentGameDocument === undefined) {
    console.log("GameDocument undefined");
    }
  else {
  // console.log(currentGameDocument);
  currentGameObject = currentGameDocument['gameData'];
  // console.log(currentGameObject[3][4]);
  var x, y;
  for (y=0; y < Object.keys(currentGameObject).length; y++) {
    for (x=0; x < Object.keys(currentGameObject[y]).length; x++){
        boardPosition[y][x] = currentGameObject[y][x]
      if (currentGameObject[y][x] !== null) {
        drawPieces(y,x);
        // console.log("x: "+ x + " y: " + y + " value: " + currentGameObject[y][x]);
        }
      }}
   } 
  // PieceCollection.findOne(currentGameSelector, {_id: 0, gameData: 1}, function(err, res){
  // console.log("hi");
  // if (!err) {
  //   console.log(res);
  //   }

  //  else if (err == undefined){
  //   console.log('undefined');
  //  } 

  // else {
  //   console.log(err);
  //   throw new Meteor.Error(400, "Invalid");
  //   }
  //   });
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
  // setInitialPosition(); //Local function for testing
  // readArray();
  readCollection();
  clickInputAccepted = true;
  gameOn = true;
  if (playerTurn=1){
      switchTurn();
      }
  document.title = "Othello";
   }); 
  
document.getElementById("skipTurn").addEventListener("click", function(){
  clickInputAccepted = true;
  gameOn = true;
  switchTurn();  
  });

//Scroll down to the bottom of chat div
$("input[type=text]").focus(function(){
    $(this).css("background","#ffffff");
  });
}//init

function setInitialPosition(){
//Initialize beginning board position
//0 for white, 1 for black
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
//grid width and height
var boardWidth = 400;
var boardHeight = 400;
padding = 10; //padding around grid
//draw vertical lines of grid
context.beginPath();
for (var x = 0; x <= boardWidth; x += 50) {
    
    context.moveTo(0.5 + x + padding, padding);
    context.lineTo(0.5 + x + padding, boardHeight + padding);
  }
//draw horizontal lines of grid
  for (var x = 0; x <= boardHeight; x += 50) {
    context.moveTo(padding, 0.5 + x + padding);
    context.lineTo(boardWidth + padding, 0.5 + x + padding);
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
        drawPieces(y,x);
    }}}
  }

function clearArray(){
  var x, y;
  for (y=0; y < boardPosition.length; y++) {
    for (x=0; x < boardPosition[y].length; x++){
      
      if (boardPosition[y][x] == 1 | boardPosition[y][x] == 0) {
        boardPosition[y][x] = null;
        drawPieces(y,x);
        }}}
        document.getElementById("score").innerHTML = "";
}

function flippingLogTextAnimation(){
  if (document.getElementById("messages").innerHTML == "Flipping.....")
   document.getElementById("messages").innerHTML = "Flipping..";
  
  else {
   var flippingTextValue = document.getElementById("messages").innerHTML;
   document.getElementById("messages").innerHTML = flippingTextValue + ".";
    }
  }

function intervalDelay(){intSet = setInterval(returnFlipCoordinate,500);} 
function returnFlipCoordinate(){
   if (flipCoordinate_x.length > 0){
    flippingLogTextAnimation();
    cell_x = flipCoordinate_x.pop();
    cell_y = flipCoordinate_y.pop();
    if (debugErrorMessage){console.log("Flip x: "+ cell_x + " y: " + cell_y);}
    addPiece(cell_y,cell_x);
  }
  else {
  clearInterval(intSet);
  clickInputAccepted = true;
  //Update Collection after all pieces are flipped and the currentGameObject has reflected all of the changes
  // PieceCollection.update({_id: "game1"}, { $set: {gameData: currentGameObject}}, {upsert: true})
  updateGameData();
  // readCollection();
  if(gameOn){ switchTurn();}
    }
  }

function calculateScore(){
var x, y;
var whiteScore = 0,  blackScore = 0;
for (y=0; y < boardPosition.length; y++) {
  for (x=0; x < boardPosition[y].length; x++){
    if (boardPosition[y][x] == 0){
        whiteScore +=1;
    }
    else if (boardPosition[y][x] == 1){
      blackScore +=1;
    }
    }}

  if (whiteScore + blackScore <= 64){
  document.getElementById("score").innerHTML = "White: "+ whiteScore  + " Black: " + blackScore;
  }
  if (whiteScore + blackScore == 64 && whiteScore > blackScore){
    clickInputAccepted = false;
    gameOn = false;
    document.getElementById("turn").innerHTML = "White player wins with " + whiteScore + " pieces!";
    document.getElementById("score").innerHTML = "White: "+ whiteScore  + " Black: " + blackScore;
  }
  else if (whiteScore + blackScore == 64 && blackScore > whiteScore){
    clickInputAccepted = false;
    gameOn = false;
    document.getElementById("turn").innerHTML = "Black player wins with " + blackScore + " pieces!";
    document.getElementById("score").innerHTML = "White: "+ whiteScore  + " Black: " + blackScore;
  }
  else if (whiteScore + blackScore == 64 && blackScore == whiteScore){
    clickInputAccepted = false;
    gameOn = false;
    document.getElementById("turn").innerHTML = "Draw! How unusual!";
  }
  else if (blackScore == 0){
    clickInputAccepted = false;
    gameOn = false;
    document.getElementById("turn").innerHTML = "White player wins with " + whiteScore + " pieces!";
    }
  else if (whiteScore == 0){
    clickInputAccepted = false;
    gameOn = false;
    document.getElementById("turn").innerHTML = "Black player wins with " + blackScore + " pieces!";
    }
}

function listenMouseDown () {
  if (clickInputAccepted){
  //Get canvas offset using jQuery to get a relative mouse position
  var canvasOffset=$("#canvas2").offset();
  var offset_x = canvasOffset.left;
  var offset_y = canvasOffset.top;

  //Remove ofset from pageX and pageY to get an accurate position
  canvas_x = Math.round(event.pageX - offset_x);
  canvas_y = Math.round(event.pageY - offset_y);
  //console.log ("Mouse Click" + "\n" + "X: "+canvas_x+" Y: "+canvas_y);
  translateCoordinate(canvas_y,canvas_x);
  }
  else {
    if (debugErrorMessage){console.log("Mouse input locked!");}
  }
}

function translateCoordinate (canvas_y,canvas_x){
  //Determines which cell the coordinate from mouse listener belongs to
  cell_x = Math.floor((canvas_x-padding)/cellWidth);
  cell_y = Math.floor((canvas_y-padding)/cellWidth);
  if (debugErrorMessage){console.log ("Mouse x: " + canvas_x  + " y: " + canvas_y + "\n" + "Map x: "+cell_x+" y: "+cell_y);}
  //console.log ("Mouse Click" + "\n" + "X: "+canvas_x+" Y: "+canvas_y);
  //Remove erroneous coordinates like outside the grid in the padding
  if (0 <= cell_x && cell_x < 8 && 0 <= cell_y && cell_y < 8){
  //addPiece(cell_x, cell_y);
  validMove(cell_y,cell_x);
  }
  else {
    if (debugErrorMessage){console.log("Out of bounds");}
    document.getElementById("messages").innerHTML = "Out of bounds: try to keep it in the lines!";
  }
}

function switchTurn (){
  //switches the player turn and then updates h3 with id="turn"
  var playerText = "";
  if (playerTurn == 0) {
    //Takes white's turn and switches to black's
    playerTurn = 1;
    playerText = "Player Turn: Black";
    document.title = "Black's turn - Othello";
  } 
  //Takes black's turn and switches to white's
  else if (playerTurn == 1) {
    playerTurn = 0;
    playerText = "Player Turn: White";
    document.title = "White's turn - Othello";
  }
  if (debugErrorMessage){console.log("Switch turn");}
  document.getElementById("turn").innerHTML = playerText;
  document.getElementById("messages").innerHTML = "Please proceed!";
}

function validMove(cell_y,cell_x){
  var noOppositeMatch = true;
  var flipIndex = 0;
  //var multFactor = 2;
  //Comment this out to prevent manual piece flipping
  if (boardPosition[cell_y][cell_x] == 1 | boardPosition[cell_y][cell_x] == 0){addPiece(cell_y,cell_x);return false;} //Bypass move validation when there is already a piece in the square

  else if (boardPosition[cell_y][cell_x] == null){ 
    clickInputAccepted = false;
    document.getElementById("messages").innerHTML = "Flipping..";
    for (dx = -1; dx <= 1; dx++){ //Iterate horizontally
        for (dy = -1; dy <=1; dy++){ //Iterate vertically
          if (typeof boardPosition[cell_y+dy] != 'undefined' && typeof boardPosition[cell_y+dy][cell_x+dx] != 'undefined'){ //Prevent attempting to scan outside of the array
           if (dx == 0 && dy == 0) {continue;} //prevent boardPosition[cell_y][cell_x] from being processed
            var adjacentCellValue = boardPosition[cell_y+dy][cell_x+dx];
            //Evaluating for the opposite of playerTurn value
            if (adjacentCellValue != playerTurn && typeof adjacentCellValue != 'undefined' && adjacentCellValue != null){
               if (debugErrorMessage){console.log("Adj x: " + (cell_x+dx) + " y: " + (cell_y+dy));} //Log the coordinates of the adjacent cell being checked to the console for debugging purposes
              //Evaluating the piece(s) beyond the adjacent tile to ensure that a flip is possible
             for (multFactor = 2; (cell_y+(dy*multFactor)) >= 0 && (cell_x+(dx*multFactor)) >= 0 && (cell_y+(dy*multFactor)) <= 7 && (cell_x+(dx*multFactor)) <= 7; multFactor++){
             //while ((cell_y+(dy*multFactor)) >= 0, (cell_x+(dx*multFactor)) >= 0, (cell_y+(dy*multFactor)) <= 7, (cell_x+(dx*multFactor)) <= 7){
               if (debugErrorMessage){console.log("Mult: " + multFactor + " x: "+ (cell_x+(dx*multFactor)) +" y: "+ (cell_y+(dy*multFactor)));}
               if (boardPosition[cell_y+(dy*multFactor)][cell_x+(dx*multFactor)] == playerTurn){ //If the end piece is the same as the player's color, write to a temporary array
                multFactor -= 1; //To account for not flipping the end piece because the end piece has the max multFactor
                while (multFactor >= 1){ //Write the coordinates of pieces that need to be flipped
                flipCoordinate_y[flipIndex] = cell_y+(dy*multFactor);
                flipCoordinate_x[flipIndex] = cell_x+(dx*multFactor);
                flipIndex += 1;
                multFactor -= 1;
                }
                noOppositeMatch = false;
                break;
                }
              else if (boardPosition[cell_y+(dy*multFactor)][cell_x+(dx*multFactor)] == null){break;} //Break the loop if it encounters an empty tile
              else if (boardPosition[cell_y+(dy*multFactor)][cell_x+(dx*multFactor)] != playerTurn){continue;} //If the piece beyond the adjacent is the same as the playerTurn, continue the for loop and increase the multFactor
              }
             }
            }
          }      
        }                  
      }
      
    if (noOppositeMatch) {
      document.getElementById("messages").innerHTML = "Invalid Move: Can't let you do that star fox!";
      if (debugErrorMessage){console.log("Invalid move");}
      clickInputAccepted = true;
    }
    else if (noOppositeMatch == false){
      addPiece(cell_y,cell_x); //Add selection piece first
      intervalDelay(); //Call the intervalDelay to start flipping the remaining pieces through the returnFlipCoordinate function
      }
    }

function addPiece (cell_y,cell_x) {
  var thisCell = boardPosition[cell_y][cell_x];
  
  if (thisCell == null){
    boardPosition[cell_y][cell_x] = playerTurn;
    currentGameObject[cell_y][cell_x] = playerTurn;
    //Move flip function to after draw 
    //Believe I can return this to default behavior, changed due to troubleshooting. 
     //switchTurn();  //MOVED: To after pieces are finished flipping
    }
  //Leaving manual flipping functionality in place for testing
  else if (thisCell == 0){
    boardPosition[cell_y][cell_x] = 1;
    currentGameObject[cell_y][cell_x] = 1;
    
    }
  else if (thisCell == 1){ //This will be commented out eventually, used for testing
    boardPosition[cell_y][cell_x] = 0;
    currentGameObject[cell_y][cell_x] = 0;
    }
  // xPosition = cell_x;
  // yPosition = cell_y;
  drawPieces(cell_y,cell_x);
  // PieceCollection.update({_id: "game1"}, { $set: {gameData: currentGameObject}}, {upsert: true})
  calculateScore();
}

function updateGameData() {
  Meteor.call('othello.updateGameData', {
  gameId: currentGameId,
  changedGameData: currentGameObject
}, (err, res) => {
  if (err) {
    alert(err);
  } else {
    console.log("Great success!");
  }
});
}

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

function drawPieces(yPosition,xPosition) {
  radius = 20;
  padding = 10;
  cellWidth = 50;
  //implement random positioning within cell for added interest and analog feel
  //uses a random number generator to vary between a value -1 to +1
  var randomX = Math.floor((Math.random()*3))-1;
  var randomY = Math.floor((Math.random()*3))-1;
  //console.log("randomX = "+randomX);
  //console.log("randomY = "+randomY);
  var centerX = cellWidth/2+padding+randomX+cellWidth*xPosition;
  var centerY = cellWidth/2+padding+randomY+cellWidth*yPosition;
  var pieceGradient = contextPieces.createRadialGradient(centerX, centerY, radius/1.5, centerX, centerY, radius);
  
  if (boardPosition[yPosition][xPosition] == 0) {
  //White piece gradient
  pieceGradient.addColorStop(0, "white");
  pieceGradient.addColorStop(1, "#cfcfcf");
  contextPieces.strokeStyle = '#404040';  //Old value #585858
    }
    
  else if (boardPosition[yPosition][xPosition] == 1){
  //Black piece gradient
  pieceGradient.addColorStop(0, "#202020");
  pieceGradient.addColorStop(1, "black");
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
  contextPieces.fillStyle = pieceGradient;
  contextPieces.lineWidth = 0.5;
  
  if (debugErrorMessage){console.log("Draw x: " + xPosition + " y: " + yPosition);}
  contextPieces.fill();
  contextPieces.stroke();
    }
//Accessible through the console for debugging purposes
function globalDebug(){
window.debugMode = debugMode; //Assign function to global window property
function debugMode(){debugErrorMessage = true; console.log("Debug mode on!");return true;} 
  }

} //End isClient