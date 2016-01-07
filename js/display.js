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
    // draw static elements
    display.redrawGameStatic();
    // draw active elements
    display.redrawGameState();
  },
  drawGameTimer: function() {
    // handle drawing logic for displaying the game timer above the game area
    $('.game-timer-svg').remove();
    var cWidth = Math.floor($('.game-timer').width());
    var cHeight = Math.floor($('.game-timer').height());
    var gameTimerSVG = helpers.eltNS('svg', 'game-timer-svg');
    gameTimerSVG.setAttribute('width', String(cWidth));
    gameTimerSVG.setAttribute('height', String(cHeight));
    var gameTimerText = helpers.eltNS('text', 'game-timer-text');
    gameTimerText.textContent = 'time: ' + String((game.data.time).toFixed(2)) + 's';
    gameTimerText.setAttribute('x', '0');
    gameTimerText.setAttribute('y', String(cHeight * 0.8));
    gameTimerSVG.appendChild(gameTimerText);
    $('.game-timer').append($(gameTimerSVG));
  },
  drawGameScore: function() {
    // handle drawing logic for displaying the game score above the game area
    $('.game-score-svg').remove();
    var cWidth = Math.floor($('.game-score').width());
    var cHeight = Math.floor($('.game-score').height());
    var gameScoreSVG = helpers.eltNS('svg', 'game-score-svg');
    gameScoreSVG.setAttribute('width', String(cWidth));
    gameScoreSVG.setAttribute('height', String(cHeight));
    var gameScoreText = helpers.eltNS('text', 'game-score-text');
    gameScoreText.textContent = 'score: ' + String((game.data.score * 10).toFixed(0));
    gameScoreText.setAttribute('x', '0');
    gameScoreText.setAttribute('y', String(cHeight * 0.8));
    gameScoreSVG.appendChild(gameScoreText);
    $('.game-score').append($(gameScoreSVG));
  },
  // function to run at new game instantiation to setup background board tiles.
  drawGameTiles: function() {
    // clear current render
    $('.game-tile').remove();
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
    var tileWidth = Math.floor((boardWidth - 2) / game.data.boardSize);
    $('.game-tile').css('width', String(tileWidth * 0.9) + 'px');
    $('.game-tile').css('height', String(tileWidth * 0.9) + 'px');
    $('.game-tile').css('margin', String(tileWidth * 0.05) + 'px');
  },
  // function to render game pieces at every frame
  drawGamePieces: function() {
    // clear current render
    $('.game-piece').remove();
    var boardWidth = display.elts.$gameBoard.outerWidth();
    //display.elts.$gameBoard.css('padding', String(boardWidth * 0.048) + 'px');
    var tileWidth = Math.floor((boardWidth - 2) / game.data.boardSize);
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
        newPiece.style.top = String(y * tileWidth) + 'px';
        newPiece.style.left = String(x * tileWidth) + 'px';
        display.elts.$gameBoard.append($(newPiece));
        newCol.push(newPiece);
      });
      newPieces.push(newCol);
    });
    display.gamePieces = newPieces;
    $('.game-piece').css('width', String(tileWidth * 0.7) + 'px');
    $('.game-piece').css('height', String(tileWidth * 0.7) + 'px');
    $('.game-piece').css('margin', String(tileWidth * 0.15) + 'px');
    handlers.setPieceSelection();
  },
  drawGameMultiplier: function() {
    // handle drawing logic for the multiplier display to the right of the game area
    $('.game-multiplier-svg').remove();
    // drawing visual bar indicator
    var cWidth = Math.floor($('.game-multiplier').width());
    var cHeight = Math.floor($('.game-multiplier').height());
    var barHeight = Math.floor(cHeight * 0.75);
    var barLevel = Math.floor(barHeight * game.data.multiplier);
    var gameMultArea = helpers.eltNS('svg', 'game-multiplier-svg');
    gameMultArea.setAttribute('width', String(cWidth));
    gameMultArea.setAttribute('height', String(cHeight));
    var gameMultBar = helpers.eltNS('path', 'game-multiplier-bar bar-fill-path');
    var barPathData = 'M0 ' + String(cHeight - barHeight) + ' L 0 ' + String(cHeight) +
      ' L ' + String(cWidth) + ' ' + String(cHeight) + ' L ' + String(cWidth) +
      ' ' + String(cHeight - barHeight);
    gameMultBar.setAttribute('d', barPathData);
    var gameMultBarLevel = helpers.eltNS('path', 'game-multiplier-bar primary-fill-path');
    var barLevelPathData = 'M0 ' + String(cHeight - barLevel) + ' L 0 ' + String(cHeight) +
      ' L ' + String(cWidth) + ' ' + String(cHeight) + ' L ' + String(cWidth) +
      ' ' + String(cHeight - barLevel);
    gameMultBarLevel.setAttribute('d', barLevelPathData);
    var gameMultText = helpers.eltNS('text', 'game-multiplier-text');
    gameMultText.textContent = String((game.data.multiplier * 100).toFixed(2)) + '%';
    gameMultText.setAttribute('x', String(cWidth * 0.2));
    gameMultText.setAttribute('y', String(cHeight * 0.2));
    gameMultArea.appendChild(gameMultBar);
    gameMultArea.appendChild(gameMultBarLevel);
    gameMultArea.appendChild(gameMultText);
    $('.game-multiplier').append($(gameMultArea));
  },
  drawGameBreaks: function() {
    // handle drawing logic for break buttons under the game board
    $('.game-breaks-svg').remove();
    var cWidth = Math.floor($('.game-breaks').width());
    var cHeight = Math.floor($('.game-breaks').height());
    var cCorner = Math.floor(cHeight * 0.4);
    var gameBreaksSVG = helpers.eltNS('svg', 'game-breaks-svg');
    gameBreaksSVG.setAttribute('width', String(cWidth));
    gameBreaksSVG.setAttribute('height', String(cHeight));
    var gameBreaksBkg = helpers.eltNS('path', 'game-breaks-bkg bkg-fill-path');
    var bkgPathData = 'M0 ' + String(cCorner) + ' L 0 ' + String(cHeight - cCorner) +
      ' C 0 ' + String(cHeight) + ', 0 ' + String(cHeight) + ', ' +
      String(cCorner) + ' ' + String(cHeight) + ' L ' + String(cWidth * 0.98) +
      ' ' + String(cHeight) + ' L ' + String(cWidth) + ' ' +
      String(cHeight * 0.5) + ' L ' + String(cWidth * 0.98) + ' 0 L ' +
      String(cCorner) + ' 0 C 0 0, 0 0, 0 ' + String(cCorner);
    gameBreaksBkg.setAttribute('d', bkgPathData);
    var gameBreaksBoard = helpers.eltNS('path', 'game-breaks-board primary-fill-path');
    var boardBtnPathData = 'M' + String(cWidth * 0.76 - 4) + ' 2 L ' +
      String(cWidth * 0.78 - 4) + ' ' + String(cHeight * 0.5) + ' L ' +
      String(cWidth * 0.76 - 4) + ' ' + String(cHeight - 2) + ' L ' +
      String(cWidth * 0.98 - 4) + ' ' + String(cHeight - 2) + ' L ' +
      String(cWidth - 4) + ' ' + String(cHeight * 0.5) + ' L ' +
      String(cWidth * 0.98 - 4) + ' 2 L ' + String(cWidth * 0.76 - 4) + ' 2';
    gameBreaksBoard.setAttribute('d', boardBtnPathData);
    var gameBreaksRow = helpers.eltNS('path', 'game-breaks-row primary-fill-path');
    var rowBtnPathData = 'M' + String(cWidth * 0.52 - 8) + ' 2 L ' +
      String(cWidth * 0.54 - 8) + ' ' + String(cHeight * 0.5) + ' L ' +
      String(cWidth * 0.52 - 8) + ' ' + String(cHeight - 2) + ' L ' +
      String(cWidth * 0.76 - 8) + ' ' + String(cHeight - 2) + ' L ' +
      String(cWidth * 0.78 - 8) + ' ' + String(cHeight * 0.5) + ' L ' +
      String(cWidth * 0.76 - 8) + ' 2 L ' + String(cWidth * 0.52 - 8) + ' 2';
    gameBreaksRow.setAttribute('d', rowBtnPathData);
    var gameBreaksPiece = helpers.eltNS('path', 'game-breaks-piece primary-fill-path');
    var pieceBtnPathData = 'M' + String(cWidth * 0.28 - 12) + ' 2 L ' +
      String(cWidth * 0.30 - 12) + ' ' + String(cHeight * 0.5) + ' L ' +
      String(cWidth * 0.28 - 12) + ' ' + String(cHeight - 2) + ' L ' +
      String(cWidth * 0.52 - 12) + ' ' + String(cHeight - 2) + ' L ' +
      String(cWidth * 0.54 - 12) + ' ' + String(cHeight * 0.5) + ' L ' +
      String(cWidth * 0.52 - 12) + ' 2 L ' + String(cWidth * 0.28 - 12) + ' 2';
    gameBreaksPiece.setAttribute('d', pieceBtnPathData);
    var breakBreakText = helpers.eltNS('text', 'game-breaks-text help-text');
    breakBreakText.textContent = 'break';
    breakBreakText.setAttribute('x', String(cWidth * 0.1));
    breakBreakText.setAttribute('y', String(cHeight * 0.7));
    var breakPieceText = helpers.eltNS('text', 'game-breaks-text btn-text');
    breakPieceText.textContent = 'piece';
    breakPieceText.setAttribute('x', String(cWidth * 0.34));
    breakPieceText.setAttribute('y', String(cHeight * 0.7));
    var breakRowText = helpers.eltNS('text', 'game-breaks-text btn-text');
    breakRowText.textContent = 'row';
    breakRowText.setAttribute('x', String(cWidth * 0.56));
    breakRowText.setAttribute('y', String(cHeight * 0.7));
    var breakBoardText = helpers.eltNS('text', 'game-breaks-text btn-text');
    breakBoardText.textContent = 'board';
    breakBoardText.setAttribute('x', String(cWidth * 0.80));
    breakBoardText.setAttribute('y', String(cHeight * 0.7));
    gameBreaksSVG.appendChild(gameBreaksBkg);
    gameBreaksSVG.appendChild(gameBreaksPiece);
    gameBreaksSVG.appendChild(gameBreaksRow);
    gameBreaksSVG.appendChild(gameBreaksBoard);
    gameBreaksSVG.appendChild(breakBreakText);
    gameBreaksSVG.appendChild(breakPieceText);
    gameBreaksSVG.appendChild(breakRowText);
    gameBreaksSVG.appendChild(breakBoardText);
    $('.game-breaks').append($(gameBreaksSVG));
  },
  redrawGameState: function() {
    // active elements to be redrawn on each frame.
    // static elements such as the break buttons are redrawn only on window resizing.
    display.drawGameTimer();
    display.drawGameScore();
    display.drawGameTiles();
    display.drawGamePieces();
    display.drawGameMultiplier();
  },
  redrawGameStatic: function() {
    // called on resize and initialising.
    display.drawGameArea();
    display.drawNavBar();
    display.drawGameBreaks();
  },
  drawNavBar: function() {
    // handle draw procedure for nav bar border. (elements should be dynamically sized)
    $('.nav-bar-svg').remove();
    $('.site-icon').remove();
    $('.player-detail').remove();
    $('.nav-icon').remove();
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
    // dynamically produce nav bar elements for proper display on resizing
    var navBarHome = helpers.elt('div', 'two columns u-pull-left site-icon');
    navBarHome.style.paddingTop = String(Math.floor(vportCurve * 0.2)) + 'px';
    var navBarHomeIcon = helpers.elt('i', 'icon ion-bonfire');
    navBarHome.appendChild(navBarHomeIcon);
    var navBarProfile = helpers.elt('div', 'four columns u-pull-right player-detail');
    navBarProfile.style.paddingTop = String(Math.floor(vportCurve * 0.2)) + 'px';
    var navBarProfileName = helpers.elt('div', 'profile-name');
    var navBarProfileIcon = helpers.elt('i', 'icon ion-person');
    navBarProfileName.textContent = 'FatDavo';
    navBarProfileName.style.display = 'inline-block';
    navBarProfileIcon.style.display = 'inline-block';
    navBarProfile.appendChild(navBarProfileName);
    navBarProfile.appendChild(navBarProfileIcon);
    var navBarNavicon = helpers.elt('div', 'two columns u-pull-right nav-icon');
    var navBarNaviconIcon = helpers.elt('i', 'icon ion-navicon-round');
    navBarNavicon.appendChild(navBarNaviconIcon);
    display.groups.$navBar.append($(navBarHome));
    display.groups.$navBar.append($(navBarNavicon));
    display.groups.$navBar.append($(navBarProfile));
    // set nav bar sizing properties based on current dimensions
    display.groups.$navBar.css('font-size', String(Math.floor(vportCurve * 1.2)) + 'px');
    display.groups.$navBar.css('line-height', String(Math.floor(vportCurve * 1.8)) + 'px');
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
    gameAreaSVG.style.marginTop = String(Math.round(viewportHeight * 0.02)) + 'px';
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
    var gameAreaNewRound = helpers.eltNS('path', 'game-area-new-round');
    var newRoundPathData = 'M' + String(gameBox * 0.75) + ' 20 L ' + String(gameBox - gCorner - 8) +
      ' 20 C ' + String(gameBox - gCorner - 8) + ' ' + String(gameBox * 0.14) + ', ' +
      String(gameBox - gCorner - 8) + ' ' + String(gameBox * 0.14) + ', ' +
      String(gameBox * 0.7) + ' ' + String(gameBox * 0.14) + ' L ' + String(gameBox * 0.75) + ' 20';
    gameAreaNewRound.setAttribute('d', newRoundPathData);
    var newRoundText = helpers.eltNS('text', 'new-round-text');
    newRoundText.textContent = 'new\nround';
    newRoundText.style.whiteSpace = 'normal';
    newRoundText.setAttribute('x', String(Math.floor(gameBox * 0.76)));
    newRoundText.setAttribute('y', String(Math.floor(gameBox * 0.10)));
    gameAreaSVG.appendChild(gameAreaBorder);
    gameAreaSVG.appendChild(gameAreaFill);
    gameAreaSVG.appendChild(gameAreaNewRound);
    gameAreaSVG.appendChild(newRoundText);
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
    display.groups.$gameArea.append($(gameBreaks));
    display.groups.$gameArea.append($(gameBoard));
    display.groups.$gameArea.append($(gameMultiplier));
    // set newly created DOM handles
    display.setHandles();
    handlers.setGameHandlers();
  },
  setGameEnabled: function() {
    // set visual properties relating to game running
    $('.game-timer').css('opacity', '1')
    $('.game-score').css('opacity', '1');
    $('.game-board').css('opacity', '1');
    $('.game-multiplier').css('opacity', '1');
    $('.primary-fill-path .').css('fill', '#F4B350');
    $('.game-area-new-round').css('fill', '#9A9D9D');
    $('.game-breaks-text').css('opacity', '1');
  },
  setGameDisabled: function() {
    // set visual properties relating to game waiting to run
    $('.game-timer').css('opacity', '0.4');
    $('.game-score').css('opacity', '0.4');
    $('.game-board').css('opacity', '0.4');
    $('.game-multiplier').css('opacity', '0.4');
    $('.primary-fill-path').css('fill', '#9A9D9D');
    $('.game-area-new-round').css('fill', '#F4B350');
    $('.game-breaks-text').css('opacity', '0.4');
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