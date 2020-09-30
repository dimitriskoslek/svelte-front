<script>
    let menuOpen = false
    let menuItems = ['Polls', 'Users']

    const toggleMenu = () => {
        //menuOpen = !menuOpen
    }
</script>


<header>
    <div class="site-logo">
        <a href="http://localhost:5000/">
            <img src="/icons/site-logo.svg" alt="Poll Ninja Logo">
        </a>
    </div>
    <div id="menu-toggle" class:active={menuOpen}>
        {#if menuOpen == true}
            <img src="/icons/menu-icon-open.svg" alt="menu_icon" on:click={toggleMenu}>
        {:else if menuOpen == false}
            <img src="/icons/menu-icon-closed.svg" alt="menu_icon" on:click={toggleMenu}>
        {/if}
    </div>
    <div id="menu">
        {#if menuOpen == true }
            <ul>
                {#each menuItems as menuItem}
                    <li>{menuItem}</li>
                {/each}
            </ul>
        {/if}
    </div>
</header>


<style>
    header {
        background: #f7f7f7;
        padding: 20px;
        overflow: auto;
    }
    .site-logo {
        float: left;
        margin-left: 35px;
    }
    .site-logo img {
        height: 60px;
        cursor: pointer;
    }
    #menu-toggle {
        float: right;
        padding: 10px 25px 0 0;
    }
    #menu-toggle img {
        height: 45px;
        cursor: pointer;
    }
    #menu ul {
        position: absolute;
        list-style: none;
        left: 0;
        right: 0;
        top: 0;
        z-index: 10;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.6);
        margin-top: 0;
    }
    #menu li {
        text-align: center;
        color: #ffffff;
        font-size: 30px;
        margin-top: 10px;
        margin-bottom: 10px;
    }
</style>
