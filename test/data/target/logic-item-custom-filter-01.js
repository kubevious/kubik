select('Namespace')
.child('Application')
.descendant('Port')
.child('Service')
    .filter(({item}) => {
        return item.config.spec.type == 'NodePort';
    })