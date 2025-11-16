/**
 * Test simple sans dépendances natives
 */

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
} from 'react-native';

function App() {
  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      <Text style={styles.text}>🎬 Kiosk Harry Potter</Text>
      <Text style={styles.subtext}>Test connexion OK</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtext: {
    color: '#aaa',
    fontSize: 18,
  },
});

export default App;
