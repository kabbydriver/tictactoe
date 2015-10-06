(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// tictactoe.js                                                        //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
var Table = new Mongo.Collection("table");                             // 1
var Turn = new Mongo.Collection("turn");                               // 2
var Status = new Mongo.Collection("status");                           // 3
                                                                       //
if (Meteor.isClient) {                                                 // 5
  Session.setDefault('counter', 0);                                    // 6
                                                                       //
  Template.board.helpers({                                             // 9
    rows: function () {                                                // 10
      return Table.find({});                                           // 11
    }                                                                  //
  });                                                                  //
                                                                       //
  Template.row.helpers({                                               // 15
    columns: function (parentContext) {                                // 16
      return this.cols;                                                // 17
    }                                                                  //
  });                                                                  //
                                                                       //
  var isRowWinner = function (row) {                                   // 21
    var mark = row[0];                                                 // 22
    for (var entry = 0; entry < row.length; entry++) {                 // 23
      if (mark == 0 || mark != row[entry]) {                           // 24
        return 0;                                                      // 25
      }                                                                //
    }                                                                  //
    return mark;                                                       // 28
  };                                                                   //
                                                                       //
  var isColWinner = function (board, col) {                            // 31
    var mark = board[0][col];                                          // 32
    for (var i = 0; i < board.length; i++) {                           // 33
      var entry = board[i][col];                                       // 34
      if (entry == 0 || mark != entry) {                               // 35
        return 0;                                                      // 36
      }                                                                //
    }                                                                  //
    return mark;                                                       // 39
  };                                                                   //
                                                                       //
  var isDiagWinner = function (board) {                                // 42
    var mark = board[0][0];                                            // 43
    var failure = false;                                               // 44
    for (var i = 0; i < board.length; i++) {                           // 45
      var j = i;                                                       // 46
      var entry = board[i][j];                                         // 47
      if (entry == 0 || mark != entry) {                               // 48
        failure = true;                                                // 49
      }                                                                //
    }                                                                  //
                                                                       //
    if (!failure) {                                                    // 53
      return mark;                                                     // 54
    }                                                                  //
                                                                       //
    var mark = board[0][board.length - 1];                             // 57
    for (var i = 0; i < board.length; i++) {                           // 58
      var j = board.length - i - 1;                                    // 59
      var entry = board[i][j];                                         // 60
      if (entry == 0 || entry != mark) {                               // 61
        return 0;                                                      // 62
      }                                                                //
    }                                                                  //
    return mark;                                                       // 65
  };                                                                   //
                                                                       //
  var checkRows = function (board) {                                   // 68
    for (var i in babelHelpers.sanitizeForInObject(board)) {           // 69
      var result = isRowWinner(board[i]);                              // 70
      if (result) {                                                    // 71
        return result;                                                 // 72
      }                                                                //
    }                                                                  //
    return 0;                                                          // 75
  };                                                                   //
                                                                       //
  var checkCols = function (board) {                                   // 78
    for (var i in babelHelpers.sanitizeForInObject(board)) {           // 79
      var result = isColWinner(board, i);                              // 80
      if (result) {                                                    // 81
        return result;                                                 // 82
      }                                                                //
    }                                                                  //
    return 0;                                                          // 85
  };                                                                   //
                                                                       //
  Template.row.events({                                                // 88
    'click td': function (event, template) {                           // 89
      var winner = Status.findOne().winner;                            // 90
      if (winner) {                                                    // 91
        return;                                                        // 91
      }                                                                //
      var row = Table.findOne(template.data._id);                      // 92
      var cols = row.cols;                                             // 93
                                                                       //
      var mark = cols[this.col - 1].playerMark;                        // 95
      var turn = Turn.findOne({});                                     // 96
                                                                       //
      if (mark != 0 || turn.playerTurn != Session.get('player')) {     // 98
        return;                                                        // 99
      }                                                                //
                                                                       //
      cols[this.col - 1].playerMark = Session.get('player');           // 102
      var next = Session.get('player') == 1 ? 2 : 1;                   // 103
      Table.update(template.data._id, { $set: { cols: cols } });       // 104
      Turn.update(turn._id, { $set: { playerTurn: next } });           // 105
                                                                       //
      //create board                                                   //
      var board = [];                                                  // 109
      var row1 = new Array(3);                                         // 110
      var row2 = new Array(3);                                         // 111
      var row3 = new Array(3);                                         // 112
      board.push(row1);                                                // 113
      board.push(row2);                                                // 114
      board.push(row3);                                                // 115
      var data = Table.find().fetch();                                 // 116
                                                                       //
      var unMarkedSpaces = 0;                                          // 118
      Table.find().forEach(function (doc) {                            // 119
        var row = doc.row - 1;                                         // 120
        for (var col in babelHelpers.sanitizeForInObject(doc.cols)) {  // 121
          var playerMark = doc.cols[col].playerMark;                   // 122
          board[row][col] = playerMark;                                // 123
          if (playerMark == 0) {                                       // 124
            unMarkedSpaces++;                                          // 124
          }                                                            //
        }                                                              //
      });                                                              //
                                                                       //
      var status = Status.findOne();                                   // 128
      var rowsResult = checkRows(board);                               // 129
                                                                       //
      if (rowsResult) {                                                // 133
        Status.update(status._id, { $set: { winner: rowsResult } });   // 134
        return;                                                        // 135
      }                                                                //
                                                                       //
      var colResult = checkCols(board);                                // 138
      if (colResult) {                                                 // 139
        Status.update(status._id, { $set: { winner: colResult } });    // 140
        return;                                                        // 141
      }                                                                //
                                                                       //
      var diagResult = isDiagWinner(board);                            // 144
      if (diagResult) {                                                // 145
        Status.update(status._id, { $set: { winner: diagResult } });   // 146
        return;                                                        // 147
      }                                                                //
                                                                       //
      if (unMarkedSpaces == 0) {                                       // 150
        Status.update(status._id, { $set: { winner: 3 } });            // 151
      }                                                                //
    }                                                                  //
  });                                                                  //
                                                                       //
  Template.cell.helpers({                                              // 156
    getImage: function () {                                            // 157
      if (this.playerMark == 0) {                                      // 158
        return '';                                                     // 159
      } else if (this.playerMark == 1) {                               //
        return 'X';                                                    // 161
      } else {                                                         //
        return 'O';                                                    // 163
      }                                                                //
    }                                                                  //
  });                                                                  //
                                                                       //
  Template.reset.events({                                              // 168
    'click button': function () {                                      // 169
                                                                       //
      Table.find({}).forEach(function (doc) {                          // 171
        var cols = doc.cols;                                           // 172
        cols.forEach(function (cell) {                                 // 173
          cell.playerMark = 0;                                         // 174
          Table.update(doc._id, { $set: { cols: cols } });             // 175
        });                                                            //
      });                                                              //
      Turn.find({}).forEach(function (doc) {                           // 178
        Turn.update(doc._id, { $set: { playerTurn: 1 } });             // 179
      });                                                              //
                                                                       //
      var status = Status.findOne();                                   // 182
      Status.update(status._id, { $set: { winner: 0 } });              // 183
    }                                                                  //
  });                                                                  //
                                                                       //
  Template.gameStatus.helpers({                                        // 187
    whoseTurn: function () {                                           // 188
      var turn = Turn.findOne().playerTurn;                            // 189
      var player = Session.get('player');                              // 190
      var winner = Status.findOne().winner;                            // 191
      if (winner) {                                                    // 192
        if (winner == 3) {                                             // 193
          return "It's a tie!";                                        // 194
        }                                                              //
        if (winner == player) {                                        // 196
          return "You Won!";                                           // 197
        } else {                                                       //
          return "You Lost!";                                          // 199
        }                                                              //
      }                                                                //
      if (turn == player) {                                            // 202
        return "Your Move";                                            // 203
      } else {                                                         //
        return "Waiting for Player " + turn;                           // 205
      }                                                                //
    }                                                                  //
  });                                                                  //
                                                                       //
  Template.registerHelper('getPlayer', function () {                   // 211
    return Session.get('player');                                      // 212
  });                                                                  //
}                                                                      //
                                                                       //
if (Meteor.isServer) {                                                 // 217
  Meteor.startup(function () {                                         // 218
    // code to run on server at startup                                //
  });                                                                  //
}                                                                      //
                                                                       //
FlowRouter.route('/player1', {                                         // 223
  action: function () {                                                // 224
    Session.set('player', 1);                                          // 225
  }                                                                    //
});                                                                    //
                                                                       //
FlowRouter.route('/player2', {                                         // 229
  action: function () {                                                // 230
    Session.set('player', 2);                                          // 231
  }                                                                    //
});                                                                    //
/////////////////////////////////////////////////////////////////////////

}).call(this);

//# sourceMappingURL=tictactoe.js.map
