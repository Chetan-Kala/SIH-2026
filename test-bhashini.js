const BHASHINI_API_KEY = "3789926697-447c-403b-b7f3-bd7e927b2aa8";
const BHASHINI_USER_ID = "538084d6fb494be7bcb67af74ae875f1"; // transcribed from screenshot

async function test() {
  const configRes = await fetch('https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ulcaApiKey': BHASHINI_API_KEY,
      'userID': BHASHINI_USER_ID,
    },
    body: JSON.stringify({
      pipelineTasks: [{ taskType: 'translation', config: { language: { sourceLanguage: 'hi', targetLanguage: 'en' } } }],
      pipelineRequestConfig: { pipelineId: '64392f96daac500b55c543cd' },
    }),
  });
  console.log('Status:', configRes.status);
  const data = await configRes.json();
  console.log(JSON.stringify(data, null, 2));
}

test().catch(console.error);
