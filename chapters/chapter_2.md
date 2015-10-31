# Chapter 2: Key Concepts

Now we are going to take a deep dive into some of React's core concepts from an intellectual standpoint. There will be little actual code involved, just enough to get a point across. Once we have a better understand about React's way of thinking, we can get started building our Star Trek video game. By then we should have a better understanding of how React works under the hood.

## How Does React Views the World?

React goes against many things we have considered to be best practices in front-end web development. As mentioned in the last chapter, React sees single page applications as a series of nested UI components. Therefore, React is primarily concerned with the presentation layer of an application. Since client-side applications are just UI components, React just cares about rendering those components to the user.

For many, this leads them to conclude React is simply the "V" in "MVC". This is somewhat misleading. While you _could_ make React the view layer of an MVC architecture, that would negate many of the benefits of using React. It's philosophy mostly rejects MVC/MV* in the browser. Why is that and what should replace it?

MVC is actually an excellent idea for the server. Given the success of MVC on the server, it's no wonder why we have been trying to use it on the browser. As browser JavaScript engines started getting better along with the rise of excellent user experiences found in native applications, we increasingly started pushing data and behavior from the server to the client. This was a great step forward for the web, but as web developers this lead us scrambling to find ways to work in the hostile browser environment. So, we took the ideas that served us well on the server and applied them to the browser.

This was an improvement from what we had before, much like how jQuery took us forward as a community as well. And while it sounded like a good idea to use MVC to separate concerns on the browser, in practice that environment is very different from the server. Many mistakes in history have been made by well intentioned people making decisions based on what seemed like a good idea at the time -- and at the time, MVC in the browser seemed like a good idea. After all, it worked well on the server. What could go wrong? The problem with forcing MVC on the browser is that we're trying to separate concerns that are inextricably linked.

MVC makes sense in the stateless environment of HTTP and webservers but it makes less sense in single page applications. That's because unlike the server environment, the browser is full of state. The server is concerned with requests and responses, but the browser is a user interface with a lot of events and user interaction. MVC on the browser tries to separate things that actually belong together, which in turn obscures the state of an application.

What this means is when bugs arise (and they will), it can be very difficult to determine exactly what is the cause of the problem. For example in Angular, when there is a bug it is relatively difficult to determine its root cause. That's because state is shared among many different parts of an MVC architecture. You're not sure if the bug is in a controller, a view, a model, a directive, a directive controller, etc. It becomes difficult to track where messages are being passed in an Angular app, because as an Angular app grows, the number of directions messages can travel grows exponentially.

## How To Separate Concerns: Write Components, Not Templates

React thinks that you should stop writing templates: you should be writing components. This means we need to stop separating out HTML from our JavaScript.

This goes against everything we have come to believe in the JavaScript community. In fact, the above statement is enough for many to dismiss React. For just a moment, let us set aside dogma and analyze the issue as if approaching it for the first time.

React asserts markup and display logic are inextricably linked. Whenever you change markup, you are bound to affect the behavior you wrote in JavaScript. And when you change the behavior, you are undoubtedly going to update the markup. That is not always the case, but that is a concern. This looks a lot like tight coupling in a system. By trying to separate a UI between templates and controllers/view-models, we are not separating concerns -- were separating technologies. 

Before we continue, we should define what "separation of concerns" means. Separation of concerns is really about reducing coupling while simultaneously increasing cohesion. Coupling is how much pieces of a system depend on each other, while cohesion do pieces individual pieces of a system belong together. Templates and controllers have implicit agreements among themselves meaning if you change one, might have to change the other, leading to cascading changes. This is coupling. So by separating markup and display logic, you are actually increasing coupling throughout your system. Meanwhile, you are also decreasing the amount of cohesion in your application. Display logic and markup are very cohesive -- they are both concerned with showing the UI to the user. By separating them, you are reducing cohesion and the developer's ability to reason about the structure of the application.

To truly separate concerns, you should be writing components. Frameworks cannot separate concerns for you. You can do a much better job of separating concerns yourself. You seperate concerns by creating small components responsible for rendering just a small piece of the UI. Displaying a piece of the UI is now encapsulated in one place. Such a component is both decoupled from the rest of your system and cohesive.

In addition, small components are reusable, composable, and above all, unit testable. Essentially, components are idempotent functions that when given a set of data will always return the same UI result, making them much easier to test. React essentially introduced functional programing to the UI.

Let's take a look at what a component looks like in React. Here's a small example.

```javascript
var HelloWorld = React.createClass({
  render: function() {
    return <h1 className="header">Hello, World!</h1>
  }
});
```

The first thing you will most likely notice is what looks like HTML in our JavaScript. It is not actually HTML. This is JSX. It is syntactic sugar on top of plain JavaScript that makes it easy to declare markup. When compiled to regular JavaScript, it will look like this:

```javascript
var HelloWorld = React.createClass({
  render: function() {
    return React.createElement('h1', {className: 'header'}, 'Hello, World!')
  }
});
```

JSX is not needed to work with React, but using it makes it much easier to create components that are semantic and easy to understand at a glance. These days, most JavaScript projects are using some kind of build system and perhaps using that build system to use ES2015, so adding a small compilation step for JSX is trivial in comparison. In fact, Babel.js supports JSX.

We are passing a `render` method in an object to `React.createClass` to create the `HelloWorld` component. `render` is the most important method in React. It is the heart of a React component. `render` gets called every time the React components gets rendered to HTML.

It is important to point out that `render` does not return an `h1` -- it will return an in memory representation of a DOM node that will eventually be used to create an in memory representation of the current state of the DOM, the Virtual DOM. More about that in a minute.

Now that we have this component, we can reuse it elsewhere:

```javascript
var Header = React.createClass({
  render: function() {
    return (
      <div>
        <HelloWorld />
        <h2>React all the things!</h2>
      </div>
    );
  }
});
```

Above we created a new `Header` component that is reusing the `HelloWorld` component. Instead of using a template partial, we can simply reuse components anywhere we like. We have the accessibility of templates with the power of JavaScript. You can write your whole app in JavaScript and function calls that look like markup, allowing you to clearly refactor without worrying about breaking your templates or vice versa.

But this is still a pretty small example without any data, state, or behavior. Let's dive into how React thinks about all those things.

## Data Binding

User interfaces are very difficult to build due to the amount of state found in it. State is the root of all evil. All this state in user interfaces intertwines to create a complex system that is very difficult for humans to understand.

Why is state so hard to understand? Essentially, state is your data at any given point in time. In other words, state is data that changes over time -- it's mutable. Human brains, it turns out, are not very well geared toward reasoning about systems that change over time. We are masters of understanding static relationships and have no problem keeping those relationships in our brains. However, we have a really hard time at keeping track of dynamic relationships that change over time. When data is constantly in flux, we humans have a hard time trying to reason about exactly what is going on at any given point in time.

So how do we as programmers master state in user interfaces? Traditionally, we have done this via data binding. This helps transform a dymanic process into a more static one. Data binding makes the UI look more like a static program relative to our data. In other words, data binding syncs UI state with a data model.

Data binding is one of many great ideas to come from the 1970's but in JavaScript it is not perfect. The problem with data binding in JavaScript is that it is a polyfill for reactive programming in the DOM. What do we mean by that?

Reactive programming deserves it's own book, so we will not talk about it too much in this book. Reactive programming is a little difficult to grasp at first, but it is basically programming with asynchronous data streams. Unfortunately, JavaScript is not actually reactive. Take a look at this very simple example:

```javascript
var a = 1;
var b = 1;
var c = a + b;
var a = 2;
```

In the above example, `c` will still equal 2 even after we change the value of `a`. If JavaScript were truly reactive, the value of `c` would be automatically be in sync with the sum of `a` and `b`. This is a very simple example. If you want to learn more about reactive programming take a look at this excellent resource: [The Introduction to Reactive Programming You've Been Missing](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754).

Needless to say, this is not necessarily a mistake or bug in the language, but it does present an obstacle if we want a reactive implementation of JavaScript in the DOM. In order to achieve this, most JavaScript frameworks implement some form of data binding. 

This is not a trivial abstraction on top of JavaScript, and like all abstractions, these implementations leak. The difference is how leaky they are, when do they leak, and how easy is it to spot and fix the leak.

Pretty much every JavaScript frameworks uses Key-Value Observation (KVO) for data binding (most prominently Ember and Meteor) except Angular (which uses dirty checking). We will not dive into too much detail into these systems in this book. The main problem with these systems is they diverge too far away from something that looks a lot more like vanilla JavaScript. They also require deep understanding of the inner workings of these systems. 

Take Angular for example: a developer working on a non-trivial Angular application will need a deep understanding of the digest cycle. This is most apparent when attempting to test in Angular. Since the beggining, Angular claimed that it is easy to test. That is a lie. Testing in Angular is incredibly difficult. In order to create a simple unit test, you need to stub out a large portion of the framework. This requires a deep understanding of how dependency injection works in Angular, and when to use `$scope`, `$watch`, and `$apply`. These are not simple abstractions, and they often break in mysterious ways that are not intuitive. You have to learn a lot about the framework's data binding system and how to fix it. And often times, the way to fix it is to go around the data binding system all together, which is it's own nightmare. In other words, you need to be deeply familiar with the Angular and it's pain points.

This is far from ideal. The ideal data binding system tries to stick to plain old JavaScript functions as much as possible, while giving you simple tools for reactivity. You should not have to think about how the data binding works. Leaks in the abstraction should be predictable every time and easy to solve. 

React fits this description almost perfectly. It's data binding system is not perfect, but those leaks are very well understood and predictable.

## Virtual DOM

React's approach data binding relies on much simpler abstractions: the Virtual DOM. Essentially, React's Virtual DOM system abstracts the DOM by keeping a virtual representation of the DOM in memory and whenever the data model changes, React triggers a re-render of the components that rely on that data.

At a high level, React give you tools to describe what your component should look like at any given time. So, whenever the state changes, React will begin re-rendering the component that contains that state, diff the previous virtual representation of the DOM with the new virtual representation, and only update the DOM with what actually changed. You as a developer do not need to worry about how this really works, you just need to describe what your component looks like and let React know when your state has changed. That being said, we will dive deeper into React's Virtual DOM diff algorithm shortly.

Let's look at a very simple example and see how this works in detail. You can play the code here: [Demo](http://codepen.io/anon/pen/VvrqxO)

```javascript
var Cat = React.createClass({
  getInitialState: function() {
    return { name: null };
  },
  
  render: function() {
    return (
      <div>
        <p>Your cat's name is: {this.state.name}</p>
        <input type="text" onChange={this.updateName} />
      </div>
    );
  },

  updateName: function(event) {
    this.setState({name: event.target.value});
  }
});
```

You can figure out what this simple example does yourself without much need for explanation. First, we are setting the initial state of the component in `getInitialState`. You can think of this method like a constructor function for the component, where we are setting the default value of `name` to null. `getInitialState` is not required for every React component, just like a constructor function is not always needed to create a class in Object Oriented Programming.

Then we are describing what our component will look like in the `render` method. We can access the current state of the component via `this.state`. Inside of `render`, we are returning the current state of the cat name via `this.state.name`. We are also rendering an input field to the user to change the name of the cat.

Notice we are adding an event handler to the input field using `onChange={this.updateName}`. Whenever there is a change to the input field, `updateName` will be called. `updateName` calls a special React method called `setstate`. If `render` can be considered the heart of a component, `setState` can be considered the brain. `setState` will update the value of the data in the components state, which in turn will trigger a re-render of the app. 

If you type in the letter "M" into the input field, `updateName` will be called, which will grab that value from the input field and update the state of the cat name with `setState`. React will then call `render` on `Cat` again with the new state. It will create two virtual representations of the DOM: the old DOM and the new DOM. It will batch all updates together and figure out the most optimal DOM mutations necessary to reach the new state of the UI.

By the time you are finished typing "Mittens", React would have triggered numerous re-renders on `Cat`. On the surface, this seems like it would be slow. In fact, this design decision makes React extremely fast. Because this is all done in JavaScript, this is all performed within one repaint of the browser. Even in the worse case senario involving tens of thousands of DOM mutations, React will perform a re-render withing the repaint time of the browser. This is due to the speed of modern JavaScript engines and React's clever diffing algorithm, which we will go into more detail shortly.

## Data in React

In addition to the Virtual DOM, React treats data differently from other JavaScript projects like Angular or Ember. React separates data that changes over time (state) from data that stays the same. It does this via two concepts: `state` and `props`. `state` is data that will change over time such as user interaction.

Components should strive to contain as little state as possible. However, sometimes a component needs to respond to external events such as user interaction, a server request, or the passage of time. For that kind of data, components should keep that in `state`. For data that will not change, components should keep that in `props`.

React receive `props` from a parent component. By relying on props, a component essentially becomes an idempotent function. React sees components as functions, therefore it forces data to only flow from parent to child. Just like a function, data should flow into it as arguments. Data always flow just one way in React from parent to child.

Unidirectional data flow limits the messages and data being passed inside the system, making it easier to debug. Since data can only pass from parent to child, it is easy to trace the flow of data in your system. When you come across a bug, first you look at the component you think is causing the bug. If you can't find it there, you turn to it's parent and so on until you find the culprit. In an MVC pattern, since messages travel all over the place, it is much more difficult to figure out the flow of your data.

Let's take a look at an example of `state`, `props`, and unidirectional data flow. You can follow along here: [Demo](http://codepen.io/anon/pen/OyzowP).

```javascript
var AnimalRescue = React.createClass({
  getInitialState: function() {
    return { catCount: 0, dogCount: 0 }
  },

  render: function() {
    return (
      <div>
        <ul>
          <Cats count={this.state.catCount}/>
          <Dogs count={this.state.dogCount}/>
        </ul>
        <button onClick={this.moreAnimals}>Save more animals</button>
      </div>
    );
  },

  moreAnimals: function() {
    var catCount = this.state.catCount + 1;
    var dogCount = this.state.dogCount + 1;
    this.setState({
      catCount: catCount,
      dogCount: dogCount
    });
  }
});

var Cats = React.createClass({
  render: function() {
    return (
      <li># of Cats: {this.props.count}</li>
    );
  }
});

var Dogs = React.createClass({
  render: function() {
    return (
      <li># of Dogs: {this.props.count}</li>
    );
  }
});
```

In this simple example, the number of dogs and cats changes over time. This is the state that we will store in the `AnimalRescue` component. `AnimalRescue` will only be in charge of keeping track of the state of `catCount` and `dogCount` as well as rendering the `Cats` and `Dogs` component and a button to change the number of animals. We can access that state within the `AnimalRescue` component by calling `this.state`. From a `Cats` and `Dogs` perspective, they receive the animal count as immutable `props` which they can access from `this.props`. As far as `Cats` and `Dogs` is concerned, the number doesn't matter. They only care about displaying that data to the user.

When the button is clicked, `this.moreAnimals` is called, which is in charge of calculating the new state and updating the state via `this.setState`. Once `setState` is called, React nows that the state has changes and figures out which parts of the UI need to change. If there is a bug anywhere, you can quickly identify which component is coming from and trace the flow of the data to find the root cause of the bug.

You may have spotted a refactoring opportunity here. Because React sticks to regular JavaScript as much possible and components are idempotent, you can easily refactor your code and create reusable components.

```javascript
var AnimalRescue = React.createClass({
  getInitialState: function() {
    return { catCount: 0, dogCount: 0 }
  },

  render: function() {
    return (
      <div>
        <AnimalCount catCount={this.state.catCount} dogCount={this.state.dogCount}/>
        <button onClick={this.moreAnimals}>Save more animals</button>
      </div>
    );
  },

  moreAnimals: function() {
    var catCount = this.state.catCount + 1;
    var dogCount = this.state.dogCount + 1;
    this.setState({
      catCount: catCount,
      dogCount: dogCount
    });
  }
});

var AnimalCount = React.createClass({
  render: function() {
    return (
      <ul>
        <AnimalListItem animalName="Cats" count={this.props.catCount} />
        <AnimalListItem animalName="Dogs" count={this.props.dogCount} />
      </ul>
    );
  }
});

var AnimalListItem = React.createClass({
  render: function() {
    return (
      <li># of {this.props.animalName}: {this.props.count}</li>
    );
  }
});
```

Now AnimalRescue only cares about state, behavior, and delegating rendering of animal count to the `AnimalCount` component. `AnimalCount` only worries about rendering an unordered list of animal data. Rendering of the list items is delegated to the `AnimalListItem` component. This essentially turned our user interface into a state machine, with components that snap into place and react to state changes.

While this seems like a novel approach to data binding, it's actually not unique -- it is just new to web development. React took a look at another area of software development, the gaming industry, and brought those ideas to the web. Games have a lot in common with web based user interfaces. They're packed full of state (number of weapons, vehicles, sounds, events based on user interaction, etc ...) and tons of behavior that needs to be constantly recalculated and re-render the player at 60 frames per second. On top of that, you need to do all of this with tough hardware constraints and with consistent performance despite those hardware limitations. 

Indeed, the React lifecycle is very similar to the Doom 3 engine. In Doom, all the state of the game is kept at a high level container, then passes it to it's front-end components which contain the game logic, followed by the creation of an intermediate representation of the scene, which then gets translated into OpenGL operations and finally flushed out to the graphics card. React's frow is very similar: the state of the application lives in higher components which then gets passed down as immutable data to child components which actually house the behavior, then a Virtual DOM is created as an intermediate representation of the DOM, finally batching of the DOM mutations and updating the real DOM itself.
