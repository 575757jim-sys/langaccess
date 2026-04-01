import { generateCardWithQR } from './src/utils/generateCardWithQR.ts';

async function test() {
  try {
    console.log('Running generateCardWithQR with batchId: "oakland-final-1"...\n');
    const result = await generateCardWithQR('oakland-final-1');
    console.log('\nReturned URL:', result);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

test();
