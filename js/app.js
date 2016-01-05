// data object for holding helper functions
var helpers = {
  elt: function(name, className, id) {
    var newElt = document.createElement(name);
    if (className) {
      newElt.setAttribute('class', className);
    }
    if (id) {
      newElt.setAttribute('id', id);
    }
    return newElt;
  },
  eltNS: function(name, className, id) {
    // element creation assist
    var elt = document.createElementNS("http://www.w3.org/2000/svg",name);
    if (className) {
      elt.setAttribute('class', className);
    }
    if (id) {
      elt.setAttribute('id', id);
    }
    return elt;
  },
  setAtts: function(elt) {
    for (var i = 1; i < arguments.length; i++) {
      elt.setAttribute(arguments[i][0], arguments[i][1]);
    }
  }
};

// data holder for display information
var display = {
  viewportWidth: null,
  viewportHeight: null,
  pieceColors: ['#0F8', '#F08', '#08F', '#F80', '#80F', '#8F0'],
  gameTiles: null,
  selectedTile: null,
  targetedTile: null,
  groups: {
    $container: null,
    $logo: null,
    $playSelect: null,
    $gameBoard: null,
    $footer: null,
  },
  elts: {
    $siteIcon: null,
    $select1P: null,
    $select2P: null,
    $gameBoard: null,
  },
  // grab DOM handles
  setHandles: function() {
    display.groups.$container = $('.container');
    display.elts.$siteIcon = $('.site-icon');
    display.groups.$logo = $('.logo-row');
    display.groups.$playSelect = $('.play-select-row');
    display.elts.$select1P = $('#select-one-player');
    display.elts.$select2P = $('#select-two-player');
    display.groups.$gameBoard = $('.game-board-row');
    display.elts.$gameBoard = $('.game-board');
    display.groups.$footer = $('.footer-row');
  },
  // function to update display variables
  getViewportDimensions: function() {
    display.viewportWidth = $(window).width();
    display.viewportHeight = $(window).height();
  },
  // function for retrieving viewport dimensions
  getViewportWidth: function() {
    display.getViewportDimensions();
    return display.viewportWidth;
  },
  getViewportHeight: function() {
    display.getViewportDimensions();
    return display.viewportHeight;
  },
  // function to ensure container element fits to length of the page
  setContainerHeight: function() {
    var currHeight = display.getViewportHeight();
    display.groups.$container.css('height', String(currHeight) + 'px')
  },
  // function to ensure footer is fitted to container elements
  setFooterWidth: function() {
    var containerWidth = display.groups.$container.width();
    display.groups.$footer.css('width', String(containerWidth) + 'px')
  },
  // function to opening landing page
  showLandingPage: function() {
    // display/hide relevant dom elements to the player.
    display.groups.$logo.css('display', 'block');
    display.groups.$playSelect.css('display', 'block');
    display.groups.$gameBoard.css('display', 'none');
  },
  // function to open a game view
  showGamePage: function() {
    display.groups.$logo.css('display', 'none');
    display.groups.$playSelect.css('display', 'none');
    // update board height to reflect width
    display.groups.$gameBoard.css('visibility', 'hidden');
    display.groups.$gameBoard.css('display', 'block');
    var gameBoardWidth = display.elts.$gameBoard.width();
    display.elts.$gameBoard.css('height', String(gameBoardWidth) + 'px');
    display.groups.$gameBoard.css('visibility', 'visible');
    display.redrawGameTiles();
  },
  // function to run at new game instantiation to setup background board tiles.
  drawGameTiles: function() {
    // setup a mirrored set of arrays that will hold the tile DOM elements associated with each piece
    var newTiles = [];
    _.each(_.range(game.data.boardSize), function(x) {
      var newCol = [];
      _.each(_.range(game.data.boardSize), function(y) {
        var newTile = helpers.elt('div','game-tile u-pull-left');
        // set tile specific style properties (offsets *and color for testing*)
        newTile.style.backgroundColor = display.pieceColors[game.data.gamePieces[x][y].category];
        newTile.setAttribute('data-selected', false);
        newTile.setAttribute('data-targeted', false);
        display.elts.$gameBoard.append($(newTile));
        newCol.push(newTile);
      });
      newTiles.push(newCol);
    });
    display.gameTiles = newTiles;
    // calculate and update tile properties based on current board size
    var boardWidth = display.elts.$gameBoard.width();
    display.elts.$gameBoard.css('padding', String(boardWidth * 0.048) + 'px');
    var tileWidth = boardWidth * 0.9 / game.data.boardSize;
    $('.game-tile').css('width', String(tileWidth * 0.9) + 'px');
    $('.game-tile').css('height', String(tileWidth * 0.9) + 'px');
    $('.game-tile').css('margin', String(tileWidth * 0.05) + 'px');
    $('.game-tile').css('border-radius', '1rem');
    $('.game-tile').css('opacity', '0.8');
    handlers.setTileSelection();
  },
  redrawGameTiles: function() {
    $('.game-tile').remove();
    display.elts.$gameBoard.css('padding', '0px');
    game.data.gamePieces = game.generateBoard();
    display.drawGameTiles();
  }
};

// data object to contain event listeners logic and handling.
var handlers = {
  setHomeButton: function() {
    display.elts.$siteIcon.on('click', function() {
      display.showLandingPage();
    });
  },
  setPlayButton: function() {
    display.elts.$select1P.on('click', function() {
      display.showGamePage();
    });
  },
  setResizeHandling: function() {
    // update dynamically generated elements on window resizing event.
  },
  setTileSelection: function() {
    $('.game-tile').on('mousedown', function(event) {
      event.target.style.backgroundColor = '#FFF';
      event.target.setAttribute('data-selected', true);
      display.selectedTile = event.target;
      game.setSelectedPiece();
    });
    $('.game-tile').on('mouseup', function() {
      event.target.setAttribute('data-targeted', true);
      display.targetedTile = event.target;
      game.setTargetedPiece();
      // todo clear highlighting on selected tile.
      game.attemptMovePiece();
    });
  },
  // set all event handlers
  setStartingHandlers: function() {
    handlers.setHomeButton();
    handlers.setPlayButton();
    handlers.setResizeHandling();
  }
};

// data object containing game variables and logic definitions
var game = {
  // game related data
  data: {
    // flag current game status
    gameStatus: 0,
    boardSize: 8,
    selectedPiece: null,
    targetedPiece: null,
    gamePieces: null,
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
          position: [x, y],
          matched: false
        }
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
  checkMatch: function(pieces, pX, pY) {
    // removal of pieces requires all parts of match to be flagged so search will be done in all cardinal directions
    // three pieces in a row of the same category constitutes a match.
    var target = pieces[pX][pY];
    // search -y direction (up)
    if (pY >= 2 &&
        pieces[pX][pY-1].category === target.category &&
        pieces[pX][pY-2].category === target.category) {
      target.matched = true;
      return true;
    }
    // search +x direction (right)
    if (pX < (game.boardSize - 2) &&
        pieces[pX+1][pY].category === target.category &&
        pieces[pX+2][pY].category === target.category) {
      target.matched = true;
      return true;
    }
    // search +y direction (down)
    if (pY < (game.boardSize - 2) &&
        pieces[pX][pY+1].category === target.category &&
        pieces[pX][pY+2].category === target.category) {
      target.matched = true;
      return true;
    }
    // search -x direction (left)
    if (pX >= (2) &&
        pieces[pX-1][pY].category === target.category &&
        pieces[pX-2][pY].category === target.category) {
      target.matched = true;
      return true;
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
  setSelectedPiece: function() {
    game.allPieces(display.gameTiles, function(tiles, pX, pY) {
      if (tiles[pX][pY].getAttribute('data-selected') === 'true') {
        game.data.selectedPiece = [pX, pY];
      }
    });
  },
  // find selected piece from gamePieces
  setTargetedPiece: function() {
    game.allPieces(display.gameTiles, function(tiles, pX, pY) {
      if (tiles[pX][pY].getAttribute('data-targeted') === 'true') {
        game.data.targetedPiece = [pX, pY];
      }
    });
  },
  // run selection logic to see if piece move is valid and if so exchange piece positions
  attemptMovePiece: function() {
    console.log('Attempting to move...');
    console.log('From: ', game.data.selectedPiece);
    console.log('To: ', game.data.targetedPiece);
  }
};

$(document).ready(function() {
  display.setHandles();
  // make sure container is set to full page size.
  display.setContainerHeight();
  display.setFooterWidth();
  display.showLandingPage();
  handlers.setStartingHandlers();
  game.data.gamePieces = game.generateBoard();
});
