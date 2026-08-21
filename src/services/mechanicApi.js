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

  // -------------------------------------------------------
  // UPDATE REQUEST STATUS
  // -------------------------------------------------------

  requestStatus: (requestId) =>
    `/api/v1/mechanics/requests/${encodeURIComponent(
      String(requestId)
    )}/status`,
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
// Result:
// SEARCHING → ASSIGNED
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
// UPDATE SERVICE REQUEST STATUS
// =========================================================
//
// Backend:
//
// PATCH
// /api/v1/mechanics/requests/{requestId}/status?status=STATUS
//
// Supported flow:
//
// ASSIGNED
//     ↓
// MECHANIC_EN_ROUTE
//     ↓
// ARRIVED
//     ↓
// IN_PROGRESS
//     ↓
// PAYMENT_PENDING
//
// =========================================================

export async function updateMechanicRequestStatus(
  requestId,
  status
) {

  // -------------------------------------------------------
  // VALIDATE REQUEST ID
  // -------------------------------------------------------

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


  // -------------------------------------------------------
  // VALIDATE STATUS
  // -------------------------------------------------------

  if (!status) {

    throw new Error(
      'Status is required.'
    );
  }


  const normalizedStatus =
    String(status)
      .trim()
      .toUpperCase();


  if (!normalizedStatus) {

    throw new Error(
      'Status is required.'
    );
  }


  // -------------------------------------------------------
  // LOG
  // -------------------------------------------------------

  console.log(
    '===================================='
  );

  console.log(
    '[Mechanic API] Updating request status'
  );

  console.log(
    '[Mechanic API] Request ID:',
    cleanRequestId
  );

  console.log(
    '[Mechanic API] New status:',
    normalizedStatus
  );


  // -------------------------------------------------------
  // BUILD ENDPOINT
  // -------------------------------------------------------

  const endpoint =
    `${MECHANIC_ENDPOINTS.requestStatus(
      cleanRequestId
    )}?status=${encodeURIComponent(
      normalizedStatus
    )}`;


  console.log(
    '[Mechanic API] Status endpoint:',
    endpoint
  );


  // -------------------------------------------------------
  // API CALL
  // -------------------------------------------------------

  try {

    const response =
      await apiRequest(
        endpoint,
        {
          method: 'PATCH',
        }
      );


    console.log(
      '[Mechanic API] Status update response:',
      response
    );


    console.log(
      '===================================='
    );


    return response;

  } catch (error) {

    console.error(
      '[Mechanic API] Status update failed:',
      {
        requestId:
          cleanRequestId,

        status:
          normalizedStatus,

        error,
      }
    );


    console.error(
      '[Mechanic API] Error status:',
      error?.status
    );


    console.error(
      '[Mechanic API] Error data:',
      error?.data
    );


    throw error;
  }
}


// =========================================================
// START TRAVEL
// =========================================================
//
// ASSIGNED
//     ↓
// MECHANIC_EN_ROUTE
//
// =========================================================

export async function startMechanicTravel(
  requestId
) {

  console.log(
    '[Mechanic API] Starting mechanic travel:',
    requestId
  );


  return updateMechanicRequestStatus(
    requestId,
    'MECHANIC_EN_ROUTE'
  );
}


// =========================================================
// ARRIVE AT LOCATION
// =========================================================
//
// MECHANIC_EN_ROUTE
//     ↓
// ARRIVED
//
// =========================================================

export async function arriveAtLocation(
  requestId
) {

  console.log(
    '[Mechanic API] Mechanic arrived:',
    requestId
  );


  return updateMechanicRequestStatus(
    requestId,
    'ARRIVED'
  );
}


// =========================================================
// START SERVICE
// =========================================================
//
// ARRIVED
//     ↓
// IN_PROGRESS
//
// =========================================================

export async function startMechanicService(
  requestId
) {

  console.log(
    '[Mechanic API] Starting mechanic service:',
    requestId
  );


  return updateMechanicRequestStatus(
    requestId,
    'IN_PROGRESS'
  );
}


// =========================================================
// MARK PAYMENT PENDING
// =========================================================
//
// IN_PROGRESS
//     ↓
// PAYMENT_PENDING
//
// =========================================================

export async function markPaymentPending(
  requestId
) {

  console.log(
    '[Mechanic API] Marking payment pending:',
    requestId
  );


  return updateMechanicRequestStatus(
    requestId,
    'PAYMENT_PENDING'
  );
}


// =========================================================
// DEFAULT EXPORT
// =========================================================

export default {

  // Profile
  getMyMechanicProfile,

  updateMyMechanicProfile,

  // Availability
  updateMechanicAvailability,

  // Location
  updateMechanicLocation,

  // Requests
  getMechanicRequests,

  getMechanicRequestById,

  acceptMechanicRequest,

  // Status
  updateMechanicRequestStatus,

  startMechanicTravel,

  arriveAtLocation,

  startMechanicService,

  markPaymentPending,
};