import type { drawerLetters, processValues, tubeNumbers } from './constants';
import * as v from 'valibot';
import type { doseSchema } from './validation';

export type Process = (typeof processValues)[number];
export type Drawer = (typeof drawerLetters)[number];
export type TubeNumber = (typeof tubeNumbers)[number];
export type Dose = v.InferOutput<typeof doseSchema>;
