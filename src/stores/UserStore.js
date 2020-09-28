import { writable } from 'svelte/store'

const UserStore = writable([
    {
        _id: {
            $oid: "5edbadbc009bf04600454223"
        },
        username: "dimitriskl",
        hashedPassword: "$2a$08$5lp.nhoXLidJFPCMOpDnEeYPAmNgkBG6K2ebdOoJ625mTCp5WoCnK",
        dateCreated: "2020-06-06T14:52:44.646Z",
        dateUpdated: "2020-06-06T14:52:44.646Z"
    }
])

export default UserStore

/*export const users = writable([])

export const fetchUsers = async () => {
    const response = await fetch("localhost:4000/u/")
    if(response.ok){
        const data = await response.json()
        console.log('data')
        users.set(data)
    }
}*/
