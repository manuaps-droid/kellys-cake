"use client";

import { useRef, useEffect, useState, useCallback } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

import { useCheckout } from "../../hooks/useCheckout";
import { getDistanceAndFee } from "../../utils/distance";

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const DISTRITOS_AREQUIPA = [
  "Alto Selva Alegre",
  "Arequipa",
  "Cayma",
  "Cerro Colorado",
  "Characato",
  "Chiguata",
  "Jacoboo Hunter",
  "José Luis Bustamante y Rivero",
  "La Joya",
  "Mariano Melgar",
  "Miraflores",
  "Mollebaya",
  "Paucarpata",
  "Pocsi",
  "Polobaya",
  "Quequeña",
  "Sabandía",
  "Sachaca",
  "San Juan de Siguas",
  "San Juan de Tarucani",
  "Santa Isabel de Siguas",
  "Santa Rita de Siguas",
  "Socabaya",
  "Tiabaya",
  "Uchumayo",
  "Vítor",
  "Yanahuara",
  "Yarabamba",
  "Yura",
];

function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof google !== "undefined" && google.maps) {
      resolve();
      return;
    }

    if (!GOOGLE_MAPS_KEY) {
      reject(new Error("No API key"));
      return;
    }

    const existingScript = document.getElementById("google-maps-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places,marker&language=es`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
}

function MapContainer({ onMapReady }: { onMapReady: (container: HTMLDivElement) => void }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current && !containerRef.current.hasChildNodes()) {
      onMapReady(containerRef.current);
    }
  }, [onMapReady]);

  return (
    <div className="h-[280px] w-full bg-cake-sand" ref={containerRef} />
  );
}

export default function AddressForm() {
  const { checkout, updateAddress, setDeliveryInfo } = useCheckout();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const mapWrapperRef = useRef<HTMLDivElement>(null);

  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!checkout.address.department || !checkout.address.province) {
      updateAddress({ department: "Arequipa", province: "Arequipa" });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateDeliveryInfo = useCallback(
    (lat: number, lng: number) => {
      const { distance, fee } = getDistanceAndFee(lat, lng);
      setDeliveryInfo(distance, fee);
    },
    [setDeliveryInfo]
  );

  const parsePlace = useCallback(
    (place: google.maps.places.PlaceResult) => {
      const components = place.address_components || [];
      let district = "";

      for (const comp of components) {
        const types = comp.types;
        if (types.includes("locality") || types.includes("sublocality_level_1")) {
          district = comp.long_name;
        }
      }

      const lat = place.geometry?.location?.lat() ?? null;
      const lng = place.geometry?.location?.lng() ?? null;

      updateAddress({
        address: place.formatted_address || place.name || "",
        district,
        department: "Arequipa",
        province: "Arequipa",
        lat,
        lng,
      });

      if (lat && lng) {
        updateDeliveryInfo(lat, lng);

        if (mapRef.current) {
          mapRef.current.panTo({ lat, lng });
          mapRef.current.setZoom(16);

          if (markerRef.current) {
            markerRef.current.setPosition({ lat, lng });
          }
        }
      }
    },
    [updateAddress, updateDeliveryInfo]
  );

  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => setMapsLoaded(true))
      .catch(() => {});
  }, []);

  const handleMapReady = useCallback(
    (container: HTMLDivElement) => {
      if (!mapsLoaded || mapRef.current) return;

      const bakeryLat = Number(process.env.NEXT_PUBLIC_BAKERY_LAT) || -16.4230021665101;
      const bakeryLng = Number(process.env.NEXT_PUBLIC_BAKERY_LNG) || -71.51603377642644;

      const initialCenter =
        checkout.address.lat && checkout.address.lng
          ? { lat: checkout.address.lat, lng: checkout.address.lng }
          : { lat: bakeryLat, lng: bakeryLng };

      const map = new google.maps.Map(container, {
        center: initialCenter,
        zoom: checkout.address.lat ? 16 : 13,
        disableDefaultUI: true,
        zoomControl: true,
      });
      mapRef.current = map;

      const marker = new google.maps.Marker({
        map,
        position: initialCenter,
        draggable: true,
        title: "Ubicación de entrega",
      });
      markerRef.current = marker;

      marker.addListener("dragend", () => {
        const pos = marker.getPosition();
        if (!pos) return;

        const lat = pos.lat();
        const lng = pos.lng();

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results?.[0]) {
            parsePlace(results[0]);
          } else {
            updateAddress({ lat, lng, department: "Arequipa", province: "Arequipa" });
            updateDeliveryInfo(lat, lng);
          }
        });
      });

      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;

        const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        marker.setPosition(pos);

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: pos }, (results, status) => {
          if (status === "OK" && results?.[0]) {
            parsePlace(results[0]);

            if (searchInputRef.current) {
              searchInputRef.current.value = results[0].formatted_address || "";
            }
          }
        });
      });

      if (searchInputRef.current) {
        const autocomplete = new google.maps.places.Autocomplete(
          searchInputRef.current,
          {
            componentRestrictions: { country: "pe" },
            fields: ["address_components", "formatted_address", "geometry", "name"],
            types: ["address"],
          }
        );

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (place.geometry) {
            parsePlace(place);
          }
        });

        searchInputRef.current.addEventListener("keydown", (e: KeyboardEvent) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        });
      }

      setMapReady(true);
    },
    [mapsLoaded, checkout.address.lat, checkout.address.lng, parsePlace, updateAddress, updateDeliveryInfo]
  );

  const showDeliveryInfo =
    checkout.address.deliveryDistance !== null &&
    checkout.address.deliveryFee !== null;

  return (
    <Card className="p-6">
      <div className="mb-6 space-y-1">
        <h2 className="text-2xl font-bold text-cake-espresso">
          Dirección de entrega
        </h2>

        <p className="text-sm text-cake-chocolate/60">
          Busca tu dirección en el mapa o escríbela manualmente.
        </p>
      </div>

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Departamento</Label>

            <Input
              value="Arequipa"
              readOnly
              className="bg-gray-50 text-gray-600"
            />
          </div>

          <div className="space-y-2">
            <Label>Provincia</Label>

            <Input
              value="Arequipa"
              readOnly
              className="bg-gray-50 text-gray-600"
            />
          </div>

          <div className="space-y-2">
            <Label>Distrito</Label>

            <Select
              value={checkout.address.district}
              onValueChange={(value) =>
                updateAddress({ district: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona tu distrito" />
              </SelectTrigger>

              <SelectContent>
                {DISTRITOS_AREQUIPA.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {mapsLoaded && (
          <>
            <div className="space-y-2">
              <Label>Buscar dirección</Label>

              <input
                ref={searchInputRef}
                type="text"
                placeholder="Escribe tu dirección y selecciona del listado..."
                defaultValue={checkout.address.address}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-cake-gold focus:ring-2 focus:ring-cake-gold/20"
              />
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
              <MapContainer onMapReady={handleMapReady} />
            </div>

            {showDeliveryInfo && (
              <div className="rounded-xl border border-kc-rose-gold/30 bg-kc-rose-gold/5 p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-kc-charcoal">
                      Distancia del local
                    </p>
                    <p className="text-2xl font-bold text-kc-charcoal">
                      {checkout.address.deliveryDistance} km
                    </p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-sm font-medium text-kc-charcoal">
                      Costo de delivery
                    </p>
                    <p className="text-2xl font-bold text-kc-rose-gold">
                      S/ {checkout.address.deliveryFee?.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {checkout.address.lat && checkout.address.lng && (
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                <span>Ubicación seleccionada correctamente</span>
              </div>
            )}
          </>
        )}

        {!mapsLoaded && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
            <p className="font-medium">Cargando mapa...</p>
          </div>
        )}

        <div className="space-y-2">
          <Label>Dirección completa</Label>

          <Input
            value={checkout.address.address}
            onChange={(e) =>
              updateAddress({ address: e.target.value })
            }
            placeholder="Av. Ejemplo 123, Dpto 4B"
          />
        </div>

        <div className="space-y-2">
          <Label>Referencia</Label>

          <Input
            value={checkout.address.reference}
            onChange={(e) =>
              updateAddress({ reference: e.target.value })
            }
            placeholder="Cerca al parque, portón verde..."
          />
        </div>
      </div>
    </Card>
  );
}
