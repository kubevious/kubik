if (Logic()
        .child('Namespace')
            .name('kube-system')
        .child('Application')
        .child('Launcher')
            .name('DaemonSet')
        .parent()
        .count() == 5)
{
    warning('Found 5 DaemonSet Apps in kube-system')
}
else
{
    error('Could not find 5 DaemonSet Apps in kube-system')
}