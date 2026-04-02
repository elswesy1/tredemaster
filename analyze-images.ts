import ZAI, { VisionMessage } from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const images = [
  '/home/z/my-project/upload/Screenshot_2026-03-31-12-06-17-27_40deb401b9ffe8e1df2f1cc5ba480b12.jpg',
  '/home/z/my-project/upload/Screenshot_2026-03-31-12-06-43-02_40deb401b9ffe8e1df2f1cc5ba480b12.jpg',
  '/home/z/my-project/upload/Screenshot_2026-03-31-12-07-19-52_40deb401b9ffe8e1df2f1cc5ba480b12.jpg',
  '/home/z/my-project/upload/Screenshot_2026-03-31-12-07-38-49_40deb401b9ffe8e1df2f1cc5ba480b12.jpg',
  '/home/z/my-project/upload/Screenshot_2026-03-31-12-07-46-94_40deb401b9ffe8e1df2f1cc5ba480b12.jpg',
  '/home/z/my-project/upload/Screenshot_2026-03-31-12-07-52-55_40deb401b9ffe8e1df2f1cc5ba480b12.jpg',
];

const prompt = `Analyze this trading journal app screenshot in extreme detail. Describe:
1) Which section it shows (Pre-market, Market-in, or Market-post)
2) All field labels and input elements visible with their exact text
3) The exact Arabic and English text shown for every element
4) Any special UI components (sliders, dropdowns, rating systems, toggles, etc.)
5) The layout structure and organization
6) Color scheme and visual design elements

Be very thorough and list EVERY text element you can see, including buttons, labels, headers, and any placeholder text. For Arabic text, provide the exact Arabic text and its English meaning if possible.`;

async function analyzeImage(zai: any, imagePath: string, index: number) {
  try {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`IMAGE ${index + 1}: ${path.basename(imagePath)}`);
    console.log('='.repeat(80));
    
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const imageUrl = `data:image/jpeg;base64,${base64Image}`;

    const messages: VisionMessage[] = [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      }
    ];

    const response = await zai.chat.completions.createVision({
      model: 'glm-4.6v',
      messages,
      thinking: { type: 'disabled' }
    });

    const reply = response.choices?.[0]?.message?.content;
    console.log(reply ?? JSON.stringify(response, null, 2));
  } catch (err: any) {
    console.error(`Error analyzing image ${index + 1}:`, err?.message || err);
  }
}

async function main() {
  const zai = await ZAI.create();
  
  for (let i = 0; i < images.length; i++) {
    await analyzeImage(zai, images[i], i);
  }
}

main().catch(console.error);
