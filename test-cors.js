import http from 'http'

// Test OPTIONS preflight request
const optionsData = '';
const optionsOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/token',
    method: 'OPTIONS',
    headers: {
        'Origin': 'http://192.168.1.100:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
    }
};

console.log('Testing CORS OPTIONS preflight request...');

const optionsReq = http.request(optionsOptions, (res) => {
    console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
    console.log('Headers:', res.headers);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Response data:', data || '(empty)');

        // Check if CORS headers are present
        const corsHeaders = [
            'access-control-allow-origin',
            'access-control-allow-methods',
            'access-control-allow-headers'
        ];

        const hasCorsHeaders = corsHeaders.every(header => res.headers[header]);

        if (hasCorsHeaders && res.statusCode === 200) {
            console.log('✅ CORS preflight request is working correctly');
        } else {
            console.log('❌ CORS preflight request failed');
        }
    });
});

optionsReq.on('error', (err) => {
    console.error('Error:', err.message);
});

optionsReq.write(optionsData);
optionsReq.end();
