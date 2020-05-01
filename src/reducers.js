import { xSet } from './xSet';
import { actionTypes } from './actionTypes';
import { toArray } from './util';

/**
 * Reduce single action
 *
 * Both childrenIds and state are part of component State
 * in a wider sense, but `state` is its part related to Accordion
 * as such, while `childrenIds` is its part related to what whappen
 * to be its children and somewhat more external.
 *
 * Now, the goal of reducers here is to update the `state` part:
 *    state = reducer(state, action)
 * therefore we inject childrenIds in advance, as `external` param:
 *    reducer = actionReducer(childrenIds)
 *
 * So, reducer is still a pure function, but configurable
 * by childrenIds param.
 */
export const actionReducer = (childrenIds) => (state, action) => {
  const newState = {};
  let selected, ids;

  if (!action) return state;

  switch (action.type) {
    case actionTypes.selectIds:
      selected = xSet(action.ids);
      newState.selected = selected;
      if (selected.size() > 1 && state.accordion) {
        newState.accordion = false;
      }
      break;
    case actionTypes.accordionOn:
      if (!state.accordion) {
        newState.accordion = true;
      }
      if (state.selected.size() > 1) {
        newState.selected = state.selected.first();
      }
      break;
    case actionTypes.accordionOff:
      if (state.accordion) {
        newState.accordion = false;
      }
      break;
    case actionTypes.collapseAll:
      if (state.selected.size() !== 0) {
        newState.selected = xSet();
      }
      if (!state.accordion) {
        newState.accordion = true;
      }
      break;
    case actionTypes.expandAll:
      if (state.accordion) {
        newState.accordion = false;
      }
      if (!state.selected.equal(childrenIds)) {
        newState.selected = xSet(childrenIds);
      }
      break;
    case actionTypes.toggleIds:
      /**
       * Toggle is basically an XOR operation:
       * Selection state of specified IDs has to be inverted.
       * On top of that, if the Accordion mode is ON,
       * we have to then deselect all but the very first selected node.
       */
      ids = action.ids;
      selected = state.selected;
      if (state.accordion) {
        // only first can stay selected when Accordion mode is ON:
        ids = xSet(ids).first();
        selected = selected.AND(ids);
      }
      newState.selected = selected.XOR(ids);
      break;
    default:
  }

  return { ...state, ...newState };
};

/**
 * Reduce a list of actions
 * - by applying single action reducers one by one.
 */
export const actionListReducer = (childrenIds) => (state, actions) => {
  const reducer = actionReducer(childrenIds);
  return toArray(actions)
    .filter((x) => x.type)
    .reduce((newState, action) => reducer(newState, action), state);
};

/**
 * Action dispatcher,
 * - can dispatch either a single action or a list of them.
 */
export const dispatch = (childrenIds, state, setState) => (actions) =>
  setState(actionListReducer(childrenIds)(state, actions));
