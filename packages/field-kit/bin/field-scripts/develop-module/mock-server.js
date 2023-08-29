import http from 'http';
import { FM_API_ENDPOINT, resolveModulePathname } from '../../../namespaces/index.js';
import { fmtScript, fmtJsonApi } from '../format.js';

const trimPath = p => (typeof p === 'string' ? p : '').replaceAll(/^\/|\/$/g, '');
const eqPath = (pathA, pathB) => trimPath(pathA) === trimPath(pathB);

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS, GET',
  'Access-Control-Max-Age': 2592000, // 30 days
};

export default function createMockServer(config) {
  const jsonapi = fmtJsonApi(config);
  const script = fmtScript(config);
  const scriptPath = resolveModulePathname(config.name);
  return http.createServer((req, res) => {
    if (eqPath(req.url, FM_API_ENDPOINT)) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(jsonapi));
    } else if (eqPath(req.url, scriptPath)) {
      res.writeHead(200, { 'Content-Type': 'application/javascript', ...cors });
      res.end(script);
    } else {
      res.writeHead(404);
      res.end(`Proxy server could not find resource ${req.url} for ${config.name} module.`);
    }
  });
}
