type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function errorResponse(error?: unknown): Response {
  console.error(error);
  return new Response(
    `<!DOCTYPE html><html><head><title>HackTrack — Error</title></head><body style="background:#07090f;color:#e8edf5;font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh"><div style="text-align:center"><h1 style="color:#00e5a0">HACKTRACK</h1><p>Something went wrong. Please reload.</p></div></body></html>`,
    { status: 500, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      return await handler.fetch(request, env, ctx);
    } catch (error) {
      return errorResponse(error);
    }
  },
};
