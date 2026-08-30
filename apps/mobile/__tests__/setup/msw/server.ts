import { setupServer } from 'msw/node';

import { crewHandlers } from './handlers/crew.handlers';
import { notificationHandlers } from './handlers/notification.handlers';

export const server = setupServer(...crewHandlers, ...notificationHandlers);
