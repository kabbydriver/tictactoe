Tic Tac Toe

I implemented a live two-player game of tic-tac-toe using meteor
Player 1: 
kabbydriver.meteor.com/player1

Player 2:
kabbydriver.meteor.com/player2

The game uses several collections to keep players in sync

Table
Status
Turn

Table is used to store the state of each cell in a 
board of tic-tac-toe. Each document in this collection is structured as follows:

{
	row: (1-3)
	cols: [
		{
			col: 1,
			playerMark: 0
		}, 
		{
			col: 2,
			playerMark: 0
		},
		{
			col: 3,
			playerMark: 0
		}
	]
}

Each entry in the array corresponds to a cell in the tic-tac-toe board. There are three rows in the database.
The playerMark can store 3 values,
0 -- No player has marked this cell
1 -- player 1 has marked this cell
2 -- player 2 has marked this cell

Once a cell has been marked it cannot be marked again.
Hitting the reset button simply finds each cell and changes
its playerMark to 0

Status is used to keep track of the game, and keep players in sync. Status just has one field, 'winner'. Winner can take on 4 values. Hitting the reset button changes 'winner' to zero.

0 -- No winner so far
1 -- Player 1 has won
2 -- Player 2 has won
3 -- The game has resulted in a tie

Turn is used to keep track of whose turn it is. A Turn document has one field, playerTurn. This field can hold one of two values.

1 -- It is player 1's turn
2 -- It is player 2's turn

A new game defaults to player 1's turn. This document is used to lock a player from making a move when it is not his/her turn. 
Additionally, it is used to display dynamic messages about whose turn it is ("Waiting for player x", "Your Move"). Resetting the game changes this variable to 1.


Miscellaneous
I implemented a few helper methods that check when a game is finished and update the corresponding collections appropriately. Additionally, I implemented a check for a full board with no winner to display to the user there is a tie. 

To keep track of seperate players, I used two routes.
Player 1 logs in through the end point /player1
and a session variable is marked accordingly. Player 2 enters through /player2 and a session variable is then marked.