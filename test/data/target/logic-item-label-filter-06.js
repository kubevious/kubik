select('Launcher')
    .labels({ 
        'app': 'openfaas',
        'component': 'gateway'
    })
    .label('app.kubernetes.io/instance', 'gitlab')