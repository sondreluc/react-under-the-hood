# Chapter 1: Introduction

## What is React?

React is an open-source JavaScript library for creating user interfaces. It aims to address the problems of building large applications with data that changes over time. Originally developed at Facebook, it is now used in a number of web applications including Netflix, Instagram, and Airbnb.

React brings a whole new set of ideas to web development. It goes against some established best practices we've come to accept in front-end web development. React sees client-side JavaScript applications in a fundamentally different way. It asserts we should stop using MVC in the browser. Instead, we should organize our applications into reusable UI components. MVC works great on the server for putting state into the stateless nature of HTTP. However, the problems of client-side JavaScript application are different. The browser, unlike the server, is full of state. React implements design decisions that greatly help developers understand and manage that state.

React has greatly influenced the direction of front-end JavaScript. In fact, we can consider Ember 2 and Angular 2 to be a response to React. Those frameworks are trying to rapidly catch up to React, but are still lacking in many ways. We will go over the major differences between React and these other projects in the following chapter.

## Why Would I Want to Use React?

There are many great reasons why you should use React right away. It's simple, declarative, composable, and fast. It gives you simple but powerful tools to create self-contained, reusable components. React makes is easy to describe what a component will look like without needing to use a template. Because data is unidirectional, components essentially become functions. That makes a React component reusable and flexible. Just like a function, as long as you pass the required data into a component, you will always get the same result. Since React components act just like functions, they're also easy to debug and test.

React is also extremely fast. It abstracting the DOM (which is notoriously slow) via a virtual DOM. JavaScript engines are really great these days. It's much faster to use an in memory representation of the DOM than dealing directly with the DOM. We will go into how the Virtual DOM works exactly in the following chapter.

React also plays well with third-party libraries and existing code bases. React does not have an opinion about how you manage your data, nor does it restrict you to only using it for DOM manipulation. If you need to use a jQuery plugin or want to use it with Angular/Ember/Meteor, React provides very easy ways of doing so. What this means is that you can use React with an existing code base. Indeed, you can use it inside your code base to improve performance, or you can use it to wrap existing code to create a more modular architecture.

