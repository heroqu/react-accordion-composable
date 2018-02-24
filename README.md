# React Accordion Composable

React component for Accordion.

Composable because it keeps itself decoupled from content of the Title and Body parts of the sections.

Here is the [demo](https://heroqu.github.io/react-accordion-composable-demo/).

## Table of Contents

* [Installation](#installation)
* [Credits](#credits)
* [Ideas](#ideas)
* [Usage](#usage)
  + [Basic example](#basic-example)
    - [Styling](#styling)
  + [Modes of operation](#modes-of-operation)
  + [Power features](#power-features)

## Installation

`npm install --save react-accordion-composable`

## Credits

The architecture and code of this component is greatly inspired and influenced by [Accordion example](http://jsfiddle.net/jhudson8/135oo6f8/) of [Joe Hudson](https://github.com/jhudson8)'s.
There I've learnt the elegant way of enhancing the props of child components. His code was the starting point and some chunks of his example have stayed almost untouched here.

## Ideas

`<Accordion>` element can hold several `<AccordionSection>` elements that can have a few child elements. The first child element inside each `<AccordionSection>` is treated as Title part and is always displayed, while child elements 2,3 etc. altogether are considered a Body part. Mouse clicking on any element inside a section toggles the visibility of its Body part.

This Accordion is called __composable__ because such a setup separates concerns: `<Accordion>` and `<AccordionSection>` stay basically unseen (unless enforced by css) with the only responsibility of hiding and showing whatever happen to be stuffed inside sections. The responsibility of providing the contents is handed entirely over the nested elements. I consider this to be a more __react-ish way__ of doing things as compared to when one would have to supply title and body texts through props and `<AccordionSection>` would also be responsible for displaying and styling those texts.

## Usage

### Basic example

```jsx
import { Accordion, AccordionSection } from 'react-accordion-composable'

// then inside react component:
// ...
render (
  <div>
    <h1>Accordion goes here:</h1>
    <Accordion>
      <AccordionSection id="1">
        <h3>Title 1</h3>
        <p>Body 1</p>
      </AccordionSection>
      <AccordionSection id="2">
        <div>
          <h3>Title 2</h3>
          <p>title 2 - continues</p>
        </div>
        <p>Body 2</p>
        <div>
          Body 2 - continues as next (sibling) child
          <p>and can be nested further as desired</p>
        </div>
      </AccordionSection>
    </Accordion>
  </div>  
)
```

This illustrates composability: the title part of section 2 is the first child element inside `<AccordionSection>` and whatever is there nested inside it is still the title part and going to be displayed.

The body part of section 2 is all the other child elements nested inside `<AccordionSection>`: its second and third children. Again, one can use as simple or as complex elements here as one likes.

#### Styling

One can use css classes on both `<Accordion>` and `<AccordionSection>`, as internally they are based on `<div>`-s:

```jsx
<Accordion className="someClass">
  <AccordionSection className="otherClass" id="1">
// ...
```

One can use `{ display: flex; }` for `<Accordion>` e.g. and the sections will obey.

### Modes of operation

Accordion component operates in two modes: `Accordion On` and `Accordion Off`. In the first mode no more then one section is expanded at a time and selecting a particular section collapses the previously expanded. In `Accordion Off` mode there is no control - each section can be collapsed or expanded independently.

### Power features

While `<Accordion>` component holds its state and operates on its own, one can _influence_ it from outside by sending it a 'message' through a `msg` prop. For example:

```jsx
<Accordion msg={ {
  actions: {type:'AccordionOff'},
  ts:'12345'
  } }>
```

Here we tell Accordion that it should switch to `Accordion Off` mode. The `ts` is a timestamp and whenever it changes the Accordion will know the new message came and it should read it and apply.

This message can be set once as an initialization, or, it can be _sent_ on a regular basis (see the [demo](https://heroqu.github.io/react-accordion-composable-demo/)) if the logic of bigger application needs to manipulate the accordion from outside by changing its mode and/or expanding/collapsing particular sections.

More then one action can be wrapped into a message at a time:

```jsx
<Accordion msg={ {
  actions: [
    {type:'AccordionOff'},
    {type:'SelectIds', ids: ['3']},
  ]
  ts:'78910'
  } }>
```

and the order of actions does matter.

This approach is pretty powerful, as it allows one to dispatch actions to Accordion from outside while keeping the Accordion decoupled from external state stores the main application can be using. There is a helper function to compose messages from actions with automatic time-stamping, and one can see a full fledged example in the [repo](https://github.com/heroqu/react-accordion-composable-demo) of the [demo](https://heroqu.github.io/react-accordion-composable-demo/)
