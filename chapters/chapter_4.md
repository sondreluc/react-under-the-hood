# Chapter 4: Relevant Libraries & Concepts

React is perhaps Facebook's most popular open source library, but it is not the only one. They have released quite a few interesting libraries lately. We should point out 4 libraries/concepts they have introduced since they are often mentioned in the same breath as React. This tutorial is mostly about React, but we should briefly talk about these other libraries. 

## Flux

More of an architecture pattern than a library, Flux provides a more robust solution to organizing your data and business logic. As a React application grows, it can be useful to separate your core business logic from your UI components. Flux works in tandem with React's unidirectional data flow by using [EventEmitter](https://nodejs.org/api/events.html#events_class_events_eventemitter) as a basis 

Flux is a library as well as an architecture pattern, originally developed at Facebook, for managing data and behavior across a large application. Without MVC, Facebook needed another framework that adheres to React's unidirectional data flow.

Flux has 4 major parts: actions, dispatchers, stores, and views (React components). Actions are dispatcher helper methods used to create a more semantic API. When a user interacts with the view, an action is propagated to a central dispatcher, which knows which stores in needs to call. Stores hold the application's data and business logic, which when called will update views that are affected. This helps clean out data and business logic from React components.

This is a step in the right direction but the overhead complexity of Flux is not worth the effort until you start having problems reasoning about your data. Once you start reaching a certain level of complexity in a React application, you should consider taking a look at Flux, as well as truly reactive libraries like [RxJS](https://github.com/Reactive-Extensions/RxJS).

## GraphQL

REST is not dead, but for some kinds of applications REST is not expressive enough to serve many application's data requirements without a lot of API calls to the server. For an application as large as Facebook, making individual API calls to RESTful endpoints is just not performant enough.

REST has been a great step forward for the web, but it's not the end of history. It's very imperative compared to GraphQL. Still, REST is tried and true but in no way should it be the final word for how to build scalable APIs.

A GraphQL query is a string interpreted by a server that returns data in a specified format. Here is an example query:

```
{
  user(id: 3500401) {
    id,
    name,
    isViewerFriend,
    profilePicture(size: 50)  {
      uri,
      width,
      height
    }
  }
}
```

This is much more expressive than regular REST. When designing an API for native or web based clients, the API designer often need to know a lot about the requirements of the client in order to prevent multiple calls to the server. REST is just too rigid for large client-side or native applications. With GraphQL, you can just make one call to the server asking for your data requirements. 

That said, REST is not dead. We as programmers should be trying to prevent problems, but making design decisions based on uncertainty is going to lead to trouble. Just like with Flux, it's better to stick with REST unless it really doesn't make sense for your applications.

## Relay

While GraphQL can help limit the amount of calls to the server, various components have differing data requirements, which can result in multiple calls to the server. Relay, among other things, helps batch together all data requirements into one request. Relay is built on top of GraphQL.

Again, just like Flux and GraphQL, you don't need to worry about using Relay unless data fetching becomes a problem.

## Immutable.js