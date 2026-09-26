import React, { useMemo, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import Constants from 'expo-constants';

/**
 * True when running inside genuine Expo Go (which uses Expo's own native
 * Google Maps key — expired as of SDK 55+, so native tiles render black).
 * In dev builds (`null` / 'standalone') the native MapView works with our
 * own manifest key from app.config.js.
 */
export const IN_EXPO_GO = Constants.appOwnership === 'expo';

export type GoMapType = 'standard' | 'hybrid' | 'terrain';

export interface GoMapMarker {
  latitude: number;
  longitude: number;
  color?: string;
  title?: string;
}

export interface GoMapCenter {
  latitude: number;
  longitude: number;
}

interface GoMapViewProps {
  style?: StyleProp<ViewStyle>;
  /** Map center. Changes are pushed live without reloading the page. */
  center: GoMapCenter;
  /** Native-style latitude delta, converted to a JS-API zoom level. */
  latitudeDelta?: number;
  /** Explicit zoom (wins over latitudeDelta). */
  zoom?: number;
  mapType?: GoMapType;
  /** False = static map (no pan/zoom). Default true. */
  interactive?: boolean;
  markers?: GoMapMarker[];
  polyline?: GoMapCenter[];
  /** Fit the camera to markers+polyline once after load. */
  autoFit?: boolean;
  onRegionChangeComplete?: (center: GoMapCenter & { zoom: number }) => void;
  onReady?: () => void;
  onError?: (message: string) => void;
}

const MAP_TYPE_TO_JS: Record<GoMapType, string> = {
  standard: 'roadmap',
  hybrid: 'hybrid',
  terrain: 'terrain',
};

function deltaToZoom(delta: number): number {
  const d = Number.isFinite(delta) && delta > 0 ? delta : 0.005;
  return Math.max(2, Math.min(20, Math.round(Math.log2(360 / d))));
}

function buildHtml(apiKey: string, init: {
  lat: number;
  lng: number;
  zoom: number;
  mapType: string;
  interactive: boolean;
  reportIdle: boolean;
}): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta name='viewport' content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' />
<style>html,body,#map{height:100%;margin:0;padding:0;}body{background:#F9FAFB;}</style>
<script src='https://maps.googleapis.com/maps/api/js?key=${apiKey}'></script>
</head>
<body>
<div id='map'></div>
<script>
(function(){
  var post = function(msg){
    try { window.ReactNativeWebView.postMessage(JSON.stringify(msg)); } catch (e) {}
  };
  var map = null;
  var markers = [];
  var line = null;
  var ready = false;
  var pending = [];

  function pinIcon(color){
    var svg = "<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'>" +
      "<circle cx='20' cy='20' r='13' fill='" + color + "' stroke='white' stroke-width='4'/></svg>";
    return { url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg), scaledSize: new google.maps.Size(40, 40), anchor: new google.maps.Point(20, 20) };
  }

  function setMarkers(list){
    for (var i = 0; i < markers.length; i++) markers[i].setMap(null);
    markers = [];
    (list || []).forEach(function(m){
      markers.push(new google.maps.Marker({
        position: { lat: m.latitude, lng: m.longitude },
        map: map,
        title: m.title || '',
        icon: pinIcon(m.color || '#f3a823'),
      }));
    });
  }

  function setRoute(path){
    if (line) { line.setMap(null); line = null; }
    if (path && path.length >= 2) {
      line = new google.maps.Polyline({
        path: path.map(function(p){ return { lat: p.latitude, lng: p.longitude }; }),
        geodesic: true, strokeColor: '#f97316', strokeOpacity: 1, strokeWeight: 3, map: map,
      });
    }
  }

  function fitAll(){
    var b = new google.maps.LatLngBounds();
    var n = 0;
    markers.forEach(function(m){ b.extend(m.getPosition()); n++; });
    if (line) { line.getPath().forEach(function(p){ b.extend(p); n++; }); }
    if (n > 1) map.fitBounds(b, 48);
    else if (n === 1) map.setCenter(b.getCenter());
  }

  window.__goMapCmd = function(json){
    var run = function(){
      var m;
      try { m = JSON.parse(json); } catch (e) { return; }
      if (m.cmd === 'setCenter') map.setCenter({ lat: m.latitude, lng: m.longitude });
      else if (m.cmd === 'setZoom') map.setZoom(m.zoom);
      else if (m.cmd === 'setMapType') map.setMapTypeId(m.mapType);
      else if (m.cmd === 'setMarkers') { setMarkers(m.markers); if (m.autoFit) fitAll(); }
      else if (m.cmd === 'setRoute') { setRoute(m.path); if (m.autoFit) fitAll(); }
    };
    if (ready) run(); else pending.push(run);
  };

  window.gm_authFailure = function(){
    post({ type: 'mapError', message: 'Google Maps rejected the API key (gm_authFailure).' });
  };

  try {
    map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: ${init.lat}, lng: ${init.lng} },
      zoom: ${init.zoom},
      mapTypeId: '${init.mapType}',
      gestureHandling: ${init.interactive ? "'greedy'" : "'none'"},
      disableDefaultUI: ${init.interactive ? 'false' : 'true'},
      zoomControl: ${init.interactive ? 'true' : 'false'},
      clickableIcons: false,
    });
    ${init.reportIdle ? `map.addListener('idle', function(){
      var c = map.getCenter();
      post({ type: 'idle', latitude: c.lat(), longitude: c.lng(), zoom: map.getZoom() });
    });` : ''}
    ready = true;
    for (var i = 0; i < pending.length; i++) pending[i]();
    pending = [];
    post({ type: 'ready' });
  } catch (e) {
    post({ type: 'mapError', message: 'Map init failed: ' + (e && e.message ? e.message : e) });
  }
})();
</script>
</body>
</html>`;
}

function cmd(js: string): string {
  return `(function(){try{window.__goMapCmd(${JSON.stringify(js)});}catch(e){}})();true;`;
}

/**
 * Google map rendered in a WebView (Maps JavaScript API). Used automatically
 * inside Expo Go, where native map tiles cannot load. In dev builds the
 * native MapView is used instead — callers branch on IN_EXPO_GO.
 */
export function GoMapView({
  style,
  center,
  latitudeDelta,
  zoom,
  mapType = 'standard',
  interactive = true,
  markers = [],
  polyline = [],
  autoFit = false,
  onRegionChangeComplete,
  onReady,
  onError,
}: GoMapViewProps): React.JSX.Element {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  const webRef = useRef<WebView>(null);
  const fittedOnce = useRef(false);
  const lastSent = useRef<string>('');

  const initialZoom = zoom ?? deltaToZoom(latitudeDelta ?? 0.005);

  const html = useMemo(() => {
    if (!apiKey) return null;
    return buildHtml(apiKey, {
      lat: center.latitude,
      lng: center.longitude,
      zoom: initialZoom,
      mapType: MAP_TYPE_TO_JS[mapType] ?? 'roadmap',
      interactive,
      reportIdle: !!onRegionChangeComplete,
    });
    // Mount-only: live updates go through commands, never a reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  const send = useCallback((payload: object) => {
    webRef.current?.injectJavaScript(cmd(JSON.stringify(payload)));
  }, []);

  // Live updates (no reloads)
  useEffect(() => {
    const key = `${center.latitude.toFixed(6)},${center.longitude.toFixed(6)}`;
    if (key !== lastSent.current) {
      lastSent.current = key;
      send({ cmd: 'setCenter', latitude: center.latitude, longitude: center.longitude });
    }
  }, [center.latitude, center.longitude, send]);

  useEffect(() => {
    send({ cmd: 'setMapType', mapType: MAP_TYPE_TO_JS[mapType] ?? 'roadmap' });
  }, [mapType, send]);

  useEffect(() => {
    const doFit = autoFit && !fittedOnce.current;
    if (doFit) fittedOnce.current = true;
    send({ cmd: 'setMarkers', markers, autoFit: doFit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(markers), send]);

  useEffect(() => {
    const doFit = autoFit && !fittedOnce.current;
    if (doFit) fittedOnce.current = true;
    send({ cmd: 'setRoute', path: polyline, autoFit: doFit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(polyline), send]);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'ready') {
        onReady?.();
      } else if (msg.type === 'idle') {
        // Record what the map reported so a parent echo of the same coords
        // doesn't bounce back as a setCenter (camera feedback loop).
        lastSent.current = `${Number(msg.latitude).toFixed(6)},${Number(msg.longitude).toFixed(6)}`;
        onRegionChangeComplete?.({ latitude: msg.latitude, longitude: msg.longitude, zoom: msg.zoom });
      } else if (msg.type === 'mapError') {
        onError?.(String(msg.message || 'Map error'));
      }
    } catch {
      // Ignore malformed bridge messages.
    }
  }, [onReady, onRegionChangeComplete, onError]);

  if (!apiKey || !html) {
    return (
      <View style={[styles.fallback, style]}>
        <Text style={styles.fallbackText}>Map unavailable (missing API key).</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webRef}
        style={styles.web}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        source={{ html, baseUrl: 'https://maps.tap2go.com/' }}
        onMessage={handleMessage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  web: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  fallback: {
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: '#6B7280',
    fontSize: 13,
  },
});
