var Table = new Mongo.Collection("table");
var Turn = new Mongo.Collection("turn");
var Status = new Mongo.Collection("status");

if (Meteor.isClient) {
  Session.setDefault('counter', 0);


  Template.board.helpers({
  	rows: function() {
  		return Table.find({});			
  	}
  });

  Template.row.helpers({
  	columns: function(parentContext) {
  		return this.cols;
  	}
  });

  var isRowWinner = function(row) {
    var mark = row[0]
    for (var entry = 0; entry < row.length; entry++) {
      if (mark == 0 || mark != row[entry]) {
        return 0;
      }
    }
    return mark;
  }

  var isColWinner = function(board, col) {
    var mark = board[0][col];
    for (var i = 0; i < board.length; i++) {
      var entry = board[i][col];
      if (entry == 0 || mark != entry) {
        return 0;
      }
    }
    return mark;
  }

  var isDiagWinner = function(board) {
    var mark = board[0][0];
    var failure = false;
    for (var i = 0; i < board.length; i++) {
      var j = i;
      var entry = board[i][j];
      if (entry == 0 || mark != entry) {
        failure = true;
      }
    }

    if (!failure) {
      return mark;
    } 

    var mark = board[0][board.length-1];
    for (var i = 0; i < board.length; i++) {
      var j = board.length - i - 1;
      var entry = board[i][j];
      if (entry == 0 || entry != mark) {
        return 0;
      }
    }
    return mark;
  }

  var checkRows = function(board) {
  	for (var i in board) {
  		var result = isRowWinner(board[i]);
  		if (result) {
  			return result;
  		}
  	}
  	return 0;
  }

  var checkCols = function(board) {
  	for (var i in board) {
  		var result =  isColWinner(board, i);
  		if (result) {
  			return result;
  		}
  	}
  	return 0;
  }

  Template.row.events({
  	'click td': function(event, template) {
  		var winner = Status.findOne().winner;
  		if (winner) { return; }
  		var row = Table.findOne(template.data._id);
  		var cols = row.cols

  		var mark = cols[this.col-1].playerMark;
  		var turn = Turn.findOne({});

  		if (mark != 0 || turn.playerTurn != Session.get('player')) {
  			return;
  		}

  		cols[this.col-1].playerMark = Session.get('player');
  		var next = (Session.get('player') == 1) ? 2 : 1;
  		Table.update(template.data._id, {$set: {cols: cols}});
  		Turn.update(turn._id, {$set: {playerTurn: next}});


  		//create board
  		var board = [];
  		var row1 = new Array(3);
  		var row2 = new Array(3);
  		var row3 = new Array(3);
  		board.push(row1);
  		board.push(row2);
  		board.push(row3);
  		var data = Table.find().fetch();

  		var unMarkedSpaces = 0;
  		Table.find().forEach(function(doc){
  			var row = doc.row - 1;
  			for (var col in doc.cols) {
  				var playerMark = doc.cols[col].playerMark;
  				board[row][col] = playerMark
  				if (playerMark == 0) { unMarkedSpaces++; }
  			}
  		});

  		var status = Status.findOne();
  		var rowsResult = checkRows(board);



  		if (rowsResult) { 
  			Status.update(status._id, {$set: {winner: rowsResult}});
  			return;
  		}

  		var colResult = checkCols((board));
  		if (colResult) {
  			Status.update(status._id, {$set: {winner: colResult}});
  			return;
  		}

  		var diagResult = isDiagWinner(board);
  		if (diagResult) {
  			Status.update(status._id, {$set: {winner: diagResult}});
  			return;
  		}

      if (unMarkedSpaces == 0) {
        Status.update(status._id, {$set: {winner: 3}});
      }
  	}
  });

  Template.cell.helpers({
  	getImage: function() {
  		if (this.playerMark == 0) {
  			return '';
  		} else if (this.playerMark == 1) {
  			return 'X';
  		} else {
  			return 'O';
  		}
  	}
  });

  Template.reset.events({
  	'click button': function() {

  		Table.find({}).forEach(function (doc) {
  			var cols = doc.cols
  			cols.forEach(function(cell) {
  				cell.playerMark = 0;
  				Table.update(doc._id, {$set: {cols: cols}});
  			});
  		});
  		Turn.find({}).forEach(function(doc) { 
  			Turn.update(doc._id, {$set: {playerTurn: 1}});
  		});

  		var status = Status.findOne();
  		Status.update(status._id, {$set : {winner: 0}});
  	}
  });

  Template.gameStatus.helpers({
  	whoseTurn: function() {
  		var turn = Turn.findOne().playerTurn;
  		var player = Session.get('player');
  		var winner = Status.findOne().winner;
  		if (winner) {
  			if (winner == 3) {
  				return "It's a tie!";
  			}
  			if (winner == player) {
  				return "You Won!";
  			} else  {
  				return "You Lost!";
  			}
  		}
  		if (turn == player) {
  			return "Your Move";
  		} else {
  			return "Waiting for Player " + turn;
  		}

  	}
  });

  Template.registerHelper('getPlayer', function(){
  	return Session.get('player');
  });

}

if (Meteor.isServer) {
	Meteor.startup(function () {
    // code to run on server at startup
	});
}

FlowRouter.route('/player1', { 
  action: function() { 
    Session.set('player', 1); 
  } 
}); 
 
FlowRouter.route('/player2', { 
  action: function() { 
    Session.set('player', 2); 
  } 
}); 
