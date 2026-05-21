// Script to create test reports for map testing
const fetch = require('../backend/node_modules/node-fetch');

const API_BASE = 'http://localhost:3002/api';

// Sample reports with Hanoi area locations
const testReports = [
  {
    title: "Red River Pollution",
    description: "River water appears cloudy with industrial waste discharge",
    pollutionType: "chemical",
    severity: "high",
    location: {
      latitude: 21.0285,
      longitude: 105.8542
    },
    images: []
  },
  {
    title: "Groundwater Contamination",
    description: "Well water shows unusual color and odor",
    pollutionType: "other", 
    severity: "medium",
    location: {
      latitude: 20.9982,
      longitude: 105.8422
    },
    images: []
  },
  {
    title: "West Lake Oil Spill",
    description: "Oil film visible on lake surface with strong odor",
    pollutionType: "chemical",
    severity: "high",
    location: {
      latitude: 21.0488,
      longitude: 105.8086
    },
    images: []
  },
  {
    title: "Nhue Canal Biological Growth",
    description: "Excessive algae growth turning water green",
    pollutionType: "biological",
    severity: "medium",
    location: {
      latitude: 21.0085,
      longitude: 105.8642
    },
    images: []
  },
  {
    title: "Fish Pond Contamination",
    description: "Multiple fish deaths reported in urban fish pond",
    pollutionType: "chemical",
    severity: "critical",
    location: {
      latitude: 20.9908,
      longitude: 105.8235
    },
    images: []
  },
  {
    title: "Water Tank Chemical Leaks",
    description: "Filtered water shows signs of chemical contamination",
    pollutionType: "chemical",
    severity: "low",
    location: {
      latitude: 21.0188,
      longitude: 105.8745
    },
    images: []
  }
];

async function loginAndGetToken() {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });

    const data = await response.json();
    if (data.token) {
      return data.token;
    }
    throw new Error('Login failed');
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

async function createReport(reportData, token) {
  try {
    const response = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reportData)
    });

    const data = await response.json();
    if (response.ok) {
      console.log('✅ Created report:', reportData.title);
      return data;
    } else {
      console.error('❌ Error creating report:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

async function createTestReports() {
  console.log('🚀 Creating test reports for map testing...');
  
  // Login as admin
  console.log('📧 Logging in as admin...');
  const token = await loginAndGetToken();
  
  if (!token) {
    console.log('❌ Failed to login. Please make sure admin account exists.');
    return;
  }
  
  console.log('✅ Login successful. Creating reports...');
  
  let createdCount = 0;
  for (const report of testReports) {
    const result = await createReport(report, token);
    if (result) {
      createdCount++;
    }
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`🎉 Complete! Created ${createdCount}/${testReports.length} test reports.`);
  console.log('📍 Map should show these reports with different colored markers.');
  console.log('');
  console.log('🌐 Access the map at: http://localhost:3001/admin/map');
}

// Run the script
createTestReports().catch(console.error);
