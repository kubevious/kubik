select('Namespace')
    .name('hipster')
    .name('book')
.child('Application')
.descendant('Pod')
    // .labels(({ prev }) => 
    //     prev.child('Deployment')
    //         .config.spec.template.metadata.labels
    // )
