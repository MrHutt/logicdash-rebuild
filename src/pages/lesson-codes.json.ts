// Published as /lesson-codes.json: the uppercase code → lesson path map.
// Read by the 404 page (to rescue a short link in any letter case) and by the
// build step in astro.config.mjs that writes the server's .htaccess rules.
import type { APIRoute } from "astro";
import { codeMap } from "../lib/lessonCodes";

export const GET: APIRoute = () =>
	new Response(JSON.stringify(codeMap()), { headers: { "Content-Type": "application/json" } });
