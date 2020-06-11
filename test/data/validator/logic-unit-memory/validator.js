var value = item.getProperties('resources')['memory request'];
if (value) {
    if (unit.memory(value).in('gb') > 8) {
        mark('high-memory-app');
    }
    else if (unit.memory(value).in('gb') > 4) {
        mark('memium-memory-app');
    } else if (unit.memory(value).in('mb') < 500) {
        mark('small-memory-app');
    }
} else {
    mark('no-memory-request-set');
}