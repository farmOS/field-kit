export default function (type) {
  switch (type) {
    case 'farm_activity':
      return 'Activity';
    case 'farm_harvest':
      return 'Harvest';
    case 'farm_input':
      return 'Input';
    case 'farm_observation':
      return 'Observation';
    case 'farm_seeding':
      return 'Seeding';
    default:
      throw new Error('Invalid type');
  }
}
