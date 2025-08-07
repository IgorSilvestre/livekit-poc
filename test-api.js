#!/usr/bin/env node

async function testApiEndpoint() {
    const baseUrl = process.argv[2] || 'http://localhost:3000';
    const url = `${baseUrl}/api/token`;

    console.log(`Testing API endpoint: ${url}`);

    const testData = {
        roomId: 'test-room',
        username: 'test-user'
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log(`Headers:`, Object.fromEntries(response.headers.entries()));

        if (response.ok) {
            const data = await response.json();
            console.log('Response data:', data);
            console.log('✅ API endpoint is working correctly');
        } else {
            const errorText = await response.text();
            console.log('Error response:', errorText);
            console.log('❌ API endpoint returned an error');
        }
    } catch (error) {
        console.error('❌ Failed to connect to API endpoint:', error.message);
    }
}

testApiEndpoint();
