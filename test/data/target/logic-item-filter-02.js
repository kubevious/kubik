select('Namespace')
    .name('gitlab')
    .name('book')
    .label('env', 'prod')
.child('Application')
.descendant('Port')
    .filter(({item}) => {
        return item.config.protocol == 'TCP';
    })
.child('Service')
.child('Ingress')
    .filter(({item}) => {
        return item.parent.config.spec.type == 'NodePort';
    })