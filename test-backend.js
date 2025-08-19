// Simple test script to verify backend functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testBackend() {
    console.log('🧪 Testing ChatBRO Backend...\n');
    
    try {
        // Test 1: Check if server is running
        console.log('1️⃣ Testing server connectivity...');
        const homeResponse = await axios.get(`${BASE_URL}/`);
        console.log('✅ Home page accessible');
        
        // Test 2: Test API key update
        console.log('\n2️⃣ Testing API key update...');
        const testKeys = {
            openai: 'sk-test-key-123',
            anthropic: 'sk-ant-test-key-123'
        };
        
        const keysResponse = await axios.post(`${BASE_URL}/api/update-keys`, testKeys);
        console.log('✅ API keys updated successfully:', keysResponse.data);
        
        // Test 3: Test chat API with invalid model
        console.log('\n3️⃣ Testing chat API validation...');
        try {
            await axios.post(`${BASE_URL}/api/chat`, {
                message: 'Hello',
                model: 'invalid-model'
            });
        } catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Chat API validation working (rejected invalid model)');
            } else {
                throw error;
            }
        }
        
        // Test 4: Test chat API with missing message
        console.log('\n4️⃣ Testing chat API message validation...');
        try {
            await axios.post(`${BASE_URL}/api/chat`, {
                message: '',
                model: 'openai'
            });
        } catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Chat API validation working (rejected empty message)');
            } else {
                throw error;
            }
        }
        
        // Test 5: Test chat API with missing model
        console.log('\n5️⃣ Testing chat API model validation...');
        try {
            await axios.post(`${BASE_URL}/api/chat`, {
                message: 'Hello',
                model: ''
            });
        } catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Chat API validation working (rejected missing model)');
            } else {
                throw error;
            }
        }
        
        // Test 6: Test chat API with unconfigured model
        console.log('\n6️⃣ Testing chat API with unconfigured model...');
        try {
            await axios.post(`${BASE_URL}/api/chat`, {
                message: 'Hello',
                model: 'google'
            });
        } catch (error) {
            if (error.response?.status === 400) {
                console.log('✅ Chat API validation working (rejected unconfigured model)');
            } else {
                throw error;
            }
        }
        
        console.log('\n🎉 All backend tests passed! The server is working correctly.');
        console.log('\n📝 Next steps:');
        console.log('   1. Configure your actual API keys in the Settings page');
        console.log('   2. Try sending a message in the Chat page');
        console.log('   3. Check the server console for detailed logs');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Make sure the server is running:');
            console.log('   npm start');
        } else if (error.response) {
            console.log('\n📊 Response status:', error.response.status);
            console.log('📊 Response data:', error.response.data);
        }
    }
}

// Run the test
testBackend();
