select('Namespace')
    .name('gitlab')
.child('Application')
    .filter(({item}) => {
        return item.hasDescendants('Ingress');
    })