# Chapter 5: Star Trek Video Game Demo

This isn't a book about project organization. There are some conventions that are starting to materialize. You can learn more here: Khan Academy link

By now, we'be already gone through most of the important parts of React's API. It's API foot print is actually quite narrow compared to some other frameworks but as the Roman prover says: "The fox has many tricks. The hedgehog has one good one."

We're going to get started building out Star Trek video game. Once we're finished, it will look something like this:

![finished demo](../images/01_finished_demo.png)

By the end of the tutorial, the game should render a star chart with star systems colored by faction as well render the image of your starship at the current position of the starship. You should be able to chart a course by selecting a star system on the star chart, or you can search a star system under the "Course Control" panel under "Helm Control". You should be able to set the name of your ship and your crew by clicking on the name. Also, you should be able to select the warp factor for your starship and engage the warp engines, which will begin the movement of the starship to it's current destination. During travel, the "Navigation" panel will display your current destination, heading, and position.

## Setup

Requirements:
* [Git](https://git-scm.com/downloads)
* [Node.js](https://nodejs.org/en/)
    * NVM is the easiest way to manage Node. [Its setup instructions here](https://github.com/creationix/nvm#installation). Then run `nvm install node && nvm alias default node`, which installs the latest version of Node.js and sets up your terminal so you can run it by typing `node`. With nvm you can install multiple versions of Node.js and easily switch between them.
    * New to [npm](https://docs.npmjs.com/)?

If you have not already done so, clone the [demo repository](https://github.com/freddyrangel/react-under-the-hood) for this tutorial. This book is not about setting up a development environment so it is highly recommended you follow along in the demo repository.

There are two main directories: `finished` and `unfinished`. You will be following along in the `unfinished` directory. `finished` is available if you are stuck or want to skip ahead. Be warned however that copy and pasting from `finished` may not always work since it represents the end state of the game. If you copy code from `finished`, it is possible that code depends on other code that is not going to be added until later in the tutorial.

That said, go ahead and `cd` into `unfinished` and run `npm i`. This will install all the dependencies required for this demo. Once that is finished, you can start the server by running `npm start` and navigating to `localhost:4000` in your browser.

## Tooling:

A little bit about tooling. We are using Webpack for managing everything other than dependencies. Webpack combines a build system like Gulp/Grunt with the functionality of Browserify and has plugins for running a development server, among many other things. Unlike Browserify, Webpack understands more than one module loading system. For this book, we are going to use CommonJS modules. 

We are using Babel.js to compile our JSX code, which would allow us to use ES2015 if we wanted to. We are going to stay away from ES2015 for this tutorial since it is not universally understood by all JavaScript developers as of today. However, ES2015 works really well with React and is worth exploring on your own.

## HelloWorld

Let's start by creating a simple "Hello, World!" example. The entry point to our app is set up to be `unfinished/app/index.jsx` so we are going to start there.

```javascript
# unfinished/app/index.jsx

require('./main.css');
var React    = require('react');
var ReactDOM = require('react-dom');
var Game     = require('./components/Game.jsx');

var appNode = document.createElement('div');
appNode.className = 'react-game';
document.body.appendChild(appNode);
ReactDOM.render(<Game />, appNode);
```

One of the first things you may notice is that we are requiring a CSS file. Webpack allows you to require CSS files. This allows developers to modularize CSS the same way we can modularize JavaScript. We are going to do that here for convenience.

Below that we are requiring the React library as is expected, however we are also requiring ReactDOM. That might be a little confusing but there is a very good reason why React and ReactDOM are seperate libraries. Under the hood, React just holds a virtual representation fo your UI. This means React can abstract any type of UI, not just a web UI. React can now be found in Android and iOS applications via React Native, we well as canvas and even the terminal. Since we are using a web implementation of React, we need to require ReactDOM.

We are creating a `div` on which we will render our React application. This is generally a good practice. It gives us the flexibility to add other content on the page other than our React application. On `ReactDOM.render(<Game />, appNode);` we are rendering our `Game` component onto `appNode`. At the moment, `Game` does not exist yet. If you are attempting to view the result in the browser, all you will see is a blank blue screen.

Let's create this component. Create a file under `unfinished/app/components/Game.jsx` and add the following:

```javascript
# unfinished/app/components/Game.jsx

var React = require('react');

module.exports = React.createClass({
  render: function() {
    return <h1>Hello, World!</h1>
  }
});
```

At this point, if you navigate to `localhost:4000` you should see this:

![hello world](../images/02_hello_world.png)

This is something like a pre-flight check to make sure everything is set up correctly before we move on.

Let's talk about exactly what is going on here. In `Game.jsx` we are exporting a component with a very simple `render()` function. You may recall that JSX does not return actual DOM element but rather it transforms into React's API for creating Virtual DOM elements. In this case, it will become `React.createElement('h1', {}, 'Hello, World!')`.

Then, in `index.jsx` we will render `<Game />` to the DOM. JSX will infer the name of a component based on the name of the variable that contains it. If we changed `Game` to `Cats` the application would still render correctly.

## Star Chart

Now let's begin by rendering a star chart. Star system data is already available for you under `unfinished/app/data/StarData.js`.

We are going to render the star chart using SVG. There are a few really good reasons for this. SVG allows us to draw circles for star systems. Charting libraries like D3.js also use SVG, allowing us to use D3 later if we want to resize the chart. In addition, React supports most SVG elements, except for a few key exceptions.

We are going to create an SVG element that is 1000px X 600px. Then, we are going to map over all the star system data and render an SVG `circle` (representing the star system) and `text` element with the name of the system. Then, we will use the jurisdiction of the star system as the circle's class name so we can easily color each star system.

Let's create our `StarChart` component under `unfinished/app/components/StarChart.jsx`.

```javascript
# unfinished/app/components/StarChart.jsx

var React = require('react');
var Stars = require('./Stars.jsx');

module.exports = React.createClass({
  render: function() {
    var props = this.props;
    return (
      <div className="star-chart">
        <svg width="1000" height="600">
          <Stars starData={props.starData}/>
        </svg>
      </div>
    );
  }
});
```
You may be wondering why we are using `className` instead of `class` to set an elements class. That is because `class` is a reserved word in JavaScript. Since JSX is really just JavaScript, we cannot use `class`. Also, `className` is the DOM API for setting and retrieving the class of a DOM element in JavaScript, so React uses `className` for consistency.


Within our `StarChart` component, we are rendering a `Stars` component who's job it will be to render the stars. We are passing `starData` as `props` to `Stars`.

Let's go ahead and create our `Stars` component

```javascript
# unfinished/app/components/Stars.jsx

var React = require('react');

module.exports = React.createClass({
  render: function() {
    return (
      <g>
        {this.props.starData.map(this.renderStars)}
      </g>
    );
  },

  renderStars: function(star, index) {
    var circleAttr = {
      cx: star.position[0],
      cy: star.position[1],
      r: 2,
      className: 'star-circle'
    };
    var textAttr = {
      x: star.position[0] + 5,
      y: star.position[1] + 5,
      className: 'star-name' + ' ' + star.jurisdiction
    };
    return (
      <g key={index}>
        <text {...textAttr}>
          {star.name}
        </text>
        <circle {...circleAttr}></circle>
      </g>
    );
  }
});
```

Let's take a look at our new `render()` function. The `g` in SVG is a container used to group  can be thought of as something akin to a `div` but not quite the same. Here we are using `g` in very similar way we would use a `div`, to contain related elements in one parent element. Inside of this `g` we are maping over our `starData` (which was passed in by the parent `StarChart` as a `prop`) and rendering a circle and text element for each star system. 
Let's take a look at our new `render()` function. The `g` in SVG is a container used to group objects. It can be thought of as something akin to a `div`. Here we are using `g` in very similar way we would use a `div`, to contain related elements in one parent element. Within this `g`, we find a set of curly braces with a JavaScript expression. Curly braces is JSX allow us to execute JavaScript expressions in a manner very similar to Handlebars.

There we are maping over our `starData` (which was passed in by the parent `StarChart` as a `prop`), passing a function called `renderStars`. This function will return an SVG `circle` and a `text` element with the name of the system. As mentioned in a prior chapter, a list of sibling elements should have a unique key as an attribute, allowing React to greatly improve the performance of transforming a large list. Here, we are using the index of the star system within the array.

In addigin, our `renderStars` function is setting up the attributes for our circle and text elements in an object. By doing it this way, we can use the [spread operator](https://facebook.github.io/react/docs/jsx-spread.html) to expand that object into arguments using the `...` syntax. The spread operator is supported by JSX and is supported for arrays in ES2015. It is also proposed for objects in ES2016. The equivalent expression would look something like this:

```
<text x={star.position[0] + 5} y={star.position[1] + 5} className={'star-name' + ' ' + this.jurisdictionToClassName(star)}/>
```

But with the spread operator, we can easily set up the arguments for our element elsewhere and pass it in with a much cleaner syntax.

At this point, you may have asked yourself why are we wrapping `starData` in a `g` element in our `render()` function. It seems unnecessary. In fact, it's very much necessary -- it will not work without it. Since React abstracts the DOM via JavaScript, we cannot return sibling elements without it wrapped in a parent element. This is a limitation of the language since JavaScript functions have only one return value. Therefore, anything returned in our `render()` function must resemble a tree with one parent node at the very top. Without this `g` element, our component will result in an error.


Finally, we need to render the `StarChart` in the `Game` component, as well as the `starData`.

```
# unfinished/app/components/Game.jsx
var React = require('react');
var starData = require('../data/starData');
var StarChart = require('./StarChart.jsx');

module.exports = React.createClass({
  render: function() {
    return <StarChart starData={starData} />
  }
});
```

In `Game`'s `render()` function, we are going to get all the star data and then pass that into the `StarChart` as `props`. This is the ideal way of building a React component. You start with the child component you want to build and require data that you don't have yet, and then in the parent component figure out how to get that data to the child component. In that respect, it's similar to TDD (Test-Driven Development) in that you're starting with tests for the code you wish you had, then you write the code itself.

Now if we take a look at our browser, we should the star chart:

![star chart](../images/03_star_chart.png)

The different colors represent different factions in the Star Trek Universe. In case you are wondering:

* Federation: Aqua
* Romulan Empire: Red
* Garidian Republic: Pink
* Elorg Bloc: Purple
* Cardassian Union: Teal
* Tzenkethi Coalition: Orange
* Klingon Empire: Violet
* Independent: Grey

## Starship

Now that we have a star chart, we can create a ship and render it's position of the map. Let's create a constructor for a ship in `unfinished/app/data/Ship.js`. 

```javascript
# unfinished/app/data/Ship.js

module.exports = function() {
  this.info = {
    shipName: null,
    captain: null,
    firstOfficer: null,
    chiefEngineer: null,
    tacticalOfficer: null,
    helmsman: null
  };

  this.position = [500, 300];

  this.destination = {
    name: 'Sol',
    position: [500, 300],
    jurisdiction: 'Federation'
  };

  this.speed = 0;
};
```

Now let's create this ship in `Game.jsx` and pass it down to our `StarChart`.


```javascript
# unfinished/app/components/Game.jsx

var React = require('react');
var starData = require('../data/starData');
var StarChart = require('./StarChart.jsx');
var Ship = require('../data/Ship.js');

module.exports = React.createClass({

  getInitialState: function() {
    return { ship: new Ship() };
  },

  render: function() {
    var ship = this.state.ship;
    return <StarChart starData={starData} ship={ship}/>
  }
});
```
Again, `getInitialState` can be considered a constructor method for a React component much like a class in traditional OOP. Here we can set the intial state of the component on it's very first render. Remember, React components manage their own internal state. Ideally, you want to put as much data into `props` as possible, but data that needs to change or initialized somehow will probably be placed in `state`. To access the ship data, we call `this.state.ship`. We will pass that ship to `StarChart` as props. If we ever need to access the ship in `StarChart` or any other direct child component of `Game`, we can have access to it by passing into those components as `props`.

```javascript
# unfinished/app/components/StarChart.jsx

var React = require('react');
var Stars = require('./Stars.jsx');
var StarshipRenderer = require('./StarshipRenderer.jsx');

module.exports = React.createClass({
  render: function() {
    var props = this.props;
    return (
      <div className="star-chart">
        <svg width="1000" height="600">
          <Stars starData={props.starData}/>
          <StarshipRenderer ship={props.ship}/>
        </svg>
      </div>
    );
  }
});
```

The only addition to this component is the `StarshipRenderer` component which will be in charge of figuring out how to render a starship. If we had multiple ships we could re-use this component to render those ships. `StarChart` has access to the ship as `props`, which will then also pass ship to `StarshipRenderer` as `props`. We can access props via `this.props`.

Remember, `props` should be treated as immutable. So in the `StarChart` component, there is no state to speak of. It is a stateless component. It is basically an idempotent function. Given certain data, it is guarenteed to always return the same value. Now let's create our `StarshipRenderer` component. 

The point of this tutorial is to show how React works under the hood and to give you as the developer a deep understanding of where things work and when they do not. React supports all HTML tags and most SVG tags. One SVG tag which we need but isn't supported is an SVG `image` tag. (Update: as of React 0.14, the SVG `image` element is now supported).

Under the hood, React uses `setInnerHTML` to update a DOM node. Normally, React abstracts this from the application developer. But in this case, we need to tell React how to render an SVG image. React gives you an ability to do that with `dangerouslySetInnerHTML`, aptly named to warn the developer that you can potentially open your application to a cross-site scripting attack. This is safe to use as long as you're not deriving the value of the `innerHTML` via unsanitized user input. Check out this article to learn more: [Dangerously Set innerHTML](https://facebook.github.io/react/tips/dangerously-set-inner-html.html)

All that is required is to create an image string and derive the coordinates based on the ship position.  We are abstracting exactly how we come up with this string because of the complicated trigonometry necessary, but you can take a look at how we are doing it if you are curious.

As a side note, React loves to use strongly worded method names and variables to warn developers. Here is an funny one from the React source code: [SECRET_DOM_DO_NOT_USE_OR_YOU_WILL_BE_FIRED](https://github.com/facebook/react/blob/b2ca3349c27b57b1e9462944cbe4aaaf76783d2b/src/React.js#L67)

```javascript
# unfinished/app/components/Starship.jsx

var React         = require('react');
var starshipImage = require('../utilities/starshipImage.js');

module.exports = React.createClass({

  render: function() {
    return (
      // React does not support SVG Image elements. We need to do this ourselves
      <g dangerouslySetInnerHTML={this.renderImage()}></g>
    );
  },

  renderImage: function() {
    var imageInText = starshipImage.renderImageElementAsString(this.props.ship);
    return {__html: imageInText};
  }
});

```

`dangerouslySetInnerHTML` requires an object with `__html` as the key and your DOM element string as the value. Now our cute little ship is on the star chart.

![star chart with starship](../images/04_star_chart_with_starship.png)

## Ship Info

It's great that we are displaying an accurate representation of the Alpha Quadrant with a early version of the USS Enterprise. However, we want to update the name of our starship, along with the members of our crew. 

Let's begin creating a component allowing us to do just that. We are going to start by rendering a `HelmControl` component in `Game`.

```
# unfinished/app/components/App.jsx

var App = React.createClass({
...

  render: function() {
    var ship  = this.state.ship;
    var stars = Stars.getStarData();
    return (
      <div>
        <StarChart
          starData={stars}
          ship={ship} />
        <div className="helm">
          <div id="helm-header">
            <h1>Helm Control</h1>
          </div>
          <ShipInfo ship={ship} updateShip={this.updateShip} />
        </div>
      </div>
    );
  },

  updateShip: function(ship) {
   this.setState({ship: ship});
  },
});

module.exports = App;
```

We're going to create a "helm" element with the `ShipInfo` component inside it. We could create a `Heml` component instead, but we're going to create quite a few components here. For learning purposes we're going to avoid nesting our components too far down, but if you wanted to add other components like a communication panel, you would certainly want to create a `Heml` component to encapsulate that functionality.

We're passing the ship to `ShipInfo`, but we're also passing in the `updateShip` method as well. Since data in React is unidirectional, changes to `this.state.ship` can only occur where that state lives, which in this case is `App`. Therefore, we need to pass a method to our child components if we want to update the state.

If you're observant you may have noticed that when `updateShip` gets called in the child component, the value of `this` would have changed. React automatically binds methods in it's components to it's current value of `this`, avoiding needless repetition.

Inside `updateShip`, we are taking a new ship as an argument, which we will then update the current state of the ship to equal the one passed in as an argument. Updating the state via `setState` tells React that the state has changed, triggering a re-render. 

As was mentioned before, all abstractions leak, and this is one place where the Virtual DOM leaks. We have to notify our system that our state has changed. If JavaScript were truly reactive, the value of our new state would be updated automatically. But like most things in life, there are few things that are always a complete win -- everything is a tradeoff. While we do have to explicitly tell React about state changes, we know that once that state changes are app will resemble a static system. Our whole app is essentially a state machine, with all our components automatically snapping into place when the state of the world has changed.

Let's create a `ShipInfo` component which will be in charge of rendering the ship info and updating it.

```
# unfinished/app/components/ShipInfo.jsx

var ShipInfo = React.createClass({
  render: function() {
    var ship = this.props.ship;
    var info = ship.info;
    return (
      <div className="ship-info">
        <h2>Ship Info</h2>
        {this.renderElement('shipName', info.shipName, 'Ship Name')}
        {this.renderElement('captain', info.captain, 'Captain Name')}
        {this.renderElement('firstOfficer', info.firstOfficer, 'First Officer')}
        {this.renderElement('chiefEngineer', info.chiefEngineer, 'Chief Engineer')}
        {this.renderElement('tacticalOfficer', info.tacticalOfficer, 'Tactical Officer')}
        {this.renderElement('helmsman', info.helmsman, 'Helmsman')}
      </div>
    );
  },

  renderElement: function(keyName, item, defaultValue) {
    return (
      <EditableElement
          keyName={keyName}
          item={item}
          defaultValue={defaultValue}
          onEdit={this.updateShipInfo}/>
    );
  },

  updateShipInfo: function(key, newValue) {
    var ship = this.props.ship;
    ship.info[key] = newValue;
    this.props.updateShip(ship);
  }
});

module.exports = ShipInfo;
```

`ShipInfo`'s `render` function is returning a list of `EditableElement` components which will display a piece of data and edit that data when clicked. We're taking a rather naive approach to rendering the `EditableElement`s. If the names of the keys for the ship info changes we would have to change this component as well. This is fine for now.

```
# unfinished/app/components/EditableElement.jsx

var EditableElement = React.createClass({
  getInitialState: function() {
    return { editing: false };
  },

  render: function() {
    return this.state.editing ? this.renderEdit() : this.renderValue()
  },

  renderValue: function() {
    var props = this.props;
    return <p onClick={this.enterEditState}>{props.item || props.defaultValue}</p>
  },

  enterEditState: function() {
    this.setState({ editing: true });
  },

  renderEdit: function() {
    return (
      <input type="text"
        autoFocus="true"
        defaultValue={this.props.item}
        onBlur={this.finishEdit}
        onKeyPress={this.checkEnter} />
    );
  },

  checkEnter: function(e) {
    if (e.key === 'Enter') {
      this.finishEdit(e);
    }
  },

  finishEdit: function(e) {
    var keyName = this.props.keyName;
    var newValue = e.target.value;
    this.props.onEdit(keyName, newValue);
    this.setState({editing: false});
  }
});

module.exports = EditableElement;
```

This component has two states: editing and non-editing. When editing is true, it will render an input field which will watch for the "Enter" key and for clicking out of the input field, which will then trigger an update up the input value. When editing is false, it will just render the value of the ship info.