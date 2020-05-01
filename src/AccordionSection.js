import React from 'react';
import PropTypes from 'prop-types';

/**
 * Made with composability in mind:
 * It's just a div that holds children.
 * And its only purpose is to show/hide children keeping
 * the first one always shown. This gives all the power
 * to the user: add whatever you like as the first child and
 * whatever you like as other children! E.g. title
 * (the first child) of accordion section can be quite
 * complex react element, not just text.
 */
export const AccordionSection = ({
  id,
  isSelected,
  onToggle,
  className,
  children,
}) => {
  // first child plays role of a Title part
  // other children plays role of a Body part
  const [titleElement, ...bodyElements] = React.Children.toArray(children);

  const Title = titleElement || null;

  // wrap body elements in a div to suppress mouse click bubbling
  const Body =
    isSelected && bodyElements.length !== 0 ? (
      <div key="body" onClick={(e) => e.stopPropagation()}>
        {bodyElements}
      </div>
    ) : null;

  return (
    <div className={className} onClick={() => onToggle(id)}>
      {Body ? [Title, Body] : [Title]}
    </div>
  );
};

AccordionSection.propTypes = {
  children: PropTypes.node,
  id: PropTypes.string,
  isSelected: PropTypes.bool,
  onToggle: PropTypes.func,
  className: PropTypes.string,
};
