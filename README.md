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

TBD

### Union

TBD

### Filter

TBD

### Transform

TBD

### TransformMany

TBD

### Shortcut

TBD

## Rule Script

TBD

## Cache Script

TBD
