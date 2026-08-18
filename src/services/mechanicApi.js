import { apiRequest } from './api';


// =========================================================
// MECHANIC ENDPOINTS
// =========================================================

const MECHANIC_ENDPOINTS = {
  me: '/api/v1/mechanics/me',
};


// =========================================================
// GET MY PROFILE
// =========================================================

export async function getMyMechanicProfile() {
  return apiRequest(
    MECHANIC_ENDPOINTS.me,
    {
      method: 'GET',
    }
  );
}


// =========================================================
// UPDATE MY PROFILE
// =========================================================

export async function updateMyMechanicProfile(
  profile
) {
  return apiRequest(
    MECHANIC_ENDPOINTS.me,
    {
      method: 'PUT',

      body: {
        name:
          profile.name?.trim() || null,

        email:
          profile.email?.trim() || null,

        experienceYears:
          profile.experienceYears === '' ||
          profile.experienceYears === null ||
          profile.experienceYears === undefined
            ? null
            : Number(
                profile.experienceYears
              ),

        workshopName:
          profile.workshopName?.trim() || null,

        workshopAddress:
          profile.workshopAddress?.trim() || null,
      },
    }
  );
}