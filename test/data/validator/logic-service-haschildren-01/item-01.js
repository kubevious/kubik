module.exports = {
    "config": {
        "spec": {
            "externalTrafficPolicy": "Cluster"
        }
    },
    hasChildren: function(name) {
        return true;
    }   
}