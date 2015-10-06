(function(){

/////////////////////////////////////////////////////////////////////////
//                                                                     //
// tictactoe.js                                                        //
//                                                                     //
/////////////////////////////////////////////////////////////////////////
                                                                       //
var Table = new Mongo.Collection("table");                             // 1
var Counter = new Mongo.Collection("counter");                         // 2
var Turn = new Mongo.Collection("turn");                               // 3
var Status = new Mongo.Collection("status");                           // 4
if (Meteor.isClient) {                                                 // 5
  // counter starts at 0                                               //
  Session.setDefault('counter', 0);                                    // 7
                                                                       //
  Template.board.helpers({                                             // 10
    rows: function () {                                                // 11
      return Table.find({});                                           // 12
    }                                                                  //
  });                                                                  //
                                                                       //
  Template.row.helpers({                                               // 16
    columns: function (parentContext) {                                // 17
      return this.cols;                                                // 18
    }                                                                  //
  });                                                                  //
                                                                       //
  var isRowWinner = function (row) {                                   // 22
    var mark = row[0];                                                 // 23
    for (var entry = 0; entry < row.length; entry++) {                 // 24
      if (mark == 0 || mark != row[entry]) {                           // 25
        return 0;                                                      // 26
      }                                                                //
    }                                                                  //
    return mark;                                                       // 29
  };                                                                   //
                                                                       //
  var isColWinner = function (board, col) {                            // 32
    var mark = board[0][col];                                          // 33
    for (var i = 0; i < board.length; i++) {                           // 34
      var entry = board[i][col];                                       // 35
      if (entry == 0 || mark != entry) {                               // 36
        return 0;                                                      // 37
      }                                                                //
    }                                                                  //
    return mark;                                                       // 40
  };                                                                   //
                                                                       //
  var isDiagWinner = function (board) {                                // 43
    var mark = board[0][0];                                            // 44
    var failure = false;                                               // 45
    for (var i = 0; i < board.length; i++) {                           // 46
      var j = i;                                                       // 47
      var entry = board[i][j];                                         // 48
      if (entry == 0 || mark != entry) {                               // 49
        failure = true;                                                // 50
      }                                                                //
    }                                                                  //
                                                                       //
    if (!failure) {                                                    // 54
      return mark;                                                     // 55
    }                                                                  //
                                                                       //
    var mark = board[0][board.length - 1];                             // 58
    for (var i = 0; i < board.length; i++) {                           // 59
      var j = board.length - i - 1;                                    // 60
      var entry = board[i][j];                                         // 61
      if (entry == 0 || entry != mark) {                               // 62
        return 0;                                                      // 63
      }                                                                //
    }                                                                  //
    return mark;                                                       // 66
  };                                                                   //
                                                                       //
  var checkRows = function (board) {                                   // 69
    for (var i in babelHelpers.sanitizeForInObject(board)) {           // 70
      var result = isRowWinner(board[i]);                              // 71
      if (result) {                                                    // 72
        return result;                                                 // 73
      }                                                                //
    }                                                                  //
    return 0;                                                          // 76
  };                                                                   //
                                                                       //
  var checkCols = function (board) {                                   // 79
    for (var i in babelHelpers.sanitizeForInObject(board)) {           // 80
      var result = isColWinner(board, i);                              // 81
      if (result) {                                                    // 82
        return result;                                                 // 83
      }                                                                //
    }                                                                  //
    return 0;                                                          // 86
  };                                                                   //
                                                                       //
  Template.row.events({                                                // 89
    'click td': function (event, template) {                           // 90
      var winner = Status.findOne().winner;                            // 91
      if (winner) {                                                    // 92
        return;                                                        // 92
      }                                                                //
      var row = Table.findOne(template.data._id);                      // 93
      var cols = row.cols;                                             // 94
                                                                       //
      var mark = cols[this.col - 1].playerMark;                        // 96
      var turn = Turn.findOne({});                                     // 97
                                                                       //
      if (mark != 0 || turn.playerTurn != Session.get('player')) {     // 99
        return;                                                        // 100
      }                                                                //
                                                                       //
      cols[this.col - 1].playerMark = Session.get('player');           // 103
      var next = Session.get('player') == 1 ? 2 : 1;                   // 104
      Table.update(template.data._id, { $set: { cols: cols } });       // 105
      Turn.update(turn._id, { $set: { playerTurn: next } });           // 106
                                                                       //
      //create board                                                   //
      var board = [];                                                  // 110
      var row1 = new Array(3);                                         // 111
      var row2 = new Array(3);                                         // 112
      var row3 = new Array(3);                                         // 113
      board.push(row1);                                                // 114
      board.push(row2);                                                // 115
      board.push(row3);                                                // 116
      var data = Table.find().fetch();                                 // 117
                                                                       //
      var unMarkedSpaces = 0;                                          // 119
      Table.find().forEach(function (doc) {                            // 120
        var row = doc.row - 1;                                         // 121
        for (var col in babelHelpers.sanitizeForInObject(doc.cols)) {  // 122
          var playerMark = doc.cols[col].playerMark;                   // 123
          board[row][col] = playerMark;                                // 124
          if (playerMark == 0) {                                       // 125
            unMarkedSpaces++;                                          // 125
          }                                                            //
        }                                                              //
      });                                                              //
                                                                       //
      var status = Status.findOne();                                   // 129
      var rowsResult = checkRows(board);                               // 130
                                                                       //
      if (unMarkedSpaces == 0) {                                       // 132
        Status.update(status._id, { $set: { winner: 3 } });            // 133
      }                                                                //
                                                                       //
      if (rowsResult) {                                                // 136
        Status.update(status._id, { $set: { winner: rowsResult } });   // 137
        return;                                                        // 138
      }                                                                //
                                                                       //
      var colResult = checkCols(board);                                // 141
      if (colResult) {                                                 // 142
        Status.update(status._id, { $set: { winner: colResult } });    // 143
        return;                                                        // 144
      }                                                                //
                                                                       //
      var diagResult = isDiagWinner(board);                            // 147
      if (diagResult) {                                                // 148
        Status.update(status._id, { $set: { winner: diagResult } });   // 149
        return;                                                        // 150
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
      var countDoc = Counter.findOne({});                              // 170
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
