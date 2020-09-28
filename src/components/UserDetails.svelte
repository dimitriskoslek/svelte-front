<script>
    import UserStore from '../stores/UserStore.js'
    import Card from '../shared/Card.svelte'
    import Button from '../shared/Button.svelte'

    export let user

    const handleDelete = async(username) => {
        const url = 'http://localhost:4000/u/' + username
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        if(response.ok){
            UserStore.update((currentUsers) => {
                return currentUsers.filter(user => user.username != username)
            })
        }
    }
</script>


<Card>
    <div class="user">
        <h3>{user.username}</h3>
        <p>ID: {user._id.$oid}</p>
        <p>Created: {user.dateCreated}</p>
        <p>Latest update: {user.dateUpdated}</p>
        <div class="delete">
            <Button type="primary" flat={true} inverse={false} on:click={() => handleDelete(user.username)}>Delete</Button>
        </div>
    </div>
</Card>

<style>
    h3 {
        margin: 5px auto 15px auto;
        color: #555555;
    }
    p {
        margin-top: 6px;
        font-size: 14px;
        color: #aaaaaa;
        margin-bottom: 10px;
    }
    .answer {
        background: #fafafa;
        cursor: pointer;
        margin: 10px auto;
        position: relative;
    }
    .answer:hover {
        opacity: 0.6;
    }
    span {
        display: inline-block;
        padding: 10px 20px;
    }
    .percent {
        height: 100%;
        position: absolute;
        box-sizing: border-box;
    }
    .percent-a {
        border-left: 4px solid #d91b42;
        background-color: rgba(217, 27, 66, 0.2);
    }
    .percent-b {
        border-left: 4px solid #45c496;
        background-color: rgba(69, 196, 150, 0.2);
    }
    .delete {
        margin-top: 30px;
        text-align: center;
    }
</style>
