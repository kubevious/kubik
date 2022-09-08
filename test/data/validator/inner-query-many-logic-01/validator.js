for(const x of Logic()
                    .child('Namespace')
                        .name('kube-system')
                    .child('Application')
                    .child('Launcher')
                        .name('DaemonSet')
                    .parent()
                    .many()
                    )
{
    if (x.name === 'calico-node') {
        error('Found calico-node DaemonSet app')
    }
    // console.log('-> RULE: ', x._dn)
}
