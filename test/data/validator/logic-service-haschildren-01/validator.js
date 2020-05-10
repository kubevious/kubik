if (item.config.spec.externalTrafficPolicy == 'Cluster') {
    if (item.hasChildren("Ingress"))
    {
        error();
    }
}