// data holder for display information
var display = {
  viewportWidth: null,
  viewportHeight: null,
  $container: null,
  $siteIcon: null,
  $logo: null,
  $playSelect: null,
  $gameBoard: null,
  $gameBoardArea: null,
  $footer: null,
  // grab DOM handles
  setHandles: function() {
    display.$container = $('.container');
    display.$siteIcon = $('.site-icon');
    display.$logo = $('.logo-row');
    display.$playSelect = $('.play-select-row');
    display.$gameBoard = $('.game-board-row');
    display.$gameBoardArea = $('.game-board');
    display.$footer = $('.footer-row');
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
    display.$container.css('height', String(currHeight) + 'px')
  },
  // function to ensure footer is fitted to container elements
  setFooterWidth: function() {
    var containerWidth = display.$container.width();
    display.$footer.css('width', String(containerWidth) + 'px')
  },
  // function to opening landing page
  showLandingPage: function() {
    // display/hide relevant dom elements to the player.
    display.$logo.css('display', 'block');
    display.$playSelect.css('display', 'block');
    display.$gameBoard.css('display', 'none');
  },
  // function to open a game view
  showGamePage: function() {
    display.$logo.css('display', 'none');
    display.$playSelect.css('display', 'none');
    // update board height to reflect width
    display.$gameBoard.css('visibility', 'hidden');
    display.$gameBoard.css('display', 'block');
    var gameBoardAreaWidth = display.$gameBoardArea.width();
    display.$gameBoardArea.css('height', String(gameBoardAreaWidth) + 'px');
    display.$gameBoard.css('visibility', 'visible');
  }
};

// data object to contain event listeners logic and handling.
var handlers = {
  setHomeButton: function() {
    display.$siteIcon.on('click', function() {
      display.showLandingPage();
    });
  },
  setPlayButton: function() {
    display.$playSelect.on('click', function() {
      display.showGamePage();
    });
  },
  setResizeHandling: function() {
    // update dynamically generated elements on window resizing event.
  },
  // set all event handlers
  setAllHandlers: function() {
    handlers.setHomeButton();
    handlers.setPlayButton();
    handlers.setResizeHandling();
  }
};

$(document).ready(function() {
  display.setHandles();
  // make sure container is set to full page size.
  display.setContainerHeight();
  display.setFooterWidth();
  display.showLandingPage();
  handlers.setAllHandlers();
});
