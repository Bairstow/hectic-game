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
    currPos: null,
    targetedPos: null,
    mousePos: null,
    gamePieces: null,
    breakPieceStatus: false,
    breakRowStatus: false,
    breakBoardStatus: false,
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
          marker: [x,y],
          markerElt: null,
          id: ((x * game.data.boardSize) + y)
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
    }
  },
  movePieceUp: function(pieces, pX, pY) {
    // piece move up (in the -y direction) and copying displaced piece into origin position
    if (pY > 0) {
      var temp = pieces[pX][pY - 1];
      pieces[pX][pY - 1] = pieces[pX][pY];
      pieces[pX][pY] = temp;
    }
  },
  movePieceDown: function(pieces, pX, pY) {
    // piece move down (in the +y direction) and copying displaced piece into origin position
    if (pY < game.data.boardSize - 1) {
      var temp = pieces[pX][pY + 1];
      pieces[pX][pY + 1] = pieces[pX][pY];
      pieces[pX][pY] = temp;
    }
  },
  movePieceLeft: function(pieces, pX, pY) {
    // piece move left (in the -x direction) and copying displaced piece into origin position
    if (pX > 0) {
      var temp = pieces[pX - 1][pY];
      pieces[pX - 1][pY] = pieces[pX][pY];
      pieces[pX][pY] = temp;
    }
  },
  movePieceRight: function(pieces, pX, pY) {
    // piece move right (in the +x direction) and copying displaced piece into origin position
    if (pX < game.data.boardSize - 1) {
      var temp = pieces[pX + 1][pY];
      pieces[pX + 1][pY] = pieces[pX][pY];
      pieces[pX][pY] = temp;
    }
  },
  movePiece: function(oldPos, newPos) {
    // pieces can only be moved in cardinal directions
    ///debugger
    if (oldPos[0] === newPos[0] ||
        oldPos[1] === newPos[1]) {
      var currPos = [oldPos[0],oldPos[1]];
      while (currPos[0] !== newPos[0] || currPos[1] !== newPos[1]) {
        // check directional discrepancy and adjust appropriately
        if (currPos[0] < newPos[0]) {
          game.movePieceRight(game.data.gamePieces, currPos[0], currPos[1]);
          currPos[0] += 1;
        }
        if (currPos[0] > newPos[0]) {
          game.movePieceLeft(game.data.gamePieces, currPos[0], currPos[1]);
          currPos[0] -= 1;
        }
        if (currPos[1] < newPos[1]) {
          game.movePieceDown(game.data.gamePieces, currPos[0], currPos[1]);
          currPos[1] += 1;
        }
        if (currPos[1] > newPos[1]) {
          game.movePieceUp(game.data.gamePieces, currPos[0], currPos[1]);
          currPos[1] -= 1;
        }
      }
    } else {
      return oldPos;
    }
    return newPos;
  },
  // assign selected pos
  setSelectedPos: function(pX, pY) {
    game.data.currPos = [pX, pY];
    game.data.originalPos = [pX, pY];
  },
  // assign targeted pos
  setTargetedPos: function(pX, pY) {
    game.data.targetedPos = [pX, pY];
  },
  // assign current mouse coords
  setMousePos: function(pX, pY) {
    game.data.mousePos = [pX, pY];
  },
  // function takes an element and assigns it a new category and moves it to top of its column
  replacePiece: function(oldPos) {
    // set new random category for the piece and move it to the 0 position of it column (i.e the
    // top of the current column);
    var topOfColumn = [oldPos[0], 0];
    game.data.gamePieces[oldPos[0]][oldPos[1]].marker = [oldPos[0], -1];
    game.data.gamePieces[oldPos[0]][oldPos[1]].category = Math.floor(Math.random() * 6);
    game.movePiece(oldPos, topOfColumn);
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
  replaceMatches: function(matches) {
    var newMatchPositions = matches;
    while (newMatchPositions.length > 0) {
      _.each(newMatchPositions, function(matchPosition) {
        game.replacePiece(matchPosition);
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
  clearSelections: function() {
    game.data.currPos = null;
    game.data.targetedPos = null;
    game.data.originalPos = null;
    game.data.hoverPos = null;
  },
  updateMarkerPositions: function(stepDistance) {
    game.allPieces(game.data.gamePieces, function(pieces, x, y) {
      var xDist = x - pieces[x][y].marker[0];
      var yDist = y - pieces[x][y].marker[1];
      if (xDist || yDist) {
        //debugger
      }
      // if discrepancy between marker and tile x positions step closer together
      if (xDist) {
        if (Math.abs(xDist) < stepDistance) {
          // move marker back to tile position
          pieces[x][y].marker[0] = x;
        } else if (xDist < 0) {
          pieces[x][y].marker[0] -= stepDistance;
        } else {
          pieces[x][y].marker[0] += stepDistance;
        }
      }
      if (yDist) {
        if (Math.abs(yDist) < stepDistance) {
          // move marker back to tile position
          pieces[x][y].marker[1] = y;
        } else if (yDist < 0) {
          pieces[x][y].marker[1] -= stepDistance;
        } else {
          pieces[x][y].marker[1] += stepDistance;
        }
      }
    });
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
  // function containing game logic to be run on cycle
  updateGameState: function() {
    // initial checks and handling of run status/end-of-game conditions
    if (game.data.runStatus === 1) {
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
        game.clearSelections();
      }
    }
    // return currPos to its original position
    if (game.data.currPos) {
      if (game.data.currPos[0] !== game.data.originalPos[0] ||
          game.data.currPos[1] !== game.data.originalPos[1]) {
        game.movePiece(game.data.currPos, game.data.originalPos);
      }
    }
    // if player has input a move update piece position and then replace matches.
    if (game.data.originalPos && game.data.targetedPos) {
      // move piece to target position, check matches, leave if matches found or move back to original
      // position if there is none.
      game.movePiece(game.data.originalPos, game.data.targetedPos);
      var newMatchPositions = game.collectMatches();
      if (newMatchPositions.length) {
        game.replaceMatches(newMatchPositions);
      } else {
        game.movePiece(game.data.targetedPos, game.data.originalPos);
      }
      // after move attempt remove all current selection data
      game.clearSelections();
    } else {
      // check if current cursor position overlaps a tile location
      var hoverPos = display.checkMouseLocation();
      if (hoverPos && game.data.originalPos) {
        game.data.currPos = game.movePiece(game.data.originalPos, hoverPos);
      }
    }
    // decrement the multiplier based on time
    if (game.data.multiplier > 0) {
      game.data.multiplier -= Math.min(0.001, game.data.multiplier);
    }
    // update piece marker positions (where arg is step distance, 1 = tilewidth)
    game.updateMarkerPositions(0.2);
  },
  startNewRound: function() {
    // set initial conditions
    game.data.startTime = Date.now();
    game.data.gamePieces = game.generateBoard();
    // reattach a marker element to each of the game pieces
    display.drawGamePieces();
    game.data.time = 30;
    game.data.score = 0;
    game.data.runStatus = 1;
    game.data.breakPieceStatus = true;
    game.data.breakRowStatus = true;
    game.data.breakBoardStatus = true;
    display.drawGameBreaks();
    display.setGameEnabled();
  },
  // group functions calls to be made on page initiation
  init: function() {
      game.data.gamePieces = game.generateBoard();
      display.drawPage();
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
