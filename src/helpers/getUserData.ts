import fs from 'fs';

import User from '../models/user';

const usersData = async (userDataPath: string): Promise<User[]> => {
    const data = await fs.promises.readFile(userDataPath, 'utf8');
    return JSON.parse(data) as User[];
};

export default usersData;