"use client";

import { useMemo } from "react";
import { GoogleMap, Marker, Circle, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = { width: "100%", height: "100%", borderRadius: "16px" };

export default function MapView({ center, radiusKm, properties }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || "",
    id: "xid-google-map-script",
  });

  const mapCenter = useMemo(() => ({ lat: center.lat, lng: center.lng }), [center]);

  if (!apiKey) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl bg-teal-50 p-6 text-center">
        <p className="text-sm font-medium text-teal-800">Map view needs a Google Maps API key</p>
        <p className="max-w-xs text-xs text-teal-700/70">
          Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local, then restart the dev server.
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl bg-coral-50 text-sm text-coral-600">
        Couldn't load Google Maps. Check your API key and enabled APIs.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl bg-teal-50 text-sm text-ink/50">
        Loading map...
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={mapCenter}
      zoom={13}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
        ],
      }}
    >
      <Marker position={mapCenter} />
      <Circle
        center={mapCenter}
        radius={radiusKm * 1000}
        options={{
          fillColor: "#0F6E56",
          fillOpacity: 0.08,
          strokeColor: "#0F6E56",
          strokeOpacity: 0.4,
          strokeWeight: 1.5,
        }}
      />

      {properties
        .filter((p) => p.location?.coordinates?.length === 2)
        .map((p) => (
          <Marker
            key={p._id}
            position={{ lat: p.location.coordinates[1], lng: p.location.coordinates[0] }}
            title={`${p.title} — Rs${Number(p.rentPerMonth).toLocaleString("en-IN")}/mo`}
            icon={{
              path: "M12 0C7.6 0 4 3.6 4 8c0 5.4 8 16 8 16s8-10.6 8-16c0-4.4-3.6-8-8-8z",
              fillColor: p.category === "pg" ? "#D85A30" : "#0F6E56",
              fillOpacity: 1,
              strokeWeight: 0,
              scale: 1.1,
              anchor: typeof window !== "undefined" && window.google ? new window.google.maps.Point(12, 24) : undefined,
            }}
          />
        ))}
    </GoogleMap>
  );
}