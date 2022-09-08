if (ApiVersion('apps/v1')
        .Kind('Deployment')
            .label('app.kubernetes.io/instance', 'gitlab')
        .count() == 3)
{
    warning('GitLab has 3 Deployments')
}
else
{
    error('GitLab should have 3 Deployments')
}
