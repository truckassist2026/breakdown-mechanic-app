// src/services/api.js

import { getToken } from '../utils/authStorage';


// =========================================================
// BACKEND URL
// =========================================================

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  'https://truck-assist-backend.onrender.com';


// =========================================================
// API REQUEST
// =========================================================

export async function apiRequest(
  endpoint,
  options = {}
) {

  const {
    method = 'GET',
    body,
    token: suppliedToken,
    headers: customHeaders = {},
  } = options;


  // =======================================================
  // GET STORED JWT
  // =======================================================

  let token =
    suppliedToken || null;


  if (!token) {

    try {

      token =
        await getToken();

    } catch (error) {

      console.error(
        '[API] Unable to read stored token:',
        error
      );

      token = null;
    }
  }


  // =======================================================
  // HEADERS
  // =======================================================

  const headers = {
    Accept:
      'application/json',

    'Content-Type':
      'application/json',

    ...customHeaders,
  };


  // =======================================================
  // JWT
  // =======================================================

  if (token) {

    headers.Authorization =
      `Bearer ${token}`;

  }


  // =======================================================
  // LOG
  // =======================================================

  console.log(
    '[API] Request:',
    method,
    endpoint
  );

  console.log(
    '[API] JWT:',
    token
      ? 'PRESENT'
      : 'MISSING'
  );


  // =======================================================
  // REQUEST OPTIONS
  // =======================================================

  const requestOptions = {
    method,
    headers,
  };


  if (
    body !== undefined &&
    body !== null
  ) {

    requestOptions.body =
      JSON.stringify(body);

  }


  // =======================================================
  // FETCH
  // =======================================================

  let response;

  try {

    response =
      await fetch(
        `${API_BASE_URL}${endpoint}`,
        requestOptions
      );

  } catch (error) {

    console.error(
      '[API] Network error:',
      error
    );

    throw new Error(
      'Unable to connect to Truck Assist backend.'
    );
  }


  // =======================================================
  // RESPONSE
  // =======================================================

  let data = null;


  try {

    const contentType =
      response.headers.get(
        'content-type'
      );


    if (
      contentType &&
      contentType.includes(
        'application/json'
      )
    ) {

      data =
        await response.json();

    } else {

      const text =
        await response.text();

      data =
        text || null;

    }

  } catch (error) {

    console.warn(
      '[API] Unable to parse response:',
      error
    );

    data = null;
  }


  // =======================================================
  // ERROR
  // =======================================================

  if (!response.ok) {

    console.error(
      '[API] Error:',
      {
        endpoint,
        method,
        status:
          response.status,
        data,
      }
    );


    let message =
      `Request failed with status ${response.status}`;


    if (
      typeof data ===
      'string'
    ) {

      message =
        data ||
        message;

    } else if (
      data?.message
    ) {

      message =
        data.message;

    } else if (
      data?.error
    ) {

      message =
        data.error;

    } else if (
      data?.detail
    ) {

      message =
        data.detail;

    }


    // -----------------------------------------------------
    // AUTHENTICATION
    // -----------------------------------------------------

    if (
      response.status === 401
    ) {

      message =
        'Your mechanic session has expired. Please login again.';

    }


    // -----------------------------------------------------
    // AUTHORIZATION
    // -----------------------------------------------------

    if (
      response.status === 403
    ) {

      message =
        data?.message ||
        data?.error ||
        'You are not authorized to perform this action.';

    }


    const error =
      new Error(message);


    error.status =
      response.status;

    error.data =
      data;

    error.endpoint =
      endpoint;


    throw error;
  }


  // =======================================================
  // SUCCESS
  // =======================================================

  console.log(
    '[API] Success:',
    method,
    endpoint,
    response.status
  );


  return data;
}


// =========================================================
// GET
// =========================================================

export async function apiGet(
  endpoint,
  options = {}
) {

  return apiRequest(
    endpoint,
    {
      ...options,
      method: 'GET',
    }
  );
}


// =========================================================
// POST
// =========================================================

export async function apiPost(
  endpoint,
  body,
  options = {}
) {

  return apiRequest(
    endpoint,
    {
      ...options,
      method: 'POST',
      body,
    }
  );
}


// =========================================================
// PUT
// =========================================================

export async function apiPut(
  endpoint,
  body,
  options = {}
) {

  return apiRequest(
    endpoint,
    {
      ...options,
      method: 'PUT',
      body,
    }
  );
}


// =========================================================
// PATCH
// =========================================================

export async function apiPatch(
  endpoint,
  body,
  options = {}
) {

  return apiRequest(
    endpoint,
    {
      ...options,
      method: 'PATCH',
      body,
    }
  );
}


// =========================================================
// DELETE
// =========================================================

export async function apiDelete(
  endpoint,
  options = {}
) {

  return apiRequest(
    endpoint,
    {
      ...options,
      method: 'DELETE',
    }
  );
}