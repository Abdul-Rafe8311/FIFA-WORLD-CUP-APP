// Loaded first (as a side-effect import) so env vars are populated before any
// module that reads process.env (e.g. ../src/db) is evaluated.
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
