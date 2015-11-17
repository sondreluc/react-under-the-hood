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

We are going to render the star chart using SVG. React supports most SVG elements, except for a few which we will go into later. We are going to create an SVG element that is 1000px X 600px. Then, we are going to map over all the star system data and render an SVG `circle` (representing the star system) and `text` element with the name of the system. Then, we are also going to use the jurisdiction of the star system as the circle's class name so we can easily color each star system.

Let's create our `StarChart` component under `unfinished/app/components/StarChart.jsx`.

```
# unfinished/app/components/StarChart.jsx

var StarChart = React.createClass({
  render: function() {
    var props = this.props;
    return (
      <div className="star-chart">
        <svg width="1000" height="600">
          {props.starData.map(this.renderStars)}
        </svg>
      </div>
    );
  },

  renderStars: function(star) {
    var circleAttr = {
      cx: star.position[0],
      cy: star.position[1],
      r: 2,
      className: 'star-circle'
    };
    var textAttr = {
      x: star.position[0] + 5,
      y: star.position[1] + 5,
      className: 'star-name' + ' ' + this.jurisdictionToClassName(star)
    };
    return (
      <g key={star.id}>
        <text {...textAttr}>
          {star.name}
        </text>
        <circle {...circleAttr}></circle>
      </g>
    );
  },

  jurisdictionToClassName: function(star) {
    var jurisdiction = star.jurisdiction;
    return jurisdiction.toLowerCase().replace(/\s+/g, '-')
  }
});

module.exports = StarChart;
```

You may be wondering why we're using `className` instead of `class` to set an elements class. That's because `class` is a reserved word in JavaScript, and `className` is the DOM API for setting a class in JavaScript.

The curly braces in our return value for our `render` function allows us to run JavaScript expressions in our JSX code. There we're accessing the star data which will be passed into this component as props, and then mapping over that data to return an SVG `circle` and a text element with the name of the system.

In our `renderStars` function, we're setting up the attributes for our circle and text elements in an object. By doing it this way, we can use the [spread operator](https://facebook.github.io/react/docs/jsx-spread.html) to expand that object into arguments using the `...` syntax. The spread operator is supported by JSX and is supported for arrays in ES2015 and is proposed for objects is ES2016. The equivalent expression would look something like this:


```
<text x={star.position[0] + 5} y={star.position[1] + 5} className={'star-name' + ' ' + this.jurisdictionToClassName(star)}/>
```

But with the spread operator, we can easily set up the arguments for our element elsewhere and pass it in with a much cleaner syntax.

What's not clear from our code here is that we're dealing with two limitations of the React's diffing algorithm here. Firstly, we need to wrap our `circle` and `text` elements in a `g` element since React does not allow multiple return values for UI elements. Since JSX looks like HTML but is actually JavaScript, we need to wrap every JSX return value into one parent element, otherwise it won't work. Also, since we're returning multiple sibling star system elements, React needs a unique key for each sibling element to make insertions, substitutions, deletions, a O(n) operation with a hash map rather than a O(n^2) via other algorithms. The star systems already have a unique ID, so we're going to use that as our keys.

Next, we need to actually call this component in our `App` component.

```
# unfinished/app/components/App.jsx
var App = React.createClass({
  render: function() {
    var stars = Stars.getStarData();
    return <StarChart starData={stars}/>
  }
});

module.exports = App;
```

In `App`'s `render` function, we're going to get all the star data and then pass that into the `StarChart` as `props`. This is the ideal way of building a React component. You start with the child component you want to build and require data that you don't have yet, and then in the parent component figure out how to get that data to the child component. In that respect, it's similar to TDD (Test-Driven Development) in that you're starting with test for the code you wish you had, then you write the code itself.

Now if we take a look at our browser, we should see the following: