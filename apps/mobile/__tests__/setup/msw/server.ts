import { setupServer } from 'msw/node';

import { crewHandlers } from './handlers/crew.handlers';

export const server = setupServer(...crewHandlers);
