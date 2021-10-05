## PROPOSAL

```js
Logic()
.select('Namespace')
.child('Application')
.descendant('Port')
```

or:
```js
select('Namespace')
.child('Application')
.descendant('Port')
```


```js
Images()
.select('Repo')
    .name('dockerhub')
.child('Image')
.child('Tag')
    .name('latest')
.descendant('Application')
```

```js
Infra()
.select('Node')
```

```js
K8s()
    .select('Api') 
        .name('batch')
    .child('Version')
        .name('v1')
    .child('Kind')
        .name('Job')
    .child('Resource')
```

```js
// K8s()
//     .kind('Deployment')
//     .api('..') // optional
//     .version('') // optional
```