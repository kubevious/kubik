module.exports = {
    "config": {},
    getProperties: function(name)
    {
        if(name == 'props') {
            return {
                "tag": "1234"
            }
        }
        return {}
    }
}