/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {
  Platform, 
  StyleSheet,
  ScrollView} from 'react-native';

import TicTacToeGame from './src/components/TicTacToeGame'

type Props = {};
export default class App extends Component<Props> {
  render() {
    return (
      <ScrollView style={styles.mainViewContainer}>
        <TicTacToeGame />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  mainViewContainer: {
    ...Platform.select({
        ios: {
          marginTop: 20
        }
    })
  }
});
