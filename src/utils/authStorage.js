import { Platform } from 'react-native';

const TOKEN_KEY =
  'roadassist_mechanic_access_token';

const USER_KEY =
  'roadassist_mechanic_user';

let SecureStore = null;

if (Platform.OS !== 'web') {
  SecureStore =
    require('expo-secure-store');
}


// =========================================================
// SET STORAGE
// =========================================================

async function setStorage(
  key,
  value
) {
  if (Platform.OS === 'web') {

    if (
      typeof window !== 'undefined'
    ) {
      window.localStorage.setItem(
        key,
        value
      );
    }

    return;
  }

  await SecureStore.setItemAsync(
    key,
    value
  );
}


// =========================================================
// GET STORAGE
// =========================================================

async function getStorage(
  key
) {
  if (Platform.OS === 'web') {

    if (
      typeof window !== 'undefined'
    ) {
      return window.localStorage.getItem(
        key
      );
    }

    return null;
  }

  return SecureStore.getItemAsync(
    key
  );
}


// =========================================================
// REMOVE STORAGE
// =========================================================

async function removeStorage(
  key
) {
  if (Platform.OS === 'web') {

    if (
      typeof window !== 'undefined'
    ) {
      window.localStorage.removeItem(
        key
      );
    }

    return;
  }

  await SecureStore.deleteItemAsync(
    key
  );
}


// =========================================================
// SAVE AUTH SESSION
// =========================================================

export async function saveAuthSession(
  token,
  user
) {
  await setStorage(
    TOKEN_KEY,
    token
  );

  await setStorage(
    USER_KEY,
    JSON.stringify(user)
  );
}


// =========================================================
// GET TOKEN
// =========================================================

export async function getToken() {
  return getStorage(
    TOKEN_KEY
  );
}


// =========================================================
// GET USER
// =========================================================

export async function getUser() {

  const value =
    await getStorage(
      USER_KEY
    );

  if (!value) {
    return null;
  }

  try {

    return JSON.parse(
      value
    );

  } catch (error) {

    console.error(
      '[Mechanic Auth] Unable to parse user:',
      error
    );

    return null;
  }
}


// =========================================================
// CLEAR SESSION
// =========================================================

export async function clearAuthSession() {

  await removeStorage(
    TOKEN_KEY
  );

  await removeStorage(
    USER_KEY
  );
}