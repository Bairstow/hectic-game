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
    $(window).resize(display.redrawGameStatic);
  },
  setPieceSelection: function() {
    $('.game-piece').on('mousedown', function(event) {
      event.target.setAttribute('data-selected', true);
      game.setSelectedPiece();
    });
    $('.game-piece').on('mouseup', function() {
      event.target.setAttribute('data-targeted', true);
      game.setTargetedPiece();
    });
  },
  setStartRoundButton: function() {
    $('.game-timer').on('click', game.startNewRound);
  },
  // set all event handlers
  setStartingHandlers: function() {
    handlers.setHomeButton();
    handlers.setPlayButton();
    handlers.setResizeHandling();
  },
  // set all game related handlers
  setGameHandlers: function() {
    handlers.setStartRoundButton();
  }
};
