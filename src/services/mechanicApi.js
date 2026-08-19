import { apiRequest } from './api';

// =========================================================
// MECHANIC ENDPOINTS
// =========================================================

const MECHANIC_ENDPOINTS = {
  // -------------------------------------------------------
  // PROFILE
  // -------------------------------------------------------

  me:
    '/api/v1/mechanics/me',

  // -------------------------------------------------------
  // AVAILABILITY
  // -------------------------------------------------------

  availability:
    '/api/v1/mechanics/me/availability',

  // -------------------------------------------------------
  // LOCATION
  // -------------------------------------------------------

  location:
    '/api/v1/mechanics/me/location',

  // -------------------------------------------------------
  // AVAILABLE REQUESTS
  // -------------------------------------------------------

  requests:
    '/api/v1/mechanics/requests',

  // -------------------------------------------------------
  // REQUEST BY ID
  // -------------------------------------------------------

  requestById: (requestId) =>
    `/api/v1/mechanics/requests/${encodeURIComponent(
      String(requestId)
    )}`,

  // -------------------------------------------------------
  // ACCEPT REQUEST
  // -------------------------------------------------------

  acceptRequest: (requestId) =>
    `/api/v1/mechanics/requests/${encodeURIComponent(
      String(requestId)
    )}/accept`,
};


// =========================================================
// GET MY MECHANIC PROFILE
// =========================================================

export async function getMyMechanicProfile() {

  console.log(
    '[Mechanic API] Getting mechanic profile'
  );

  return apiRequest(
    MECHANIC_ENDPOINTS.me,
    {
      method: 'GET',
    }
  );
}


// =========================================================
// UPDATE MY MECHANIC PROFILE
// =========================================================

export async function updateMyMechanicProfile(
  profile
) {

  console.log(
    '[Mechanic API] Updating mechanic profile'
  );

  return apiRequest(
    MECHANIC_ENDPOINTS.me,
    {
      method: 'PUT',

      body: {

        name:
          profile?.name?.trim() ||
          null,

        email:
          profile?.email?.trim() ||
          null,

        experienceYears:
          profile?.experienceYears === '' ||
          profile?.experienceYears === null ||
          profile?.experienceYears === undefined
            ? null
            : Number(
                profile.experienceYears
              ),

        workshopName:
          profile?.workshopName?.trim() ||
          null,

        workshopAddress:
          profile?.workshopAddress?.trim() ||
          null,
      },
    }
  );
}


// =========================================================
// UPDATE MECHANIC AVAILABILITY
// =========================================================

export async function updateMechanicAvailability(
  available
) {

  console.log(
    '[Mechanic API] Updating availability:',
    available
  );

  return apiRequest(
    MECHANIC_ENDPOINTS.availability,
    {
      method: 'PATCH',

      body: {
        available:
          Boolean(available),
      },
    }
  );
}


// =========================================================
// UPDATE CURRENT MECHANIC LOCATION
// =========================================================

export async function updateMechanicLocation(
  latitude,
  longitude
) {

  if (
    latitude === null ||
    latitude === undefined ||
    longitude === null ||
    longitude === undefined
  ) {

    throw new Error(
      'Valid mechanic location is required.'
    );
  }


  console.log(
    '[Mechanic API] Updating location:',
    {
      latitude,
      longitude,
    }
  );


  return apiRequest(
    MECHANIC_ENDPOINTS.location,
    {
      method: 'PATCH',

      body: {
        latitude:
          Number(latitude),

        longitude:
          Number(longitude),
      },
    }
  );
}


// =========================================================
// GET AVAILABLE SERVICE REQUESTS
// =========================================================
//
// Backend:
// GET /api/v1/mechanics/requests
//
// =========================================================

export async function getMechanicRequests() {

  console.log(
    '[Mechanic API] Getting available requests'
  );


  const response =
    await apiRequest(
      MECHANIC_ENDPOINTS.requests,
      {
        method: 'GET',
      }
    );


  console.log(
    '[Mechanic API] Available requests:',
    response
  );


  return response;
}


// =========================================================
// GET SERVICE REQUEST BY ID
// =========================================================
//
// Backend:
// GET /api/v1/mechanics/requests/{requestId}
//
// =========================================================

export async function getMechanicRequestById(
  requestId
) {

  if (!requestId) {

    throw new Error(
      'Request ID is required.'
    );
  }


  const cleanRequestId =
    String(requestId).trim();


  if (!cleanRequestId) {

    throw new Error(
      'Request ID is required.'
    );
  }


  console.log(
    '[Mechanic API] Getting request by ID:',
    cleanRequestId
  );


  const endpoint =
    MECHANIC_ENDPOINTS.requestById(
      cleanRequestId
    );


  console.log(
    '[Mechanic API] Request details endpoint:',
    endpoint
  );


  const response =
    await apiRequest(
      endpoint,
      {
        method: 'GET',
      }
    );


  console.log(
    '[Mechanic API] Request details response:',
    response
  );


  return response;
}


// =========================================================
// ACCEPT SERVICE REQUEST
// =========================================================
//
// Backend:
// PATCH /api/v1/mechanics/requests/{requestId}/accept
//
// =========================================================

export async function acceptMechanicRequest(
  requestId
) {

  if (!requestId) {

    throw new Error(
      'Request ID is required.'
    );
  }


  const cleanRequestId =
    String(requestId).trim();


  if (!cleanRequestId) {

    throw new Error(
      'Request ID is required.'
    );
  }


  console.log(
    '[Mechanic API] Accepting request:',
    cleanRequestId
  );


  const endpoint =
    MECHANIC_ENDPOINTS.acceptRequest(
      cleanRequestId
    );


  console.log(
    '[Mechanic API] Accept endpoint:',
    endpoint
  );


  const response =
    await apiRequest(
      endpoint,
      {
        method: 'PATCH',
      }
    );


  console.log(
    '[Mechanic API] Accept response:',
    response
  );


  return response;
}


// =========================================================
// DEFAULT EXPORT
// =========================================================

export default {

  getMyMechanicProfile,

  updateMyMechanicProfile,

  updateMechanicAvailability,

  updateMechanicLocation,

  getMechanicRequests,

  getMechanicRequestById,

  acceptMechanicRequest,
};