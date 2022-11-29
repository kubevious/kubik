[![Codefresh build status]( https://g.codefresh.io/api/badges/pipeline/kubevious/Image%20Builds%2Fkubik?branch=master&key=eyJhbGciOiJIUzI1NiJ9.NWRmYWM4ZGJkYzJlNTkwMDA5MWJmYzM4.nrzBqsKVoTwu9mHe8-HD7RQ1xV9DcdOjeGou95l0MiU&type=cf-1 )]( https://g.codefresh.io/pipelines/kubik/builds?repoOwner=kubevious&repoName=kubik&serviceName=kubevious%252Fkubik&filter=trigger:build~Build;branch:master;pipeline:5eb9eb74d794435ece16cc56~kubik)

# Kubik

**Kubik** (pronounced [ku:bik]) is a Kubernetes-centric validation and query language for detecting and preventing errors and violations of compliance, security, and cloud-native best practices. It was designed from the ground up to allow graph-like queries across manifests. Kubik uses JavaScript-like syntax for expressing custom rules.

We are maintaining a [community-driven rules library](https://github.com/kubevious/rules-library) which is a great way to get familiar with Kubik and implement your own custom rules.

The [Kubevious CLI](https://github.com/kubevious/cli) command-line tool interprets Kubik rules towards manifests in the file system as well as live manifests already configured in the Kubernetes cluster.

- [Concepts](#concepts)
- [Target Script](#target-script)
- [Rule Script](#rule-script)
- [Cache Script](#cache-script)

## Concepts

Kubik rule consists of two primary parts: **target** and **rule** scripts. The *target script* declares on which manifests the validation should be executed. The *rule script* validates each manifest that matches the *target script*.

**Target:**

```js
Api('apps')
	.Kind('Deployment')
```
**Rule:**

```js
for(const container of config.spec?.template?.spec?.containers ?? [])
{
		for(const envFrom of container.envFrom ?? [])
    {
    		if (envFrom.configMapRef)
        {
            const configMap = ApiVersion('v1')
            										.Kind('ConfigMap')
            										.name(envFrom.configMapRef.name)
                   						  .single()
           	if (!configMap)
            {
								error(`Could not find ConfigMap ${envFrom.configMapRef.name}`)
            }
        }
    }
}
```

## Target Script

### Querying K8s Manifests

Query Kubernetes objects by ApiVersion and Kind:

```js
ApiVersion('apps/v1')
	.Kind('Deployment')
```

Query Kubernetes object by ApiGroup and Kind:

```js
Api('autoscaling')
	.Kind('HorizontalPodAutoscaler')
```

Query Clustered objects:

```js
Api('rbac.authorization.k8s.io')
  .Kind('ClusterRoleBinding')
  .isClusterScope(true)
```

Filtering query results by object name:

```js
ApiVersion('v1')
  .Kind('Service')
  .name('backend')
```

Filtering query results by label:

```js
ApiVersion('v1')
  .Kind('Service')
  .label('foo', 'bar')
```

Filtering query results by multiple labels:

```js
ApiVersion('v1')
  .Kind('Service')
  .label({ foo: 'bar', stage: 'prod' })
```

Limiting the query within a namespace:

```js
ApiVersion('v1')
  .Kind('Service')
  .namespace('pepsi')
```

### Union

Queries can be combined:

```js
Union(
  Api('rbac.authorization.k8s.io')
    .Kind("ClusterRoleBinding")
    .isClusterScope(true),
  Api('rbac.authorization.k8s.io')
  	.Kind("RoleBinding")
)
```

### Shortcut

Kubik comes with Shortcut queries to simplify writing common Kubernetes rules:

| Shortcut                  | Description                                                  |
| ------------------------- | ------------------------------------------------------------ |
| Shortcut('PodSpec')       | Returns PodSpecs across Deployments, StatefulSets, DaemonSet, Jobs, and CronJobs |
| Shortcut('ContainerSpec') | Returns ContainerSpecs across Deployments, StatefulSets, DaemonSet, Jobs, and CronJobs. Also includes init containers. |
| Shortcut('Secret', name)  | Returns the K8s Secret object or the Secret object produced by the corresponding bitnami SealedSecret. |

### Filter

Queries can be filtered:

```js
Filter(
  Api('batch')
  	.Kind("Job")
).Criteria(item => {
  if (item.config.metadata?.ownerReferences) {
    return false;
  }
  return true;
})
```

### Transform

Query results can be transformed into another object:

```js
Transform(
  Api('batch')
  	.Kind("CronJob")
).To(item => ({
  synthetic: true,
  apiVersion: 'v1',
  kind: 'PodSpec',
  metadata: {
    ...item.config.spec?.template?.metadata ?? {},
    name: `CronJob-${item.config.metadata?.name}`
  },
  spec: item.config.spec?.jobTemplate?.spec?.template?.spec
}))
```

### TransformMany

Query results can be transformed into multiple other objects:

```js
TransformMany(
  Shortcut("PodSpec")
).To((item) => {
  const results = [];
  for (const cont of item?.config.spec?.containers ?? []) {
    results.push({
      synthetic: true,
      apiVersion: "v1",
      kind: "ContainerSpec",
      metadata: {
        ...(item.config.spec?.template?.metadata ?? {}),
        name: `${item.config.metadata?.name}-Cont-${cont.name}`,
      },
      spec: cont,
    });
  }
  for (const cont of item?.config.spec?.initContainers ?? []) {
    results.push({
      synthetic: true,
      apiVersion: "v1",
      kind: "ContainerSpec",
      metadata: {
        ...(item.config.spec?.template?.metadata ?? {}),
        name: `${item.config.metadata?.name}-InitCont-${cont.name}`,
      },
      spec: cont,
    });
  }
  return results;
});
```

## Rule Script

The *rule script* is executed for every item returned from the *target script*. The purpose of the *rule script* is to validate whether the item is good or not. In case of violations, it should trigger errors or warnings:

```js
error(`Something is wrong with the object ${item.name}!`);
warning(`We prefer not configuring ${config.kind} in this way...`);
```

The global scope of the rule script contains:

| Variable | Description                                                  |
| -------- | ------------------------------------------------------------ |
| config   | The raw Kubernetes object                                    |
| item     | A wrapper around the *config* object. It provides quick access to:<br />- item.name<br />- item.namespace<br />- item.labels<br />- item.annotations |
| helpers  | Contains common utility functions. See the reference [here](#global-helpers) |
| cache    | Scoped cache object. Learn more [here](#cache-script)        |

Sample rule script:

```js
if (helpers.parseImage(config.spec.image).tag === 'latest') {
  error(`Latest Image Tags not allowed: ${config.spec.image}`);
}
```

### Nested queries
Additional queries can be made from the rule script following the *target script* syntax and by adding **.many()**, **.single()**, or **.count()** suffix. 

In the example below we can loop through HPAs:
```js
for(const hpa of Api('autoscaling')
                  .Kind('HorizontalPodAutoscaler')
                  .many())
{
  // do something
}
```

or query the ConfigMap by name:
```js
const configMap = ApiVersion('v1')
                  .Kind('ConfigMap')
                  .name('mysql-configs')
                  .single();
if (!configMap) {
  error('Could not find the ConfigMap');
}
```

### Query Scope
Nested queryes by default are scoped to the namespace of the target item. To query objects from a specific namespace, the `.namespace('...')` query filter should be used:
```js
const gatewayItem = Api('gateway.networking.k8s.io')
                      .Kind('Gateway')
                      .name('my-gateway')
                      .namespace('from-another-namespace')
                      .single();
```

When querying Clustered objects the `.isClustered(true)` filter should always be set:
```js
Api('rbac.authorization.k8s.io')
  .Kind('ClusterRole')
  .isClusterScope(true)
```

It is also possible to query Namespaced objects globally by settings `.allNamespaces()` filter should always be set:
```js
Api('rbac.authorization.k8s.io')
  .Kind('Role')
  .allNamespaces()
```

## Cache Script
*Cache scripts* are optional. They are called only once per Namespace or once per Cluster scope. *Cache scripts* share a global **cache** object which is unique per Namespace. It is useful to perform queries and building lookup queries.

Following cache scripts builds a Pod Label dictionary once per Namespace:
```js
cache.apps = helpers.newLabelLookupDict();
for(const app of Shortcut("PodSpec")
                   .many())
{
  cache.apps.add(app, app.config.metadata?.labels);
}
```

It is then accessible to items in the *rule scripts*:
```js
const apps = cache.apps.resolveSelector(config.spec.selector)
if (apps.length === 0)
{
  error(`Could not find Applications for Service`);
}
```
Here is a good example for cache script usage: https://github.com/kubevious/rules-library/blob/main/k8s/service/service-selector-ref.yaml

## Global Helpers

Scripts have access to following helper functions:

**Parsing image string into image and tag**
```js
parseImage(fullImage: string) : { image: string, tag: string };
```

**Helper to perform label selector lookup**
```js
newLabelLookupDict() : { 
  add(item, labels),  
  resolveSelector(selector) : items[],
  matchesSelector(selector) : boolean
}
```

**Helper to perform name lookup**

```js
newNameLookupDict(items) : { 
  resolve(name) : Item | null,
  contains(name) : boolean
}
```

**Labels dictionary to string**

```js
labelsToString(labels) : string
```

