// data holder for display information
var display = {
  viewportWidth: null,
  viewportHeight: null,
  pieceColors: ['#0F8', '#F08', '#08F', '#F80', '#80F', '#8F0'],
  highlightColor: '#DDF',
  gameTiles: null,
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
    var gameTimerLabel = helpers.eltNS('tspan', 'game-timer-label grey-svg-text');
    var gameTimerValue = helpers.eltNS('tspan', 'game-timer-value orange-svg-text');
    gameTimerLabel.textContent = 'time: ';
    gameTimerValue.textContent = String((game.data.time).toFixed(2)) + 's';
    gameTimerLabel.style.fontSize = String(cHeight * 0.2) + 'px';
    gameTimerLabel.setAttribute('x', '0');
    gameTimerLabel.setAttribute('y', String(cHeight * 0.48));
    gameTimerValue.style.fontSize = String(cHeight * 0.3) + 'px';
    gameTimerValue.setAttribute('x', '0');
    gameTimerValue.setAttribute('y', String(cHeight * 0.8));
    gameTimerText.appendChild(gameTimerLabel);
    gameTimerText.appendChild(gameTimerValue);
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
    var gameScoreLabel = helpers.eltNS('tspan', 'game-score-label grey-svg-text');
    var gameScoreValue = helpers.eltNS('tspan', 'game-score-value orange-svg-text');
    gameScoreLabel.textContent = 'score';
    gameScoreValue.textContent = String((game.data.score * 100).toFixed(0));
    gameScoreLabel.style.fontSize = String(cHeight * 0.3);
    gameScoreLabel.setAttribute('x', '0');
    gameScoreLabel.setAttribute('y', String(cHeight * 0.9));
    gameScoreValue.style.fontSize = String(cHeight * 0.5);
    gameScoreValue.setAttribute('x', '0');
    gameScoreValue.setAttribute('y', String(cHeight * 0.58));
    gameScoreText.appendChild(gameScoreLabel);
    gameScoreText.appendChild(gameScoreValue);
    gameScoreSVG.appendChild(gameScoreText);
    $('.game-score').append($(gameScoreSVG));
  },
  // function to run at new game instantiation to setup background board tiles.
  drawGameTiles: function() {
    // clear current render
    $('.game-tile').remove();
    // calculate and update tile properties based on current board size
    var boardWidth = display.elts.$gameBoard.outerWidth();
    var tileWidth = Math.floor((boardWidth - 2) / game.data.boardSize);
    // setup a mirrored set of arrays that will hold the tile DOM elements associated with each background tile
    var newTiles = [];
    _.each(_.range(game.data.boardSize), function(x) {
      var newCol = [];
      _.each(_.range(game.data.boardSize), function(y) {
        var newTile = helpers.elt('div','game-tile u-pull-left');
        // set tile specific style properties
        newTile.setAttribute('data-x', x);
        newTile.setAttribute('data-y', y);
        newTile.style.top = String(y * tileWidth) + 'px';
        newTile.style.left = String(x * tileWidth) + 'px';
        display.elts.$gameBoard.append($(newTile));
        newCol.push(newTile);
      });
      newTiles.push(newCol);
    });
    display.gameTiles = newTiles;
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
    // iterate over the game piece data and generate a new marker piece render
    // for each position.
    var gamePieces = game.data.gamePieces;

    _.each(gamePieces, function(gameRow, x) {
      _.each(gameRow, function(gamePiece, y) {
        var newMarker = helpers.elt('div', 'game-piece');
        // current piece marker position from game data
        var currPos = gamePiece.position;
        var currMarker = gamePiece.marker;
        var currCategory = gamePiece.category;
        // set piece specific style properties
        if (game.data.selectedPiece &&
            game.data.selectedPiece[0] === currPos[0] &&
            game.data.selectedPiece[1] === currPos[1]) {
          newMarker.style.opacity = 0.6;
        } else {
          newMarker.style.opacity = 1;
        }
        newMarker.style.backgroundColor = display.pieceColors[currCategory];
        newMarker.setAttribute('data-x', currPos[0]);
        newMarker.setAttribute('data-y', currPos[1]);
        newMarker.style.top = String(currMarker[0] * tileWidth) + 'px';
        newMarker.style.left = String(currMarker[1] * tileWidth) + 'px';
        display.elts.$gameBoard.append($(newMarker));
      });
    });
    $('.game-piece').css('width', String(tileWidth * 0.7) + 'px');
    $('.game-piece').css('height', String(tileWidth * 0.7) + 'px');
    $('.game-piece').css('margin', String(tileWidth * 0.15) + 'px');
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
    var barPathData = 'M1 ' + String(cHeight - barHeight) + ' L 1 ' + String(cHeight) +
      ' L ' + String(cWidth) + ' ' + String(cHeight) + ' L ' + String(cWidth) +
      ' ' + String(cHeight - barHeight);
    gameMultBar.setAttribute('d', barPathData);
    var gameMultBarLevel = helpers.eltNS('path', 'game-multiplier-bar primary-fill-path');
    var barLevelPathData = 'M1 ' + String(cHeight - barLevel) + ' L 1 ' + String(cHeight) +
      ' L ' + String(cWidth) + ' ' + String(cHeight) + ' L ' + String(cWidth) +
      ' ' + String(cHeight - barLevel);
    gameMultBarLevel.setAttribute('d', barLevelPathData);
    var gameMultText = helpers.eltNS('text', 'game-multiplier-text');
    gameMultText.textContent = String((game.data.multiplier * 100).toFixed(0)) + '%';
    gameMultText.style.fontSize = String(Math.floor(cHeight * 0.08)) + 'px';
    var gameMultBarMask = helpers.eltNS('path', 'game-multiplier-mask mask-fill-path');
    var maskPathData = 'M0 ' + String(cHeight - barHeight - 1) + ' L 0 ' + String(cHeight) +
      ' L 1 ' + String(cHeight) + ' L ' + String(cWidth * 0.25) + ' ' + String(cHeight - barHeight * 0.88) +
       ' L ' + String(cWidth) + ' ' + String(cHeight - barHeight) + ' L ' + String(cWidth) + ' ' +
       String(cHeight - barHeight - 1);
    gameMultBarMask.setAttribute('d', maskPathData);
    gameMultText.setAttribute('x', String(cWidth * 0.2));
    gameMultText.setAttribute('y', String(cHeight * 0.2));
    gameMultArea.appendChild(gameMultBar);
    gameMultArea.appendChild(gameMultBarLevel);
    gameMultArea.appendChild(gameMultText);
    gameMultArea.appendChild(gameMultBarMask);
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
    gameBreaksSVG.style.fontSize = String(cHeight * 0.7) + 'px';
    var gameBreaksBkg = helpers.eltNS('path', 'game-breaks-bkg bkg-fill-path');
    var bkgPathData = 'M0 ' + String(cCorner) + ' L 0 ' + String(cHeight - cCorner) +
      ' C 0 ' + String(cHeight) + ', 0 ' + String(cHeight) + ', ' +
      String(cCorner) + ' ' + String(cHeight) + ' L ' + String(cWidth * 0.98) +
      ' ' + String(cHeight) + ' L ' + String(cWidth) + ' ' +
      String(cHeight * 0.5) + ' L ' + String(cWidth * 0.98) + ' 0 L ' +
      String(cCorner) + ' 0 C 0 0, 0 0, 0 ' + String(cCorner);
    gameBreaksBkg.setAttribute('d', bkgPathData);
    var breakBoardGroup = helpers.eltNS('g', 'game-breaks-board');
    var gameBreaksBoard = helpers.eltNS('path', 'primary-fill-path board-path');
    var boardBtnPathData = 'M' + String(cWidth * 0.76 - 4) + ' 2 L ' +
      String(cWidth * 0.78 - 4) + ' ' + String(cHeight * 0.5) + ' L ' +
      String(cWidth * 0.76 - 4) + ' ' + String(cHeight - 2) + ' L ' +
      String(cWidth * 0.98 - 4) + ' ' + String(cHeight - 2) + ' L ' +
      String(cWidth - 4) + ' ' + String(cHeight * 0.5) + ' L ' +
      String(cWidth * 0.98 - 4) + ' 2 L ' + String(cWidth * 0.76 - 4) + ' 2';
    gameBreaksBoard.setAttribute('d', boardBtnPathData);
    var breakRowGroup = helpers.eltNS('g', 'game-breaks-row');
    var gameBreaksRow = helpers.eltNS('path', 'primary-fill-path row-path');
    var rowBtnPathData = 'M' + String(cWidth * 0.52 - 8) + ' 2 L ' +
      String(cWidth * 0.54 - 8) + ' ' + String(cHeight * 0.5) + ' L ' +
      String(cWidth * 0.52 - 8) + ' ' + String(cHeight - 2) + ' L ' +
      String(cWidth * 0.76 - 8) + ' ' + String(cHeight - 2) + ' L ' +
      String(cWidth * 0.78 - 8) + ' ' + String(cHeight * 0.5) + ' L ' +
      String(cWidth * 0.76 - 8) + ' 2 L ' + String(cWidth * 0.52 - 8) + ' 2';
    gameBreaksRow.setAttribute('d', rowBtnPathData);
    var breakPieceGroup = helpers.eltNS('g', 'game-breaks-piece');
    var gameBreaksPiece = helpers.eltNS('path', 'primary-fill-path piece-path');
    var pieceBtnPathData = 'M' + String(cWidth * 0.28 - 12) + ' 2 L ' +
      String(cWidth * 0.30 - 12) + ' ' + String(cHeight * 0.5) + ' L ' +
      String(cWidth * 0.28 - 12) + ' ' + String(cHeight - 2) + ' L ' +
      String(cWidth * 0.52 - 12) + ' ' + String(cHeight - 2) + ' L ' +
      String(cWidth * 0.54 - 12) + ' ' + String(cHeight * 0.5) + ' L ' +
      String(cWidth * 0.52 - 12) + ' 2 L ' + String(cWidth * 0.28 - 12) + ' 2';
    gameBreaksPiece.setAttribute('d', pieceBtnPathData);
    var breakBreakText = helpers.eltNS('text', 'game-breaks-text help-text');
    breakBreakText.textContent = 'break';
    breakBreakText.setAttribute('x', String(cWidth * 0.07));
    breakBreakText.setAttribute('y', String(cHeight * 0.7));
    breakBreakText.style.fill = '#6A6D6D';
    var breakPieceText = helpers.eltNS('text', 'game-breaks-text btn-text');
    breakPieceText.textContent = 'piece';
    breakPieceText.setAttribute('x', String(cWidth * 0.3));
    breakPieceText.setAttribute('y', String(cHeight * 0.7));
    var breakRowText = helpers.eltNS('text', 'game-breaks-text btn-text');
    breakRowText.textContent = 'row';
    breakRowText.setAttribute('x', String(cWidth * 0.56));
    breakRowText.setAttribute('y', String(cHeight * 0.7));
    var breakBoardText = helpers.eltNS('text', 'game-breaks-text btn-text');
    breakBoardText.textContent = 'board';
    breakBoardText.setAttribute('x', String(cWidth * 0.80));
    breakBoardText.setAttribute('y', String(cHeight * 0.7));
    breakBoardGroup.appendChild(gameBreaksBoard);
    breakBoardGroup.appendChild(breakBoardText);
    breakRowGroup.appendChild(gameBreaksRow);
    breakRowGroup.appendChild(breakRowText);
    breakPieceGroup.appendChild(gameBreaksPiece);
    breakPieceGroup.appendChild(breakPieceText);
    gameBreaksSVG.appendChild(gameBreaksBkg);
    gameBreaksSVG.appendChild(breakPieceGroup);
    gameBreaksSVG.appendChild(breakRowGroup);
    gameBreaksSVG.appendChild(breakBoardGroup);
    gameBreaksSVG.appendChild(breakBreakText);
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
    navBarHome.textContent = 'H';
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
    navBarNavicon.style.fontSize = String(Math.floor(vportCurve * 1.1)) + 'px';
    navBarNavicon.style.paddingTop = String(Math.floor(vportCurve * 0.08)) + 'px';
    navBarNavicon.appendChild(navBarNaviconIcon);
    display.groups.$navBar.append($(navBarHome));
    display.groups.$navBar.append($(navBarNavicon));
    display.groups.$navBar.append($(navBarProfile));
    // set nav bar sizing properties based on current dimensions
    display.groups.$navBar.css('font-size', String(Math.floor(vportCurve * 1.2)) + 'px');
    display.groups.$navBar.css('line-height', String(Math.floor(vportCurve * 1.8)) + 'px');
    // set newly created DOM handles
    display.setHandles();
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
    var newRoundGroup = helpers.eltNS('g', 'new-round-group');
    var gameAreaNewRound = helpers.eltNS('path', 'game-area-new-round');
    var newRoundPathData = 'M' + String(gameBox * 0.72) + ' 20 L ' + String(gameBox - gCorner - 8) +
      ' 20 C ' + String(gameBox - gCorner * 1.2) + ' ' + String(gameBox * 0.1) + ', ' +
      String(gameBox - gCorner * 1.4) + ' ' + String(gameBox * 0.13) + ', ' +
      String(gameBox * 0.68) + ' ' + String(gameBox * 0.14) + ' L ' + String(gameBox * 0.72) + ' 20';
    gameAreaNewRound.setAttribute('d', newRoundPathData);
    var newRoundText = helpers.eltNS('text', 'new-round-text');
    newRoundText.textContent = 'GO';
    newRoundText.style.fontSize = String(Math.floor(gameBox * 0.05)) + 'px';
    newRoundText.setAttribute('x', String(Math.floor(gameBox * 0.74)));
    newRoundText.setAttribute('y', String(Math.floor(gameBox * 0.10)));
    newRoundGroup.appendChild(gameAreaNewRound);
    newRoundGroup.appendChild(newRoundText);
    gameAreaSVG.appendChild(gameAreaBorder);
    gameAreaSVG.appendChild(gameAreaFill);
    gameAreaSVG.appendChild(newRoundGroup);
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
    gameMultiplier.style.height = String(Math.floor(gameBox * 0.7)) + 'px';
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
  },
  setGameEnabled: function() {
    // set visual properties relating to game running
    $('.game-timer').css('opacity', '1')
    $('.game-score').css('opacity', '1');
    $('.game-board').css('opacity', '1');
    $('.game-multiplier').css('opacity', '1');
    $('.primary-fill-path').css('fill', '#F4B350');
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
    // update display components
    if (game.data.runStatus === 0) {
      display.setGameDisabled();
    } else if (game.data.runStatus === 1) {
      display.setGameEnabled();
    }
  }
};
