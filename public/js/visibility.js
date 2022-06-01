$(document).ready(function () {
    $('input[name="visibilityRadios"]').change(function () {
        let visibility = document.querySelector('input[name="visibilityRadios"]:checked').value;

        fetch('/uploads/change-visibility', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({
                uploadKey: document.querySelector('#upload-key').value,
                visibility: visibility
            })
            // headers: {
            //     'csrf-token': csrf
            // }
        })
            .then(result => {
                return result.json();
            })
            .then(data => {
                console.log(data);
                if ($('#restrictedRadio').prop('checked')) {
                    document.querySelector('.list-group').style.display = 'flex';
                    document.querySelector('.input-group').style.display = 'flex';
                } else {
                    document.querySelector('.list-group').style.display = 'none';
                    document.querySelector('.input-group').style.display = 'none';
                }
            })
            .catch(err => {
                console.log(err);
            });

    });
});

const addUser = (btn) => {
    let emailadded = btn.parentNode.parentNode.querySelector('input[name=users-email]').value;

    let userlist = btn.parentNode.parentNode.parentNode.querySelector('.list-group');

    let responseStatusCode;

    fetch('/uploads/add-user', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
            uploadKey: document.querySelector('#upload-key').value,
            email: emailadded
        })
        // headers: {
        //     'csrf-token': csrf
        // }
    })
        .then(result => {
            console.log(result);
            responseStatusCode = result.status;
            return result.json();
        })
        .then(data => {
            console.log(data);
            if (responseStatusCode.toString() === '200' && data.message === 'Added user') {
                $(userlist).append(`<li class="list-group-item" style="display:flex;justify-content: space-between;"><p style="margin: 0;">${emailadded}</p><button style="background: none;border:0px;"><img style="width: 18px;" src="../images/cancel-svg.svg" alt=""></button>
                </li>`);
                btn.parentNode.parentNode.querySelector('input[name=users-email]').value = '';
            }
            else {
                document.querySelector('#warning-text').innerHTML = data.message;
            }
        })
        .catch(err => {
            console.log(err);
        });
}

const removeUser=(btn)=>{

    let emailremoved = btn.parentNode.querySelector('p').innerHTML.trim();

    let userlist = btn.parentNode.parentNode.parentNode.querySelector('.list-group');

    fetch('/uploads/remove-user', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
            uploadKey: document.querySelector('#upload-key').value,
            email: emailremoved
        })
        // headers: {
        //     'csrf-token': csrf
        // }
    })
        .then(result => {
            console.log(result);
            responseStatusCode = result.status;
            return result.json();
        })
        .then(data => {
            console.log(data);
            if (responseStatusCode.toString() === '200' && data.message === 'Removed user') {
                console.log(btn.parentNode);
                btn.parentNode.remove();
            }
            else {
                document.querySelector('#warning-text').innerHTML = data.message;
            }
        })
        .catch(err => {
            console.log(err);
        });

}