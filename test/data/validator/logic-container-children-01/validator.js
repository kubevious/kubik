for(var port of item.children("Port"))
{
    if (port.config.protocol != 'TCP')
    {
        error();
    }
}