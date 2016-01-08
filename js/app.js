// import via jquery
var helpersLoaded = false;
var displayLoaded = false;
var handlersLoaded = false;
$.getScript("js/helpers.js", function(data) {
  helpersLoaded = true;
  console.log('helpers.js loaded...');
});
$.getScript("js/display.js", function(data) {
  displayLoaded = true;
  console.log('display.js loaded...');
});
$.getScript("js/handlers.js", function(data) {
  handlersLoaded = true;
  console.log('handlers.js loaded...');
});

// data object containing game variables and logic definitions
var game = {
  // game related data
  data: {
    // flag current game status (filling, waiting, moving)
    gameStatus: 'waiting',
    runStatus: 0,
    boardSize: 8,
    selectedPiece: null,
    targetedPiece: null,
    hoverPiece: null,
    gamePieces: null,
    startTime: null,
    time: 0,
    multiplier: 0,
    score: 0
  },
  // function for generating initial board positions
  generateBoard: function() {
    var newPieces = [];
    _.each(_.range(game.data.boardSize), function(x) {
      var newCol = [];
      _.each(_.range(game.data.boardSize), function(y) {
        var newPiece = {
          category: Math.floor(Math.random() * 6),
        };
        newCol.push(newPiece);
      });
      newPieces.push(newCol);
    });
    game.allPieces(newPieces, game.unmatchPieces);
    return newPieces;
  },
  // function taking all pieces and perform action on each
  allPieces: function(pieces, pieceOperation) {
    _.each(pieces, function(col, x) {
      _.each(col, function(piece, y) {
        pieceOperation(pieces, x, y);
      });
    });
  },
  // piece operation checking match for given position
  checkMatch: function(pieces, pX, pY, selectPos) {
    // removal of pieces requires all parts of match to be flagged so search will be done in all cardinal directions
    // three pieces in a row of the same category constitutes a match.
    var target = pieces[pX][pY];
    var matched = false;
    if (selectPos) {
      target = pieces[selectPos[0]][selectPos[1]];
      console.log('Checking selection at: ', selectPos);
    }
    // search -y direction (up)
    if (pY >= 2 &&
        pieces[pX][pY-1].category === target.category &&
        pieces[pX][pY-2].category === target.category) {
      matched = true;
    }
    // search +x direction (right)
    if (pX < (game.data.boardSize - 2) &&
        pieces[pX+1][pY].category === target.category &&
        pieces[pX+2][pY].category === target.category) {
      matched = true;
    }
    // search +y direction (down)
    if (pY < (game.data.boardSize - 2) &&
        pieces[pX][pY+1].category === target.category &&
        pieces[pX][pY+2].category === target.category) {
      matched = true;
    }
    // search -x direction (left)
    if (pX >= (2) &&
        pieces[pX-1][pY].category === target.category &&
        pieces[pX-2][pY].category === target.category) {
      matched = true;
    }
    // search top-bottom (i.e. target is in the middle)
    if (pY >= 1 && pY < (game.data.boardSize - 1) &&
        pieces[pX][pY-1].category === target.category &&
        pieces[pX][pY+1].category === target.category) {
      matched = true;
    }
    // search left-right
    if (pX >= 1 && pX < (game.data.boardSize - 1) &&
        pieces[pX-1][pY].category === target.category &&
        pieces[pX+1][pY].category === target.category) {
      matched = true;
    }
    // return result based on findings
    if (matched) {
      return true;
    } else {
      return false;
    }
  },
  // piece operation to randomise initial types so no matches to begin
  unmatchPieces: function(pieces, pX, pY) {
    while (game.checkMatch(pieces, pX, pY)) {
      pieces[pX][pY].category = Math.floor(Math.random() * 6);
      pieces[pX][pY].matched = false;
    }
  },
  // find selected piece from gamePieces
  setSelectedPiece: function(pX, pY) {
    // redundant assignment functions that used to contain more logic.
    game.data.selectedPiece = [pX, pY];
    game.data.originalPos = [pX, pY];
  },
  // find selected piece from gamePieces
  setTargetedPiece: function(pX, pY) {
    game.data.targetedPiece = [pX, pY];
  },
  // find selected piece from gamePieces
  setHoverPiece: function(pX, pY) {
    game.data.hoverPiece = [pX, pY];
  },
  // run selection logic to see if piece move is valid and if so exchange piece positions
  attemptMovePiece: function() {
    // check move validity. i.e. selection and target must share either row or column
    if (game.data.selectedPiece[0] === game.data.targetedPiece[0] ||
        game.data.selectedPiece[1] === game.data.targetedPiece[1]) {
      // move piece first to check the match then if it fails move it back.
      game.movePiece(game.data.gamePieces, game.data.selectedPiece, game.data.targetedPiece);
      var matched = false;
      game.allPieces(game.data.gamePieces, function(pieces, pX, pY) {
        if (game.checkMatch(pieces, pX, pY)) {
          matched = true;
        }
      });
      if (!matched) {
        // new positions do not form a new match move the piece back to original position
        game.movePiece(game.data.gamePieces, game.data.targetedPiece, game.data.selectedPiece);
      }
    }
    game.clearSelections();
  },
  // show temporary position replacement checking cardinal movement requirements but
  // not checking matching criteria.
  temporaryMove: function(pieceOrigin, pieceDestination) {
    // check move validity. i.e. selection and target must share either row or column
    if (pieceOrigin[0] === pieceDestination[0] ||
        pieceOrigin[1] === pieceDestination[1]) {
      // move piece first to check the match then if it fails move it back.
      game.movePiece(game.data.gamePieces, pieceOrigin, pieceDestination);
    }
  },
  // cycle through game pieces and build positional list of pieces that are currently matched
  collectMatches: function() {
    var matchList = [];
    game.allPieces(game.data.gamePieces, function(pieces, pX, pY) {
      if (game.checkMatch(pieces, pX, pY)) {
        matchList.push([pX, pY]);
      }
    });
    return matchList;
  },
  // function takes an element that is to be removed from the game board either through
  // a match or by some other game function and the shifts all pieces above the target
  // in the column down and generates a new pieces to fill the empty position at the top
  replacePiece: function(pieces, oldPos) {
    var removedPiece = pieces[oldPos[0]].splice(oldPos[1], 1);
    var newPiece = {
      category: Math.floor(Math.random() * 6),
    };
    pieces[oldPos[0]].unshift(newPiece);
  },
  // function to move a piece to new position and update the displaced pieces in
  // the shared row or column to the new positions
  movePiece: function(pieces, oldPos, newPos) {
    // two seperate handling cases depending on whether the move is in a column or in a row
    // sanity check to catch and return if the selection and target positions are the same
    if (oldPos[0] === newPos[0] && oldPos[1] === newPos[1]) {
      return;
    } else if (oldPos[0] === newPos[0]) {
      // handle column movement first
      // pull selected piece from current position.
      var movingPiece = pieces[oldPos[0]].splice(oldPos[1], 1)[0];
      // push selected piece back to new position
      pieces[oldPos[0]].splice(newPos[1], 0, movingPiece);
    } else {
      // otherwise movement will be in the horizontal
      var movingPiece = pieces[oldPos[0]].splice(oldPos[1], 1)[0];
      var moveDirection = (oldPos[0] < newPos[0] ? 1:-1);
      var currentCol = oldPos[0];
      var targetCol = oldPos[0] + moveDirection;
      // until target column is move the piece in the adjoining column into the vacated position
      while (targetCol !== newPos[0]) {
        // move displaced piece
        var displacedPiece = pieces[targetCol].splice(oldPos[1], 1)[0];
        pieces[currentCol].splice(oldPos[1], 0, displacedPiece);
        // update positioning variables
        targetCol += moveDirection;
        currentCol += moveDirection;
      }
      // target column reached so insert the selected piece at its new position
      var displacedPiece = pieces[targetCol].splice(oldPos[1], 1)[0];
      pieces[currentCol].splice(oldPos[1], 0, displacedPiece);
      pieces[targetCol].splice(oldPos[1], 0, movingPiece);
    }
  },
  clearSelections: function() {
    game.data.selectedPiece = null;
    game.data.targetedPiece = null;
    game.data.originalPos = null;
    game.data.hoverPiece = null;
  },
  breakRandomPiece: function() {
    // mark random board piece to break
    var randX = Math.floor(Math.random() * game.data.boardSize);
    var randY = Math.floor(Math.random() * game.data.boardSize);
    // grey out piece button
    $('.game-breaks-piece').css('opacity', '0.2');
    var matchList = [[randX,randY]];
    game.replaceMatches(matchList);
  },
  breakRandomRow: function() {
    // mark random row to break
    var randY = Math.floor(Math.random() * game.data.boardSize);
    // grey out row button
    $('.game-breaks-row').css('opacity', '0.2');
    var matchList = [];
    for (var x = 0; x < game.data.boardSize; x++) {
      matchList.push([x,randY]);
    }
    game.replaceMatches(matchList);
  },
  breakBoard: function() {
    // grey out board button
    $('.game-breaks-board').css('opacity', '0.2');
    var matchList = [];
    for (var x = 0; x < game.data.boardSize; x++) {
      for (var y = 0; y < game.data.boardSize; y++) {
        matchList.push([x,y]);
      }
    }
    game.replaceMatches(matchList);
  },
  replaceMatches: function(forcedMatches) {
    var newMatchPositions = []
    if (forcedMatches) {
      newMatchPositions = forcedMatches;
    } else {
      newMatchPositions = game.collectMatches();
    }
    while (newMatchPositions.length > 0) {
      _.each(newMatchPositions, function(matchPosition) {
        game.replacePiece(game.data.gamePieces, matchPosition);
        // whenever a piece is removed increment the score
        game.data.score += (1 * (1 + game.data.multiplier));
      });
      // increment based on number of matches found (matching more than 2 in a cycle bumps)
      if (newMatchPositions.length > 2) {
        game.data.multiplier += 0.06 * (newMatchPositions.length - 2);
        if (game.data.multiplier > 1) { game.data.multiplier = 1 };
      }
      newMatchPositions = game.collectMatches();
    }
  },
  // function containing game logic to be run on cycle
  updateGameState: function() {
    // initial checks and handling of run status
    if (game.data.runStatus === 0) {
      display.setGameDisabled();
    } else if (game.data.runStatus === 1) {
      display.setGameEnabled();
      var newTS = Date.now();
      var oldTS = game.data.startTime;
      var elapsed = newTS - oldTS;
      game.data.startTime = newTS;
      game.data.time -= elapsed/1000;
      if (game.data.time < 0) {
        // timer has run out and round has been completed
        game.data.time = 0;
        game.data.multiplier = 0;
        game.data.runStatus = 0;
      }
    }
    if (game.data.selectedPiece && game.data.targetedPiece) {
      // player has input an attempted move
      // return selected piece to its original positon and update
      game.temporaryMove(game.data.selectedPiece, game.data.originalPos);
      game.data.selectedPiece = game.data.originalPos;
      game.attemptMovePiece();
      game.replaceMatches();
    }
    // decrement the multiplier based on time
    if (game.data.multiplier > 0) {
      game.data.multiplier -= Math.min(0.001, game.data.multiplier);
    }
  },
  startNewRound: function() {
    // set initial conditions
    game.data.startTime = Date.now();
    game.data.gamePieces = game.generateBoard();
    game.data.time = 30;
    game.data.score = 0;
    game.data.runStatus = 1;
    display.drawGameBreaks();
    display.setGameEnabled();
  },
  // group functions calls to be made on page initiation
  init: function() {
      display.setHandles();
      // make sure container is set to full page size.
      display.setContainerHeight();
      display.drawNavBar();
      display.setFooterWidth();
      display.showLandingPage();
      game.data.gamePieces = game.generateBoard();
      handlers.setAll();
      display.animate();
  }
};

// wait on script loading and then execute game initiation
var scriptID = null;
var checkScripts = function() {
  if (helpersLoaded && displayLoaded && handlersLoaded) {
    console.log('All scripts loaded.');
    window.clearTimeout(scriptID);
    game.init();
  } else {
    scriptID = window.setTimeout(checkScripts, 200);
    console.log('Waiting on scripts...');
  }
};
// HAX
$(document).ready(function() {
  scriptID = window.setTimeout(checkScripts, 200);
});
