import farm from '../farm';
import { cachingCriteria, daysAway, evictionCriteria } from './cachingCriteria';

const now = new Date().toISOString();
const props = {
  type: 'activity',
  timestamp: now,
};
const metadata = {
  remote: { lastSync: daysAway(now, 1) },
  fields: { timestamp: { changed: now } },
};
const unsyncedMetadata = {
  remote: { lastSync: daysAway(now, -1) },
  fields: { timestamp: { changed: now } },
};
const meetsCachingCriteria = cachingCriteria({ now }).log;
const meetsEvictionCriteria = evictionCriteria({ now }).log;

describe('cachingCriteria', () => {
  it('passes a log timestamped at the current time', () => {
    const log = farm.log.create(props, metadata);
    expect(meetsCachingCriteria(log)).toBe(true);
  });
  it('passes a log timestamped 29 days ago', () => {
    const log = farm.log.create({
      ...props,
      timestamp: daysAway(now, -29),
    }, metadata);
    expect(meetsCachingCriteria(log)).toBe(true);
  });
  it('fails a log timestamped 30 days ago', () => {
    const log = farm.log.create({
      ...props,
      timestamp: daysAway(now, -30),
    }, metadata);
    expect(meetsCachingCriteria(log)).toBe(false);
  });
  it('passes a log timestamped 40 days ago but unsynced', () => {
    const log = farm.log.create({
      ...props,
      timestamp: daysAway(now, -40),
    }, unsyncedMetadata);
    expect(meetsCachingCriteria(log)).toBe(true);
  });
  it('passes a log timestamped 14 days from now', () => {
    const log = farm.log.create({
      ...props,
      timestamp: daysAway(now, 14),
    }, metadata);
    expect(meetsCachingCriteria(log)).toBe(true);
  });
  it('fails a log timestamped 15 days from now', () => {
    const log = farm.log.create({
      ...props,
      timestamp: daysAway(now, 15),
    }, metadata);
    expect(meetsCachingCriteria(log)).toBe(false);
  });
});

describe('evictionCriteria', () => {
  it('fails a log timestamped at the current time', () => {
    const log = farm.log.create(props, metadata);
    expect(meetsEvictionCriteria(log))
      .toBe(false);
  });
  it('fails a log timestamped 29 days ago', () => {
    const log = farm.log.create({
      ...props,
      timestamp: daysAway(now, -29),
    }, metadata);
    expect(meetsEvictionCriteria(log))
      .toBe(false);
  });
  it('passes a log timestamped exactly 30 days ago', () => {
    const log = farm.log.create({
      ...props,
      timestamp: daysAway(now, -30),
    }, metadata);
    expect(meetsEvictionCriteria(log))
      .toBe(true);
  });
  it('fails a log timestamped 40 days ago but unsynced', () => {
    const log = farm.log.create({
      ...props,
      timestamp: daysAway(now, -40),
    }, unsyncedMetadata);
    expect(meetsEvictionCriteria(log))
      .toBe(false);
  });
  it('fails a log timestamped 14 days from now', () => {
    const log = farm.log.create({
      ...props,
      timestamp: daysAway(now, 14),
    }, metadata);
    expect(meetsEvictionCriteria(log))
      .toBe(false);
  });
  it('passes a log timestamped exactly 15 days from now', () => {
    const log = farm.log.create({
      ...props,
      timestamp: daysAway(now, 15),
    }, metadata);
    expect(meetsEvictionCriteria(log))
      .toBe(true);
  });
});
