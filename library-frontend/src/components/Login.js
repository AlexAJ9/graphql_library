import React, { useState } from 'react'

const Login = (props) => {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    if (!props.show) {
        return null
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault()

        const result = await props.login({ variables: { username, password } })

        if (result) {
            const token = result.data.login.value
            props.setToken(token)
            localStorage.setItem('user-token', token)
        }
    }

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div> username<input type="text" value={username} onChange={({ target }) => setUsername(target.value)} /></div>
                <div> password<input type="password" value={password} onChange={({ target }) => setPassword(target.value)} /></div>
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}
export default Login