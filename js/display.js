// data holder for display information
var display = {
  viewportWidth: null,
  viewportHeight: null,
  pieceColors: ['#0F8', '#F08', '#08F', '#F80', '#80F', '#8F0'],
  highlightColor: '#DDF',
  gameTiles: null,
  gamePieces: null,
  selectedPiece: null,
  targetedPosition: null,
  groups: {
    $container: null,
    $navBar: null,
    $logo: null,
    $playSelect: null,
    $gameArea: null,
    $footer: null,
  },
  elts: {
    $siteIcon: null,
    $navIcon: null,
    $playerDetail: null,
    $select1P: null,
    $select2P: null,
    $gameBoard: null,
  },
  // grab DOM handles
  setHandles: function() {
    display.groups.$container = $('.container');
    display.groups.$navBar = $('.nav-bar');
    display.elts.$siteIcon = $('.site-icon');
    display.elts.$playerDetail = $('.player-detail');
    display.elts.$navIcon = $('.nav-icon');
    display.groups.$logo = $('.logo-row');
    display.groups.$playSelect = $('.play-select-row');
    display.elts.$select1P = $('#select-one-player');
    display.elts.$select2P = $('#select-two-player');
    display.groups.$gameBoardRow = $('.game-board-row');
    display.groups.$gameArea = $('.game-area');
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
    display.groups.$gameBoardRow.css('display', 'none');
  },
  // function to open a game view
  showGamePage: function() {
    display.groups.$logo.css('display', 'none');
    display.groups.$playSelect.css('display', 'none');
    // update board height to reflect width
    display.groups.$gameBoardRow.css('visibility', 'hidden');
    display.groups.$gameBoardRow.css('display', 'block');
    var gameBoardWidth = display.elts.$gameBoard.width();
    display.elts.$gameBoard.css('height', String(gameBoardWidth) + 'px');
    display.groups.$gameBoardRow.css('visibility', 'visible');
    display.drawNavBarBorder();
    display.drawGameArea();
    display.redrawGameState();
  },
  // function to run at new game instantiation to setup background board tiles.
  drawGameTiles: function() {
    // setup a mirrored set of arrays that will hold the tile DOM elements associated with each background tile
    var newTiles = [];
    _.each(_.range(game.data.boardSize), function(x) {
      var newCol = [];
      _.each(_.range(game.data.boardSize), function(y) {
        var newTile = helpers.elt('div','game-tile u-pull-left');
        // set tile specific style properties
        newTile.setAttribute('data-x', x);
        newTile.setAttribute('data-y', y);
        display.elts.$gameBoard.append($(newTile));
        newCol.push(newTile);
      });
      newTiles.push(newCol);
    });
    display.gameTiles = newTiles;
    // calculate and update tile properties based on current board size
    var boardWidth = display.elts.$gameBoard.outerWidth();
    // display.elts.$gameBoard.css('padding', String(boardWidth * 0.048) + 'px');
    var tileWidth = boardWidth * 0.9 / game.data.boardSize;
    $('.game-tile').css('width', String(tileWidth * 0.9) + 'px');
    $('.game-tile').css('height', String(tileWidth * 0.9) + 'px');
    $('.game-tile').css('margin', String(tileWidth * 0.05) + 'px');
  },
  // function to render game pieces at every frame
  drawGamePieces: function() {
    var boardWidth = display.elts.$gameBoard.outerWidth();
    //display.elts.$gameBoard.css('padding', String(boardWidth * 0.048) + 'px');
    var tileWidth = boardWidth * 0.9 / game.data.boardSize;
    // setup a mirrored set of arrays that will hold the tile DOM elements associated with each piece
    var newPieces = [];
    _.each(_.range(game.data.boardSize), function(x) {
      var newCol = [];
      _.each(_.range(game.data.boardSize), function(y) {
        var newPiece = helpers.elt('div','game-piece');
        // set tile specific style properties
        if (game.data.selectedPiece &&
            game.data.selectedPiece[0] === x &&
            game.data.selectedPiece[1] === y) {
          newPiece.style.backgroundColor = display.highlightColor;
        } else {
          newPiece.style.backgroundColor = display.pieceColors[game.data.gamePieces[x][y].category];
        }
        newPiece.setAttribute('data-selected', false);
        newPiece.setAttribute('data-targeted', false);
        newPiece.setAttribute('data-x', x);
        newPiece.setAttribute('data-y', y);
        newPiece.style.top = String(boardWidth * 0.048 + y * tileWidth) + 'px';
        newPiece.style.left = String(boardWidth * 0.048 + x * tileWidth) + 'px';
        display.elts.$gameBoard.append($(newPiece));
        newCol.push(newPiece);
      });
      newPieces.push(newCol);
    });
    display.gamePieces = newPieces;
    $('.game-piece').css('width', String(tileWidth * 0.8) + 'px');
    $('.game-piece').css('height', String(tileWidth * 0.8) + 'px');
    $('.game-piece').css('margin', String(tileWidth * 0.1) + 'px');
    handlers.setPieceSelection();
  },
  redrawGameState: function() {
    $('.game-tile').remove();
    $('.game-piece').remove();
    display.drawGameTiles();
    display.drawGamePieces();
  },
  drawNavBarBorder: function() {
    // handle draw procedure for nav bar border. (elements should be dynamically sized)
    $('.nav-bar-svg').remove();
    var cWidth = display.groups.$container.width();
    var viewportHeight = display.getViewportHeight();
    var vportCurve = Math.floor(viewportHeight * 0.025);
    var navBarSVG = helpers.eltNS('svg', 'nav-bar-svg');
    navBarSVG.setAttribute('width', String(cWidth));
    navBarSVG.setAttribute('height', String(vportCurve * 2 + 4));
    var navBarPath = helpers.eltNS('path', 'nav-bar-path border-path');
    var pathData = 'M2 0 L 2 ' + String(vportCurve) + ' C 2 ' + String(vportCurve * 1.5) +
      ', ' + String(vportCurve * 0.5) + ' ' + String(vportCurve * 2) + ', ' +
      String(vportCurve) + ' ' + String(vportCurve * 2) + ' L ' + String(cWidth - vportCurve) +
      ' ' + String(vportCurve * 2) + ' C ' + String(cWidth - vportCurve * 0.5) +
      ' ' + String(vportCurve * 2) + ', ' + String(cWidth - 2) + ' ' + String(vportCurve * 1.5) +
      ', ' + String(cWidth - 2) + ' ' + String(vportCurve) + ' L ' + String(cWidth - 2) + ' 0';
    navBarPath.setAttribute('d', pathData);
    navBarSVG.appendChild(navBarPath);
    display.groups.$navBar.append($(navBarSVG));
  },
  drawGameArea: function() {
    // handle draw procedure for game area background. (border and fill)
    $('.game-area-svg').remove();
    var cWidth = display.groups.$container.width();
    var viewportHeight = display.getViewportHeight();
    // draw game area based on the smaller of width or height available
    var gameBox = Math.floor(Math.min(cWidth, viewportHeight * 0.8));
    var gCorner = Math.floor(gameBox * 0.1);
    var gCOffset = Math.floor(gCorner * 0.5);
    var gameAreaSVG = helpers.eltNS('svg', 'game-area-svg');
    gameAreaSVG.setAttribute('width', String(Math.floor(gameBox)));
    gameAreaSVG.setAttribute('height', String(Math.floor(gameBox)));
    gameAreaSVG.style.marginTop = String(viewportHeight * 0.02) + 'px';
    var gameAreaOffset = 0;
    if (gameBox < cWidth) {
      gameAreaOffset = (cWidth - gameBox) / 2;
      gameAreaSVG.style.marginLeft = String(Math.round(gameAreaOffset)) + 'px';
    }
    var gameAreaBorder = helpers.eltNS('path', 'game-area-path border-path');
    var pathData = 'M2 ' + String(gCorner) + ' L 2 ' + String(gameBox - gCorner) + ' C 2 ' +
      String(gameBox - gCOffset) + ', ' + String(gCOffset) + ' ' + String(gameBox - 2) +
      ', ' + String(gCorner) + ' ' + String(gameBox - 2) + ' L ' + String(gameBox - gCorner) +
      ' ' + String(gameBox - 2) + ' C ' + String(gameBox - gCOffset) + ' ' +
      String(gameBox - 2) + ', ' + String(gameBox - 2) + ' ' + String(gameBox - gCOffset) +
      ', ' + String(gameBox - 2) + ' ' + String(gameBox - gCorner) + ' L ' +
      String(gameBox - 2) + ' ' + String(gCorner) + ' C ' + String(gameBox - 2) + ' ' +
      String(gCOffset) + ', ' + String(gameBox - gCOffset) + ' 2, ' + String(gameBox - gCorner) +
      ' 2 L ' + String(gCorner) + ' 2 C ' + String(gCOffset) + ' 2, 2 ' + String(gCOffset) +
      ', 2 ' + String(gCorner);
    gameAreaBorder.setAttribute('d', pathData);
    var gameAreaFill = helpers.eltNS('path', 'game-area-fill fill-path');
    var fillPathData = 'M12 ' + String(gameBox * 0.2) + ' L 12 ' + String(gameBox - gCorner - 8) +
      ' C 12 ' + String(gameBox - gCOffset - 8) + ', ' + String(gCOffset + 8) + ' ' +
      String(gameBox - 12) + ', ' + String(gCorner + 8) + ' ' + String(gameBox - 12) + ' L ' +
      String(gameBox - gCorner - 8) + ' ' + String(gameBox - 12) + ' C ' +
      String(gameBox - gCOffset - 8) + ' ' + String(gameBox - 12) + ', ' + String(gameBox - 12) +
      ' ' + String(gameBox - gCOffset - 8) + ', ' + String(gameBox - 12) + ' ' +
      String(gameBox - gCorner - 8) + ' L ' + String(gameBox - 12) + ' ' + String(gCorner + 8) +
      ' C ' + String(gameBox - 12) + ' ' + String(gCOffset + 8) + ', ' +
      String(gameBox - gCOffset - 8) + ' 12, ' + String(gameBox - gCorner - 8) + ' 12 L ' +
      String(gameBox * 0.7) + ' 12 L ' + String(gameBox * 0.65) + ' ' + String(gameBox * 0.16) +
      ' L 12 ' + String(gameBox * 0.2);
    gameAreaFill.setAttribute('d', fillPathData);
    gameAreaSVG.appendChild(gameAreaFill);
    gameAreaSVG.appendChild(gameAreaBorder);
    display.groups.$gameArea.append($(gameAreaSVG));
    // clear current game elements
    $('.game-timer').remove();
    $('.game-score').remove();
    $('.game-board').remove();
    $('.game-multiplier').remove();
    $('.game-breaks').remove();
    // set game element areas
    var gameTimer = helpers.elt('div', 'game-timer game-element');
    var gameScore = helpers.elt('div', 'game-score game-element');
    var gameBoard = helpers.elt('div', 'game-board game-element');
    var gameMultiplier = helpers.elt('div', 'game-multiplier game-element');
    var gameBreaks = helpers.elt('div', 'game-breaks game-element');
    // set game element properties
    gameTimer.style.width = String(Math.floor(gameBox * 0.26)) + 'px';
    gameTimer.style.height = String(Math.floor(gameBox * 0.15)) + 'px';
    gameTimer.style.top = String(Math.floor(gameBox * 0.05)) + 'px';
    gameTimer.style.left = String(Math.floor(gameBox * 0.08 + gameAreaOffset)) + 'px';
    gameScore.style.width = String(Math.floor(gameBox * 0.26)) + 'px';
    gameScore.style.height = String(Math.floor(gameBox * 0.1)) + 'px';
    gameScore.style.top = String(Math.floor(gameBox * 0.05)) + 'px';
    gameScore.style.left = String(Math.floor(gameBox * 0.40 + gameAreaOffset)) + 'px';
    gameBoard.style.width = String(Math.floor(gameBox * 0.65)) + 'px';
    gameBoard.style.height = String(Math.floor(gameBox * 0.65)) + 'px';
    gameBoard.style.top = String(Math.floor(gameBox * 0.25)) + 'px';
    gameBoard.style.left = String(Math.floor(gameBox * 0.05 + gameAreaOffset)) + 'px';
    gameMultiplier.style.width = String(Math.floor(gameBox * 0.2)) + 'px';
    gameMultiplier.style.height = String(Math.floor(gameBox * 0.75)) + 'px';
    gameMultiplier.style.top = String(Math.floor(gameBox * 0.15)) + 'px';
    gameMultiplier.style.left = String(Math.floor(gameBox * 0.75 + gameAreaOffset)) + 'px';
    gameBreaks.style.width = String(Math.floor(gameBox * 0.5)) + 'px';
    gameBreaks.style.height = String(Math.floor(gameBox * 0.05)) + 'px';
    gameBreaks.style.top = String(Math.floor(gameBox * 0.92)) + 'px';
    gameBreaks.style.left = String(Math.floor(gameBox * 0.15 + gameAreaOffset)) + 'px';
    // attach game elements to game area
    display.groups.$gameArea.append($(gameTimer));
    display.groups.$gameArea.append($(gameScore));
    display.groups.$gameArea.append($(gameBoard));
    display.groups.$gameArea.append($(gameMultiplier));
    display.groups.$gameArea.append($(gameBreaks));
    // set newly created DOM handles
    display.setHandles();
  },
  // handle display updates via animation frame requests
  animate: function() {
    window.requestAnimationFrame(display.animate);
    // update game model
    game.updateGameState();
    // redraw live game objects
    display.redrawGameState();
  }
};
