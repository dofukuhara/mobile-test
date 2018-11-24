# TicTacToe Mobile App 

## The Project

This TicTacToe Mobile App was implemented using React Native (for iOS and Android) and has the following functionality:

- The game ends under either of the following circumstances:
- -  A player wins by claiming 3 cells that fall in a horizontal, vertical, or diagonal line.
- - The players tie if there are no more possible moves (i.e., all cells are claimed).

- This is a button at the bottom of the screen whose function is to start a new game. If no game is currently in progress, this button will be labeled as Start New Game; if there is a game in progress, this button will be labeled as Restart Game.

- When the game ends, a dialog box will be displayed with the result, as well as a notification in the upper left corner of the app, with the following message:
- - If Player 1 wins, display Player 1 Wins.
- - If Player 2 wins, display Player 2 Wins.
- - If the players tie, display It's a Tie.

- In the right corner of the top bar, it will be displayed the number of games thus user finished. 
- - When finishing 5 games, show message on the screen (alert dialog)
- - This number will be kept if the user finishes the app and start it again

- If the user clicks on the Restart Game, a dialog box will appear with the message: Do you want to restart the game?.
- - If the user clicks OK, a new game starts. This means the game board reverts its initial state and all claimed cells are cleared.
- - If the user clicks CANCEL, the dialog box closes and the current game resumes.


## Instructions
- Install NodeJS
- - https://nodejs.org/en/

- Install React Native CLI
- - npm install -g react-native-cli

- Download this project

- Run 'npm install' to download and update project's dependencies

- Run 'react-native start' to prepare the environment so that the app can be initialized

- To build and install the application, run:
- - For Android build: react-native run-android
- - For iOS build: react-native run-ios
- - **PS**: By default 'run-android' does not starts an Emulator (you need to manually start an Emulator or have a physical device connected), whereas 'run-ios' automatically starts a Simulator (that, by default is "iPhone 6")

That's all!
Enjoy and Have Fun :laughing:
