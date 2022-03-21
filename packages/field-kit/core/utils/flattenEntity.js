const flattenEntity = ({
  id, type, meta, attributes = {}, relationships = {},
} = {}) => ({
  id, type, meta, ...attributes, ...relationships,
});

export default flattenEntity;
