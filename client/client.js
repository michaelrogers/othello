if (Meteor.isClient) {
  //Require username for players
  Accounts.ui.config({  passwordSignupFields: "USERNAME_ONLY"  });

  //Global for access from console
  var debugErrorMessage = false;
  //defining layers for canvas
  var layer1, layer2, layer3;
  //Canvas variables for window resizing
  var radius, padding, cellWidth, linePadding;
  //-----Local gamePiece Data -----
  var boardPosition = []; //Holds 2d array of piece data
  var flipCoordinate_x = [], flipCoordinate_y = []; //Temporary coordinate array for holding pieces that need to be flipped
  var currentGameObject = {};
  //-----Canvas-------------
  var contextPieces, contextMarkers;


  //-----------States ------
  var intSet; //Used in interval delay function
  var clickInputAccepted = false; //Used to lock the player while setInterval is repeating/flipping
  var gameOn = true;
  var notBoardReset = true;
  var playerTurn, playerColorSelection;
  const intervalDelayValue = 500;


  window.onload = function (){setSession(sessionStorage.getItem("gameId"));}
    
  function setSession(gameId){
    if (debugErrorMessage){console.count("client setSession")}
    if (gameId == null){
       if (debugErrorMessage){console.count('Session nullified');}    
      sessionStorage.clear();
      Session.clear();
      }
    else {
    Session.set('gameId', gameId);
    sessionStorage.setItem('gameId', gameId);
    }
  }

  function gameInit(){ //Declaring this function to be globally accessible
    $(document).ready(function(){
      currentGameObject = {};
      notBoardReset = true;
      intSet = null;
      document.title = "Othello";
      if (debugErrorMessage){console.count("gameInit");}
      buttonListeners();
      getCanvasContext();
      resizingDeclarations();
      // clearArray(); //drawGrid();
      setInitialPosition();
      globalDebug();
      $(window).resize(function(){resizingDeclarations});
      $(document).keypress(function(){document.getElementById("message").focus();});
      $('#chat-message').animate({ scrollTop: $('#chat-end').offset().top }, 'slow'); //Scroll to the chat end div on page load
      whatPlayerAmI(Session.get("gameId"));
      returnGameDocument();
      pieceObserver();
        });
  }

  function pieceObserver(){
  if (sessionStorage.getItem('gameId') !== null){
     if (debugErrorMessage){console.count("pieceObserver");}
    PieceCollection.find({_id: sessionStorage.getItem('gameId')}).observeChanges({
     // added: function () {returnGameDocument(); console.log('added');},
     changed: function () {returnGameDocument();  if (debugErrorMessage){console.log('changed');}},
     // removed: function () {  }
      });
  }
  else {console.log("gameId undefined")}
  }

   
  function getCanvasContext() {
   //layer 1 = board with lines
  layer1 = document.getElementById("canvas1");
  context = layer1.getContext("2d");
  //layer 2 = board with pieces
  layer2 = document.getElementById("canvas2");
  contextPieces = layer2.getContext("2d");
  layer2.addEventListener("click", listenMouseDown); //Event listener for mouse input and event is implicitely passed as an argument
  //layer 3 = board with markers
  layer3 = document.getElementById("canvas3");
  contextMarkers = layer3.getContext("2d");
  }//getCanvasContext

  function buttonListeners() {
    //DEPRECATED Color selection radio
    // document.getElementById('playerChoice').addEventListener("click", function(){playerColorSelection = $('input[name="playerChoice"]:checked').val(); switchTurn(); console.log("Player Color: "+playerColorSelection);  });
    //Reset button
    // document.getElementById("resetButton").addEventListener("click", function(){notBoardReset = false; init()}); 
    //Skip turn button
    document.getElementById("skipTurn").addEventListener("click", function(){if(clickInputAccepted) {updateGameData(Session.get("gameId"), currentGameObject);}});
    //Join button
    // document.getElementById('joinButton').addEventListener("click", function(){joinGame(null);});
    //Lobby button
    document.getElementById('lobby').addEventListener("click", function(){setSession(null);});
    //Resign button
    document.getElementById('resignButton').addEventListener("click", function(){resignationButtonConfirmation();});
  }

  function resignationButtonConfirmation(){
    var resignationConfirmation = confirm("Are you sure you want to resign? This will be counted as a loss.");
      if (resignationConfirmation){
        clickInputAccepted = false;
        endGame(true);
        document.getElementById("messages").innerHTML = "You have resigned.";
        setSession(null);
      }
  }

  function whatPlayerAmI(gameId){
    if (debugErrorMessage){console.count("whatPlayerAmI");}
    if (Meteor.user()){ 
      // console.log(Meteor.user().username)
      Meteor.call('othello.whatPlayerAmI', {username: Meteor.user().username, gameId: Session.get('gameId')}, (err, res) => {
      if (err) {console.log("Error: \n" + err);}
      else {if (res !== false){
        // console.count("playerColorSelection set"); 
        playerColorSelection = res; switchTurn();} //console.count("switchTurn - whatPlayerAmI"); 
      else {setSession(null);} //Kick the player to the lobby if they are not matched to the game
      }
      });
    }
  }

  function resizingDeclarations(){
  radius = 20, padding = 10, cellWidth = 50; //Used for drawing the pieces
  drawGrid();
  }

  function setInitialPosition(){
    //Initialize beginning board position
    //0 for white, 1 for black
    var row0 = [null,null,null,null,null,null,null,null],
        row1 = [null,null,null,null,null,null,null,null],
        row2 = [null,null,null,null,null,null,null,null],
        row3 = [null,null,null,null,null,null,null,null],
        row4 = [null,null,null,null,null,null,null,null],
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
    linePadding = 0.5;
    context.beginPath();
    for (var x = 0; x <= boardWidth; x += 50) {
        context.moveTo(linePadding + x + padding, padding);
        context.lineTo(linePadding + x + padding, boardHeight + padding);
      }
    //draw horizontal lines of grid
      for (var x = 0; x <= boardHeight; x += 50) {
        context.moveTo(padding, linePadding + x + padding);
        context.lineTo(boardWidth + padding, linePadding + x + padding);
       }
      context.strokeStyle = "#323232";
      context.lineWidth = 1;
      context.stroke();
    }
   // function readArray(){
   // //Reads the initialized array and draws the start position
   // var x, y;
   // for (y=0; y < boardPosition.length; y++) {
   //   for (x=0; x < boardPosition[y].length; x++){
   //     if (boardPosition[y][x] !== null) {
   //         drawPieces(y,x);
   //     }}}
   //   }

  function clearArray(){
   if (typeof boardPosition !== 'undefined'){
   var x, y;
   for (y=0; y < boardPosition.length; y++) {
     for (x=0; x < boardPosition[y].length; x++){
        if (boardPosition[y][x] == 1 | boardPosition[y][x] == 0) {
         boardPosition[y][x] = null;
         drawPieces(y,x, null);
         }}}
    }
   }

  function flippingLogTextAnimation(){
    var messages = document.getElementById("messages").innerHTML;
    if (messages.innerHTML == "Flipping.....")
     messages.innerHTML = "Flipping..";
    else {
     var flippingTextValue = messages.innerHTML;
     messages.innerHTML = flippingTextValue + ".";
      }
    }

  function endGame(resignation) {
    Meteor.call("othello.endGame", {gameId: Session.get("gameId"), resignation: resignation, userId: Meteor.user().username}, (err, res) => {
      if (err){console.log(err)}
      else {
          if(res){//Do something if game is ended
            clickInputAccepted = false; //To catch resignation
          }
          else {//Do something if server returns false
          }
        }
      });
    } 

  function listenMouseDown(event) {
    if (clickInputAccepted && Meteor.user()){
      event = event || window.event; //Accomodate cross browser support
      var canvasOffset = $("#canvas2").offset();  //Get canvas offset using jQuery to get a relative mouse position
      var offset_x = canvasOffset.left;
      var offset_y = canvasOffset.top;

      //Remove offset from pageX and pageY to get an accurate position
      canvas_x = Math.round(event.pageX - offset_x);
      canvas_y = Math.round(event.pageY - offset_y);
      //console.log ("Mouse Click" + "\n" + "X: "+canvas_x+" Y: "+canvas_y);
      translateCoordinate(canvas_y,canvas_x);
    }
    else if (Meteor.user() == null){document.getElementById("messages").innerHTML = "Please login to play.";}
    else {
      var opponent;
      if (playerColorSelection == 0){opponent = "Black";}
      else if (playerColorSelection == 1){opponent = "White";}

      document.getElementById("messages").innerHTML = "Waiting on " + opponent + " to finish playing!";
    }
      // if (debugErrorMessage){console.log("Mouse input locked!");}
  }

  function translateCoordinate(canvas_y,canvas_x){
    //Determines which cell the coordinate from mouse listener belongs to
    cell_x = Math.floor((canvas_x-padding)/cellWidth);
    cell_y = Math.floor((canvas_y-padding)/cellWidth);
    if (debugErrorMessage){console.log ("Mouse x: " + canvas_x  + " y: " + canvas_y + "\n" + "Map x: "+cell_x+" y: "+cell_y);}
    //console.log ("Mouse Click" + "\n" + "X: "+canvas_x+" Y: "+canvas_y);
    //Remove erroneous coordinates like outside the grid in the padding
    if (0 <= cell_x && cell_x < 8 && 0 <= cell_y && cell_y < 8){
      validMove(cell_y,cell_x);
    }
    else {
      if (debugErrorMessage){console.log("Out of bounds");}
      document.getElementById("messages").innerHTML = "Out of bounds: try to keep it in the lines!";
      }
  }

  function switchTurn(){
    //switches the player turn and then updates h3 with id="turn"
    // console.count("switchTurn");
    var playerText = "";
    var messages = "";
    if (playerTurn == playerColorSelection){clickInputAccepted = true;}
    else {clickInputAccepted = false;}
    if (document.getElementById("whitePlayerWrapper") !== null && document.getElementById("blackPlayerWrapper")){
      if (playerTurn == 0) {
          // playerText = "Player Turn: White";
        document.title = "White's turn - Othello";
        document.getElementById("whitePlayerWrapper").className += " currentPlayerTurn";
        document.getElementById("blackPlayerWrapper").className = "playerTurnWrapper";

      } 
      else if (playerTurn == 1) {
        // playerText = "Player Turn: Black";
        document.title = "Black's turn - Othello";
        document.getElementById("whitePlayerWrapper").className = "playerTurnWrapper";
        document.getElementById("blackPlayerWrapper").className += " currentPlayerTurn";
      }
    }
   //Deprecated
    // if (typeof playerColorSelection === "undefined"){
    //   messages = "Please select a piece color to play with.";}
    if (playerColorSelection == playerTurn){
      messages = "Your move!"
    }
    else {messages = "Waiting on your opponent to play.";}
    //-----Write messages to DOM----
    var messagesText = document.getElementById('messages');
    if (messagesText != null){document.getElementById('messages').innerHTML = messages;}
    var turnText = document.getElementById("turn");
    if (turnText != null){turnText.innerHTML = playerText;}
  }


  function calculateScore(){
  var x, y;
  var whiteScore = 0,  blackScore = 0;
  for (y=0; y < boardPosition.length; y++) {
    for (x=0; x < boardPosition[y].length; x++){
      if (boardPosition[y][x] == 0){whiteScore +=1;}
      else if (boardPosition[y][x] == 1){blackScore +=1;}
      }}
    // $("div#blackScoreValue").ready(function(){
    // var turnText = document.getElementById("turn");
    // var scoreText = document.getElementById("score");
    // console.log(typeof document.getElementById("blackScoreValue").innerHTML);
    // if (document.getElementById("whiteScoreValue").innerHTML !== null && document.getElementById("blackScoreValue").innerHTML !== null){
    var whiteScoreValue = document.getElementById("whiteScoreValue");
    var blackScoreValue = document.getElementById("blackScoreValue");
    var messagesText = document.getElementById('messages');
    if (whiteScoreValue !== null && blackScoreValue !== null){
      if (whiteScore + blackScore <= 64){
        gameOn = true;
        whiteScoreValue.innerHTML = whiteScore; blackScoreValue.innerHTML = blackScore;
      }
      if (whiteScore + blackScore == 64 && whiteScore > blackScore){
        clickInputAccepted = false;
        gameOn = false;
        messagesText.innerHTML = "White player wins with " + whiteScore + " pieces!";
        whiteScoreValue.innerHTML = whiteScore; blackScoreValue.innerHTML = blackScore;
        // turnText.innerHTML = "Game over!";
      }
      else if (whiteScore + blackScore == 64 && blackScore > whiteScore){
        clickInputAccepted = false;
        gameOn = false;
        messagesText.innerHTML = "Black player wins with " + blackScore + " pieces!";
        whiteScoreValue.innerHTML = whiteScore; blackScoreValue.innerHTML = blackScore;
        // turnText.innerHTML = "Game over!";
      }
      else if (whiteScore + blackScore == 64 && blackScore == whiteScore){
        clickInputAccepted = false;
        gameOn = false;
        messagesText.innerHTML = "Draw! How unusual!";
        // turnText.innerHTML = "Game over!";
      }
      else if (blackScore == 0 && whiteScore > 2){
        clickInputAccepted = false;
        gameOn = false;
        messagesText.innerHTML = "White player wins with " + whiteScore + " pieces!";
        // turnText.innerHTML = "Game over!";
        }
      else if (whiteScore == 0 && blackScore > 2){
        clickInputAccepted = false;
        gameOn = false;
        messagesText.innerHTML = "Black player wins with " + blackScore + " pieces!";
        // turnText.innerHTML = "Game over!";
        }
      
        if (gameOn == false){endGame(false);}
      // });
    }
  }
  function validMove(cell_y,cell_x){
    var noOppositeMatch = true;
    // var flipIndex = 0;
    //Comment this out to prevent manual piece flipping
    // if (boardPosition[cell_y][cell_x] == 1 | boardPosition[cell_y][cell_x] == 0){addPiece(cell_y,cell_x);return false;} //Bypass move validation when there is already a piece in the square
    
    var validMoveGameObject = currentGameObject;
    if (validMoveGameObject[cell_y][cell_x] == null){ 
      clickInputAccepted = false;
      document.getElementById("messages").innerHTML = "Flipping..";
      for (let dx = -1; dx <= 1; dx++){ //Iterate horizontally
          for (let dy = -1; dy <=1; dy++){ //Iterate vertically
            if (typeof validMoveGameObject[cell_y+dy] !== 'undefined' && typeof validMoveGameObject[cell_y+dy][cell_x+dx] !== 'undefined'){ //Prevent attempting to scan outside of the array
             if (dx == 0 && dy == 0) {continue;} //prevent boardPosition[cell_y][cell_x] from being processed
              var adjacentCellValue = validMoveGameObject[cell_y+dy][cell_x+dx];
              //Evaluating for the opposite of playerTurn value
              if (adjacentCellValue != playerTurn && typeof adjacentCellValue !== 'undefined' && adjacentCellValue != null){
                 if (debugErrorMessage){console.log("Adj x: " + (cell_x+dx) + " y: " + (cell_y+dy));} //Log the coordinates of the adjacent cell being checked to the console for debugging purposes
                //Evaluating the piece(s) beyond the adjacent tile to ensure that a flip is possible
               for (let multFactor = 2; (cell_y+(dy*multFactor)) >= 0 && (cell_x+(dx*multFactor)) >= 0 && (cell_y+(dy*multFactor)) <= 7 && (cell_x+(dx*multFactor)) <= 7; multFactor++){
                 if (debugErrorMessage){console.log("Mult: " + multFactor + " x: "+ (cell_x+(dx*multFactor)) +" y: "+ (cell_y+(dy*multFactor)));}
                 if (validMoveGameObject[cell_y+(dy*multFactor)][cell_x+(dx*multFactor)] == playerTurn){ //If the end piece is the same as the player's color, write to a temporary array
                  multFactor -= 1; //To account for not flipping the end piece because the end piece has the max multFactor
                  while (multFactor >= 1){ //Write the coordinates of pieces that need to be flipped to two arrays with an index
                    // flipCoordinate_y[flipIndex] = cell_y+(dy*multFactor);
                    // flipCoordinate_x[flipIndex] = cell_x+(dx*multFactor);
                    currentGameObject[cell_y+(dy*multFactor)][cell_x+(dx*multFactor)] = playerTurn;
                    // flipIndex += 1;
                    multFactor -= 1;
                    }
                  noOppositeMatch = false; //Indicated a match has been found
                  currentGameObject[cell_y][cell_x] = playerTurn;
                  break;
                  }
                  else if (validMoveGameObject[cell_y+(dy*multFactor)][cell_x+(dx*multFactor)] == null){break;} //Break the loop if it encounters an empty tile
                  else if (validMoveGameObject[cell_y+(dy*multFactor)][cell_x+(dx*multFactor)] != playerTurn){continue;} //If the piece beyond the adjacent is the same as the playerTurn, continue the for loop and increase the multFactor
                }
               }
              }
            }      
          }                  
        }
        
      if (noOppositeMatch) {
        document.getElementById("messages").innerHTML = "Invalid Move: Can't let you do that, Star Fox!";
        if (debugErrorMessage){console.log("Invalid move");}
        clickInputAccepted = true;
      }
      else if (noOppositeMatch == false){
        if (debugErrorMessage){console.log("validMove");}
        // clientUpdated = true;
        // console.count('intervalDelay - validMove');
        updateGameData(Session.get("gameId"), currentGameObject);
        // addPiece(cell_y,cell_x); //Add selection piece first
        // clearMarkerCanvas();
        // drawMarker(cell_y, cell_x, true, true);
        
        // intervalDelay(intervalDelayValue); //Call the intervalDelay to start flipping the remaining pieces through the returnFlipCoordinate function
        }
      }//End validMove

  function intervalDelay(intervalDelayValue){intSet = setInterval(returnFlipCoordinate, intervalDelayValue);} 
  function returnFlipCoordinate(){
     if (flipCoordinate_x.length > 0){
      flippingLogTextAnimation();
      cell_x = flipCoordinate_x.pop();
      cell_y = flipCoordinate_y.pop();
      if (debugErrorMessage){console.count("Flipping");}
      if (debugErrorMessage){console.log("Flip x: "+ cell_x + " y: " + cell_y);}
      addPiece(cell_y,cell_x);
      drawMarker(cell_y, cell_x, false, playerColorSelection !== playerTurn);
    }
    else {
    // if(gameOn){clickInputAccepted = true;}
    //Update Collection after all pieces are flipped and the currentGameObject has reflected all of the changes
      // if(clientUpdated){ updateGameData(Session.get("gameId"), currentGameObject);}
      // clientUpdated = false;
      clearInterval(intSet);
      // console.count("switchTurn - clearInterval");
      
      // switchTurn();
      
      if (debugErrorMessage){console.log("Flipping finished");}
      // return;
      }
    }

  function addPiece(cell_y,cell_x) {
    var thisCell = boardPosition[cell_y][cell_x];
    if (thisCell == null){
      boardPosition[cell_y][cell_x] = playerTurn;
      // currentGameObject[cell_y][cell_x] = playerTurn;
      }
      //-----Called to flip the piece data
    else if (thisCell == 0){ //Used by returnFlipCoordinate function for flipping pieces
      boardPosition[cell_y][cell_x] = 1;
      // currentGameObject[cell_y][cell_x] = 1;
      }
    else if (thisCell == 1){  //Used by returnFlipCoordinate function for flipping pieces
      boardPosition[cell_y][cell_x] = 0;
      // currentGameObject[cell_y][cell_x] = 0;
      }
    drawPieces(cell_y,cell_x, currentGameObject[cell_y][cell_x]);
    if (notBoardReset){calculateScore();}
  }//End addPiece

  function drawPieces(yPosition,xPosition, pieceColor) {
    // radius = 20; padding = 10; cellWidth = 50;
    //implement random positioning within cell for added interest and analog feel
    //uses a random number generator to vary between a value -1 to +1
    var randomX = Math.floor((Math.random()*3))-1;
    var randomY = Math.floor((Math.random()*3))-1;

    var centerX = cellWidth/2+padding+randomX+cellWidth*xPosition;
    var centerY = cellWidth/2+padding+randomY+cellWidth*yPosition;
    var pieceGradient = contextPieces.createRadialGradient(centerX, centerY, radius/1.5, centerX, centerY, radius);
    
    if (pieceColor == 0) {
    //White piece gradient
    pieceGradient.addColorStop(0, "white");
    pieceGradient.addColorStop(1, "#cfcfcf");
    contextPieces.strokeStyle = '#404040';  //Old value #585858
      }
      
    else if (pieceColor == 1){
    //Black piece gradient
    pieceGradient.addColorStop(0, "#202020");
    pieceGradient.addColorStop(1, "black");
    contextPieces.strokeStyle = '#b3b3b3'; //'#E0E0E0'
       }

    else if (pieceColor == null){
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

  function drawMarker(y, x, initialPiece, thisUserTurn){ //initialPiece is a boolean value representing the piece played by the player
    var yCoordinate = padding+cellWidth*y;
    var xCoordinate = padding+cellWidth*x;
    var centerY = yCoordinate + cellWidth/2;
    var centerX = xCoordinate + cellWidth/2;
    
    var markerGradient = contextMarkers.createRadialGradient(centerX, centerY, radius*0.9, centerX, centerY, radius*1.8);
    if (thisUserTurn){
      if (initialPiece){
      // var markerGradient = 'rgba(0,0,125,0.4)';
      markerGradient.addColorStop(0, "rgba(0,0,125,0.4)");
      markerGradient.addColorStop(1, "rgba(0,0,125,0.5)");
      }
      else {
        // var markerGradient = 'rgba(0,0,125,0.2)';
        markerGradient.addColorStop(0, "rgba(0,0,125,0.2)");
        markerGradient.addColorStop(1, "rgba(0,0,125,0.3)");
      }
    }
    else {
    if (initialPiece){
      // var markerGradient = 'rgba(0,0,125,0.4)';
      markerGradient.addColorStop(0, "rgba(125,0,0,0.4)");
      markerGradient.addColorStop(1, "rgba(125,0,0,0.5)");
      }
      else {
        // var markerGradient = 'rgba(0,0,125,0.2)';
        markerGradient.addColorStop(0, "rgba(125,0,0,0.2)");
        markerGradient.addColorStop(1, "rgba(125,0,0,0.3)");
      }
    }
     
      contextMarkers.clearRect(centerX-25,centerY-25,50,50);
      var bufferValue = 0;
      contextMarkers.fillStyle = markerGradient;
      contextMarkers.fillRect(centerX-25+bufferValue+linePadding,centerY-25+bufferValue+linePadding,50-(bufferValue*2),50-(bufferValue*2));
  }

  function clearMarkerCanvas(){
    contextMarkers.clearRect(0,0,410,410);
  }

  //Accessible through the console for debugging purposes
  function globalDebug(){
  window.debugMode = debugMode; //Assign function to global window property
  function debugMode(){debugErrorMessage = true; console.log("Debug mode on!");return true;} 
    }

  function returnGameDocument() {
  // if (!clientUpdated){
    var currentGameData = {};
   
    if (Session.get("gameId") !== 'null' && Session.get("gameId") !== undefined){
    Meteor.call('othello.readGameData', { gameId: Session.get("gameId")}, (err, res) => {
    if (err) {console.log(err);}
    else {   
       if (debugErrorMessage){console.count("returnGameDocument");}

        var pastGameData = res['pastTurnData']; var pastGameObject = {};
        if (pastGameData['turnPieceData'] !== undefined){
          pastGameObject = pastGameData['turnPieceData'];
        }
        if (boardPosition[4][4] == null){readCollection(pastGameObject);} //Todo: rework as a true comprehensive comparison instead of a spot check
        currentGameData = res['currentTurnData'];
        // console.log(boardPosition); // console.log(pastGameObject); // console.log(currentGameData);
        if (debugErrorMessage){ console.log(currentGameData);}
        if (currentGameData !== undefined){
          currentGameObject = currentGameData['turnPieceData']; playerTurn = currentGameData['playerTurn'];
          // if (playerColorSelection == playerTurn){clientUpdated = true;}
          if (debugErrorMessage){console.log('Player Turn: '+ playerTurn);}
          // whatPlayerAmI(Session.get("gameId"));
          var thisUserTurn = false;
          if (currentGameData['updatedBy'] == Meteor.user().username){thisUserTurn = true; }
          diffCollections(pastGameObject, currentGameObject, thisUserTurn);
          if (notBoardReset){calculateScore();}
          if (gameOn){switchTurn();} //console.count("switchTurn - returnGameDocument");
        }
        else {console.log("No match for gameId: " + Session.get("gameId"));}

      }});
    }//currentGame if statement
  else {console.log('No gameId');}
  // }
  // clientUpdated=false;
  }

  function updateGameData(currentGameId, currentGameObject) {
    // if (playerTurn == playerColorSelection){ 
    Meteor.call('othello.updateGameData', {
      gameId: currentGameId,
      changedGameData: currentGameObject,
      currentPlayerTurn: playerColorSelection,
      updatedBy: Meteor.user().username
      },
    (err, res) => {
    if (err) {alert(err);} else { if (debugErrorMessage){console.count("updateGameData");}}
      });
    // } 
    // switchTurn();  
  }

   function diffCollections(pastGameObject, currentGameObject, thisUserTurn) {
    if (Object.keys(pastGameObject).length == 0 || boardPosition == undefined){readCollection(currentGameObject);}
    else {
      if (debugErrorMessage){console.count("diffCollections");}
    // if (!clientUpdated){
      var x, y, flipIndex = 0;
      for (y=0; y < Object.keys(currentGameObject).length; y++) {
        for (x=0; x < Object.keys(currentGameObject[y]).length; x++){
            // boardPosition[y][x] = currentGameObject[y][x]
          if (currentGameObject[y][x] !== null && currentGameObject[y][x] != pastGameObject[y][x] ) {
            //Identify the opponents piece that they placed
            if (pastGameObject[y][x] == null){
              boardPosition[y][x] = currentGameObject[y][x];
              drawPieces(y,x,currentGameObject[y][x]); //Add opponents selection first
              clearMarkerCanvas();
              drawMarker(y,x,true, thisUserTurn);
              }
            else {
              flipCoordinate_y[flipIndex] = y;
              flipCoordinate_x[flipIndex] = x;
              flipIndex += 1;
            // console.log("x: "+ x + " y: " + y + " value: " + currentGameObject[y][x]);
          }}
        }}

       if (flipCoordinate_x.length > 0){
        // console.log("Initiate flipping");
        // var thisDelayValue;
        // if (thisUserTurn){thisDelayValue = 0;}
        // else {thisDelayValue = intervalDelayValue}
        // console.count("intervalDelay - diffCollections")
        intervalDelay(intervalDelayValue);
       }
     // }
     notBoardReset = true;
     // clientUpdated = false;
   }
  }

  function readCollection(gameObject){
    if (debugErrorMessage){console.count('readCollection');}
    clearMarkerCanvas();
    clearArray();
    var x, y;
    for (y=0; y < Object.keys(gameObject).length; y++) {
      for (x=0; x < Object.keys(gameObject[y]).length; x++){
          boardPosition[y][x] = gameObject[y][x];
          if (gameObject[y][x] !== null) {
            drawPieces(y,x,gameObject[y][x]);
            // console.log("x: "+ x + " y: " + y + " value: " + currentGameObject[y][x]);
            }
        }}
     }

export {gameInit}; //Export the init function to be called by templates.js to control single page session

} //End isClient



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

// function respondCanvas (){
// //layer 1 = board with lines
// layer1 = document.getElementById("canvas1");
// context = layer1.getContext("2d");
// //layer 2 = pieces
// layer2 = document.getElementById("canvas2");
// contextPieces = layer2.getContext("2d");
// }
