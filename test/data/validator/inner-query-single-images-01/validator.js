let repo = Images()
                .child('Repo')
                    .name('quay.io')
                .single();

if (!repo)
{
    error('Could not find Quay')
}