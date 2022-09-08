for(const x of Images()
                    .child('Repo')
                    .many()
                    )
{
    if (x.name === 'quay.io') {
        error('Found Quay')
    }
    // console.log('-> RULE: ', x._dn)
}