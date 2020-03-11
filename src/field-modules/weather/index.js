import modConfig from './module.config';

const { createFieldModule } = window.farmOS.utils;

const WeatherFieldModule = createFieldModule(modConfig);

export default WeatherFieldModule;
