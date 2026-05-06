
import { calculateSemanticMatch } from './lib/jobMatcher';

async function run() {
  const skills = ['React', 'Next.js', 'TypeScript', 'Tailwind', 'MongoDB'];
  const jd = 'We are looking for a frontend developer with experience in React, TypeScript, and modern CSS frameworks like Tailwind. You should be comfortable building UIs and connecting to APIs.';
  
  const score1 = await calculateSemanticMatch(skills, jd);
  console.log('Good Match Score:', score1);

  const jd2 = 'Seeking a Data Scientist experienced in Python, PyTorch, Machine Learning, and Big Data pipelines.';
  const score2 = await calculateSemanticMatch(skills, jd2);
  console.log('Bad Match Score:', score2);
}
run().catch(console.error);
