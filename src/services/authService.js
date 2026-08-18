

// =========================================================
// BACKEND URL
// =========================================================

// Change this to your actual Spring Boot server URL.
//
// Android physical device:
// http://YOUR-PC-IP:8080
//
// Example:
// http://192.168.1.100:8080
//
// Production:
// https://api.yourdomain.com
//
const API_BASE_URL =
  'http://192.168.1.100:8080';


// =========================================================
// API REQUEST
// =========================================================

async function apiRequest(
  endpoint,
  options = {}
) {
  const {
    method = 'GET',
    body,
    token,
  } = options;

  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  const response =
    await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        method,
        headers,
        body: body
          ? JSON.stringify(body)
          : undefined,
      }
    );

  let data = null;

  try {
    data =
      await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`;

    const error =
      new Error(message);

    error.status =
      response.status;

    error.data =
      data;

    throw error;
  }

  return data;
}


// =========================================================
// SEND MECHANIC OTP
// =========================================================

export async function sendMechanicOtp(
  phone
) {
  if (!phone) {
    throw new Error(
      'Mobile number is required.'
    );
  }

  const cleanPhone =
    String(phone)
      .replace(/\s+/g, '')
      .trim();

  console.log(
    '[Mechanic Auth] Sending OTP:',
    cleanPhone
  );

  return apiRequest(
    '/api/v1/auth/mechanic/send-otp',
    {
      method: 'POST',
      body: {
        phone: cleanPhone,
      },
    }
  );
}


// =========================================================
// VERIFY MECHANIC OTP
// =========================================================

export async function verifyMechanicOtp(
  phone,
  otp
) {
  if (!phone) {
    throw new Error(
      'Mobile number is required.'
    );
  }

  if (!otp || otp.length !== 6) {
    throw new Error(
      'Please enter the 6-digit OTP.'
    );
  }

  const cleanPhone =
    String(phone)
      .replace(/\s+/g, '')
      .trim();

  const cleanOtp =
    String(otp)
      .replace(/\D/g, '')
      .slice(0, 6);

  console.log(
    '[Mechanic Auth] Verifying OTP'
  );

  const response =
    await apiRequest(
      '/api/v1/auth/mechanic/verify-otp',
      {
        method: 'POST',
        body: {
          phone: cleanPhone,
          otp: cleanOtp,
        },
      }
    );

  console.log(
    '[Mechanic Auth] Login successful:',
    {
      userId: response?.userId,
      role: response?.role,
      isNewUser: response?.isNewUser,
    }
  );

  return response;
}


// =========================================================
// LOGIN HELPER
// =========================================================
//
// This converts the backend AuthResponse into the
// structure expected by your AuthContext.
//

export async function loginMechanic(
  phone,
  otp
) {
  const response =
    await verifyMechanicOtp(
      phone,
      otp
    );

  if (!response?.token) {
    throw new Error(
      'Login successful but no authentication token was received.'
    );
  }

  const user = {
    id:
      response.userId,

    phone,

    role:
      response.role,

    isNewUser:
      response.isNewUser,
  };

  return {
    token:
      response.token,

    user,

    response,
  };
}


// =========================================================
// EXPORT
// =========================================================

export default {
  sendMechanicOtp,
  verifyMechanicOtp,
  loginMechanic,
};