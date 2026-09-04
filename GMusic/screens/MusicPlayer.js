import React, { useEffect, useMemo, useState } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons'
import {
  setAudioModeAsync,
  useAudioPlaylist,
  useAudioPlayerStatus,
  useAudioPlaylistStatus,
} from 'expo-audio';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';

import songs from '../model/data';
import colors from '../theme/colors';

const audioSources = songs.map((song) => song.url);

export default function MusicPlayer() {
  const { width } = useWindowDimensions();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const playlistOptions = useMemo(
    () => ({
      sources: audioSources,
      loop: 'none',
      updateInterval: 250,
    }),
    [],
  );

  const playlist = useAudioPlaylist(playlistOptions);
  const status = useAudioPlaylistStatus(playlist);

  const currentSong = songs[selectedIndex];
  const artworkSize = Math.min(width-40, 380);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'doNotMix',
    });
  }, []);

  useEffect(() => {
    if (Number.isInteger(status.currentIndex)) {
      setSelectedIndex(status.currentIndex);
    }
  }, [status.currentIndex]);

  function selectSong(index) {
    if (index < 0 || index >= songs.length || index === selectedIndex) {
      return;
    }
    const shouldResume = status.playing;
    setSelectedIndex(index);
    playlist.skipTo(index);
    if (shouldResume) {
      playlist.play();
    }
  }

  function handleMomentEnd(event) {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / width);
    selectSong(index);
  }

  function handlePlayPause() {
    if (status.playing) {
      playlist.pause();
    } else {
      playlist.play();
    }
  }

  function renderArtwork({ item }) {
    return (
      <View style={[styles.artworkPage, { width }]}>
        <Image
          source={ item.artwork }
          style={[
              styles.artworkSize,
              { height: artworkSize, width: artworkSize }
            ]}
        />
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      {/*<View style={styles.header}>
        <Text style={styles.eyebrow}>TOCANDO AGORA</Text>
        <Text style={styles.counter}>
          {selectedIndex + 1} de {songs.length}
        </Text>
      </View>*/}

      <FlatList
        data={songs}
        horizontal
        pagingEnabled
        renderItem={renderArtwork}
        keyExtractor={(item) => String(item.id)}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentEnd}
      />

      <View style={styles.metadata}>
        <Text style={styles.songTitle}>{currentSong.title}</Text>
        <Text style={styles.songArtist}>{currentSong.artist}</Text>
      </View>

      <Pressable
        disabled={!status.isLoaded}
        onPress={handlePlayPause}
        style={styles.playButton}
      >
        <Ionicons
          name={status.playing ? 'pause' : 'play'}
          size={38}
          color={colors.background}
        />
      </Pressable>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    paddingBottom: 28,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    height: 70,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  counter: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  artworkPage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  artwork: {
    borderRadius: 24,
  },
  metadata: {
    minHeight: 110,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  songTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  songArtist: {
    marginTop: 6,
    color: colors.textSecondary,
    fontSize: 14,
  },
  playButton: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
})