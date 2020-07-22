const makeDefault = (schema) => {
  if (schema === null) {
    return null;
  }
  if (Array.isArray(schema)) {
    return [];
  }
  if (typeof schema === 'object') {
    const entries = Object.entries(schema)
      .map(([key, val]) => ([key, makeDefault(val)]));
    return Object.fromEntries(entries);
  }
  return schema;
};

const farmLog = (logTypes, syncDate) => ({
  createLog(props = {}) {
    const changed = Math.floor(Date.now() / 1000);
    const name = { changed, data: props.name || '', conflicts: [] };
    const type = { changed, data: props.type || 'farm_activity', conflicts: [] };
    const timestamp = { changed, data: props.timestamp || changed, conflicts: [] };
    const done = { changed, data: props.done || false, conflicts: [] };
    const {
      localID = null,
      isCachedLocally = false,
      wasPushedToServer = false,
      isReadyToSync = false,
      modules = [],
    } = props;
    const schema = logTypes[type.data].fields;
    const entries = Object.entries(schema).map(([key, { data_schema: dataSchema }]) => {
      const data = props[key] || makeDefault(dataSchema);
      return [key, { changed, data, conflicts: [] }];
    });
    return {
      ...Object.fromEntries(entries),
      name,
      type,
      timestamp,
      done,
      localID,
      isCachedLocally,
      wasPushedToServer,
      isReadyToSync,
      modules,
    };
  },
  updateLog(log, props = {}) {
    const changed = Math.floor(Date.now() / 1000);
    const updateProp = (key, def, schema) => {
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
        prop = { changed, data: def || makeDefault(schema), conflicts: [] };
      }
      return prop;
    };
    const name = updateProp('name', '');
    const type = updateProp('type', 'farm_activity');
    const timestamp = updateProp('timestamp', changed);
    const done = updateProp('done', false);
    const schema = logTypes[type.data]?.fields;
    // If the schema is missing for this log type, b/c it hasn't come from the
    // server yet or was modified, just work with the log's existing key-value pairs.
    const entries = schema ? Object.entries(schema) : Object.entries(log);
    const updatedEntries = entries.map(([key, { data_schema: dataSchema = null }]) => {
      const value = updateProp(key, undefined, dataSchema);
      return [key, value];
    });
    const updateMetaData = (key, def) => {
      let value;
      if (props[key] !== undefined) {
        value = props[key];
      } else if (log[key] !== undefined) {
        value = log[key];
      } else {
        value = def;
      }
      return value;
    };
    return {
      ...Object.fromEntries(updatedEntries),
      name,
      type,
      timestamp,
      done,
      url: props.url || log.url,
      id: props.id || log.id,
      localID: props.localID || log.localID,
      isCachedLocally: updateMetaData('isCachedLocally', false),
      wasPushedToServer: updateMetaData('wasPushedToServer', false),
      isReadyToSync: updateMetaData('isReadyToSync', false),
      modules: props.modules || log.modules || [],
    };
  },
  formatLogForServer(log) {
    const changed = Math.floor(Date.now() / 1000);
    const updateProp = (key, def, schema) => (
      log[key].data !== undefined ? log[key].data : def || makeDefault(schema)
    );
    const name = updateProp('name', '');
    const type = updateProp('type', 'farm_activity');
    const timestamp = updateProp('timestamp', changed);
    const done = updateProp('done', false);
    const schema = logTypes[type]?.fields;
    // If the schema is missing for this log type, b/c it hasn't come from the
    // server yet or was modified, just work with the log's existing key-value pairs.
    const entries = schema ? Object.entries(schema) : Object.entries(log);
    const updatedEntries = entries.map(([key, { data_schema: dataSchema = null }]) => {
      // We've got to hardcode this logic re: notes for now b/c the server does
      // not give us a valid default value. :/
      const isInvalidNotesProp = (key === 'notes' && log.notes.data === null);
      const value = isInvalidNotesProp
        ? { value: '', format: 'farm_format' }
        : updateProp(key, undefined, dataSchema);
      return [key, value];
    });
    const newLog = {
      ...Object.fromEntries(updatedEntries),
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
  mergeLogFromServer(serverLog, localLog, props = {}) {
    const changed = Math.floor(Date.now() / 1000);

    // Some dirty reassignment to coerce these props to numbers b/c the server
    // sends them as strings. :/
    serverLog.changed = +serverLog.changed; // eslint-disable-line no-param-reassign
    serverLog.timestamp = +serverLog.timestamp; // eslint-disable-line no-param-reassign
    serverLog.done = !!+serverLog.done; // eslint-disable-line no-param-reassign

    // Supply a function for updating props based on certain conditions...
    const updateProp = (!localLog)
      // If there's no local log provided, use the server log's value for all props.
      ? (key, def, schema) => (
        serverLog[key] !== undefined
          ? { changed, data: props[key] || serverLog[key], conflicts: [] }
          : { changed, data: def || makeDefault(schema), conflicts: [] }
      )
      // Otherwise we need to compare key-by-key...
      : (key, def, schema) => {
        let prop;
        if (props[key] !== undefined) {
          prop = {
            changed,
            data: props[key],
            conflicts: localLog[key].conflicts,
          };
        // If the server log is more recent but the local log has already been
        // synced, use the server log's value as prop.
        } else if (serverLog.changed > localLog[key].changed && localLog.wasPushedToServer) {
          prop = {
            changed: serverLog.changed,
            data: serverLog[key],
            conflicts: localLog[key].conflicts,
          };
        // If the local log is more recent for this key, use its value as prop.
        } else if (serverLog.changed < localLog[key].changed || syncDate > localLog[key].changed) {
          prop = {
            changed: localLog[key].changed,
            data: localLog[key].data,
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
            data: localLog[key].data || def || makeDefault(schema),
            conflicts: localLog[key].conflicts || [],
          };
        }
        return prop;
      };
    const name = updateProp('name', '');
    const type = updateProp('type', 'farm_activity');
    const timestamp = updateProp('timestamp', changed);
    const done = updateProp('done', false);
    // If the schema is missing for this log type, b/c it hasn't come from the
    // server yet or was modified, just work with the log's existing key-value pairs.
    const schema = logTypes[type.data]?.fields;
    const entries = schema ? Object.entries(schema) : Object.entries(serverLog);
    const updatedEntries = entries.map(([key, { data_schema: dataSchema, type: fieldType }]) => {
      // Due to a bug on the server, notes and other text_long fields sometimes
      // come from the server with value of [], which gets rejected if sent back
      // to the server, so we're reassigning the function parameter (oh no!)
      // on that key to correct the error.
      if (fieldType === 'text_long' && Array.isArray(serverLog[key])) {
        serverLog[key] = null; // eslint-disable-line no-param-reassign
      }
      const value = updateProp(key, undefined, dataSchema);
      return [key, value];
    });
    const updateMetaData = (key, def) => {
      let value;
      if (props[key] !== undefined) {
        value = props[key];
      } else if (localLog && localLog[key] !== undefined) {
        value = localLog[key];
      } else {
        value = def;
      }
      return value;
    };
    return {
      ...Object.fromEntries(updatedEntries),
      name,
      type,
      timestamp,
      done,
      localID: localLog?.localID,
      url: serverLog.url,
      id: serverLog.id,
      isCachedLocally: updateMetaData('isCachedLocally', false),
      wasPushedToServer: updateMetaData('wasPushedToServer', true),
      isReadyToSync: updateMetaData('isReadyToSync', false),
      modules: updateMetaData('modules', []),
    };
  },
});

export default farmLog;
