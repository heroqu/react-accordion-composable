import { timestamp, toArray } from './util';

/**
 * Wrap a list of actions or a single action into a `message`
 * - an object with a timestamp that can be dispatched
 */
export const actionsToMsg = actions => ({
  actions: toArray(actions),
  ts: timestamp(),
});
