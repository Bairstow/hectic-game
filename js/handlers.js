// data object to contain event listeners logic and handling.
// handles are set to collect at highest level with handling logic contained within the function so as to avoid resetting issues.
var handlers = {
  setAll: function() {
    $(window).resize(display.redrawGameStatic);
    $(document).on('mousedown', handlers.mouseDownHandling);
    $(document).on('mouseup', handlers.mouseUpHandling);
    $(document).on('mouseover', handlers.mouseOverHandling);
    $(document).on('mouseout', handlers.mouseOutHandling);
  },
  mouseDownHandling: function(event) {
    // only check for piece selection when game is running
    if (game.data.runStatus === 1) {
      // check all game pieces and tiles for selection
      var gameTiles = document.getElementsByClassName('game-tile');
      var gamePieces = document.getElementsByClassName('game-piece');
      _.each(gameTiles, function(tile) {
        if (event.target === tile) {
          var selectX = Number(event.target.getAttribute('data-x'));
          var selectY = Number(event.target.getAttribute('data-y'));
          game.setSelectedPiece(selectX, selectY);
        }
      });
      _.each(gamePieces, function(piece) {
        if (event.target === piece) {
          var selectX = Number(event.target.getAttribute('data-x'));
          var selectY = Number(event.target.getAttribute('data-y'));
          game.setSelectedPiece(selectX, selectY);
        }
      });
    }
  },
  mouseUpHandling: function(event) {
    // echo target
    // console.log(event.target);
    // collect and check for play game selection
    var playGameButton = document.getElementById('play-game');
    if (event.target === playGameButton) {
      display.showGamePage();
    }
    // collect and check for start new round selection
    var newRoundButton = document.getElementsByClassName('new-round-group')[0];
    if (newRoundButton.contains(event.target)) {
      game.startNewRound();
    }
    // only check for piece selection when game is running
    if (game.data.runStatus === 1) {
      // collect and check for break button selections
      var breakPieceButton = document.getElementsByClassName('game-breaks-piece')[0];
      var breakRowButton = document.getElementsByClassName('game-breaks-row')[0];
      var breakBoardButton = document.getElementsByClassName('game-breaks-board')[0];
      if (breakPieceButton.contains(event.target)) {
        game.breakRandomPiece();
        breakPieceButton.style.opacity = 0.2;
      }
      if (breakRowButton.contains(event.target)) {
        game.breakRandomRow();
        breakRowButton.style.opacity = 0.2;
      }
      if (breakBoardButton.contains(event.target)) {
        game.breakBoard();
        breakBoardButton.style.opacity = 0.2;
      }
      // check all game pieces and tiles for targeting
      var gameTiles = document.getElementsByClassName('game-tile');
      var gamePieces = document.getElementsByClassName('game-piece');
      var validTarget = false;
      _.each(gameTiles, function(tile) {
        if (event.target === tile) {
          // debugger
          var targetX = Number(event.target.getAttribute('data-x'));
          var targetY = Number(event.target.getAttribute('data-y'));
          game.setTargetedPiece(targetX, targetY);
          validTarget = true;
        }
      });
      _.each(gamePieces, function(piece) {
        if (event.target === piece) {
          // debugger
          var targetX = Number(event.target.getAttribute('data-x'));
          var targetY = Number(event.target.getAttribute('data-y'));
          game.setTargetedPiece(targetX, targetY);
          validTarget = true;
        }
      });
      if (!validTarget || !game.data.selectedPiece) {
        // if selection made and no valid location targeted or mouseup event triggered from action
        // other than selecting a piece clear both selection and target data.
        game.clearSelections();
      }
    }
  },
  mouseOverHandling: function() {
    // only check for piece selection when game is running
    if (game.data.runStatus === 1) {
      // check all game pieces and tiles for selection
      var gameTiles = document.getElementsByClassName('game-tile');
      var gamePieces = document.getElementsByClassName('game-piece');
      _.each(gameTiles, function(tile) {
        if (event.target === tile && game.data.selectedPiece) {
          var hoverX = Number(event.target.getAttribute('data-x'));
          var hoverY = Number(event.target.getAttribute('data-y'));
          var hoverPos = [hoverX, hoverY];
          /*// reset piece position on each new event
          game.temporaryMove(game.data.selectedPiece, game.data.originalPos);
          // event triggers multiple times on hover so call only once per new hover position
          if (game.data.hoverPiece === null && game.data.hoverPiece !== [hoverX, hoverY]) {
            game.setHoverPiece(hoverX, hoverY);
            game.temporaryMove(game.data.selectedPiece, game.data.hoverPiece);
          }*/
          // update and move for each hover encountered
          game.temporaryMove(game.data.selectedPiece, hoverPos);
          game.data.selectedPiece = hoverPos;
        }
      });
      _.each(gamePieces, function(piece) {
        if (event.target === piece && game.data.selectedPiece) {
          var hoverX = Number(event.target.getAttribute('data-x'));
          var hoverY = Number(event.target.getAttribute('data-y'));
          var hoverPos = [hoverX, hoverY];
          /*// event triggers multiple times on hover so call only once per new hover position
          if (game.data.hoverPiece === null && game.data.hoverPiece !== [hoverX, hoverY]) {
            game.setHoverPiece(hoverX, hoverY);
            game.temporaryMove(game.data.selectedPiece, game.data.hoverPiece);
          }*/
          game.temporaryMove(game.data.selectedPiece, hoverPos);
          game.data.selectedPiece = hoverPos;
        }
      });
    }
  },
  /*mouseOutHandling: function() {
    // check all game pieces and tiles for selection
    var gameTiles = document.getElementsByClassName('game-tile');
    var gamePieces = document.getElementsByClassName('game-piece');
    _.each(gameTiles, function(tile) {
      if (event.target === tile && game.data.selectedPiece) {
        if (game.data.hoverPiece !== null) {
          // clear current hover target and replace piece to original position
          game.temporaryMove(game.data.hoverPiece, game.data.selectedPiece);
          game.data.hoverPiece = null;
        }
      }
    });
    _.each(gamePieces, function(piece) {
      if (event.target === piece && game.data.selectedPiece) {
        if (game.data.hoverPiece !== null) {
          // clear current hover target
          game.temporaryMove(game.data.hoverPiece, game.data.selectedPiece);
          game.data.hoverPiece = null;
        }
      }
    });
  }*/
};
