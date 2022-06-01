const copyFunc = (btn) => {
    let link = btn.parentNode.querySelector('#download_link').href;

    navigator.clipboard.writeText(link);

    btn.textContent = 'Copied';

    setTimeout(() => {
        btn.textContent = 'Copy link';
    }, 2000);
};