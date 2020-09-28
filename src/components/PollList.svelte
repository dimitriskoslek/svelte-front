<script>
    //import { onMount, onDestroy } from 'svelte'
    import { fade, slide, scale } from 'svelte/transition'
    import { flip } from 'svelte/animate'
    import PollStore from '../stores/PollStore.js'
    import PollDetails from './PollDetails.svelte'

    //export let polls = []

    /*
    const unsub = PollStore.subscribe((data) => {
        polls = data
    })

    onMount(() => {
        // get data from db here
        console.log('Component mounted')
    })

    onDestroy(() => {
        // unsub from Store
        unsub()
        console.log('Component destroyed')
    })
    */

</script>


<div class="poll-list">
    {#each $PollStore as poll (poll.id)}
        <div in:fade out:scale|local animate:flip={{duration: 500}}>
            <PollDetails poll={poll} />
        </div>
    {/each}
</div>


<style>
    .poll-list {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: 20px;
    }
</style>
