if (Meteor.isClient) {

  Session.setDefault('counter', 1);
  var board = [];

  Meteor.ClientCall.methods({
    'addChip': function(player, column) {
      var move = Session.get('counter');
      var row = 1;
      var row_not_found = true;
      while(row < 8 && row_not_found) {
        if ($("#"+row+column).html() == "") {
          if(player == 1) {
            $("#"+row+column).html("<div id='blue_chip'></div>");
          } else if (player == 2) {
            $("#"+row+column).html("<div id='red_chip'></div>");
          }
          row_not_found = false;
        }
        row++;
      }

      var message = "["+move+"] Player " +player+ " added chip to column "+column+"<br/>"; 
      $('#game_log').append(message);
        Session.set('counter', Session.get('counter') + 1);
      return true;
    },
    'enablePlayerDrop': function(player) {
      var color = 'red';
      if(player == 2) color = 'blue';
      $(".add_chip_"+color).prop('disabled', false);
      $("#"+color+"_turn").removeClass("turn_no" );
      $("#"+color+"_turn").addClass("turn_yes");
      $("#"+color+"_turn").html('Your Turn: <br/>YES!');
    },
    'disablePlayerDrop': function(player) {
      var color = 'red';
      if(player == 1) color = 'blue';
      $(".add_chip_"+color).prop('disabled', true);
      $("#"+color+"_turn").removeClass("turn_yes");
      $("#"+color+"_turn").addClass("turn_no");
      $("#"+color+"_turn").html('Your Turn: <br/>NOP!');
    }
  });
  
  Meteor.methods({
    addColorChip: function (player, column, row) {      
      row = parseInt(row-1);
      column = parseInt(column);
      Meteor.call('processChip', 'blue', column, row, function(err, response) {});
    },
    processChip: function (color, column, row) {
      board[column][row] = color;
      var win = false;
      if(
          (column < 5 && column > 0 && board[column+1][row] == color && board[column+2][row] == color && board[column+3][row] == color) || 
          (column < 6 && column > 1 && board[column+1][row] == color && board[column+2][row] == color && board[column-1][row] == color) || 
          (column < 7 && column > 2 && board[column+1][row] == color && board[column-1][row] == color && board[column-2][row] == color) || 
          (column < 8 && column > 3 && board[column-1][row] == color && board[column-2][row] == color && board[column-3][row] == color) || 
          (row < 7 && row > 3 && board[column][row-1] == color && board[column][row-2] == color && board[column][row-3] == color) ||
          (column > 0 && column < 5 && row > 0 && row < 4 && board[column+1][row+1] == color && board[column+2][row+2] == color && board[column+3][row+3] == color) ||
          (column > 3 && column < 8 && row > 3 && row < 7 && board[column-1][row-1] == color && board[column-2][row-2] == color && board[column-3][row-3] == color) ||
          (column > 1 && column < 6 && row > 1 && row < 5 && board[column+1][row+1] == color && board[column+2][row+2] == color && board[column-1][row-1] == color) ||
          (column > 1 && column < 7 && row > 1 && row < 6 && board[column+1][row+1] == color && board[column-1][row-1] == color && board[column-2][row-2] == color) ||
          (column > 0 && column < 5 && row > 3 && row < 7 && board[column+1][row-1] == color && board[column+2][row-2] == color && board[column+3][row-3] == color) ||
          (column > 3 && column < 8 && row > 0 && row < 4 && board[column-1][row+1] == color && board[column-2][row+2] == color && board[column-3][row+3] == color) ||
          (column > 2 && column < 7 && row > 1 && row < 5 && board[column-1][row+1] == color && board[column-2][row+2] == color && board[column+1][row-1] == color) ||
          (column > 1 && column < 6 && row > 2 && row < 6 && board[column-1][row+1] == color && board[column+1][row-1] == color && board[column+2][row-2] == color)
        ) {
          alert(color +" player win the match! ");
          $('#game_log').html("<h1>Game Over!<br/>The player "+color+ " WON!</h1><br/><h2>Please reload the page to play again...");
        }
    },
    setBoard: function() {
      for(var i=1; i < 8; i++) {
        board[i] = [];
        for(var j = 1; j < 7; j++) {
          board[i][j] = '';
        }
      }
    }
  });

  Deps.autorun(function() {
    Meteor.ClientCall.setClientId(1);
    Meteor.call('setBoard', function(err, response) {});
  });



  Template.red_board.helpers({
    columns: [{column: "1"}, {column: "2"}, {column: "3"}, {column: "4"}, {column: "5"}, {column: "6"}, {column: "7"}],
    rows: [{row: "6"}, {row: "5"}, {row: "4"}, {row: "3"}, {row: "2"}, {row: "1"}]
  });

  Template.blue_board.helpers({
    columns: [{column: "1"}, {column: "2"}, {column: "3"}, {column: "4"}, {column: "5"}, {column: "6"}, {column: "7"}],
    rows: [{row: "6"}, {row: "5"}, {row: "4"}, {row: "3"}, {row: "2"}, {row: "1"}]
  });



  Template.blue_board.events({
    'click .add_chip': function (event, template) {
      var player =  $("#player_id").attr('player_number');
      var column = event.target.attributes.column.value;
      // Checking size in the limits
      var row = 1;
      var row_not_found = true;
      while(row < 8 && row_not_found) {
        if ($("#"+row+column).html() == "") {
          row_not_found = false;
        }
        row++;
      }
      if(row > 7) {
        alert("You cannot use that column, already at max capacity! Please choose a different one...");
        return false;
      }
      Meteor.call('addColorChip', player, column, row, function(err, response) {});
      Meteor.call('addServerChip', player, column, function(err, response) {});
      Meteor.call('enablePlayer', player, function(err, response) {});
      Meteor.call('disablePlayer', player, function(err, response) {});
    }
  });

  Template.red_board.events({
    'click .add_chip': function (event, template) {
      var player =  $("#player_id").attr('player_number');
      var column = event.target.attributes.column.value;
      // Checking size in the limits
      var row = 1;
      var row_not_found = true;
      while(row < 8 && row_not_found) {
        if ($("#"+row+column).html() == "") {
          row_not_found = false;
        }
        row++;
      }
      if(row > 7) {
        alert("You cannot use that column, already at max capacity! Please choose a different one...");
        return false;
      }
      Meteor.call('addColorChip', player, column, row, function(err, response) {});
      Meteor.call('addServerChip', player, column, function(err, response) {});
      Meteor.call('enablePlayer', player, function(err, response) {});
      Meteor.call('disablePlayer', player, function(err, response) {});
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    Meteor.methods({
      addServerChip: function (player, column) {
        Meteor.ClientCall.apply(1, 'addChip', [player, column], function(error, result) {
          return result;
        });
      },
      enablePlayer: function(player) {
        Meteor.ClientCall.apply(1, 'enablePlayerDrop', [player], function(error, result) {
        });
        return true;
      },
      disablePlayer: function(player) {
        Meteor.ClientCall.apply(1, 'disablePlayerDrop', [player], function(error, result) {
        });
        return true;
      }
    });
  });
}
