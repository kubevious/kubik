[![Codefresh build status]( https://g.codefresh.io/api/badges/pipeline/kubevious/Image%20Builds%2Fkubik?branch=master&key=eyJhbGciOiJIUzI1NiJ9.NWRmYWM4ZGJkYzJlNTkwMDA5MWJmYzM4.nrzBqsKVoTwu9mHe8-HD7RQ1xV9DcdOjeGou95l0MiU&type=cf-1 )]( https://g.codefresh.io/pipelines/kubik/builds?repoOwner=kubevious&repoName=kubik&serviceName=kubevious%252Fkubik&filter=trigger:build~Build;branch:master;pipeline:5eb9eb74d794435ece16cc56~kubik)

# Kubik

**Kubik** (pronounced [ku:bik]) is a domain-specific language to create validation rules
over configuration graphs. Kubik uses JavaScript-like syntax that allows any arbitrary rules
to be easily be written and read.

## Why use Kubik?

Configurations that have tree or graph structure are not easy to navigate and validate for correctness. Some examples are cloud environments, networking, Kubernetes, etc. 

Kubik enables traversal and validation of nodes using a combination of declarative and imperative rules.

## The Basics

Kubik rules consist of two parts: target and rule scripts. Target script declares on which nodes should the validation be executed. Rule script validates each node that matches the target script.

Lets consider following example. We have a graph representation of a Car that has front and rear Doors, each of those have a Window. 

![Sample Graph](docs/diagrams/sample-graph.svg)

### Case 1. All doors locked.
Lets ensure that all doors are locked, before we can drive the car. 

**Target:**
```js
select('Door')
```
**Rule:**
```js
if (!item.props.locked) {
    error()
}
```

### Case 2. Rear windows closed.
We want to make sure that only the rear window is closed.

**Target:**
```js
select('Door')
    .name('rear')
.child('Window')
```
**Rule:**
```js
if (!item.props.closed) {
    error()
}
```