
for(const x of Logic()
                .descendant('Namespace')
                // .child('Application')
                .descendant('Service')
                .name('paymentservice')
                .many())
{
    console.log('-> RULE: ', x._dn)
}

