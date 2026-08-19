import * as Location from 'expo-location';

import {
    updateMechanicLocation,
} from '../services/mechanicApi';

// =========================================================
// REQUEST LOCATION PERMISSION
// =========================================================

export async function requestMechanicLocationPermission() {
  console.log(
    '[Mechanic Location] Requesting location permission...'
  );

  const {
    status,
  } =
    await Location.requestForegroundPermissionsAsync();

  console.log(
    '[Mechanic Location] Permission:',
    status
  );

  if (status !== 'granted') {
    throw new Error(
      'Location permission is required to go online and receive service requests.'
    );
  }

  return true;
}

// =========================================================
// GET CURRENT LOCATION
// =========================================================

export async function getCurrentMechanicLocation() {
  const permissionGranted =
    await requestMechanicLocationPermission();

  if (!permissionGranted) {
    throw new Error(
      'Location permission was not granted.'
    );
  }

  console.log(
    '[Mechanic Location] Getting current GPS location...'
  );

  const location =
    await Location.getCurrentPositionAsync({
      accuracy:
        Location.Accuracy.High,
    });

  const latitude =
    location?.coords?.latitude;

  const longitude =
    location?.coords?.longitude;

  if (
    latitude === undefined ||
    latitude === null ||
    longitude === undefined ||
    longitude === null
  ) {
    throw new Error(
      'Unable to determine your current location.'
    );
  }

  console.log(
    '[Mechanic Location] Current GPS:',
    {
      latitude,
      longitude,
    }
  );

  return {
    latitude,
    longitude,
  };
}

// =========================================================
// GET LOCATION AND UPDATE BACKEND
// =========================================================

export async function syncCurrentMechanicLocation() {
  const location =
    await getCurrentMechanicLocation();

  await updateMechanicLocation(
    location.latitude,
    location.longitude
  );

  return location;
}