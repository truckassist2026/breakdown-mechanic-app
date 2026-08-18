import {
    getToken,
} from '../utils/authStorage';

const API_BASE_URL =
  'http://192.168.1.15:8080';


// =========================================================
// API REQUEST
// =========================================================

export async function apiRequest(
  endpoint,
  options = {}
) {

  const token =
    await getToken();


  const headers = {

    Accept:
      'application/json',

    'Content-Type':
      'application/json',

    ...(options.headers || {}),
  };


  if (token) {

    headers.Authorization =
      `Bearer ${token}`;
  }


  const url =
    `${API_BASE_URL}${endpoint}`;


  console.log(
    '[Mechanic API]',
    options.method || 'GET',
    url
  );


  console.log(
    '[Mechanic API] Auth token:',
    token
      ? 'PRESENT'
      : 'MISSING'
  );


  let response;


  try {

    response =
      await fetch(
        url,
        {
          ...options,

          headers,

          body:
            options.body &&
            typeof options.body !==
              'string'
              ? JSON.stringify(
                  options.body
                )
              : options.body,
        }
      );

  } catch (error) {

    console.error(
      '[Mechanic API] Network error:',
      error
    );

    throw new Error(
      'Unable to connect to RoadAssist server.'
    );
  }


  const contentType =
    response.headers.get(
      'content-type'
    ) || '';


  let data = null;


  if (
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


  if (!response.ok) {

    const message =
      data?.message ||
      data?.error ||
      data ||
      `Request failed with status ${response.status}`;


    const error =
      new Error(
        message
      );

    error.status =
      response.status;

    error.data =
      data;

    throw error;
  }


  return data;
}