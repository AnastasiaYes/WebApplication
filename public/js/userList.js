window.addEventListener('load', () => {
    const selectALl = document.querySelector('input.select_all');

    selectALl.addEventListener("click", function (e) {
        const selectLabel = document.querySelector('label.select_label');
        const usersCheck = document.querySelectorAll('input.user_check');

        selectALl.classList.toggle('active');

        Array.prototype.forEach.call(usersCheck, function(cb){
            cb.checked = e.target.checked;
        });
    });

    const block = document.getElementById('block');
    const unblock = document.getElementById('unblock');
    const del = document.getElementById('delete');

    function choiceId () {
        const checks = document.querySelectorAll('input.user_check:checked');
        let userIds = [];
        for (let i = 0; i < checks.length; i++) {
            userIds.push(checks[i].dataset.userId);
        }
        return userIds;
    }

    block.addEventListener('click', function () {
        fetch('/users/ban', {
            headers: {
                "Content-Type": "application/json"
            },
            method: 'post',
            body: JSON.stringify({
                ids: choiceId()
            })
        }).then(async (result) => {
            const json = await result.json();
            if (!json.ok) {
                alert(json.message);
                return;
            }
            document.location.href = document.location.href;
        }).catch(err => {
            console.log(err);
        })

    });

    unblock.addEventListener('click', function () {
        fetch('/users/unblock', {
            headers: {
                "Content-Type": "application/json"
            },
            method: 'post',
            body: JSON.stringify({
                ids: choiceId()
            })
        }).then(async (result) => {
            const json = await result.json();
            if (!json.ok) {
                alert(json.message);
                return;
            }
            document.location.href = document.location.href;
        }).catch(err => {
            console.log(err);
        })

    });

    del.addEventListener('click', function () {
        fetch('/users/del', {
            headers: {
                "Content-Type": "application/json"
            },
            method: 'post',
            body: JSON.stringify({
                ids: choiceId()
            })
        }).then(async (result) => {
            const json = await result.json();
            if (!json.ok) {
                alert(json.message);
                return;
            }
            document.location.href = document.location.href;
        }).catch(err => {
            console.log(err);
        })

    });
});