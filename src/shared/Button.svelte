<script>
    export let type = 'primary'
    export let flat = false;
    export let inverse = false;
</script>


<button class={type} class:flat={flat} class:inverse={inverse} on:click>
    <slot></slot>
</button>


<style>
    button {
        border: 0;
        cursor: pointer;
        border-radius: 6px;
        padding: 8px 12px;
        font-weight: 700;
        box-shadow: 1px 2px 3px rgba(0, 0, 0, 0.2);
    }
    .primary {
        background-color: #d91b42;
        color: #ffffff;
    }
    .secondary {
        background-color: #45c496;
        color: #ffffff;
    }
    .flat {
        box-shadow: none;
    }
    .primary.inverse {
        color: #d91b42;
        background-color: #ffffff;
        border: 2px solid #d91b42;
    }
    .secondary.inverse {
        color: #45c496;
        background-color: #ffffff;
        border: 2px solid #45c496;
    }
</style>
