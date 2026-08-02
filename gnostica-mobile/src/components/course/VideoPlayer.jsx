import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { WebView } from 'react-native-webview';
import { BASE_URL } from '../../config/api';
import { WEB_ORIGIN } from '../../config/environment';

const BUNNY_GUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BUNNY_LIBRARY_ID = process.env.EXPO_PUBLIC_BUNNY_LIBRARY_ID;

const isAbsoluteUrl = (url) => /^https?:\/\//i.test(url);
const isDirectVideoUrl = (url) => /\.(m3u8|mp4|mov|webm)($|\?)/i.test(url || '');

const getBunnyEmbedUrl = (url) => {
  if (!url) return null;

  const value = String(url).trim();
  const buildUrl = (libraryId, videoId) => {
    if (!libraryId || !videoId) return null;
    return `https://player.mediadelivery.net/embed/${libraryId}/${videoId}`;
  };

  const providerUrl = value.match(
    /(?:iframe|player)\.mediadelivery\.net\/(?:embed|play)\/([^/?#]+)\/([0-9a-f-]{36})/i
  ) || value.match(
    /video\.bunny\.net\/(?:embed|play)\/([^/?#]+)\/([0-9a-f-]{36})/i
  );
  if (providerUrl && BUNNY_GUID_REGEX.test(providerUrl[2])) {
    return buildUrl(providerUrl[1], providerUrl[2]);
  }

  const composite = value.match(/^([^/?#]+)\/([0-9a-f-]{36})$/i);
  if (composite && BUNNY_GUID_REGEX.test(composite[2])) {
    return buildUrl(composite[1], composite[2]);
  }

  if (BUNNY_LIBRARY_ID && BUNNY_GUID_REGEX.test(value)) {
    return buildUrl(BUNNY_LIBRARY_ID, value);
  }

  return null;
};

const getYoutubeId = (url) => {
  if (!url) return null;
  const match = String(url).match(/^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return match?.[1]?.length === 11 ? match[1] : null;
};

export const getEmbeddedVideoUrl = (url, { autoplay = false, startAt = 0 } = {}) => {
  if (!url || isDirectVideoUrl(url)) return null;

  const bunnyUrl = getBunnyEmbedUrl(url);
  const youtubeId = getYoutubeId(url);
  let baseUrl = bunnyUrl;

  if (youtubeId) {
    baseUrl = `https://www.youtube.com/embed/${youtubeId}`;
  } else if (!baseUrl && /vimeo\.com/i.test(url)) {
    const vimeoId = String(url).match(/vimeo\.com\/(?:video\/)?(\d+)/i)?.[1];
    baseUrl = vimeoId ? `https://player.vimeo.com/video/${vimeoId}` : url;
  }

  if (!baseUrl) return null;

  const params = new URLSearchParams();
  if (autoplay) params.set('autoplay', '1');
  if (bunnyUrl) {
    params.set('loop', 'false');
    params.set('muted', 'false');
    params.set('preload', 'true');
    params.set('playerjs', '1');
    params.set('content_ended', '1');
  }
  if (startAt > 0) params.set('t', String(Math.floor(startAt)));

  return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${params.toString()}`;
};

const getDirectVideoUrl = (url) => {
  if (!url) return null;
  if (isAbsoluteUrl(url)) return url;
  const host = BASE_URL.replace('/api', '');
  return `${host}${url.startsWith('/') ? '' : '/'}${url}`;
};

const createEmbedHtml = (embedUrl) => `<!doctype html>
<html><head><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#000}iframe{border:0;width:100%;height:100%;display:block}</style>
</head><body><iframe src="${embedUrl.replace(/&/g, '&amp;').replace(/\"/g, '&quot;')}" allow="accelerometer; autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe></body></html>`;

/**
 * Bunny's documented embed player is the primary player for Bunny videos.
 * `fallbackSource` keeps native HLS available for an embed failure without
 * making the mobile UI diverge from the web player during normal playback.
 */
const VideoPlayer = ({ source, fallbackSource, autoplay = true, startAt = 0, requestHeaders, style, onError }) => {
  const [embedError, setEmbedError] = useState(false);
  const embedUrl = useMemo(
    () => getEmbeddedVideoUrl(source, { autoplay, startAt }),
    [source, autoplay, startAt]
  );
  const directUrl = useMemo(
    () => (!embedUrl ? getDirectVideoUrl(source) : (embedError ? getDirectVideoUrl(fallbackSource) : null)),
    [source, embedUrl, embedError, fallbackSource]
  );
  const nativeSource = useMemo(() => {
    if (!directUrl) return null;
    return {
      uri: directUrl,
      ...(requestHeaders && { headers: requestHeaders }),
      ...(/\.m3u8($|\?)/i.test(directUrl) && { contentType: 'hls' }),
    };
  }, [directUrl, requestHeaders]);
  const player = useVideoPlayer(nativeSource, (videoPlayer) => {
    videoPlayer.loop = false;
    if (autoplay) videoPlayer.play();
  });

  useEffect(() => {
    setEmbedError(false);
  }, [embedUrl]);

  useEffect(() => {
    if (!directUrl) return;
    player.replaceAsync(nativeSource)
      .then(() => autoplay && player.play())
      .catch((error) => {
        console.warn('Unable to load direct video:', error);
        onError?.(error);
      });
  }, [directUrl, nativeSource, player, autoplay, onError]);

  if (embedUrl && !embedError) {
    return (
      <WebView
        // Bunny documents its player as an iframe. Loading it in this small
        // document preserves that browser context on Android WebView.
        // Bunny's CDN allow-list validates the embedding page's origin. This is
        // the web origin for the current environment (LAN in dev, public in prod).
        source={{ html: createEmbedHtml(embedUrl), baseUrl: WEB_ORIGIN }}
        style={[styles.webView, style]}
        javaScriptEnabled
        domStorageEnabled
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        allowsProtectedMedia
        mediaPlaybackRequiresUserAction={!autoplay}
        androidLayerType="hardware"
        thirdPartyCookiesEnabled
        setSupportMultipleWindows={false}
        startInLoadingState
        renderLoading={() => (
          <View className="absolute inset-0 items-center justify-center bg-black">
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        )}
        onError={(event) => {
          setEmbedError(true);
          onError?.(new Error(event.nativeEvent.description || 'Không thể tải trình phát video'));
        }}
      />
    );
  }

  if (directUrl) {
    return (
      <VideoView
        style={[styles.nativeVideo, style]}
        player={player}
        nativeControls
        surfaceType="textureView"
        contentFit="contain"
        fullscreenOptions={{ enable: true }}
        allowsPictureInPicture
        showsTimecodes
      />
    );
  }

  return null;
};

const styles = StyleSheet.create({
  // Force a hardware-backed surface on Android. Without this, some WebView video
  // streams can continue playing audio while their video surface stays black.
  webView: {
    alignSelf: 'stretch',
    backgroundColor: '#000',
    flex: 1,
  },
  nativeVideo: {
    alignSelf: 'stretch',
    backgroundColor: '#000',
    flex: 1,
  },
});

export default VideoPlayer;
