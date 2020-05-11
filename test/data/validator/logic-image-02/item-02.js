module.exports = {
    "config": {},
    getProperties: function(name)
    {
        if(name == 'props') {
            return {
                "tag": "latest"
            }
        }
        return {}
    }
}