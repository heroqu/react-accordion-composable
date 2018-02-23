import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { xSet } from './xSet'
import { ts, toArray, shallowEqual } from './util'

export const actionTypes = {
  selectIds: 'selectIds',
  accordionOn: 'accordionOn',
  accordionOff: 'accordionOff',
  collapseAll: 'collapseAll',
  expandAll: 'expandAll',
  toggleIds: 'toggleIds'
}

/**
 * Wrap a list of actions or a single action into a `message`
 * - an object with a timestap that can be dispatched
 */
export function actionsToMsg(actions) {
  return { actions: toArray(actions), ts: ts() }
}

function statesEqual(s1, s2) {
  return s1.accordion === s2.accordion && s1.selected.equal(s2.selected)
}

function propsEqual(p1, p2) {
  // mutate `msg` prop, as we handle that separately
  // inside componentWillReceiveProps
  p1 = { ...p1, msg: undefined }
  p2 = { ...p2, msg: undefined }
  return shallowEqual(p1, p2)
}

export class Accordion extends Component {
  constructor(props) {
    super(props)

    // default state...
    this.state = {
      selected: xSet(), // empty
      accordion: true
    }

    // ...that can be adjusted from outside
    if (this.props.msg) {
      /**
       * `replay` the list of actions received through props
       *  to apply them one by one.
       *
       * We use the same action messaging both inside and outside.
       */
      this.state = this.actionListReducer(this.state, this.props.msg.actions)
    }
  }

  /**
   * At any point in time Accordion can be influenced from outside
   * by sending action list through the `msg` prop like this:
   *    <Accordion
   *      msg={
   *            actions: [
   *              {type: 'selectIds', ids: ['3']},
   *              {type: 'accordionOff'}
   *            ],
   *            ts: '2343451345-1234531451'
   *          }
   *    />
   * One can use exported helper function `actionsToMsg` to wrap one or
   * more actions into this message format with automatically generated
   * timestamps. We use timestamping to facilitate distinguishing
   * new messages from older ones to avoid unnecessary re-rendering.
   */
  componentWillReceiveProps(nextProps) {
    const msg = nextProps.msg
    const ts = msg && msg.ts

    if (ts && Array.isArray(msg.actions) && msg.actions.length !== 0) {
      const prevMsgs = this.props.msg
      const prevTs = prevMsgs && prevMsgs.ts
      if (ts !== prevTs) {
        // new message arrived, have some work to do
        this.dispatchActions(msg.actions)
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !propsEqual(nextProps, this.props) || !statesEqual(nextState, this.state)
    )
  }

  dispatchActions(actions) {
    const newState = this.actionListReducer(this.state, actions)

    if (!statesEqual(newState, this.state)) {
      this.setState(newState)
    }
  }

  /**
   * All the ids of children elements.
   * Which means 'all ids' in case we'd like to do `expand all`.
   * We don't keep track of this list here but instead have to
   * recalculate it each time dynamically - to keep this
   * top component of the Accordion setup as much decoupled
   * from whatever is inserted inside as its children as possible.
   */
  childrenIds() {
    return React.Children.map(
      this.props.children,
      child => React.isValidElement(child) && child.props.id
    ).filter(x => x || x === 0) // ids only
  }

  selectedIds() {
    return this.state.selected ? this.state.selected.toArray() : []
  }

  isSelected(id) {
    return this.state.selected ? this.state.selected.has(id) : false
  }

  handleToggle(ids) {
    this.dispatchActions({ type: actionTypes.toggleIds, ids })
  }

  /**
   * Reduce a list of actions one by one
   */
  actionListReducer(prevState, actions) {
    let state = prevState

    actions = toArray(actions).filter(x => x.type)

    for (let action of actions) {
      state = this.actionReducer(state, action)
    }

    return state
  }

  /**
   * Reduce individual action
   */
  actionReducer(state, action) {
    const newState = {}
    let selected, ids

    switch (action.type) {
      case actionTypes.selectIds:
        selected = xSet(action.ids)
        newState.selected = selected
        if (selected.size() > 1 && state.accordion) {
          newState.accordion = false
        }
        break
      case actionTypes.accordionOn:
        if (!state.accordion) {
          newState.accordion = true
        }
        if (state.selected.size() > 1) {
          newState.selected = state.selected.first()
        }
        break
      case actionTypes.accordionOff:
        if (state.accordion) {
          newState.accordion = false
        }
        break
      case actionTypes.collapseAll:
        if (state.selected.size() !== 0) {
          newState.selected = xSet()
        }
        if (!state.accordion) {
          newState.accordion = true
        }
        break
      case actionTypes.expandAll:
        if (state.accordion) {
          newState.accordion = false
        }
        if (this.childrenIds().length !== state.selected.size()) {
          newState.selected = xSet(this.childrenIds())
        }
        break
      case actionTypes.toggleIds:
        /**
         * Toggle is basically an XOR operation, when the state of each
         * 'touched' id has to be inverted,
         * unless we are in the Accordion mode, when on top of that
         * all the ids except the first of the given ones
         * should get deselected.
         */
        ids = action.ids
        selected = this.state.selected
        if (state.accordion) {
          ids = xSet(ids).first()
          selected = selected.AND(ids)
        }
        newState.selected = selected.XOR(ids)
        break
      default:
    }

    return { ...state, ...newState }
  }

  render() {
    // enhance the section contents so we can track clicks and show sections
    const children = React.Children.map(this.props.children, child => {
      const id = child.props.id
      // return a cloned Section object with click tracking and "active" awareness
      return React.cloneElement(child, {
        key: id,
        // private attributes/methods that the Section component works with
        isSelected: this.isSelected(id),
        onToggle: id => this.handleToggle(id)
      })
    })

    return <div className={this.props.className}>{children}</div>
  }
}

Accordion.propTypes = {
  children: PropTypes.node
}

/**
 * Made with composability in mind:
 * It's just a div that holds children.
 * And its only purpose is to show/hide children keepeing
 * the first one always shown. This gives all the power
 * to the user: add whatever you like as the first child and
 * whatever you like as other children! E.g. title
 * (the first child) of accordion section can be quite
 * complex react element, not just text.
 */
export class AccordionSection extends Component {
  visibleChildren() {
    if (this.props.isSelected) {
      // expand: show all the children
      return this.props.children
    } else {
      // collapse: show only the first child which serve as
      // unhidable title element
      return React.Children.toArray(this.props.children).slice(0, 1)
    }
  }

  render() {
    return (
      <div
        className={this.props.className}
        onClick={() => this.props.onToggle(this.props.id)}
      >
        {this.visibleChildren()}
      </div>
    )
  }
}
