// This is the output of a call to http://farmos-base-url/log/1, converted from JSON to a plain object literal.
export default {
  rawTemplates: {observations:
    {
  field_farm_files: [],
  field_farm_images: [],
  field_farm_area: [],
  field_farm_asset: [],
  field_farm_geofield: [],
  field_farm_inventory: [],
  field_farm_log_category: [],
  field_farm_log_owner: [
    {
      uri: 'http://localhost/user/1',
      id: '1',
      resource: 'user'
    }
  ],
  field_farm_notes: {
    value: '<p>some notes</p>\n',
    format: 'farm_format'
  },
  field_farm_quantity: [],
  id: '1',
  name: 'some log name',
  type: 'farm_observation',
  uid: {
    uri: 'http://localhost/user/1',
    id: '1',
    resource: 'user'
  },
  timestamp: '1519423702',
  created: '1519423702',
  changed: '1519423744',
  done: '1',
  url: 'http://localhost/log/1',
  feeds_item_guid: null,
  feeds_item_url: null,
  feed_nid: null
} //end observations
}, //end rawTemplates
/*For each table, we have a template with keys corresponding to properties stored as something other than a simple string
  each property key is associated with an object containing a prefix and suffix
  these are appended to values with the same property key using the parseProp function
*/
propTemplates: {observations: {
  field_farm_notes: {
    prefix: '{\"value\":\"<p>',
    suffix: '</p>\\n\",\"format\":\"farm_format\"}'
  }
} //end observations
} //end propTemplates
}
