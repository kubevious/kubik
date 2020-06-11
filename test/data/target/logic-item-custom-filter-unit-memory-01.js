select('Container')
    .filter(({item}) => {
        var value = item.getProperties('resources')['memory request'];
        if (value) {
            if (unit.memory(value).in('gb') > 8) {
                return true;
            }
        }
        return false;
    })