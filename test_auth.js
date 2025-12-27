import fetch from 'node-fetch';

async function testAuth() {
    console.log('Testing Registration...');
    try {
        const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'TestUser',
                email: 'test@example.com',
                password: 'password123',
                teamName: 'TestTeam'
            })
        });
        const registerData = await registerResponse.json();
        console.log('Registration Response:', registerData);

        console.log('Testing Login...');
        const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });
        const loginData = await loginResponse.json();
        console.log('Login Response:', loginData);

        if (loginData.token) {
            console.log('Testing /me endpoint...');
            const meResponse = await fetch('http://localhost:5000/api/auth/me', {
                headers: { 'Authorization': `Bearer ${loginData.token}` }
            });
            const meData = await meResponse.json();
            console.log('/me Response:', meData);
        }
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testAuth();
