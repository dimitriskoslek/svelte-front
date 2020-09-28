<script>
	import Header from './components/Header.svelte'
	import Footer from './components/Footer.svelte'
	import Tabs from './shared/Tabs.svelte'
	import CreatePollForm from './components/CreatePollForm.svelte'
	import PollList from './components/PollList.svelte'
	import RegisterUserForm from './components/RegisterUserForm.svelte'
	import UserList from './components/UserList.svelte'

	let items = ['Current Polls', 'Add new Poll', 'Users', 'Add new User']
	let activeItem = 'Current Polls'

	const tabChange = (e) => {
		activeItem = e.detail
	}

	const handleAdd = (e) => {
		if(activeItem === 'Add new Poll'){
			activeItem = 'Current Polls'
		} else if(activeItem === 'Add new User'){
			activeItem = 'Users'
		}
	}

</script>


<Header/>
<main>
	<Tabs items={items} activeItem={activeItem} on:tabChange={tabChange} />
	{#if activeItem === 'Current Polls'}
		<PollList />
	{:else if activeItem === 'Add new Poll'}
		<CreatePollForm on:add={handleAdd} />
	{:else if activeItem === 'Users'}
		<UserList />
	{:else if activeItem === 'Add new User'}
		<RegisterUserForm on:add={handleAdd} />
	{/if}
</main>
<Footer/>

<style>
	main {
		max-width: 960px;
		margin: 40px auto;
	}
</style>
