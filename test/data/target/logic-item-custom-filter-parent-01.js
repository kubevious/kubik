select('Namespace')
    .child('Application')
    .descendant('Container')
    .descendant('Port')
    .child('Service')
    .filter(({item, prev}) => {
        if (item.config.spec.type == 'NodePort') {
            if (prev.config.containerPort == 8080) {
                return true;
            }
        }
        return false;
    })
