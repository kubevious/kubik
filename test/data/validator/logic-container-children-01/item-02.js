module.exports = {
    "config": {
    },
    children: function(name) {
        if (name == 'Port') {
            return [{
                config: {
                    protocol: 'UDP'
                }
            }];
        }
        return [];
    }   
}