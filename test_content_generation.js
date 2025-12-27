import fetch from 'node-fetch';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NGU1N2NkYjUzMTFhN2JjZjZhNDc4YiIsImlhdCI6MTc2Njc4MjEwOSwiZXhwIjoxNzY2Nzg1NzA5fQ.AxdBjaPvvq_slbMoEqv2pGPf4pkOzBW6MdhgpvgZgs4';

const testCases = [
    {
        name: 'Test 50 words',
        data: {
            section: 'objectives',
            projectTitle: 'Test Project',
            projectIdea: 'A test project idea',
            userMessage: 'make it 50 words',
            existingContent: 'The primary objective of this project is to develop a comprehensive solution that addresses multiple technical challenges. The system will implement advanced features and provide robust functionality. Secondary objectives include ensuring scalability and maintainability.'
        }
    },
    {
        name: 'Test short and brief',
        data: {
            section: 'objectives',
            projectTitle: 'Test Project',
            projectIdea: 'A test project idea',
            userMessage: 'make it short and brief',
            existingContent: 'The primary objective of this project is to develop a comprehensive solution that addresses multiple technical challenges. The system will implement advanced features and provide robust functionality. Secondary objectives include ensuring scalability and maintainability.'
        }
    },
    {
        name: 'Test 200 words',
        data: {
            section: 'objectives',
            projectTitle: 'Test Project',
            projectIdea: 'A test project idea',
            userMessage: 'expand to 200 words',
            existingContent: 'The primary objective of this project is to develop a comprehensive solution that addresses multiple technical challenges. The system will implement advanced features and provide robust functionality. Secondary objectives include ensuring scalability and maintainability.'
        }
    },
    {
        name: 'Test detailed',
        data: {
            section: 'objectives',
            projectTitle: 'Test Project',
            projectIdea: 'A test project idea',
            userMessage: 'make it detailed',
            existingContent: 'The primary objective of this project is to develop a comprehensive solution that addresses multiple technical challenges. The system will implement advanced features and provide robust functionality. Secondary objectives include ensuring scalability and maintainability.'
        }
    },
    {
        name: 'Test in pointwise',
        data: {
            section: 'objectives',
            projectTitle: 'Test Project',
            projectIdea: 'A test project idea',
            userMessage: 'present in pointwise format',
            existingContent: 'The primary objective of this project is to develop a comprehensive solution that addresses multiple technical challenges. The system will implement advanced features and provide robust functionality. Secondary objectives include ensuring scalability and maintainability.'
        }
    },
    {
        name: 'Test in bullet points',
        data: {
            section: 'objectives',
            projectTitle: 'Test Project',
            projectIdea: 'A test project idea',
            userMessage: 'format in bullet points',
            existingContent: 'The primary objective of this project is to develop a comprehensive solution that addresses multiple technical challenges. The system will implement advanced features and provide robust functionality. Secondary objectives include ensuring scalability and maintainability.'
        }
    },
    {
        name: 'Test in two paragraphs',
        data: {
            section: 'objectives',
            projectTitle: 'Test Project',
            projectIdea: 'A test project idea',
            userMessage: 'structure in two paragraphs',
            existingContent: 'The primary objective of this project is to develop a comprehensive solution that addresses multiple technical challenges. The system will implement advanced features and provide robust functionality. Secondary objectives include ensuring scalability and maintainability.'
        }
    },
    {
        name: 'Test in numbered list',
        data: {
            section: 'objectives',
            projectTitle: 'Test Project',
            projectIdea: 'A test project idea',
            userMessage: 'present in numbered list',
            existingContent: 'The primary objective of this project is to develop a comprehensive solution that addresses multiple technical challenges. The system will implement advanced features and provide robust functionality. Secondary objectives include ensuring scalability and maintainability.'
        }
    }
];

async function testContentGeneration() {
    for (const testCase of testCases) {
        console.log(`\n=== Testing: ${testCase.name} ===`);

        try {
            const response = await fetch('http://localhost:5000/api/idea/generate-content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(testCase.data)
            });

            const result = await response.json();

            if (response.ok) {
                const content = result.content;
                const wordCount = content.split(/\s+/).length;
                console.log(`✓ Success - Word count: ${wordCount}`);
                console.log(`Content preview: ${content.substring(0, 100)}...`);
            } else {
                console.log(`✗ Failed - ${result.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.log(`✗ Error - ${error.message}`);
        }
    }
}

testContentGeneration();
