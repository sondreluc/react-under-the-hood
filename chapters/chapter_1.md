# Chapter 1: Introduction

## What is React?

React is an open-source JavaScript library for creating user interfaces. It aims to address the problems of building large applications with data that changes over time. Originally developed at Facebook, it is now used in a number of web applications including Netflix, Instagram, and Airbnb.

React brings a different set of ideas to web development 

React brings a whole new set of ideas to web development. It goes against some established best practices we've come to accept in front-end web development. React sees client-side JavaScript applications in a fundamentally different way. It asserts we should stop using MVC in the browser. Instead, we should organize our applications into reusable UI components. MVC works great on the server for putting state into the stateless nature of HTTP. However, the problems of client-side JavaScript application are different. The browser, unlike the server, is full of state. React implements design decisions that greatly help developers understand and manage that state.

React has greatly influenced the direction of front-end JavaScript. In fact, we can consider Ember 2 and Angular 2 to be a response to React. Those frameworks are trying to rapidly catch up to React, but are still lacking in many ways.

## Why Would I Want to Use React?

There are many very good reasons why React makes sense to use right now. It's simple, declarative, composable, and fast. It gives you simple but powerful tools to create self-contained, reusable components. React makes is easy to describe what a component will look like without needing to use a template. Because data is unidirectional, components essentially become functions. That makes a React component reusable and flexible. Just like a function, as long as you pass the required data into a component, you will always get the same result. Since React components act just like functions, they're also easy to debug and test.

React is also extremely fast. It achieves this by completely abstracting the DOM (which is notoriously slow) with a Virtual DOM. Now that JavaScript engines are 

The Virtual DOM exists in memory, 

Also, React is extremely fast. It achieves this by abstracting the DOM, which is slow, into a Virtual DOM, which it then uses to figure batch together DOM mutations and figures out the smallest number of DOM mutations necessary to achieve the new view. We'll get into how it does that in the following chapter.

But probably it's greatest strength is it's ability to play well with third-party libraries and existing code bases. This is very different to the tools we currently have available in JavaScript. This is a story we don't hear about in pitches for a JavaScript framework. Most explinations assume you're working on a greenfield applicaiton, but most of us are working on longer running existing code bases. Once we try to apply these frameworks in the real world, we quickly find that we've sunk into a quagmire. For example, if your team decides to build a small component in Angular or Ember, it soon has to assimilate the rest of your code base like a Borg drone. That component will soon need to cooperate with other existing components, but since those frameworks don't know how to communicate with anything other than itself, soon you'll need to start rewriting other parts of your code base just to get it to play nice. Or you will most likely end up trying to use some kind of hack to pass data or behavior from other components to those frameworks and back. 

With React, as we will soon see, this is not a problem. In fact, you can use it inside your code base to improve performance, or you can use it to wrap exisiting code to create more composable architecture. 

