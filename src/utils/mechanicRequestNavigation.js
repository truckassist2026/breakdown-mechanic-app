// =========================================================
// MECHANIC REQUEST RESUME NAVIGATION
// =========================================================
//
// Backend request status is the source of truth.
// =========================================================

export function normalizeMechanicRequestStatus(status) {
  return String(status || "")
    .trim()
    .toUpperCase();
}

export function getMechanicRequestRoute(status) {
  switch (normalizeMechanicRequestStatus(status)) {
    case "CREATED":
    case "PENDING":
    case "REQUESTED":
    case "SEARCHING":
      return "/request-details";

    case "ACCEPTED":
    case "ASSIGNED":
    case "MECHANIC_EN_ROUTE":
    case "ARRIVED":
      return "/active";

    case "IN_PROGRESS":
      return "/service";

    case "PAYMENT_PENDING":
      return "/payment";

    case "COMPLETED":
    case "CANCELLED":
    default:
      return "/request-details";
  }
}

export function navigateToMechanicRequest(router, request) {
  if (!request?.id) {
    console.warn("[MECHANIC NAV] Request ID is missing.");
    return false;
  }

  const requestId = String(request.id);
  const status = normalizeMechanicRequestStatus(request.status);
  const route = getMechanicRequestRoute(status);

  console.log("[MECHANIC NAV] Opening request:", {
    requestId,
    status,
    route,
  });

  router.push({
    pathname: route,
    params: { requestId },
  });

  return true;
}
