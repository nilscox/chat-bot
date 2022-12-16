import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function (req: NextApiRequest, res: NextApiResponse) {
  // const lines = req.body.split('\n');

  // if (lines.length === 1) {
  //   return res.status(200).send('description');
  // }

  // return res.status(200).send(lines[lines.length - 2].replace(/.*: /, '') + ' (IA)');

  const completion = await openai.createCompletion({
    model: 'text-davinci-002',
    prompt: req.body,
    temperature: 0.6,
    max_tokens: 1500,
  });

  res.status(200).send(completion?.data?.choices?.[0].text?.trim());
}
