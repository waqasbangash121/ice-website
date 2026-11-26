// This boundary sits below the shared staff shell so client navigations can
// show a fallback while each page verifies staff and loads current content.
export default function Loading() {
  return <div className="admin-loading" role="status"><span aria-hidden="true"/>Loading workspace content…</div>;
}
