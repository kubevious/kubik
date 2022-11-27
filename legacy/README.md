[![Codefresh build status]( https://g.codefresh.io/api/badges/pipeline/kubevious/Image%20Builds%2Fkubik?branch=master&key=eyJhbGciOiJIUzI1NiJ9.NWRmYWM4ZGJkYzJlNTkwMDA5MWJmYzM4.nrzBqsKVoTwu9mHe8-HD7RQ1xV9DcdOjeGou95l0MiU&type=cf-1 )]( https://g.codefresh.io/pipelines/kubik/builds?repoOwner=kubevious&repoName=kubik&serviceName=kubevious%252Fkubik&filter=trigger:build~Build;branch:master;pipeline:5eb9eb74d794435ece16cc56~kubik)

# Kubik

**Kubik** (pronounced [ku:bik]) is a domain-specific language define validation rules
over configuration graphs. Kubik uses JavaScript-like syntax that allows any arbitrary rules
to be easily be written and read.

## Why use Kubik?

Configurations that have tree or graph structure are not easy to navigate and validate for correctness. Some examples are cloud environments, networking, Kubernetes, etc. 

Kubik enables traversal and validation of nodes using a combination of declarative and imperative rules.

## The Basics

Kubik rule consists of two parts: target and rule scripts. Target script declares on which nodes should the validation be executed. Rule script validates each node that matches the target script.

Lets consider following example. We have a graph representation of a Car that has front and rear Doors, each of those have a Window. 

![Sample Car Graph](docs/diagrams/sample-graph-car.svg)

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

## Graph Representation
Each node in the graph has a **type** and **name**. In the example above the type can be *"Door"* and *"Window"* and the names are *"front"* and *"rear"*. Nodes can also be marked using value labels.

Multiple sets of key-value or array objects can also be associated with each node.

## Target Script
The purpose of the target script is to select a subset of nodes that matches required criteria. The selected node are be passed along to the rule script for validation.

The target script starts with **select** statement that takes the node **type** as an input. That statement selects all nodes of the given type.
```js
select('Door')
```

Nodes can be traversed further by going down one level using **child**.
```js
select('Door')
.child('Window')
```

For further capabilities, lets consider bit more complex example below. The graph represents a fleet of trucks that move *(shipping)* containers, materials and corresponding drivers.

![Sample Fleet Graph](docs/diagrams/sample-graph-fleet.svg)

Nodes can be filtered by name:
```js
select('Material')
    .name('Corn')
```

Or by matching myltiple names. The target script below selects both "Corn" and "Horse" materials:
```js
select('Material')
    .name('Corn')
    .name('Horse')
```

Arbitrary programmable filters can be defied and expressed using JavaScript syntax. To filter "Maersk" containers:
```js
select('Container')
    .filter(({item}) => {
        return item.name.startsWith('Maersk');
    }))
```

Selecting children of filtered objects. Script below targets drivers of 3 or less axle trucks.
```js
select('Truck')
    .filter(({item}) => {
        return (item.props.axleCount <= 3);
    }))
.child("Driver")
```

Descendents can also be selected using a similar method. The resulting nodes are "Corn" and "Waste" matrials.
```js
select('Truck')
    .filter(({item}) => {
        return (item.props.axleCount > 3);
    }))
.descendant("Material")
```

Multiple filters, child and descendant queries can be chained together.
```js
select('Truck')
    .filter(({item}) => {
        return (item.props.axleCount >= 5);
    }))
.child("Container")
    .filter(({item}) => {
        return (item.props.weight >= 4);
    }))
.descendant("Material")
    .filter(({item}) => {
        return item.props.biohazard;
    }))
```

## Rule Script
Nodes selected from the target script are be passed to rule script for evaluation. Rules are expressed using JavaScript syntax. The rule script has access to the node, along with the name, properties and also has access to the entire graph. 

The current node is represented in **item** variable. Just like in case of target script, in rule script properties are accessed through *props* field. A call to **error()** function marks the node as invalid.

Some examples of rules below. Validating that hazardous materials are in containers below 4 tons:
```js
if (item.props.biohazard && item.parent.props.weight > 4) {
    error();
}
```

Enforcing California drivers not to transport livestock:
```js
if (item.props.state == 'CA'))
{
    for(var container of item.parent.children('Container'))
    {
        for(var material of container.children('Material'))
        {
            if (material.props.livestock)
            {
                error();
            }
        }
    }
}
```
