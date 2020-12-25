select('Namespace')
    .filter(({item}) => {
        const cpu = item.getProperties('cluster-consumption').cpu;
        const memory = item.getProperties('cluster-consumption').memory;
        return (unit.percentage(cpu) >= 20) ||
               (unit.percentage(memory) >= 20);
    })