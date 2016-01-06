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
  // set all event handlers
  setStartingHandlers: function() {
    handlers.setHomeButton();
    handlers.setPlayButton();
    handlers.setResizeHandling();
  }
};
