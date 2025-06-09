
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  const response = await axios.get('https://www.themealdb.com/api/json/v1/1/random.php');
  res.status(200).json(response.data.meals[0]);
}
