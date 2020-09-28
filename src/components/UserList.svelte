<script>
    import { onMount, onDestroy } from 'svelte'
    import { fade, slide, scale } from 'svelte/transition'
    import { flip } from 'svelte/animate'
    //import { users, fetchUsers } from '../stores/UserStore.js'
    import UserStore from '../stores/UserStore.js'
    import UserDetails from './UserDetails.svelte'

    export let users = []

    const unsub = UserStore.subscribe((data) => {
        users = data
    })

    onMount(async () => {
        const url = 'http://localhost:4000/u/'
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        if(response.ok){
            const data = await response.json()
            console.log(data)
            UserStore.update((currentUsers) => {
                return data
            })
        }
    })

    onDestroy(() => {
        // unsub from Store
        unsub()
    })


</script>


<div class="user-list">
    {#each $UserStore as user (user._id)}
        <div in:fade out:scale|local animate:flip={{duration: 500}}>
            <UserDetails user={user} />
        </div>
    {/each}
</div>


<style>
    .user-list {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: 20px;
    }
</style>
