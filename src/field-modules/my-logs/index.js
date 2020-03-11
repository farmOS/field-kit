import modConfig from './module.config';

const { createFieldModule } = window.farmOS.utils;

const MyLogsFieldModule = createFieldModule(modConfig);

export default MyLogsFieldModule;
