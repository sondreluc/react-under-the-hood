# React's Design Under the Hood

In the last chapter we described React's core concepts. In this chapter we are going to go over some of those concepts in detail. The purpose of this chapter is to give the reader a deeper understanding of React's internals in order to have a more nuanced opinion of where React fits in modern web development.

## Virtual DOM Diff Algorithm

The diffing algorithm in React's Virtual DOM is incredibly efficient and pretty clever. Still like all abstractions, React does leak in certain places. That said, leaks in this abstraction are always predictable and easily managed. 

React doesn't exactly re-render the whole app on every state change: it only changes the parts that need to change. But how does it do that exactly?

The DOM is just a tree of nodes, and DOM is just a tree of nodes. Comparing two trees is one of the most studied and understood problems in computer science. Finding the minimum number of mutations between two trees, even with the most [performant algorithms](http://grfia.dlsi.ua.es/ml/algorithms/references/editsurvey_bille.pdf) we have, are a O(n^3) problem, where `n` is the number of nodes.

This is not good enough. If two trees have 1,000 nodes each, figuring out the minimum operations to transform one to the other would require _one billion_ operations. This is not sustainable.

What we need are a set heuristics that help make this algorithm much more performant. React's algorithm makes the following assumptions:

1. Components of the same class will generate similar trees
2. Components of a different class will generate different trees
3. You can add unique keys to elements that are stable across different renders

With these heuristics in place, React's diff algorithm is O(n). That's because instead of trying to compare the whole tree, these heuristics help the diffing algorithm to just reconcile trees level by level. 

Let's take a look at a simple example:

```javascript
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

```javascript
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

```javascript
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

## Event Delegation and Autobinding

Adding event listeners to DOM nodes is notoriously slow. Since React triggers a re-render of a component and it's children whenever it's internal state has changes, adding and removing event listeners can have a huge negative effect on performance. React handles this by implementing a technique called "event delegation" which it calls it's "Synthetic Event System".

Here's how it works: Instead of adding event listeners directly to a DOM node, React attaches only one event listener on the root of the document. When an event is fired, the unhandled event bubbles up the DOM until it reaches React's event listener. Instead of adding event listeners to the DOM, React keeps a hash map off all the event listeners. Once the event reaches React's event system, it looks up the DOM node the event is being called upon and acts accordingly.

Best of all, React's event system is W3C compliant, meaning that it will work on IE8. It also means you have the same interface as the browser's native events, like `stopProgation()` and `preventDefault()`. You should keep this in mind if you're submitting a form:

```javascript
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

## Rendering

Whenever `setState` is called in a component, React will consider that tree node to be dirty. React will then trigger a re-render off all the dirty nodes and their children. During an event loop, React batch all these modifications to the DOM so that it's only touched once. 

Still, the fact that React triggers a re-render of a component's children, even if it doesn't need to be updated, is a leak in the Virtual DOM abstraction. But again, this is consistent, predictable, and generally not a problem for maintainability or performance. 

React provides hooks into a components lifecycle, and one of those methods is called `shouldComponentUpdate`.

```javascript
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