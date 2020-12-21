select('Namespace')
    .child('Application')
    .descendant('Port')
    .child('Service')
    .filter(({item}) => {
        if (item.config.spec.type == 'NodePort') {
            if (item.parent.config.containerPort == 8080) {
                return true;
            }
        }
        return false;
    })
