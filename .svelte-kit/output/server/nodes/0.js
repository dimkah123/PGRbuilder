import * as universal from '../entries/pages/_layout.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.js";
export const imports = ["_app/immutable/nodes/0.D_ViLv9w.js","_app/immutable/chunks/D9qPSgcW.js","_app/immutable/chunks/B6J0OaB8.js","_app/immutable/chunks/WiojJ2hU.js","_app/immutable/chunks/BdTEUmb4.js","_app/immutable/chunks/Cqe658LR.js"];
export const stylesheets = ["_app/immutable/assets/0.sa1k_Ejv.css"];
export const fonts = [];
