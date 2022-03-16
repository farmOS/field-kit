import farmOS from 'farmos';
import * as remoteConfig from './remote';

const { getHost, setHost, ...rest } = remoteConfig;
const host = getHost();
const remote = { host, ...rest };

export default farmOS({ remote });
