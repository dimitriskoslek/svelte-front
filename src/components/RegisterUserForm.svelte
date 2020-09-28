<script>
    import UserStore from '../stores/PollStore.js'
    import { createEventDispatcher } from 'svelte'
    let dispatch = createEventDispatcher()
    import Button from '../shared/Button.svelte'

    let fields = { username: '', password: '' }
    let errors = { username: '', password: '' }
    let valid = false

    const submitHandler = async() => {
        valid = true
        // Validate username
        if(fields.username.trim().length < 3){
            valid = false
            errors.username = "Username must be at least 3 characters long"
        } else {
            // refresh error in case of multiple submissions
            errors.username = ''
        }
        // Validate password
        if(fields.password.trim().length < 8){
            valid = false
            errors.password = "Password must be at least 8 characters long"
        } else {
            errors.password = ''
        }

        if(valid){
            const url = 'http://localhost:4000/register/'
            const submitBody = JSON.stringify({
                username: fields.username,
                password: fields.password
            })
            const response = await fetch(url, {
                method: 'POST',
                mode: 'no-cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'include', // include, *same-origin, omit
                headers: {
                    'Content-Type': 'application/json',
                },
                body: submitBody
            })
            if(response){
                console.log('reached4')
                let user = fields
                // save user to Store
                UserStore.update((currentUsers) => {
                    return [user, ...currentUsers]
                })
                dispatch('add')
            }
        }
    }
</script>


<form on:submit|preventDefault={submitHandler}>
    <div class="form-field">
        <label for="username">Username</label>
        <input type="text" id="username" bind:value={fields.username}>
        <div class="error">{errors.username}</div>
    </div>
    <div class="form-field">
        <label for="password">Password</label>
        <input type="text" id="password" bind:value={fields.password}>
        <div class="error">{errors.password}</div>
    </div>
    <Button type="secondary" flat={true} inverse={false}>Register</Button>
</form>


<style>
    form {
        width: 400px;
        margin: 0 auto;
        text-align: center;
    }
    .form-field {
        margin: 18px auto;
    }
    input {
        width: 100%;
        border-radius: 6px;
    }
    label {
        margin: 10px auto;
        text-align: left;
    }
    .error {
        font-weight: 700;
        font-size: 12px;
        color: #d91b42;
    }
</style>
