if (Meteor.isClient) {
  Accounts.ui.config({ passwordSignupFields: "USERNAME_ONLY" }); //Require username for players
 
  var debug = false;  //Global for access from console
  let layer1, layer2, layer3; //defining layers for canvas

  var radius, padding, cellWidth, linePadding; //Canvas variables for window resizing
  //-----Local gamePiece Data -----
  var boardPosition = []; //Holds 2d array of piece data
  var flipCoordinate_x = [], flipCoordinate_y = []; //Temporary coordinate array for holding pieces that need to be flipped
  var currentGameObject = {};
  //-----Canvas-------------
  var context, contextPieces, contextMarkers;

  //-----------States ------
  var intSet; //Used in interval delay function
  var clickInputAccepted = false; //Used to lock the player while setInterval is repeating/flipping
  var gameOn = true;
  var notBoardReset = true;
  var playerTurn, playerColorSelection;
  const intervalDelayValue = 500;
  let messageElement;
  let timeoutResize;
      
  function setSession(gameId) {
    if (debug) console.count("client setSession");
    if (gameId == null) {
      if (debug) console.count('Session nullified');    
      sessionStorage.clear();
      Session.clear();
    }
    else {
      Session.set('gameId', gameId);
      sessionStorage.setItem('gameId', gameId);
    }
  }


  function pieceObserver(){
    if (sessionStorage.getItem('gameId') !== null){
      if (debug) console.count("pieceObserver");
      PieceCollection.find({_id: sessionStorage.getItem('gameId')}).observeChanges({
        changed: function () {
          returnGameDocument();
          if (debug) console.log('changed');
        },
      });
    }
    else console.log("gameId undefined");
  }
   
  function getCanvasContext() {
    layer1 = document.getElementById("canvas1"); //layer 1 = board with lines
    context = layer1.getContext("2d");
    layer2 = document.getElementById("canvas2");  //layer 2 = board with pieces
    contextPieces = layer2.getContext("2d");
    layer2.addEventListener("click", listenMouseDown); 
    layer3 = document.getElementById("canvas3"); //layer 3 = board with markers
    contextMarkers = layer3.getContext("2d");
  }

  function buttonListeners () {
    document.getElementById("skipTurn").addEventListener("click", () => {
      if (clickInputAccepted) updateGameData(Session.get("gameId"), currentGameObject);
    });
    document.getElementById('lobby').addEventListener("click", () => setSession(null));
    document.getElementById('resignButton').addEventListener("click", resignationButtonConfirmation);
  }

  function resignationButtonConfirmation () {
    var resignationConfirmation = confirm ("Are you sure you want to resign? This will be counted as a loss.");
    if (resignationConfirmation) {
      clickInputAccepted = false;
      messageElement.innerHTML = "You have resigned.";
      endGame(true); //Write to DB that game is complete
      setSession(null); //Return to lobby
    }
  }

  function whatPlayerAmI (gameId) {
    if (debug) console.count("whatPlayerAmI");
    if (Meteor.user()) { 
      Meteor.call('othello.whatPlayerAmI', {
        username: Meteor.user().username,
        gameId: Session.get('gameId')
      }, (err, res) => {
        if (err) console.log("Error: \n" + err);
        else if (res !== false) {
          playerColorSelection = res;
          switchTurn();
        } else setSession(null); //Kick the player to the lobby if they are not matched to the game
      });
    }
  }

  function resizingDeclarations() {
    var canvasesdiv = document.querySelector('#canvasesdiv');
    var canvasArray = Array.from(document.querySelectorAll('canvas'));
    var canvasWidth = canvasesdiv.offsetWidth;
    console.log(canvasesdiv.offsetWidth, canvasWidth)
    canvasArray.map((x) => {
      x.width = canvasWidth;
      x.height = canvasWidth;
    });
    canvasesdiv.style.height = `${canvasWidth}px`;
    document.getElementById('playerDesignation').style.width = `${canvasWidth}px`;
    padding = canvasWidth * (10/420);
    var boardWidth = canvasWidth - padding * 2;
    cellWidth = boardWidth / 8 ; //Used for drawing the pieces
    radius = cellWidth * 0.4;
    console.log('boardWidth', boardWidth, 'cellWidth', cellWidth);
    drawGrid(Math.round(boardWidth), Math.round(boardWidth), Math.round(padding));
    readCollection (currentGameObject);
  }

  function setInitialPosition (){
    //Initialize beginning board position
    var row0 = [null,null,null,null,null,null,null,null],
        row1 = [null,null,null,null,null,null,null,null],
        row2 = [null,null,null,null,null,null,null,null],
        row3 = [null,null,null,null,null,null,null,null],
        row4 = [null,null,null,null,null,null,null,null],
        row5 = [null,null,null,null,null,null,null,null],
        row6 = [null,null,null,null,null,null,null,null],
        row7 = [null,null,null,null,null,null,null,null];
    //Define 2d array/matrix
    boardPosition = [row0,row1,row2,row3,row4,row5,row6,row7];
  }

  function drawGrid (boardWidth, boardHeight, boardPadding) {
    //grid width and height
    console.count('drawGrid')
    // Array.from(arguments).map((x) => {
    //   console.log(x);
    //   Math.round(x);
    //   console.log(x)
    // });
    // var boardWidth = Math.Round(boardWidth);
    // var boardWidth = Math.Round(boardWidth);
    
    console.log({boardWidth, boardHeight, boardPadding})
    if (boardWidth > 0 && boardHeight > 0) {
    // padding = 10; //padding around grid
    //draw vertical lines of grid
    context.clearRect(0, 0, layer1.width, layer1.height);
    
    linePadding = 0.5;
    context.beginPath();
    for (var x = 0; x <= boardWidth; x += (boardWidth/8)) {
      context.moveTo(linePadding + x + boardPadding, boardPadding);
      context.lineTo(linePadding + x + boardPadding, boardHeight + boardPadding);
    }
    //draw horizontal lines of grid
    for (var x = 0; x <= boardHeight; x += (boardHeight/8)) {
      context.moveTo(boardPadding, linePadding + x + boardPadding);
      context.lineTo(boardWidth + boardPadding, linePadding + x + boardPadding);
    }
    context.strokeStyle = "#323232";
    context.lineWidth = 1;
    context.stroke();
    }
  }
 
  function clearArray () {
    if (boardPosition) {
      boardPosition.map((_, yCoordinate) => {
        boardPosition[yCoordinate].map((value, xCoordinate) => {
          if (value == 1 || value == 0) {
            value = null;
            drawPieces(yCoordinate, xCoordinate, value);
          }
        });
      });
    }
  }

  function flippingLogTextAnimation () { 
    var messages = messageElement;
    if (messages.innerHTML == "Flipping.....") messages.innerHTML = "Flipping..";
    else {
      var flippingTextValue = messages.innerHTML;
      messages.innerHTML = flippingTextValue + ".";
    }
  }

  function endGame (resignation) {
    Meteor.call("othello.endGame", {gameId: Session.get("gameId"), resignation: resignation, userId: Meteor.user().username}, (err, res) => {
      if (err) console.log(err);
      else {
          if (res) {//Do something if game is ended
            clickInputAccepted = false; //To catch resignation
          } else return false;//Do something if server returns false
        }
      });
    } 

  function listenMouseDown (event) {
    if (clickInputAccepted && Meteor.user()){
      event = event || window.event; //Cross browser support for IE11
      var canvasOffset = $("#canvas2").offset();  //Get canvas offset using jQuery to get a relative mouse position
      var offset_x = canvasOffset.left;
      var offset_y = canvasOffset.top;

      //Remove offset from pageX and pageY to get an accurate position
      canvas_x = Math.round(event.pageX - offset_x);
      canvas_y = Math.round(event.pageY - offset_y);
      //console.log ("Mouse Click" + "\n" + "X: "+canvas_x+" Y: "+canvas_y);
      translateCoordinate(canvas_y,canvas_x);
    
    } else if (Meteor.user() == null) {
        messageElement.innerHTML = "Please login to play.";
      } else {
          var opponent;
          if (playerColorSelection == 0) opponent = "Black";
          else if (playerColorSelection == 1) opponent = "White";
          messageElement.innerHTML = `Waiting on ${opponent} to finish playing!`;
        }
  }

  function translateCoordinate (canvas_y, canvas_x) {
    //Determines which cell the coordinate from mouse listener belongs to
    cell_x = Math.floor((canvas_x - padding) / cellWidth);
    cell_y = Math.floor((canvas_y - padding) / cellWidth);
    if (debug) console.log (`Mouse x: ${canvas_x}
                             y: ${canvas_y}
                             Map x: ${cell_x}
                             y: ${cell_y}`);
    //console.log ("Mouse Click" + "\n" + "X: "+canvas_x+" Y: "+canvas_y);
    //Remove erroneous coordinates like outside the grid in the padding
    if (0 <= cell_x && cell_x < 8 && 0 <= cell_y && cell_y < 8) {
      validMove(cell_y, cell_x);
    }
    else messageElement.innerHTML = "Out of bounds. Try to keep it in the lines!";
  }

  function switchTurn () {
    var playerText = "";
    var messages = "";
    if (playerTurn == playerColorSelection){clickInputAccepted = true;}
    else {clickInputAccepted = false;}
    if (document.getElementById("whitePlayerWrapper") !== null
       && document.getElementById("blackPlayerWrapper")) {
      let whitePlayerWrapper = document.getElementById("whitePlayerWrapper");
      let blackPlayerWrapper = document.getElementById("blackPlayerWrapper");
      if (playerTurn == 0) {
          // playerText = "Player Turn: White";
        document.title = "White's turn - Othello";
        whitePlayerWrapper.classList.add('currentPlayerTurn');
        blackPlayerWrapper.classList.remove('currentPlayerTurn');

      } 
      else if (playerTurn == 1) {
        // playerText = "Player Turn: Black";
        document.title = "Black's turn - Othello";
        whitePlayerWrapper.classList.remove('currentPlayerTurn');
        blackPlayerWrapper.classList.add('currentPlayerTurn');
      }
    }
    if (playerColorSelection == playerTurn) messages = "Your move!";
    else messages = "Waiting on your opponent to play.";
    
    //-----Write messages to DOM----
    if (messageElement != null) messageElement.innerHTML = messages;
    var turnText = document.getElementById("turn");
    if (turnText != null) turnText.innerHTML = playerText;
  }


  function calculateScore() {
    var whiteScore = 0;
    var blackScore = 0;
    for (let y = 0; y < boardPosition.length; y++) {
      for (let x = 0; x < boardPosition[y].length; x++){
        if (boardPosition[y][x] == 0) whiteScore += 1;
        else if (boardPosition[y][x] == 1) blackScore += 1;
      }
    }
    updateScoreMessaging(whiteScore, blackScore);
  }

  function updateScoreMessaging (whiteScore, blackScore) {
    var whiteScoreValue = document.getElementById("whiteScoreValue");
    var blackScoreValue = document.getElementById("blackScoreValue");

    if (whiteScoreValue !== null && blackScoreValue !== null){
      
      if (whiteScore + blackScore <= 64){
        gameOn = true;
        whiteScoreValue.innerHTML = whiteScore;
        blackScoreValue.innerHTML = blackScore;
      }
      if (whiteScore + blackScore == 64) {
          clickInputAccepted = false;
          gameOn = false;
          whiteScoreValue.innerHTML = whiteScore;
          blackScoreValue.innerHTML = blackScore;
        if (whiteScore > blackScore) {         
          messageElement.innerHTML = `White player wins with ${whiteScore} pieces!`;
        } else if (blackScore > whiteScore) {
          messageElement.innerHTML = `Black player wins with ${blackScore} pieces!`;
        } else if (blackScore == whiteScore) {
          messageElement.innerHTML = "Draw! How unusual!";
        }
      } else if ((blackScore == 0 || whiteScore == 0) && (whiteScore > 2 || blackScore > 2)) {
        clickInputAccepted = false;
        gameOn = false;
        messageElement.innerHTML = whiteScore > 0 ? `White player wins with ${whiteScore} pieces!` : `Black player wins with ${blackScore} pieces!`;
      }

      if (gameOn == false) endGame(false);
    }
  }

  function validMove (cell_y, cell_x) {
    var noOppositeMatch = true;
    //Comment this out to prevent manual piece flipping
    // if (boardPosition[cell_y][cell_x] == 1 | boardPosition[cell_y][cell_x] == 0){addPiece(cell_y,cell_x);return false;} //Bypass move validation when there is already a piece in the square
    var validMoveGameObject = currentGameObject;
    if (validMoveGameObject[cell_y][cell_x] == null) { 
      clickInputAccepted = false;
      messageElement.innerHTML = "Flipping..";
      for (let dx = -1; dx <= 1; dx++){ //Iterate horizontally
        for (let dy = -1; dy <= 1; dy++) { //Iterate vertically
          if (typeof validMoveGameObject[cell_y + dy] !== 'undefined' 
              && typeof validMoveGameObject[cell_y + dy][cell_x + dx] !== 'undefined'){ //Prevent attempting to scan outside of the array
            if (dx == 0 && dy == 0) continue; //prevent boardPosition[cell_y][cell_x] from being processed
            var adjacentCellValue = validMoveGameObject[cell_y + dy][cell_x + dx];
            if (adjacentCellValue !== playerTurn
                && typeof adjacentCellValue !== 'undefined' 
                && adjacentCellValue != null) { //Evaluating for the opposite of playerTurn value
               if (debug) console.log("Adj x: " + (cell_x + dx) + " y: " + (cell_y + dy)); //Log the coordinates of the adjacent cell being checked to the console for debugging purposes
              //Evaluating the piece(s) beyond the adjacent tile to ensure that a flip is possible
              for (let multFactor = 2; (cell_y + (dy * multFactor)) >= 0 && (cell_x + (dx * multFactor)) >= 0  && (cell_y + (dy * multFactor)) <= 7 && (cell_x+(dx*multFactor)) <= 7; multFactor++){
                if (debug) console.log("Mult: " + multFactor + " x: "+ (cell_x + (dx * multFactor)) +" y: "+ (cell_y + (dy * multFactor)));
                if (validMoveGameObject[cell_y + (dy * multFactor)][cell_x + (dx * multFactor)] == playerTurn){ //If the end piece is the same as the player's color, write to a temporary array
                  multFactor -= 1; //To account for not flipping the end piece because the end piece has the max multFactor
                  while (multFactor >= 1) { //Write the coordinates of pieces that need to be flipped to two arrays with an index
                    currentGameObject[cell_y + (dy * multFactor)][cell_x + (dx * multFactor)] = playerTurn;
                    multFactor -= 1;
                  }
                  noOppositeMatch = false; //Indicated a match has been found
                  currentGameObject[cell_y][cell_x] = playerTurn;
                  break;
                }
                else if (validMoveGameObject[cell_y + (dy * multFactor)][cell_x + (dx * multFactor)] == null) break; //Break the loop if it encounters an empty tile
                else if (validMoveGameObject[cell_y + (dy * multFactor)][cell_x + (dx * multFactor)] !== playerTurn) continue; //If the piece beyond the adjacent is the same as the playerTurn, continue the for loop and increase the multFactor
              }
            }
          }
        }      
      }                  
      }

    if (noOppositeMatch) {
      messageElement.innerHTML = "Invalid Move: Can't let you do that, Star Fox!";
      if (debug) console.log("Invalid move");
      clickInputAccepted = true;
    }
    else if (noOppositeMatch == false){
      if (debug) console.log("validMove");
      updateGameData(Session.get("gameId"), currentGameObject);
      // intervalDelay(intervalDelayValue); //Call the intervalDelay to start flipping the remaining pieces through the returnFlipCoordinate function
    }
  }//End validMove

  function intervalDelay (intervalDelayValue) {
    intSet = setInterval(returnFlipCoordinate, intervalDelayValue);
  }

  function returnFlipCoordinate () {
     if (flipCoordinate_x.length > 0) {
      if (debug) console.log(`Flip x: ${cell_x} y: ${cell_y}`);
        flippingLogTextAnimation();
        cell_x = flipCoordinate_x.pop();
        cell_y = flipCoordinate_y.pop();
        addPiece(cell_y, cell_x);
        drawMarker(cell_y, cell_x, false, playerColorSelection !== playerTurn);
    } else {
    // if(gameOn){clickInputAccepted = true;}
    //Update Collection after all pieces are flipped and the currentGameObject has reflected all of the changes
      // if(clientUpdated){ updateGameData(Session.get("gameId"), currentGameObject);}
      // clientUpdated = false;
      clearInterval(intSet);
    }
  }

  function addPiece(cell_y, cell_x) { 
    var thisCell = boardPosition[cell_y][cell_x];
    if (thisCell == null) boardPosition[cell_y][cell_x] = playerTurn;
    //-----Called to flip the piece data-----------
    else if (thisCell == 0)  boardPosition[cell_y][cell_x] = 1; //Used by returnFlipCoordinate function for flipping pieces
    else if (thisCell == 1) boardPosition[cell_y][cell_x] = 0;//Used by returnFlipCoordinate function for flipping pieces
    drawPieces(cell_y, cell_x, currentGameObject[cell_y][cell_x]);
    if (notBoardReset) calculateScore();
  }//End addPiece

  function drawPieces (yPosition, xPosition, pieceColor) {
    // radius = 20; padding = 10; cellWidth = 50;
    //implement random positioning within cell for added interest and analog feel
    //uses a random number to vary between a value -1 to +1
    var randomX = Math.floor((Math.random() * 3)) - 1;
    var randomY = Math.floor((Math.random() * 3)) - 1;

    var centerX = cellWidth / 2 + padding + randomX + cellWidth * xPosition;
    var centerY = cellWidth / 2 + padding + randomY + cellWidth * yPosition;
    var pieceGradient = contextPieces.createRadialGradient(
      centerX,
      centerY,
      radius / 1.5,
      centerX,
      centerY,
      radius
    );
    
    if (pieceColor == 0) { //White piece gradient
      pieceGradient.addColorStop(0, "white");
      pieceGradient.addColorStop(1, "#cfcfcf");
      contextPieces.strokeStyle = '#404040';  //Old value #585858
      
    } else if (pieceColor == 1) { //Black piece gradient
      pieceGradient.addColorStop(0, "#202020");
      pieceGradient.addColorStop(1, "black");
      contextPieces.strokeStyle = '#b3b3b3'; //'#E0E0E0'
    
    } else if (pieceColor == null) { //Clear existing piece and exit function
      contextPieces.clearRect(centerX - cellWidth/2, centerY - cellWidth/2, cellWidth, cellWidth);
      return false;
    }

    //draw circle with gradient fill
    contextPieces.clearRect(centerX - cellWidth/2, centerY - cellWidth/2, cellWidth, cellWidth);
    contextPieces.beginPath();
    contextPieces.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    contextPieces.fillStyle = pieceGradient;
    contextPieces.lineWidth = 0.5;
    contextPieces.imageSmoothingEnabled = false;
    if (debug) console.log("Draw x: " + xPosition + " y: " + yPosition);
    contextPieces.fill();
    contextPieces.stroke();
  }
//initialPiece is a boolean value representing the piece played by the player
  function drawMarker (y, x, initialPiece, thisUserTurn) { 
    var yCoordinate = padding + cellWidth * y;
    var xCoordinate = padding + cellWidth * x;
    var centerY = yCoordinate + cellWidth / 2;
    var centerX = xCoordinate + cellWidth / 2;
    
    var markerGradient = contextMarkers.createRadialGradient(
      centerX,
      centerY,
      radius * 0.9,
      centerX,
      centerY,
      radius * 1.8,
    );

    if (thisUserTurn){
      if (initialPiece){
        // var markerGradient = 'rgba(0,0,125,0.4)';
        markerGradient.addColorStop(0, "rgba(0,0,125,0.4)");
        markerGradient.addColorStop(1, "rgba(0,0,125,0.5)");
      } else {
        // var markerGradient = 'rgba(0,0,125,0.2)';
        markerGradient.addColorStop(0, "rgba(0,0,125,0.2)");
        markerGradient.addColorStop(1, "rgba(0,0,125,0.3)");
      }
    } else {
        if (initialPiece){
          // var markerGradient = 'rgba(0,0,125,0.4)';
          markerGradient.addColorStop(0, "rgba(125,0,0,0.4)");
          markerGradient.addColorStop(1, "rgba(125,0,0,0.5)");
        } else {
          // var markerGradient = 'rgba(0,0,125,0.2)';
          markerGradient.addColorStop(0, "rgba(125,0,0,0.2)");
          markerGradient.addColorStop(1, "rgba(125,0,0,0.3)");
        }
    }
    contextMarkers.clearRect(centerX - cellWidth/2, centerY - cellWidth/2, cellWidth, cellWidth);
    var bufferValue = 0;
    contextMarkers.fillStyle = markerGradient;
    contextMarkers.imageSmoothingEnabled = false;
    contextMarkers.fillRect(
      centerX - cellWidth/2 + bufferValue + linePadding,
      centerY - cellWidth/2 + bufferValue + linePadding,
      cellWidth - (bufferValue * 2),
      cellWidth - (bufferValue * 2)
    );
  }

  function clearMarkerCanvas () { contextMarkers.clearRect(0, 0, cellWidth*8+padding*2, cellWidth*8+padding*2);}
  
  function globalDebug () {  //Accessible through the console for debugging purposes
    function debugMode () {
      debug = true;
      console.log("Debug mode on!");
      return true;
    } 
    window.debugMode = debugMode; //Assign function to global window property
  }

  function returnGameDocument() {
    var currentGameData = {};
    if (Session.get("gameId") !== 'null' && Session.get("gameId") !== undefined) {
      Meteor.call('othello.readGameData',
       { gameId: Session.get("gameId")},
       (err, res) => {
    if (err) console.log(err);
    else { 
        console.log(res)
        var pastGameData = res['pastTurnData'];
        var pastGameObject = [];
        if (pastGameData['turnPieceData'] !== undefined) {
          pastGameObject = pastGameData['turnPieceData'];
        }
        if (boardPosition[4][4] == null) readCollection(pastGameObject); //Todo: rework as a true comprehensive comparison instead of a spot check
        currentGameData = res['currentTurnData'];
        if (debug) console.log(currentGameData);
        if (currentGameData !== undefined) {
          currentGameObject = currentGameData['turnPieceData'];
          playerTurn = currentGameData['playerTurn'];
          if (debug) console.log('Player Turn: '+ playerTurn);
          var thisUserTurn = false;
          if (currentGameData['updatedBy'] == Meteor.user().username) thisUserTurn = true;
          diffCollections(pastGameObject, currentGameObject, thisUserTurn);
          if (notBoardReset) calculateScore();
          if (gameOn) switchTurn(); //console.count("switchTurn - returnGameDocument");
        }
        else console.log(`No match for gameId: ${Session.get("gameId")}`);
        }
      });
    }//currentGame if statement
    else console.log('No gameId');
  }

 

  function diffCollections (pastGameObject, currentGameObject, thisUserTurn) {
    console.log('diffCollections', pastGameObject, currentGameObject);

    if (pastGameObject.length < 1 || boardPosition == undefined) {
      readCollection(currentGameObject);
    } else {
      for (var y = 0; y < (currentGameObject).length; y++) {
        for (var x = 0; x < (currentGameObject[y]).length; x++){
          if (currentGameObject[y][x] !== null
              && pastGameObject[y]
              && currentGameObject[y][x] !== pastGameObject[y][x]) {
              if (pastGameObject[y][x] == null) { //Identify the opponents piece that they placed
                boardPosition[y][x] = currentGameObject[y][x];
                drawPieces(y, x, currentGameObject[y][x]); //Add opponents selection first
                clearMarkerCanvas();
                drawMarker(y, x, true, thisUserTurn);
              } else {
                  flipCoordinate_y.push(y);
                  flipCoordinate_x.push(x);
              }
          }
        }
      }
      notBoardReset = true;
      if (flipCoordinate_x.length > 0) intervalDelay(intervalDelayValue);
      
    }
  }

  function readCollection (gameObject) {
    console.count('readCollection')
    clearMarkerCanvas();
    clearArray();

    // Object.keys(gameObject).map((y, j) => {
    //   Object.keys(gameObject[j]).map((x, i) => {
    //     boardPosition[j][i] = x[i];
    //     if (x !== null) drawPieces (j, i, x);
    //   });
    // });
    for (var y = 0; y < (gameObject).length; y++) {
      for (var x = 0; x < (gameObject[y]).length; x++) {
        boardPosition[y][x] = gameObject[y][x];
        if (x !== null) drawPieces (y, x, gameObject[y][x]);
      }
    }
  }

   function updateGameData (currentGameId, currentGameObject) {
    Meteor.call('othello.updateGameData', {
      gameId: currentGameId,
      changedGameData: currentGameObject,
      currentPlayerTurn: playerColorSelection,
      updatedBy: Meteor.user().username
    }, (err, res) => {
      if (err) alert(err);
      else if (debug) console.count("updateGameData");
    });
  }

  const timeoutResizeEvent = () => {
		clearTimeout(timeoutResize);
		timeoutResize = setTimeout(resizingDeclarations, 200);
	}


  function gameInit(){ //Function is exported as a module
      // document.addEventListener("DOMContentLoaded", () => {
      $(document).ready(() => { //DOMContentLoaded will not fire if already loaded
      getCanvasContext();
      window.addEventListener('resize', timeoutResizeEvent);
      
      if (debug) console.count("gameInit");
      messageElement = document.getElementById('messages');``
      document.title = "Othello";
      currentGameObject = {};
      notBoardReset = true;
      intSet = null;
      buttonListeners();
      resizingDeclarations();
      setInitialPosition();
      globalDebug();
    
      document.addEventListener('keypress', () => {
        let message = document.getElementById("message");
        if (message) message.focus();
      });
      $('#chat-message').animate({ scrollTop: $('#chat-end').offset().top }, 'slow'); //Scroll to the chat end div on page load
      whatPlayerAmI(Session.get("gameId"));
      pieceObserver();
      returnGameDocument();
    });
  }

 document.addEventListener('DOMContentLoaded', () => setSession(sessionStorage.getItem("gameId")));


//-------Modules----------------
  export {gameInit}; //Export the init function to be called by templates.js to control single page session
} //End isClient

