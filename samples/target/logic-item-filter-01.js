select('Namespace')
    .name('hipster')
    .name('book')
    .label('env', 'prod')
.child('Application')
.descendent('Port')
    .filter(item => {
        return item.config.protocol == 'TCP';
    })
.child('Service')
.child('Ingress')
    .filter(item => {
        return item.parent.config.spec.type == 'NodePort';
    })