const farmLog = logTypes => ({
  createLog(props = {}) {
    const changed = Math.floor(Date.now() / 1000);
    const name = { changed, data: props.name || '', conflicts: [] };
    const type = { changed, data: props.type || 'farm_activity', conflicts: [] };
    const timestamp = { changed, data: props.timestamp || changed, conflicts: [] };
    const done = { changed, data: props.done || false, conflicts: [] };
    const {
      isCachedLocally = false,
      wasPushedToServer = false,
      isReadyToSync = false,
      modules = [],
    } = props;
    const schema = logTypes[type.data].fields;
    const entries = Object.entries(schema).map(([key, { default_value: def }]) => {
      const data = props[key] || def;
      return [key, { changed, data, conflicts: [] }];
    });
    return {
      ...Object.fromEntries(entries),
      name,
      type,
      timestamp,
      done,
      isCachedLocally,
      wasPushedToServer,
      isReadyToSync,
      modules,
    };
  },
  updateLog(log, props = {}) {
    const changed = Math.floor(Date.now() / 1000);
    const updateProp = (key, def) => {
      let prop;
      if (props[key] !== undefined) {
        prop = {
          changed,
          data: props[key],
          conflicts: log[key].conflicts || [],
        };
      } else if (log[key]?.data !== undefined) {
        prop = {
          changed: log[key].changed,
          data: log[key].data,
          conflicts: log[key].conflicts || [],
        };
      } else {
        prop = { changed, data: def, conflicts: [] };
      }
      return prop;
    };
    const name = updateProp('name', '');
    const type = updateProp('type', 'farm_activity');
    const timestamp = updateProp('timestamp', changed);
    const done = updateProp('done', false);
    const schema = logTypes[type.data].fields;
    const entries = Object.entries(schema).map(([key, { default_value: def }]) => {
      const value = updateProp(key, def);
      return [key, value];
    });
    return {
      ...Object.fromEntries(entries),
      name,
      type,
      timestamp,
      done,
      url: props.url || log.url || log.remoteUri,
      id: log.id,
      localID: props.localID || log.localID,
      isCachedLocally: props.isCachedLocally || log.isCachedLocally || false,
      wasPushedToServer: props.wasPushedToServer || log.wasPushedToServer || false,
      isReadyToSync: props.isReadyToSync || log.isReadyToSync || false,
      modules: props.modules || log.modules || [],
    };
  },
  logToServer(log) {
    const changed = Math.floor(Date.now() / 1000);
    const updateProp = (key, def) => (log[key].data !== undefined ? log[key].data : def);
    const name = updateProp('name', '');
    const type = updateProp('type', 'farm_activity');
    const timestamp = updateProp('timestamp', changed);
    const done = updateProp('done', false);
    const schema = logTypes[type].fields;
    const entries = Object.entries(schema).map(([key, { default_value: def }]) => {
      const value = updateProp(key, def);
      return [key, value];
    });
    const newLog = {
      ...Object.fromEntries(entries),
      name,
      type,
      timestamp,
      done,
    };
    if (log.id) {
      newLog.id = log.id;
    }
    return newLog;
  },
  logFromServer(serverLog, localLog) {
    const changed = Math.floor(Date.now() / 1000);
    // Supply a function for updating props based on certain conditions...
    const updateProp = (!localLog)
      // If there's no local log provided, use the server log's value for all props.
      ? (key, def) => (
        serverLog[key]
          ? { changed, data: serverLog[key], conflicts: [] }
          : { changed, data: def, conflicts: [] }
      )
      // Otherwise we need to compare key-by-key...
      : (key, def) => {
        let prop;
        // If the local log is more recent for this key, use its value as prop.
        if (serverLog.changed < localLog[key].changed) {
          prop = {
            changed: localLog[key].changed,
            data: localLog[key].data,
            conflicts: localLog[key].conflicts,
          };
        // If the server log is more recent but the local log has already been
        // synced, use the server log's value as prop.
        } else if (serverLog.changed > localLog[key].changed && localLog.wasPushedToServer) {
          prop = {
            changed,
            data: serverLog[key],
            conflicts: localLog[key].conflicts,
          };
        // If the server log is more recent and the local log has outstanding
        // changes that haven't been synced, we have a conflict.
        } else if (serverLog.changed > localLog[key].changed && !localLog.wasPushedToServer) {
          prop = {
            changed: localLog[key].changed,
            data: localLog[key].data,
            conflicts: localLog[key].conflicts.concat([{
              changed: serverLog.changed,
              data: serverLog[key],
            }]),
          };
        } else {
          prop = {
            changed: localLog[key].changed || changed,
            data: localLog[key].data || def,
            conflicts: localLog[key].conflicts || [],
          };
        }
        return prop;
      };
    const name = updateProp('name', '');
    const type = updateProp('type', 'farm_activity');
    const timestamp = updateProp('timestamp', changed);
    const done = updateProp('done', false);
    const url = updateProp('url', '');
    const schema = logTypes[type.data].fields;
    const entries = Object.entries(schema).map(([key, { default_value: def }]) => {
      const value = updateProp(key, def);
      return [key, value];
    });
    return {
      ...Object.fromEntries(entries),
      name,
      type,
      timestamp,
      done,
      url,
      modules: localLog.modules || [],
      id: serverLog.id,
    };
  },
});

export default farmLog;
