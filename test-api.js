/**
 * Simple API Test Script
 *
 * Run this script to test the API:
 * node test-api.js
 *
 * Make sure the dev server is running: npm run dev
 */

const API_URL = 'http://localhost:3000/api/analyze';

async function testAPI() {
  console.log('🧪 Testing SEO Analyzer API...\n');

  // Test 1: Single URL Analysis
  console.log('Test 1: Single URL Analysis');
  console.log('URL: https://example.com\n');

  try {
    const response1 = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        competitorUrl: 'https://example.com'
      })
    });

    const data1 = await response1.json();

    if (data1.error) {
      console.error('❌ Error:', data1.message);
    } else {
      console.log('✅ Success!');
      console.log('Title:', data1.competitor.seo.title.content);
      console.log('Word Count:', data1.competitor.content.wordCount);
      console.log('H1 Count:', data1.competitor.headings.h1Count);
      console.log('Total Links:', data1.competitor.links.total);
      console.log('Processing Time:', data1.meta.processingTime + 'ms');
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 2: Comparison Mode
  console.log('Test 2: Comparison Mode');
  console.log('Competitor: https://example.com');
  console.log('Your URL: https://www.ietf.org\n');

  try {
    const response2 = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        competitorUrl: 'https://example.com',
        myUrl: 'https://www.ietf.org'
      })
    });

    const data2 = await response2.json();

    if (data2.error) {
      console.error('❌ Error:', data2.message);
    } else {
      console.log('✅ Success!');
      console.log('\nComparison Score:', data2.comparison.score.overall + '/100');
      console.log('Verdict:', data2.comparison.score.verdict);
      console.log('Summary:', data2.comparison.score.summary);

      console.log('\n📊 Opportunities (' + data2.comparison.opportunities.length + '):');
      data2.comparison.opportunities.slice(0, 3).forEach((opp, i) => {
        console.log(`  ${i + 1}. [${opp.severity.toUpperCase()}] ${opp.title}`);
        console.log(`     ${opp.description}`);
      });

      console.log('\n💪 Strengths (' + data2.comparison.strengths.length + '):');
      data2.comparison.strengths.forEach((strength, i) => {
        console.log(`  ${i + 1}. ${strength.title}`);
        console.log(`     ${strength.description}`);
      });

      console.log('\nProcessing Time:', data2.meta.processingTime + 'ms');
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 3: Error Handling (Invalid URL)
  console.log('Test 3: Error Handling - Invalid URL');
  console.log('URL: not-a-valid-url\n');

  try {
    const response3 = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        competitorUrl: 'not-a-valid-url'
      })
    });

    const data3 = await response3.json();

    if (data3.error) {
      console.log('✅ Error handled correctly');
      console.log('Error Code:', data3.code);
      console.log('Message:', data3.message);
    } else {
      console.error('❌ Should have returned an error');
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 4: Error Handling (Localhost blocking)
  console.log('Test 4: Error Handling - Localhost Blocking');
  console.log('URL: http://localhost:3000\n');

  try {
    const response4 = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        competitorUrl: 'http://localhost:3000'
      })
    });

    const data4 = await response4.json();

    if (data4.error) {
      console.log('✅ Localhost blocked correctly');
      console.log('Error Code:', data4.code);
      console.log('Message:', data4.message);
    } else {
      console.error('❌ Should have blocked localhost');
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');
  console.log('✨ All tests completed!\n');
}

// Run tests
testAPI().catch(console.error);
