import React, { useState } from 'react'
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';

import songs from '../model/data';
import colors from '../theme/colors';

export default function MusicPlayer() {
  const { width } = useWindowDimensions();
  const [selectedIndex, setSelectedIndex] = useState();
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>TOCANDO AGORA</Text>
        <Text style={styles.title}>GMusic</Text>
        <Text style={styles.description}>
          Nosso player começa aqui.
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  title: {
    marginTop: 8,
    color: colors.text,
    fontSize: 32,
    fontWeight: '800'
  },
  description: {
    marginTop: 10,
    color: colors.textSecondary,
    fontSize: 15
  },
})