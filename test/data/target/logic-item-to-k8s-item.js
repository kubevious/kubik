select('Namespace')
    .name('hipster')
    .name('book')
.child('Application')
.descendant('Pod')
    .labels(({ prev }) => 
        prev.child('Launcher')
            .config.spec.template.metadata.labels
    )
