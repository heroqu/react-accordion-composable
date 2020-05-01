import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { xSet } from './xSet';
import { actionTypes } from './actionTypes';
import { actionListReducer, dispatch } from './reducers';

/**
 * Check if the main state of Accordion is essentially the same
 */
const statesEqual = (s1, s2) =>
  s1.accordion === s2.accordion && s1.selected.equal(s2.selected);

export const Accordion = ({ msg, className, children }) => {
  // The `main` part of Accordion state with 2 attributes:
  //    - selected - an xSet that holds the IDs of selected (expanded) nodes
  //    - accordion - True/False - Boolean for Accordion mode
  const [state, setState] = useState({ selected: xSet(), accordion: true });

  // the timestamp of last message received through props
  const [msgTimestamp, setMsgTimestamp] = useState(undefined);

  // only the IDs of the children
  const [childrenIds, setChildrenIds] = useState([]);

  // children themselves, enhanced before rendering
  const [childrenElements, setChildrenElements] = useState([]);

  /**
   * Consume messages, coming from outer world through props
   */
  useEffect(() => {
    if (msg && msg.ts && msg.ts !== msgTimestamp) {
      // Fresh timestamp means a new message has arrived,
      // carring one or several actions.
      // Apply them all:
      const newState = actionListReducer(childrenIds)(state, msg.actions);

      if (!statesEqual(newState, state)) {
        setState(newState); // update Accordion data
        setMsgTimestamp(msg.ts); // remember last timestamp
      }
    }
  }, [msg, msgTimestamp, state, childrenIds]);

  /**
   * Update the list of the ids of children elements
   * (AccordionSection instances).
   * Which means 'all ids' in case we'd like to do `expand all`.
   * We don't keep track of this list here but instead have to
   * recalculate it each time dynamically - to keep this
   * top component of the Accordion setup as much decoupled
   * from whatever is inserted inside as its children as possible.
   */
  useEffect(() => {
    const ids = React.Children.map(
      children,
      (child) => React.isValidElement(child) && child.props.id,
    ).filter((x) => x || x === 0); // ids only

    setChildrenIds(ids);
  }, [children]);

  /**
   * Enhance child elements, AccordionSection instances:
   *  - set React key
   *  - set isSelected attribute
   *  - listen for clicks to handle the toggling
   */
  useEffect(() => {
    const elements = React.Children.map(children, (child) => {
      const id = child.props.id;
      // return a cloned Section object with click listener
      // and "active" awareness (`isSelected`)
      return React.cloneElement(child, {
        key: id,
        // private attributes/methods that the Section component works with
        isSelected: state.selected.has(id),
        onToggle: (id) =>
          dispatch(
            childrenIds,
            state,
            setState,
          )({
            type: actionTypes.toggleIds,
            ids: [id],
          }),
      });
    });

    setChildrenElements(elements);
  }, [children, childrenIds, state, setState, state.selected]);

  return <div className={className}>{childrenElements}</div>;
};

Accordion.propTypes = {
  children: PropTypes.node,
  msg: PropTypes.shape({
    actions: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.oneOf(Object.keys(actionTypes)),
      }),
    ),
    ts: PropTypes.any,
  }),
  className: PropTypes.string,
};
