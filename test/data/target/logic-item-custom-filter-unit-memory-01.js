select('Container')
    .filter(({item}) => {
        var value = item.getProperties('resources')['memory request'];
        if (value) {
            if (unit.memory(value).in('mb') > 500) {
                return true;
            }
        }
        return false;
    })