// data object to contain event listeners logic and handling.
// handles are set to collect at highest level with handling logic contained within the function so as to avoid resetting issues.
var handlers = {
  setAll: function() {
    $(window).resize(display.drawPage);
    $(document).on('mousedown', handlers.mouseDownHandling);
    $(document).on('mouseup', handlers.mouseUpHandling);
    $(document).on('mouseover', handlers.mouseOverHandling);
    $(document).on('mousemove', handlers.mouseMoveHandling);
    // live leaderboard database listener
    var scoreListView = game.data.scoreListRef.limitToLast(5);
    // set listener for on load update.
    scoreListView.on('value', function(scoreSnapShot) {
      display.currentLeaderboard = scoreSnapShot.val();
    });
  },
  mouseDownHandling: function(event) {
    event.preventDefault();
    // only check for piece selection when game is running
    if (game.data.runStatus === 1) {
      // check all game pieces and tiles for selection
      var gameTiles = document.getElementsByClassName('game-tile');
      var gamePieces = document.getElementsByClassName('game-piece');
      _.each(gameTiles, function(tile) {
        if (event.target === tile) {
          var selectX = Number(event.target.getAttribute('data-x'));
          var selectY = Number(event.target.getAttribute('data-y'));
          game.setSelectedPos(selectX, selectY);
        }
      });
      _.each(gamePieces, function(piece) {
        if (event.target === piece) {
          var selectX = Number(event.target.getAttribute('data-x'));
          var selectY = Number(event.target.getAttribute('data-y'));
          game.setSelectedPos(selectX, selectY);
        }
      });
    }
  },
  mouseUpHandling: function(event) {
    // collect and check for home navigation
    var homeIcon = document.getElementsByClassName('site-icon')[0];
    if (event.target === homeIcon) {
      display.currentPage = 'landing';
      display.drawPage();
    }
    // collect and check for player customisation selection
    var navIcon = document.getElementsByClassName('nav-icon')[0];
    if (navIcon) {
      if (navIcon.contains(event.target)) {
        display.drawNameEdit();
      }
    }
    // collect and check for player name input
    var nameInput = document.getElementsByClassName('player-label-input')[0];
    var nameInputAccept = document.getElementsByClassName('input-accept')[0];
    if (event.target === nameInput) {
      nameInput.focus();
    }
    if (event.target === nameInputAccept) {
      if (nameInput.value) {
        game.data.playerName = nameInput.value;
        localStorage.setItem('playerName', nameInput.value);
        $('.profile-name').text(game.data.playerName);
        display.clearAlertScreen();
      }
    }
    // collect and check for player score input
    var scoreInput = document.getElementsByClassName('score-input')[0];
    if (scoreInput) {
      if (event.target === scoreInput) {
        var playerScoreRef = game.data.scoreListRef.child(game.data.playerName);
        playerScoreRef.setWithPriority({
          name:game.data.playerName,
          score:game.data.playerHighScore},
          game.data.playerHighScore );
        display.clearAlertScreen();
      }
    }
    // collect and check for alert pane exit selection
    var alertExit = document.getElementsByClassName('alert-exit')[0];
    if (alertExit) {
      if (alertExit.contains(event.target)) {
        display.clearAlertScreen();
      }
    }
    // collect and check for play game selection
    var playGameButton = document.getElementById('play-game');
    if (event.target === playGameButton) {
      display.currentPage = 'game';
      display.drawPage();
      // if no player name found locally for player prompt for one now.
      var playerName = localStorage.getItem('playerName');
      if (!(playerName)) {
        display.drawNameEdit();
      }
    }
    // collect and check for high score page navigation
    var viewHighScoresButton = document.getElementById('view-high-scores');
    if (event.target === viewHighScoresButton) {
      display.currentPage = 'highScores';
      display.drawPage();
    }
    // collect and check for start new round selection
    var newRoundButton = document.getElementsByClassName('new-round-group')[0];
    if (newRoundButton) {
      if (newRoundButton.contains(event.target)) {
        game.startNewRound();
      }
    }
    // only check for piece selection when game is running
    if (game.data.runStatus === 1) {
      // collect and check for break button selections
      var breakPieceButton = document.getElementsByClassName('game-breaks-piece')[0];
      var breakRowButton = document.getElementsByClassName('game-breaks-row')[0];
      var breakBoardButton = document.getElementsByClassName('game-breaks-board')[0];
      if (breakPieceButton !== [] && game.data.breakPieceStatus) {
        if (breakPieceButton.contains(event.target)) {
          game.breakRandomPiece();
          breakPieceButton.style.opacity = 0.2;
          game.data.breakPieceStatus = false;
        }
      }
      if (breakRowButton !== [] && game.data.breakRowStatus) {
        if (breakRowButton.contains(event.target)) {
          game.breakRandomRow();
          breakRowButton.style.opacity = 0.2;
          game.data.breakRowStatus = false;
        }
      }
      if (breakBoardButton !== [] && game.data.breakBoardStatus) {
        if (breakBoardButton.contains(event.target)) {
          game.breakBoard();
          breakBoardButton.style.opacity = 0.2;
          game.data.breakBoardStatus = false;
        }
      }
      // check all game pieces and tiles for targeting
      var gameTiles = document.getElementsByClassName('game-tile');
      var gamePieces = document.getElementsByClassName('game-piece');
      var validTarget = false;
      _.each(gameTiles, function(tile) {
        if (event.target === tile) {
          var targetX = Number(event.target.getAttribute('data-x'));
          var targetY = Number(event.target.getAttribute('data-y'));
          game.setTargetedPos(targetX, targetY);
          validTarget = true;
        }
      });
      _.each(gamePieces, function(piece) {
        if (event.target === piece) {
          var targetX = Number(event.target.getAttribute('data-x'));
          var targetY = Number(event.target.getAttribute('data-y'));
          game.setTargetedPos(targetX, targetY);
          validTarget = true;
        }
      });
      if (!validTarget) {
        // if selection made and no valid location targeted clear current selection data
        game.clearSelections();
      }
    }
  },
  mouseMoveHandling: function(event) {
    event.preventDefault();
    // grab current cursor co-ordinates
    game.setMousePos(event.pageX, event.pageY);
  }
};
