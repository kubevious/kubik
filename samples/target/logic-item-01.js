logic('Application', '*', 'Port', 'Service')

/************************************/

select('Application')
descendents()
select('Port')
select('Service')
select('Ingress')

/************************************/

select('Application')
descendents()
select('Port')
select('Service')
select('Ingress')

/************************************/

select('Application')
descendents()
child('Port')
child('Service')
child('Ingress')

/************************************/

