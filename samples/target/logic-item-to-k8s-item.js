select('Namespace')
    .name('hipster')
    .name('book')
.child('Application')
.resource('Pod')
    .namespace(({ prev }) => prev.parent.name)
    .labels(({ prev }) => 
        prev.child('Launcher')
            .config.spec.template.metadata.labels
    )
