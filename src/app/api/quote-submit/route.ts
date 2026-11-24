// User requested disabled CRM delivery. Never accept or acknowledge a lead here.
export async function POST() {
  return Response.json({
    error: "Online enquiries are not being sent yet. Your draft has not been submitted. Please call 1800 934 009.",
    deliveryEnabled: false,
  }, { status: 503, headers: { "Cache-Control": "no-store" } });
}
