import Ionicons from '@expo/vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import {
  setAudioModeAsync,
  useAudioPlaylist,
  useAudioPlaylistStatus,
} from 'expo-audio';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import songs from '../model/data';
import colors from '../theme/colors';
import formatTime from '../utils/formatTime';

const audioSources = songs.map((song) => song.url);

export default function MusicPlayer() {
  const { width } = useWindowDimensions();
  const listRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);

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
  const artworkSize = Math.min(width - 40, 380);
  const currentTime = Number.isFinite(status.currentTime) ? status.currentTime : 0;

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'doNotMix',
    });
  }, []);

  useEffect(() => {
    if (
      Number.isInteger(status.currentIndex) &&
      status.currentIndex >= 0 &&
      status.currentIndex < songs.length
    ) {
      setSelectedIndex(status.currentIndex);
    }
  }, [status.currentIndex]);

  useEffect(() => {
    listRef.current?.scrollToIndex({
      index: selectedIndex,
      animated: true,
    });
  }, [selectedIndex, width]);

  const selectSong = useCallback(
    (index) => {
      if (index < 0 || index >= songs.length || index === selectedIndex) {
        return;
      }

      const shouldResume = status.playing;
      setSelectedIndex(index);
      playlist.skipTo(index);

      if (shouldResume) {
        playlist.play();
      }
    },
    [playlist, selectedIndex, status.playing],
  );

  const handleMomentumEnd = useCallback(
    (event) => {
      const offset = event.nativeEvent.contentOffset.x;
      const index = Math.round(offset / width);
      selectSong(index);
    },
    [selectSong, width],
  );

  const handlePlayPause = useCallback(() => {
    if (status.playing) {
      playlist.pause();
    } else {
      playlist.play();
    }
  }, [playlist, status.playing]);

  const handleNext = useCallback(() => {
    const nextIndex = (selectedIndex + 1) % songs.length;
    selectSong(nextIndex);
  }, [selectSong, selectedIndex]);

  const handlePrevious = useCallback(async () => {
    if (currentTime > 3) {
      await playlist.seekTo(0);
      return;
    }

    const previousIndex =
      (selectedIndex - 1 + songs.length) % songs.length;
    selectSong(previousIndex);
  }, [currentTime, playlist, selectSong, selectedIndex]);

  const renderArtwork = useCallback(
    ({ item }) => (
      <View style={[styles.artworkPage, { width }]}>
        <Image
          source={item.artwork}
          style={[
            styles.artwork,
            { width: artworkSize, height: artworkSize },
          ]}
        />
      </View>
    ),
    [artworkSize, width],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>TOCANDO AGORA</Text>
        <Text style={styles.counter}>
          {selectedIndex + 1} de {songs.length}
        </Text>
      </View>

      <FlatList
        ref={listRef}
        data={songs}
        horizontal
        pagingEnabled
        renderItem={renderArtwork}
        keyExtractor={(item) => String(item.id)}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumEnd}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      <View style={styles.metadata}>
        <Text style={styles.songTitle}>{currentSong.title}</Text>
        <Text style={styles.songArtist}>{currentSong.artist}</Text>
      </View>

      <View style={styles.controls}>
        <Pressable onPress={handlePrevious} style={styles.sideButton}>
          <Ionicons name="play-skip-back" size={28} color={colors.text} />
        </Pressable>

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

        <Pressable onPress={handleNext} style={styles.sideButton}>
          <Ionicons name="play-skip-forward" size={28} color={colors.text} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingBottom: 28,
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
    letterSpacing: 1.5,
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
    minHeight: 90,
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
  controls: {
    width: 250,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  playButton: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
});