import { cachingCriteria, evictionCriteria } from './criteria';
import { createLog } from '../../../utils/farmLog';

const current = 1580000000;

describe('meetsCachingCriteria', () => {
  it('passes a log timestamped at the current time', () => {
    const log = createLog({ timestamp: current, changed: current }, current);
    expect(cachingCriteria(current)(log))
      .toBe(true);
  });
  it('passes a log timestamped 29d, 23hr, 59min, 59sec ago', () => {
    const log = createLog({
      timestamp: current - (60 * 60 * 24 * 30) + 1,
      changed: current,
    }, current);
    expect(cachingCriteria(current)(log))
      .toBe(true);
  });
  it('fails a log timestamped exactly 30 days ago', () => {
    const log = createLog({
      timestamp: current - (60 * 60 * 24 * 30),
      changed: current,
    }, current);
    expect(cachingCriteria(current)(log))
      .toBe(false);
  });
  it('passes a log timestamped 40 days ago but unsynced', () => {
    const log = createLog({
      timestamp: current - (60 * 60 * 24 * 40),
      changed: current,
    }, current - 1);
    expect(cachingCriteria(current)(log))
      .toBe(true);
  });
  it('passes a log timestamped 14d, 23hr, 59min, 59sec from now', () => {
    const log = createLog({
      timestamp: current + (60 * 60 * 24 * 15) - 1,
      changed: current,
    }, current);
    expect(cachingCriteria(current)(log))
      .toBe(true);
  });
  it('fails a log timestamped exactly 15 days from now', () => {
    const log = createLog({
      timestamp: current + (60 * 60 * 24 * 15),
      changed: current,
    }, current);
    expect(cachingCriteria(current)(log))
      .toBe(false);
  });
});

describe('evictionCriteria', () => {
  it('fails a log timestamped at the current time', () => {
    const log = createLog({ timestamp: current, changed: current }, current);
    expect(evictionCriteria(current)(log))
      .toBe(false);
  });
  it('fails a log timestamped 29d, 23hr, 59min, 59sec ago', () => {
    const log = createLog({
      timestamp: current - (60 * 60 * 24 * 30) + 1,
      changed: current,
    }, current);
    expect(evictionCriteria(current)(log))
      .toBe(false);
  });
  it('passes a log timestamped exactly 30 days ago', () => {
    const log = createLog({
      timestamp: current - (60 * 60 * 24 * 30),
      changed: current,
    }, current);
    expect(evictionCriteria(current)(log))
      .toBe(true);
  });
  it('fails a log timestamped 40 days ago but unsynced', () => {
    const log = createLog({
      timestamp: current - (60 * 60 * 24 * 40),
      changed: current,
    }, current - 1);
    expect(evictionCriteria(current)(log))
      .toBe(false);
  });
  it('fails a log timestamped 14d, 23hr, 59min, 59sec from now', () => {
    const log = createLog({
      timestamp: current + (60 * 60 * 24 * 15) - 1,
      changed: current,
    }, current);
    expect(evictionCriteria(current)(log))
      .toBe(false);
  });
  it('passes a log timestamped exactly 15 days from now', () => {
    const log = createLog({
      timestamp: current + (60 * 60 * 24 * 15),
      changed: current,
    }, current);
    expect(evictionCriteria(current)(log))
      .toBe(true);
  });
});
