# Chapter 4: React's Design Under the Hood

In the last chapter we described React's core concepts. In this chapter we are going to over some of those topics in more detail. The purpose of this chapter is to give the reader a deeper understanding of React's internals in order to have a more nuance opinion of where React fits in modern web development. 

As a side note, we are going to compare the efficiency of algorithms using asymptotic notation. If you are unfamiliar with asymptotic notation, take a few minutes to get up to speed by watching this explanation from Harvard's CS50 course: [Asymtotic Notation Video](https://www.youtube.com/watch?v=iOq5kSKqeR4).


## Virtual DOM Diff Algorithm

As mentioned previously, React's data binding implementation involves an in memory representation of the DOM: the Virtual DOM. On every state change, React will trigger a re-render of components that rely on that state. It uses a diff algorithm to compute the minimum number of DOM mutation necessary to achieve the new DOM tree.

This algorithm is incredibly efficient and ingenious. It not only makes it practical to re-render on every state change, it also makes React orders of magnitude faster than any other data binding system. Still, it is a non-trivial abstraction which by definition will have leaks. That said, the Virtual DOM's abstraction leaks are relatively minor, predictable and manageable. By no means is the Virtual DOM the end of history for client-side JavaScript, but it is the next step in its evolution. 
On the surface, triggering a re-render would appear to be an inefficient way to keep the UI in sync with a data model. In fact, this is not a problem. JavaScript is pretty fast and `render` tends to be a fairly cheap operation. In addition, mutating the DOM is almost always the performance bottleneck, not JavaScript. React will optimize this via its diff algorithm, as well as other techniques which will be explained later in this chapter.

It is important to emphasize that React will not re-render the entire application. It will only re-render the components that are affected by changed to a particular state change. In React data always travels from parent component to child components, making it easy to determine which parts of the UI need to be updated. Whenever state changes in a component, React will trigger a re-render of that component and it's children. Unidirectional data flow makes it possible to isolate UI changes to just one branch in a DOM tree.

By isolating changes to just one branch of the DOM tree, we can take advantage of existing algorithms for determining the minimum distance between trees. Comparing tree data structures is one of the most studied and well understood problems in computer science. Now React can compare the new DOM tree to the old DOM tree in memory.

Given the most [efficient algorithms](http://grfia.dlsi.ua.es/ml/algorithms/references/editsurvey_bille.pdf), determining the minimum number of mutations between two trees is a O(n^3) problem, where `n` is the number of nodes. With a small number of DOM nodes, this would not be a problem. However, the number of operations will increase dramatically. If we were to compare two trees wth 1,000 nodes each, figuring out the minimum operations to transform one to the other would require _one billion_ operations. This is not sustainable.

We can speed up this algorithm significantly if we make a few assumptions about the DOM trees we are comparing. React applies a set of heuristics helping to dramatically improve performance. The Virtual DOM diff algorithm makes the following assumptions:

1. Components of the same class will generate similar trees
2. Components of a different class will generate different trees
3. You can add unique keys to elements that are stable across different renders

With these heuristics in place, React's diff algorithm can find the minimum number of DOM mutations in O(n). That is because instead of trying to compare the whole tree, these heuristics help the diff algorithm to just reconcile trees level by level. 

The following example walks through what this would look like in practice. Say we have the following component:

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

Above, `PetOwner` will either return a `div` with a `span`, or it will return a `div` with a `p`. It is important to reiterate that the `render` function does not return DOM nodes but a JavaScript object that represents DOM nodes. That is the Virtual DOM.

Let's assume that based on state changes, the following actions will occur:

1. The `PetOwner` component is mounted, with `likesCats` equaling to `true`. In other words, we will mount `<PetOwner likesCats={true}/>`.
2. Then, we replace this component with a similar component, instead this time `likesCats` will equal `false`. In other words, the new component will be: `<PetOwner likesCats={false}/>`.
3. Finally, the component will be completely removed. This could be due to a change in the route or something of that nature.

Based on the heuristics described above, let's walk through what DOM mutations will occur.

On Step 1, we are adding `PetOwner` for the first time. Since there was nothing there before, React will know to simply add the new DOM nodes. Here is what is will look like now:

```html
<div class="likes-cats">
  <span>Cats Rule!</span>
</div>
```

On Step 2, we are replacing a component of class `PetOwner` with another component of the exact same class. Because these two components are of the same class, chances are their DOM trees are going to be very similar. Therefore, React will keep the previous DOM tree and begin to compare these trees one level at a time. This is what the next DOM tree should look like:

```html
<div class="likes-dogs">
  <p>Dogs Rule!</p>
</div>
```

Since React decided to keep the prior DOM tree, it will begin to compare the previous DOM tree with the new one starting at the very top. Both of these DOM trees begin with a `div`. Since they are both a `div` React will continue to keep this DOM tree. If the DOM elements were different, React would completely remove the previous DOM tree and replace it with a new one. Chances are if we are replacing a type of DOM element without a DOM element of a different type, the rest of the structure is going to look radically different. Therefore, it would be inefficient mutate the current DOM tree. It would be more efficient to completely remove it and start from scratch.

Since they are both a `div`, React will keep the previous `div`, but will update it's class from `likes-cats` to `likes-dogs`. Then, the diff algorithm will compare the DOM trees one level down. On that level, we are replacing `<span>Cats Rule!</span>` with `<p>Dogs Rule!</p>`. Since we a replacing `span` with a totally different kind of DOM element, a `p`, React will completely remove the previous `span` and replace it with the new `p`. It will not bother trying to update the prior DOM element, it will just remove it entirely.

Finally, on Step 3, since the `PetOwner` component no longer exists in the new Virtual DOM representation, React will simply remove the entire `PetOwner` DOM tree.

Here is what the operations would look at a glance:

1. Mount `<PetOwner likesCats={true} />`
  * Create node: `<div className="likes-cats"><span>Cats Rule!</span></div>`
2. `<PetOwner likesCats={true} />` to `<PetOwner likesCats={false} />`
  * Replace attribute `class="likes-cats"` to `class="likes-dogs"`
  * Replace node `<span>Cats Rule!</span>` to `<p>Dogs Rule!</p>`
3. Unmount `<PetOwner likesCats={false} />`
  * Remove node `<div className="likes-dogs"></div>`
  
## Sibling Elements

So far we have mentioned the first two heuristics. The final heuristic comes into play if we are trying to insert an element in the middle of a list of other elements.

Consider the following example. We are rendering an unordered list with one list item.

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

Let's say we want to add another list item to the end. This is what the operations would look like:

* `<ul> <li>First</li> </ul>` to `<ul> <li>First</li> <li>Second</li> </ul>`
  * Append node `<li>Second</li>`
  
Adding an element to the end of the list is pretty straight forward. However, it is more difficult if we wanted to add the `li` to the front of the list:

* `<ul><li>First</li></ul>` to `<ul><li>Second</li><li>First</li></ul>`
  * Take `<li>First</li>` and change it to `<li>Second</li>`
  * Append node `<li>First</li>`

Without a unique identifier for each element in a list the number of operations necessary to modify this list increases exponentially. In fact, the fastest algorithm for inserting, substituting, or removing a single element ([Levenshtein distance](https://en.wikipedia.org/wiki/Levenshtein_distance)) can at best perform this operation in O(n^2). Even with Levenshtein, this does not help us find when a node has moved. 

Sibling elements are the main area where React's data binding abstraction leaks. In this particular case, React provides an optional attribute to make this a O(n) problem. In cases where identity and state must be maintained across re-renders, React allows you to add a `key` attribute to each element. With these keys, it will ensure siblings will be reordered or destroyed correctly.

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

* `<ul> <li key="first">First</li> </ul>` to `<ul> <li key="second">Second</li> <li key="first">First</li> </ul>`
  * `first = getElementByKeyName('first')`
  * Insert node before `first`, `<li key="second">Second</li>`

These keys do not need to be unique across the whole system. They only need to be unique within the scope of a particular list. You could reuse the key as long as it is not in the same list.

Also, the key should always be supplied by the parent component and not within an sibling component itself. Here is an example:

```javascript
// Wrong
var ListItem = React.createClass({
  render: function() {
    return <li key={this.props.data.id}>{this.props.data.text}</li>;
  }
});
var List = React.createClass({
  render: function() {
    return (
      <ul>
        {this.props.results.map(function(result) {
          return <ListItem data={result}/>;
        })}
      </ul>
    );
  }
});
```

```javascript
// Correct
var ListItem = React.createClass({
  render: function() {
    return <li>{this.props.data.text}</li>;
  }
});
var List = React.createClass({
  render: function() {
    return (
      <ul>
        {this.props.results.map(function(result) {
           return <ListItem key={result.id} data={result}/>;
        })}
      </ul>
    );
  }
});
```
Along with updating a list of sibling elements, React's data binding abstraction will leak in a somewhat non-obvious way. Since `render` is just a JavaScript function that returns a virtual representation of the DOM, it cannot return stand alone sibling elements without a parent element wrapping them. 

Here is an example:

```javascript
// Wrong
var MyComponent = React.createClass({
  render: function() {
    return (
      <p>First</p>
      <p>Second</p>
    );
  }
});
```

```javascript
// Correct
var MyComponent = React.createClass({
  render: function() {
    return (
      <div>
        <p>First</p>
        <p>Second</p>
      </div>
    );
  }
});
```

There are two reasons why the first example will not work. First, since `render` is just a regular JavaScript function, there can only be one return value. Second, in order for the diff algorithm to work, it requires a tree structure. Without wrapping the `p` elements within some parent, we would be trying to return two values, as well as returning a structure that is not a tree.

## Event Delegation and Autobinding

Adding event handlers to DOM nodes is notoriously slow. Since React triggers a re-render of a component and its children whenever its internal state has changed, adding and removing event handlers can have a huge negative effect on performance. React handles this by implementing a technique called "event delegation" which it calls its "Synthetic Event System".

Instead of adding event handlers directly to a DOM node, React attaches only one event listener on the root of the document. When an event is fired, the unhandled event bubbles up the DOM until it reaches React's sole event listener. Instead of adding event listeners to the DOM, React keeps a hash map off all the event listeners. Once the event reaches React's event system, it looks up the DOM node the event is being called upon and acts accordingly.

Best of all, React's event system is W3C compliant, meaning that it will work on IE8. It also means you have the same interface as the browser's native events, such as `stopProgation()` and `preventDefault()`. You should keep this in mind if you are submitting a form:

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

Still, the fact that React triggers a re-render of a component's children, even if it doesn't need to be updated, is a leak in the Virtual DOM abstraction. Generally, this is not a performance problem since the biggest performance bottleneck will be updating the DOM. 

If you need to get even more performance improvements, there is a way to tell React not to trigger a re-render. React provides hooks into a components lifecycle, and one of those methods is called `shouldComponentUpdate`.

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

With `shouldComponentUpdate` you can tell React whether a particular component needs to be re-rendered or not. Generally this is not necessary, but if you need to optimize performance, telling React which nodes do not need to be re-rendered can result in performance improvements.