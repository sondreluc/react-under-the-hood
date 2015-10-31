# Chapter 2: Key Concepts

Now we are going to take a deep dive into some of React's core concepts from an intellectual standpoint. There will be little actual code involved, just enough to get a point across. Once we have a better understand about React's way of thinking, we can get started building our Star Trek video game. By then we should have a better understanding of how React works under the hood.

## How Does React Views the World?

React goes against many things we have considered to be best practices in front-end web development. As mentioned in the last chapter, React sees single page applications as a series of nested UI components. Therefore, React is primarily concerned with the presentation layer of an application. Since client-side applications are just UI components, React just cares about rendering those components to the user.

For many, this leads them to conclude React is simply the "V" in "MVC". This is somewhat misleading. While you _could_ make React the view layer of an MVC architecture, that would negate many of the benefits of using React. It's philosophy mostly rejects MVC/MV* in the browser. Why is that and what should replace it?

MVC is actually an excellent idea for the server. Given the success of MVC on the server, it's no wonder why we have been trying to use it on the browser. As browser JavaScript engines started getting better along with the rise of excellent user experiences found in native applications, we increasingly started pushing data and behavior from the server to the client. This was a great step forward for the web, but as web developers this lead us scrambling to find ways to work in the hostile browser environment. So, we took the ideas that served us well on the server and applied them to the browser.

This was an improvement from what we had before, much like how jQuery took us forward as a community as well. And while it sounded like a good idea to use MVC to separate concerns on the browser, in practice that environment is very different from the server. Many mistakes in history have been made by well intentioned people making decisions based on what seemed like a good idea at the time -- and at the time, MVC in the browser seemed like a good idea. After all, it worked well on the server. What could go wrong? The problem with forcing MVC on the browser is that we're trying to separate concerns that are inextricably linked.

MVC makes sense in the stateless environment of HTTP and webservers but it makes less sense in single page applications. That's because unlike the server environment, the browser is full of state. The server is concerned with requests and responses, but the browser is a user interface with a lot of events and user interaction. MVC on the browser tries to separate things that actually belong together, which in turn obscures the state of an application.

What this means is when bugs arise (and they will), it can be very difficult to determine exactly what is the cause of the problem. For example in Angular, when there is a bug it is relatively difficult to determine its root cause. That's because state is shared among many different parts of an MVC architecture. You're not sure if the bug is in a controller, a view, a model, a directive, a directive controller, etc. It becomes difficult to track where messages are being passed in an Angular app, because as an Angular app grows, the number of directions messages can travel grows exponentially.

### How To Separate Concerns: Write Components, Not Templates

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

### Data Binding

User interfaces are very difficult to build due to the amount of state found in it. State is the root of all evil. All this state in user interfaces intertwines to create a complex system that is very difficult for humans to understand.

Why is state so hard to understand? Essentially, state is your data at any given point in time. In other words, state is data that changes over time -- it's mutable. Human brains, it turns out, are not very well geared toward reasoning about systems that change over time. We're masters of understanding static relationships and being able to keep those relationships in our brains, but we have a really hard time at keeping track of dynamic relationships that change over time. When data is constantly in flux, we humans have a hard time trying to reason about exactly what is going on at any given point in time.

So how do we as programmers master state in user interfaces? Traditionally, we've done this via data binding, which makes the UI look more like a static program relative to our data. In other words, data binding syncs UI state with the data model. Data binding is one of many great ideas to come from the 1970's but there's a problem here. That problem with data binding in JavaScript is that it is a polyfill for reactive JavaScript in the DOM. What does that mean exactly?

Reactive programming is a little difficult to grasp at first, but it is basically programming with asynchronous data streams. Unfortunately, JavaScript is not actually reactive. Take a look at a very simple example:

```
var a = 1;
var b = 1;
var c = a + b;
var a = 2;
```

In the above example, `c` will still equal 2 even after we change the value of a. If JavaScript were truly reactive, the value of `c` would be automatically be in sync with the value of `a` and `b`. This is a very simple example. If you want to learn more about reactivity take a look at this excellent [resource](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754).

Needless to say, this isn't a mistake or bug in the language, but it does present an obstacle if we want true reactive JavaScript in the DOM. In order to achieve this, most JavaScript frameworks have implemented some form of data binding. This is a non-trivial abstraction on top of plain old JavaScript, and like all abstractions, these implementations leak. The difference is how leaky they are, when do they leak, and how easy is it to spot and fix the leak.

Pretty much most JavaScript frameworks use Key-Value Observation (KVO) for data binding (most prominently Ember and Meteor) with Angular being the main outlier at the moment, with uses dirty checking. We won't go into too much detail into these systems but suffice it to say that anyone who's worked with these frameworks know of the pain in KVO of having to know the internal implementation details of other object resulting in tight coupling or the pain of working with `$scope`, `$watch`, and `$apply` in Angular. These are not simple abstractions, and they often break in mysterious ways that are not intuitive. You have to learn a lot about the framework's data binding system and how to fix it. And often times, the way to fix it is to go around the data binding system all together, which is it's own nightmare. In other words, you need to be deeply familiar with the frameworks and their pain points.

This is far from ideal. The ideal data binding system tries to stick to plain old JavaScript functions as much as possible, while giving you simple tools for reactivity. You shouldn't have to think about how the data binding works. And when there are leaks, either the leak isn't a show stopper and/or the solution is crystal clear. React fits this description almost perfectly.

### How React Manages State

React's approach to managing state and complexity via data binding relies on much simpler abstractions: the Virtual DOM and a unidirectional data flow.

Essentially, React's Virtual DOM system abstracts the DOM by keeping a virtual representation of the DOM in memory and whenever the data model changes, React triggers a re-render of the components that rely on that data. At a high level, what React does is give you tools to describe what your component should look like at any given time. So, whenever the state changes, React will begin re-rendering the component that contains that state, diff the previous virtual representation of the DOM with the new virtual representation, and only updates the DOM with what actually changed. You as a developer don't need to worry about how this really works, you just need to describe what your component looks like and let React know when your state has changed. That being said, we will dive deeper into React's Virtual DOM diff algorithm shortly.

Let's look at a very simple example and see how this works in more detail. You can play with the live demo here: [Demo](http://codepen.io/anon/pen/VvrqxO)

```
var Cats = React.createClass({
  getInitialState: function() {
    return { catCount: 0 };
  },
  
  render: function() {
    return (
      <div>
        <p>The current cat count is: {this.state.catCount}</p>
        <input type="text" onChange={this.updateCount} />
      </div>
    );
  },

  updateCount: function(event) {
    this.setState({catCount: Number(event.target.value)});
  }
});

React.render(<Cats />, document.getElementById('cats'));
```

You can figure out what this simple example does yourself without much need for explanation. First, we are setting the initial state of the component in `getInitialState`. You can think of this method like an initializer for the component, where we are setting the default value of `catCount` to 0. Then we're describing what our component will look like in the `render` method. Then the input field changes `updateCount` will be called. `updateCount` calls a special React method called `setstate`, which if `render` is the heart of a component, `setState` is the brain. `setState` will update the value of the data in the components state, which in turn will trigger a re-render of the app. 

So, if you type in the number "9" into the input field, `updateCount` will be called, which will grab that value and set the new state with `setState`. React will then compare then figure out what the new component will look like, diff that with what is in the Virtual DOM, and do just the minimum DOM mutations necessary to reach the new state of the UI.

While this seems like a novel approach to data binding, it's actually not unique -- it is just new to web development. React took a look at another area of software development, the gaming industry, and brought those ideas to the web. Games have a lot in common with web based user interfaces. They're packed full of state (number of weapons, vehicles, sounds, events based on user interaction, etc ...) and tons of behavior that needs to be constantly recalculated and re-render the player at 60 frames per second. On top of that, you need to do all of this with tough hardware constraints and with consistent performance despite those hardware limitations. 

Indeed, the React lifecycle is very similar to the Doom 3 engine. In Doom, all the state of the game is kept at a high level container, then passes it to it's front-end components which contain the game logic, followed by the creation of an intermediate representation of the scene, which then gets translated into OpenGL operations and finally flushed out to the graphics card. React's frow is very similar: the state of the application lives in higher components which then gets passed down as immutable data to child components which actually house the behavior, then a Virtual DOM is created as an intermediate representation of the DOM, finally batching of the DOM mutations and updating the real DOM itself.

In addition to the Virtual DOM, React treats data very differently from other JavaScript frameworks. React separates data that changes over time (state) from immutable data that stays the same. React calls these two concepts `state` and `props`. In React, components manage their own internal `state` and receive `props` from the parents, or pass in props to their children. React enforces a unidirectional data flow from parent to child. A React component passes data to their child components as `props` and child components cannot pass data to their parents.

Unlike other frameworks where data and messages fly in multiple directions over time and are always mutable, React's design streamlines the flow of messages as well as separating things that change from things that don't.

Unidirectional data flow limits the messages and data being passed to the system, making it easy to debug. Since data can only pass from parent to child, it's easy to trace the flow of data in your system. In addition, since data is passed in to components only from a parent via props, you can treat your components as idempotent functions that given a set of data will always return the same result. As you can imagine, this makes unit testing your components much easier.

Let's take a look at an example of `state`, `props`, and unidirectional data flow.

```
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

```
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


## React's Design Under the Hood

One might think that keeping a virtual representation of the DOM and re-rendering the UI on every data change is detrimental for performance, but the opposite is true. React vastly outperforms other frameworks by great orders of magnitude (although due to React's influence Ember and Angular are starting to catch up). In fact, any more performance enhancements would be unperceivable to the user even in the worst possible use case. 

This is due to a number of design decisions, most important of which is how React abstracts the DOM.

### Virtual DOM Diff Algorithm

React doesn't exactly re-render the whole app on every state change: it only changes the parts that need to change. But how does it do that exactly?

The DOM is just a tree of nodes, and DOM is just a tree of nodes. Comparing two trees is one of the most studied and understood problems in computer science. Finding the minimum number of mutations between two trees, even with the most [performant algorithms](http://grfia.dlsi.ua.es/ml/algorithms/references/editsurvey_bille.pdf) we have, are a O(n^3) problem, where `n` is the number of nodes.

This is not good enough. If two trees have 1,000 nodes each, figuring out the minimum operations to transform one to the other would require _one billion_ operations. This is not sustainable.

What we need are a set heuristics that help make this algorithm much more performant. React's algorithm makes the following assumptions:

1. Components of the same class will generate similar trees
2. Components of a different class will generate different trees
3. You can add unique keys to elements that are stable across different renders

With these heuristics in place, React's diff algorithm is O(n). That's because instead of trying to compare the whole tree, these heuristics help the diffing algorithm to just reconcile trees level by level. 

Let's take a look at a simple example:

```
var PetOwner = React.createClass({
  render: function() {
    if (this.props.likedCats) {
      return <div className="likes-cats"><span>Cats Rule!</span></div>;
    } else {
      return <div className="likes-dogs"><p>Dogs Rule!</p></div>;
    }
  }
});
```

It's important to reiterate that the `render` function doesn't return a DOM node but a JavaScript object that represents the DOM. That is the Virtual DOM.

Let's say we first mount our component as `<PetOwner likesCats={true} />` then update the component to `<PetOwner likesCats={false} />` and then remove the component altogether. This is what the DOM operations would look like:

* Mount `<PetOwner likesCats={true} />`
  * Create node: `<div className="likes-cats"><span>Cats Rule!</span></div>`
* `<PetOwner likesCats={true} />` to `<PetOwner likesCats={false} />`
  * Replace attribute `className="likes-cats"` to `className="likes-dogs"`
  * Replace node `<span>Cats Rule!</span>` to `<p>Dogs Rule!</p>`
* Unmount `<PetOwner likesCats={false} />`
  * Remove node `<div className="likes-dogs"></div>`
  
Because we're replacing one component with another component of the same class (PetOwner), React knows to look at their top level attributes and decide how to update (in this case, it changes the class of the `div` to "likes-dogs"). Then it goes one level lower. Since the DOM nodes are different, it will simply remove the node and replace it with the new one.

If we were replacing `<PetOwner />` with `<CarOwner />`, React would know that these components are of a different class and most likely very different. So, it won't even bother going another level down to figure out the differences. It will just remove the old DOM node and start replacing it with the new one.

Simple enough. But what happens if we're trying to insert an element in the middle of a list of other elements? 

Consider the following example. We're going to render a unordered list with one list item.

```
var List = React.createClass({
  render: function() {
    return (
      <ul>
        <li>First</li>
      </ul>
    );
  }
});
```

Let's say we want to add another list item to the end. This is what it would look like

* `<ul><li>First</li></ul>` to `<ul><li>First</li><li>Second</li></ul>`
  * Insert node `<li>Second</li>`
  
That was easy. But it's much harder if we wanted to add the `li` to the front of the list:
* `<ul><li>First</li></ul>` to `<ul><li>Second</li><li>First</li></ul>`
  * Replace text content from 'first' to 'second'
  * Insert node `<li>First</li>`

Without unique identifiers for each sibling element, the fastest algorithm for inserting, substituting, or removing a single element ([Levenshtein distance](https://en.wikipedia.org/wiki/Levenshtein_distance)) can at best perform this operation in O(n^2). 

This is one of the places where the data binding abstraction via the Virtual DOM leaks. But this leak is consistent and predictable. Also, React gives you nice hints if you fail to fix this.

In order to fix this problem, sibling elements need a unique key attribute. If each sibling element is given a unique key, React is now able to insert, delete, substitute, and move in O(n) using a hash table.

```
var List = React.createClass({
  render: function() {
    return (
      <ul>
        <li key="first">First</li>
      </ul>
    );
  }
});
```

* `<ul><li key="first">First</li></ul>` to `<ul><li key="second">Second</li><li key="first">First</li></ul>`
  * `first = getElementByKeyName('first')`
  * Insert node before `first`, `<li key="second">Second</li>`

### Event Delegation and Autobinding

Adding event listeners to DOM nodes is notoriously slow. Since React triggers a re-render of a component and it's children whenever it's internal state has changes, adding and removing event listeners can have a huge negative effect on performance. React handles this by implementing a technique called "event delegation" which it calls it's "Synthetic Event System".

Here's how it works: Instead of adding event listeners directly to a DOM node, React attaches only one event listener on the root of the document. When an event is fired, the unhandled event bubbles up the DOM until it reaches React's event listener. Instead of adding event listeners to the DOM, React keeps a hash map off all the event listeners. Once the event reaches React's event system, it looks up the DOM node the event is being called upon and acts accordingly.

Best of all, React's event system is W3C compliant, meaning that it will work on IE8. It also means you have the same interface as the browser's native events, like `stopProgation()` and `preventDefault()`. You should keep this in mind if you're submitting a form:

```
var NewCatForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var catName = this.refs.catName.value.trim();
    if (!catName) return;
    // TODO: send request to the server
    this.refs.catName.value = '';
    return;
  },
  
  render: function() {
    return (
      <form className="newCatForm" onSubmit={this.handleSubmit}>
        <input type="text" placeholder="Cat Name" ref="catName" />
        <input type="submit" value="Post" />
      </form>
    );
  }
});
```

We're passing a callback method called `handleSubmit` to the form. Usually when creating a callback you need to bind the method to it's instance so that the value of `this` is correct. React autobinds that for you by caching the method so it's more CPU and memory efficient.

### Rendering

Whenever `setState` is called in a component, React will consider that tree node to be dirty. React will then trigger a re-render off all the dirty nodes and their children. During an event loop, React batch all these modifications to the DOM so that it's only touched once. 

Still, the fact that React triggers a re-render of a component's children, even if it doesn't need to be updated, is a leak in the Virtual DOM abstraction. But again, this is consistent, predictable, and generally not a problem for maintainability or performance. 

React provides hooks into a components lifecycle, and one of those methods is called `shouldComponentUpdate`.

```
var MyComponent = React.createClass({
  render: function() {
    return <span>My Component</span>
  },
  
  shouldComponentUpdate: function(nextProps, nextState) {
    return false;
  }
});
```

With `shouldComponentUpdate` you can tell React whether a particular component needs to be re-rendered or not. Generally this is not necessary, but if you need to optimize performance, telling React which nodes don't needs to be re-rendered can result in performance improvements.

