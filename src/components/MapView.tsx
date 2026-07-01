"use client";

import { useEffect, useState } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";
import type { Store } from "@/types/store";
import StoreBalloon from "./StoreBalloon";

const DEFAULT_CENTER = { lat: 35.3, lng: 137.5 };
const DEFAULT_ZOOM = 6;
const GEOLOCATION_ZOOM = 12;
const GEOLOCATION_TIMEOUT_MS = 5000;
const SELECTED_STORE_PAN_ZOOM = 14;

function SelectedStorePanner({
  position,
}: {
  position: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || !position) return;
    map.panTo(position);
    if ((map.getZoom() ?? 0) < SELECTED_STORE_PAN_ZOOM) {
      map.setZoom(SELECTED_STORE_PAN_ZOOM);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, position?.lat, position?.lng]);

  return null;
}

function PrefectureFocuser({
  prefecture,
  stores,
}: {
  prefecture: string;
  stores: Store[];
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || !prefecture || stores.length === 0) return;

    if (stores.length === 1) {
      map.panTo({ lat: stores[0].lat, lng: stores[0].lng });
      if ((map.getZoom() ?? 0) < SELECTED_STORE_PAN_ZOOM) {
        map.setZoom(SELECTED_STORE_PAN_ZOOM);
      }
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    stores.forEach((store) => bounds.extend({ lat: store.lat, lng: store.lng }));
    map.panTo(bounds.getCenter());
    map.fitBounds(bounds, 64);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, prefecture]);

  return null;
}

interface MapViewProps {
  stores: Store[];
  selectedStoreId: string | null;
  prefecture: string;
  onSelectStore: (id: string | null) => void;
  onOpenDetail: (store: Store) => void;
}

export default function MapView({
  stores,
  selectedStoreId,
  prefecture,
  onSelectStore,
  onOpenDetail,
}: MapViewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const selectedStore = stores.find((s) => s.id === selectedStoreId) ?? null;

  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let settled = false;
    const finish = (nextCenter?: { lat: number; lng: number }, nextZoom?: number) => {
      if (settled) return;
      settled = true;
      if (nextCenter) setCenter(nextCenter);
      if (nextZoom) setZoom(nextZoom);
      setReady(true);
    };

    if (!navigator.geolocation) {
      const timer = setTimeout(() => finish(), 0);
      return () => clearTimeout(timer);
    }

    const fallbackTimer = setTimeout(() => finish(), GEOLOCATION_TIMEOUT_MS);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(fallbackTimer);
        finish(
          { lat: position.coords.latitude, lng: position.coords.longitude },
          GEOLOCATION_ZOOM
        );
      },
      () => {
        clearTimeout(fallbackTimer);
        finish();
      },
      { timeout: GEOLOCATION_TIMEOUT_MS }
    );

    return () => clearTimeout(fallbackTimer);
  }, []);

  if (!apiKey) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-amber-50 p-6 text-center text-base text-amber-800">
        <p className="font-semibold">Google Maps APIキーが未設定です</p>
        <p>
          プロジェクト直下の .env.local に
          <br />
          NEXT_PUBLIC_GOOGLE_MAPS_API_KEY を設定してください。
        </p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500">
        地図を準備中...
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        mapId="DEMO_MAP_ID"
        defaultCenter={center}
        defaultZoom={zoom}
        gestureHandling="greedy"
        disableDefaultUI={false}
        className="h-full w-full"
        onClick={() => onSelectStore(null)}
      >
        <SelectedStorePanner
          position={selectedStore ? { lat: selectedStore.lat, lng: selectedStore.lng } : null}
        />
        <PrefectureFocuser prefecture={prefecture} stores={stores} />

        {stores.map((store) => (
          <AdvancedMarker
            key={store.id}
            position={{ lat: store.lat, lng: store.lng }}
            onClick={() => onSelectStore(store.id)}
          >
            <Pin
              background={store.region.color}
              borderColor={store.region.colorBorder}
              glyphColor="#ffffff"
              scale={store.id === selectedStoreId ? 1.9 : 1.5}
            />
          </AdvancedMarker>
        ))}

        {selectedStore && (
          <InfoWindow
            position={{ lat: selectedStore.lat, lng: selectedStore.lng }}
            onCloseClick={() => onSelectStore(null)}
            maxWidth={300}
          >
            <StoreBalloon store={selectedStore} onOpenDetail={onOpenDetail} />
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
}
