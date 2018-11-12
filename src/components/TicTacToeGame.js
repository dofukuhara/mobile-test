import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    TouchableHighlight,
    Alert, AsyncStorage, TouchableOpacity
} from 'react-native';

/* Pega a largura do device */
//const deviceScreenWidth = Dimensions.get('screen').width;
//const deviceScreenHeight = Dimensions.get('screen').height;
/*
const deviceWindowWidth = Dimensions.get('window').width;
const deviceWindowHeight = Dimensions.get('window').height;
*/

/*
    Getting the screen width and height, in order
    to dinamically calculate the size of the cell,
    in order to have a 3x3 grid fitting in the screen
*/
const {
    width: deviceWindowWidth,
    height: deviceWindowHeight
} = Dimensions.get('window');

/*
    The size of the Grid. It will be used when deciding
    if the user won the game by a diagonal '/' combination 
*/
const gridSize = 3

// Maximun possible cells to be claimed in the game
const maxCellClaim = 9

// Number of times the user needs to play in order to throw a notification
const engagingCounter = 5

// The game will only start when the user click on "Start New Game" or "Restart Game"
let isGameStarted = false;

// Variable used to check if the game is on going
let isGameRolling = true

// Number of cells claimed during the game
let cellsClaimed = 0

// Default/fallback value of number of Played Times
let numberOfPlayedGames = '0'

// [Start] String resources
const GAME_COUNTER_ASYNC_KEY = 'gameCounterValue'
const GAME_COUNTER = 'Game Counter: '
const PLAYER_ONE_TURN = '(O) TURN\n- Player 1 -'
const PLAYER_TWO_TURN = '(X) TURN\n- Player 2 -'
const PLAYER_ONE_CHAR = 'O'
const PLAYER_TWO_CHAR = 'X'
const BTN_START_NEW_GAME = 'Start New Game'
const BTN_RESTART_GAME = 'Restart Game'
const DIAG_TITLE_GAME_NOT_START = 'Game Not Started...'
const DIAG_MSG_PRESS_START = 'In order to start a game, click in "Start New Game" button down below!'
const DIAG_TITLE_GAME_FINISHED = 'Game finished!'
const DIAG_MSG_GAME_IS_OVER = 'The game is over. Please click on "Restart Game" for a new game!'
const DIAG_TITLE_UNABLE_TO_PROCEED = 'Unable to Proceed!'
const DIAG_MSG_CELL_ALREADY_SELECTED = 'This cell was already selected, please choose another empty cell!'
const DIAG_TITLE_WINNER = 'We have a winner!!!'
const DIAG_MSG_PLAYER_ONE_WINS = 'Player 1 Wins'
const DIAG_MSG_PLAYER_TWO_WINS = 'Player 2 Wins'
const PLAYER_WINNER_DEFAULT = ''
const DIAG_MSG_GAME_TIE = "It's a Tie"
const DIAG_TITLE_RESTART_GAME = 'Restart the game'
const DIAG_MSG_RESTART_GAME = 'Do you want to restart the game?'
const DIAG_OPTION_OK = 'OK'
const DIAG_OPTION_CANCEL = 'Cancel'
const DIAG_TITLE_CONGRATS = 'Thank U!'
const DIAG_MSG_HOPE_ENJOYING = 'Wow, you played me for ' + engagingCounter + ' times! Hope you are having fun! :)'

export default class TicTacToeGame extends Component {

    constructor() {
        super();

        this.retrieveNumberOfPlayedTimes()
    }

    /*
        All the state variables that we will need to control the game:
        - gameCounter: will inform how many times the user completed a game
        - grid: will hold the value of each cell and it will be used in order to
            update the UI and also in the calculation of game decision
        - isPlayerOne: boolean resource used to control if the current player
            is Player One or not
        - currentTurn: String variable to indicate to the user which Player is 
            has the turn
        - gameWinnerString: String variable to indicate which player won the game
            or if it was a Tie
    */
    state = {
        gameCounter : GAME_COUNTER + '0',
        grid: {
            row: [
                {
                    column: [
                        { value: '' }, { value: '' }, { value: '' }
                    ],
                },
                {
                    column: [
                        { value: '' }, { value: '' }, { value: '' }
                    ],
                },
                {
                    column: [
                        { value: '' }, { value: '' }, { value: '' }
                    ],
                }
            ]
        },
        isPlayerOne: true,
        currentTurn: PLAYER_ONE_TURN,
        gameButton: BTN_START_NEW_GAME,
        gameWinnerString: PLAYER_WINNER_DEFAULT
    };

    retrieveNumberOfPlayedTimes = async() => {
        try {
            const value = await AsyncStorage.getItem(GAME_COUNTER_ASYNC_KEY);
            if (value !== null) {
                numberOfPlayedGames = value
            } else {
                numberOfPlayedGames = '0'
            }
            this.setState({gameCounter: GAME_COUNTER + numberOfPlayedGames})
        } catch (error) {
            console.log(error)
        }
    }

    updateNumberOfPlayedTimes = async() => {
        try {
            let playedGames = parseInt(numberOfPlayedGames, 10)
            playedGames++
            numberOfPlayedGames = playedGames.toString()

            if (playedGames == engagingCounter) {
                Alert.alert(
                    DIAG_TITLE_CONGRATS,
                    DIAG_MSG_HOPE_ENJOYING,
                    [{text: DIAG_OPTION_OK}],
                    { cancelable: false }
                )
            }

            await AsyncStorage.setItem(GAME_COUNTER_ASYNC_KEY, numberOfPlayedGames)
            this.setState({gameCounter: GAME_COUNTER + numberOfPlayedGames})
        } catch (error) {
            console.log(error)
        }
    }

    // Function to handle the clicks in grid cells
    onPress(rowNum, columnNum) {

        // First, let's check if the user clicked in the "Start New Game" button
        if(!isGameStarted) {
            Alert.alert(
                DIAG_TITLE_GAME_NOT_START,
                DIAG_MSG_PRESS_START)
            return
        }

        // Secondly, let's check if the game is still rolling...
        if (!isGameRolling) {
            Alert.alert(
                DIAG_TITLE_GAME_FINISHED,
                DIAG_MSG_GAME_IS_OVER)
        }
        // Thridly, lets check if the cell is not yet selected, so that we can perform the gaming verification
        else if (!this.state.grid.row[rowNum - 1].column[columnNum - 1].value) {

            // In here, the cell (state.grid) will be populated with the Player's character (X or O)
            this.state.grid.row[rowNum - 1].column[columnNum - 1].value = this.state.isPlayerOne ? PLAYER_ONE_CHAR : PLAYER_TWO_CHAR

            // Update the number of 'valid' cells claimed during game play
            cellsClaimed++

            // After updating the grid's state variable, let's check if we have a winner!
            this.checkGameDecision(rowNum, columnNum, this.state.isPlayerOne)

            // Update the Current Player's turn information only if the game is not finished yet
            if (isGameRolling)
                this.updateCurrentPlayer()

            // Update the state so that the UI can receive the updated information
            this.forceUpdate()
        } else {
            // Lastly, in case that the user tries to select an already selected cell, throw an alert notification
            Alert.alert(
                DIAG_TITLE_UNABLE_TO_PROCEED,
                DIAG_MSG_CELL_ALREADY_SELECTED)
        }
    }

    // Function to update the current player
    updateCurrentPlayer() {
        // Update the isPlayerOne boolean controller
        this.state.isPlayerOne = !this.state.isPlayerOne

        // Update the String of which is the current player's turn
        if (this.state.isPlayerOne) {
            this.state.currentTurn = PLAYER_ONE_TURN
        } else {
            this.state.currentTurn = PLAYER_TWO_TURN
        }
    }

    // Function to determine if we have a winner
    checkGameDecision(row, column, isPlayerOne) {
        // Boolean controller to check if a winner is found
        let weHaveAWinner = false

        /*
             First, let's check if the user selected a cell that is part from a
             'backslash \' diagonal.
             As we are using a matrix-style grid, this diagonal can be checked by
             the elements where row == column
        */
        if (row == column) {
            if (this.state.grid.row[0].column[0].value ===
                this.state.grid.row[1].column[1].value &&
                this.state.grid.row[1].column[1].value ==
                this.state.grid.row[2].column[2].value) {
                /*
                    In case that it is found a match where the elements in this diagonal
                    came from the same player, update the controller to indicate that we
                    have a winner 
                */
                weHaveAWinner = true
            }
        }

        /*
             Secondly, let's check if the user selected a cell that is part from a
             'slash /' diagonal.
             As we are using a matrix-style grid, this diagonal can be checked by
             the elements where (row + column) numbers == (gridSize + 1).
             PS: This verification needs to be dettached from the previous verification
             (not an if else) because, in case of an odd grid size, the element in the middle
             is both (row == column) and (row + column) numbers == (gridSize + 1)
        */
        if (!weHaveAWinner && (row + column == gridSize + 1)) {
            if (this.state.grid.row[0].column[2].value ==
                this.state.grid.row[1].column[1].value &&
                this.state.grid.row[1].column[1].value ==
                this.state.grid.row[2].column[0].value) {
                /*
                    In case that it is found a match where the elements in this diagonal
                    came from the same player, update the controller to indicate that we
                    have a winner 
                */
                weHaveAWinner = true
            }
        }

        if (!weHaveAWinner && this.state.grid.row[row - 1].column[0].value ==
            this.state.grid.row[row - 1].column[1].value &&
            this.state.grid.row[row - 1].column[1].value ==
            this.state.grid.row[row - 1].column[2].value) {
            /*
                In case that it is found a match where the elements in the selected row
                came from the same player, update the controller to indicate that we
                have a winner 
            */
            weHaveAWinner = true
        }
        if (!weHaveAWinner && this.state.grid.row[0].column[column - 1].value ==
            this.state.grid.row[1].column[column - 1].value &&
            this.state.grid.row[1].column[column - 1].value ==
            this.state.grid.row[2].column[column - 1].value) {
            /*
                In case that it is found a match where the elements in the selected column
                came from the same player, update the controller to indicate that we
                have a winner 
            */
            weHaveAWinner = true
        }

        if (weHaveAWinner) {
            /*
                In case that a winner is found, a notification message will be displayed,
                the isGameRolling boolean control variable will be updated in order to prevent
                any other action in the cell's grid from the user
            */
            Alert.alert(
                DIAG_TITLE_WINNER,
                isPlayerOne ? DIAG_MSG_PLAYER_ONE_WINS : DIAG_MSG_PLAYER_TWO_WINS,
                [{text: DIAG_OPTION_OK}],
                { cancelable: false })

            this.state.gameWinnerString = isPlayerOne ? DIAG_MSG_PLAYER_ONE_WINS : DIAG_MSG_PLAYER_TWO_WINS

            isGameRolling = false

            // Updating the Button label from "Restart Game" to "Start New Game" and update the controller
            this.state.gameButton = BTN_START_NEW_GAME
            isGameStarted = false

            this.updateNumberOfPlayedTimes()
        }

        /*
            In case that a winner is not found and all cells where claimed,
            a "It's a Tie" message will be displayed, as well as updating 
            isGameRolling boolean control about the ending of the current game
        */
        if (!weHaveAWinner && cellsClaimed == maxCellClaim) {
            Alert.alert(
                DIAG_TITLE_GAME_FINISHED,
                DIAG_MSG_GAME_TIE,
                [{text: DIAG_OPTION_OK}],
                { cancelable: false })

            this.state.gameWinnerString = DIAG_MSG_GAME_TIE

            isGameRolling = false
            
            // Updating the Button label from "Restart Game" to "Start New Game" and update the controller
            this.state.gameButton = BTN_START_NEW_GAME
            isGameStarted = false

            this.updateNumberOfPlayedTimes()
        }
    }

    /*
        Game Button.
        In case of first time click, it will change from "Start New Game" to "Restart Game" and will set the 
        boolean resource controller isGameStarted to true, indicating that a Game can be now played

        From the second click onwards, the "Restart Game" button will show a decision OK/cancel like dialog.
        If the user click in OK, the grid will be erased and a new game will be starting
    */
    onGameButtonPressed = () => {
        /*
            If the game is already started ('Restart Game' button pressed), a Dialog message asking if
            the user wants to restart the game will be prompted. In case of OK confirmation from user, 
            the 'resetGameToInitState' will be called to reinitialize the grid
        */
        if (isGameStarted) {
            Alert.alert(
                DIAG_TITLE_RESTART_GAME,
                DIAG_MSG_RESTART_GAME,
                [
                    {text: DIAG_OPTION_OK, onPress: this.resetGameToInitState},
                    {text: DIAG_OPTION_CANCEL, style: 'cancel'}
                ],
                { cancelable: false }
            )
        } else {
            /*
                In case that clicking on Start New Game button, the grid and all of the controllers will be
                restored to the initial values
            */
            this.resetGameToInitState()
        }

        // After pressing "Start New Game" button, the variable controll indicating that the game was started...
        isGameStarted = true

        // ... and update the button's label to "Restart Game"
        this.state.gameButton = BTN_RESTART_GAME
        this.forceUpdate()
    };

    /*
        Function to reinitialize the grid, as well as reseting all of the variables control to the initial state
    */
    resetGameToInitState = () => {
        for (rowNumber = 0; rowNumber < gridSize; rowNumber++) {
            for (columnNumber = 0; columnNumber < gridSize; columnNumber++) {
                this.state.grid.row[rowNumber].column[columnNumber].value = ''
            }
        }
        isGameRolling = true
        cellsClaimed = 0
        this.state.gameWinnerString = PLAYER_WINNER_DEFAULT
        this.state.currentTurn = PLAYER_ONE_TURN
        this.state.isPlayerOne = true
        this.forceUpdate()
    }

    render() {
        return (
            <View>
                <View style={ styles.gameCounterContainer}>
                    <Text style={styles.gameWinner}>
                        {this.state.gameWinnerString}
                    </Text>
                    <Text style={styles.gameCounterText}>
                        {this.state.gameCounter}
                    </Text>
                </View>
                <View style={styles.gridContainer}>
                    <TouchableHighlight onPress={this.onPress.bind(this, 1, 1)}>
                        <View style={styles.box} ><Text style={styles.gridText}>
                            {this.state.grid.row[0].column[0].value}
                        </Text></View>
                    </TouchableHighlight>
                    <TouchableHighlight onPress={this.onPress.bind(this, 1, 2)}>
                        <View style={styles.box}><Text style={styles.gridText}>
                            {this.state.grid.row[0].column[1].value}
                        </Text></View>
                    </TouchableHighlight>
                    <TouchableHighlight onPress={this.onPress.bind(this, 1, 3)}>
                        <View style={styles.box}><Text style={styles.gridText}>
                            {this.state.grid.row[0].column[2].value}
                        </Text></View>
                    </TouchableHighlight>
                    <TouchableHighlight onPress={this.onPress.bind(this, 2, 1)}>
                        <View style={styles.box}><Text style={styles.gridText}>
                            {this.state.grid.row[1].column[0].value}
                        </Text></View>
                    </TouchableHighlight>
                    <TouchableHighlight onPress={this.onPress.bind(this, 2, 2)}>
                        <View style={styles.box}><Text style={styles.gridText}>
                            {this.state.grid.row[1].column[1].value}
                        </Text></View>
                    </TouchableHighlight>
                    <TouchableHighlight onPress={this.onPress.bind(this, 2, 3)}>
                        <View style={styles.box}><Text style={styles.gridText}>
                            {this.state.grid.row[1].column[2].value}
                        </Text></View>
                    </TouchableHighlight>
                    <TouchableHighlight onPress={this.onPress.bind(this, 3, 1)}>
                        <View style={styles.box}><Text style={styles.gridText}>
                            {this.state.grid.row[2].column[0].value}
                        </Text></View>
                    </TouchableHighlight>
                    <TouchableHighlight onPress={this.onPress.bind(this, 3, 2)}>
                        <View style={styles.box}><Text style={styles.gridText}>
                            {this.state.grid.row[2].column[1].value}
                        </Text></View>
                    </TouchableHighlight>
                    <TouchableHighlight onPress={this.onPress.bind(this, 3, 3)}>
                        <View style={styles.box}><Text style={styles.gridText}>
                            {this.state.grid.row[2].column[2].value}
                        </Text></View>
                    </TouchableHighlight>
                </View>

                <View style={styles.footerContainer}>
                    <View style={styles.footer}>
                        <Text style={styles.gameTurnText}>
                            {this.state.currentTurn}
                        </Text>
                    </View>
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.gameButton}
                            onPress={this.onGameButtonPressed}>
                            <Text
                                style={styles.gameButtonText}>
                                {this.state.gameButton}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.footer}>
                        <Text></Text>
                    </View>
                </View>
            </View>

        );
    }
};


const styles = StyleSheet.create({

    gameCounterContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#555',
        height: 50,
    },

    gameWinner: {
        marginHorizontal: 6,
        color: 'white'
   },
    
    gameCounterText: {
        marginHorizontal: 6,
        color: 'white'
    },

    gridContainer: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center'
    },

    box: {
        height: (deviceWindowHeight - 100) / 3 - 11,
        width: deviceWindowWidth / 3 - 4,
        backgroundColor: 'green',
        margin: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    gridText: {
        fontWeight: 'bold',
        fontSize: deviceWindowWidth * 0.15,
        color: 'white',
        textAlign: 'center'
    },

    footerContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#555',
        height: 50,
    },

    footer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    gameButton: {
        flex: 1,
        justifyContent: 'center'
    },

    gameTurnText: {
        textAlign: 'center',
        color: 'white'
    },

    gameButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'center'
    }
});
